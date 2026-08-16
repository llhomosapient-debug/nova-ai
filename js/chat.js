const API_URL = "https://muddy-tooth-d17c.llhomosapient.workers.dev"
const STORAGE_KEY = "nova_chats_v2"
const SETTINGS_KEY = "nova_settings_v2"

let currentChat = null
let generating = false

const chatElement = document.getElementById("chat")
const messagesElement = document.getElementById("messages")
const welcomeElement = document.getElementById("welcome")
const inputElement = document.getElementById("messageInput")
const sendElement = document.getElementById("sendButton")

function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2)
}

function getChats() {
  try {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(chats) ? chats : []
  } catch {
    return []
  }
}

function saveChats(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 100)))
  } catch (error) {
    console.error("Nova history error", error)
  }
}

function getNovaSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
    return settings && typeof settings === "object" ? settings : {}
  } catch {
    return {}
  }
}

function saveChat(chat) {
  if (!chat?.id) return
  const chats = getChats().filter(item => item.id !== chat.id)
  chats.unshift(chat)
  saveChats(chats)
}

function createChat() {
  currentChat = {
    id: makeId(),
    title: "New chat",
    messages: [],
    updated: Date.now()
  }

  messagesElement.innerHTML = ""
  welcomeElement.style.display = ""
  renderHistory()
  return currentChat
}

function addMessage(role, text) {
  welcomeElement.style.display = "none"

  const message = document.createElement("div")
  message.className = `message ${role}`

  const content = document.createElement("div")
  content.className = "message-content"
  content.textContent = String(text ?? "")

  message.appendChild(content)
  messagesElement.appendChild(message)

  requestAnimationFrame(() => {
    chatElement.scrollTop = chatElement.scrollHeight
  })

  return content
}

async function sendMessage() {
  if (generating || !inputElement || !sendElement) return

  const text = inputElement.value.trim()
  if (!text) return

  if (!currentChat) createChat()

  inputElement.value = ""
  inputElement.style.height = "auto"

  addMessage("user", text)
  currentChat.messages.push({ role: "user", content: text })

  if (currentChat.title === "New chat") {
    currentChat.title = text.length > 45 ? text.slice(0, 45) + "..." : text
  }

  currentChat.updated = Date.now()
  saveChat(currentChat)
  renderHistory()

  generating = true
  sendElement.disabled = true

  const answerElement = addMessage("assistant", "")
  answerElement.innerHTML = `<div class="typing" aria-label="Nova is thinking"><span></span><span></span><span></span></div>`

  try {
    const settings = getNovaSettings()

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: currentChat.messages.slice(-12),
        thinking: Boolean(settings.thinking),
        research: Boolean(settings.research),
        images: Boolean(settings.images),
        age_verified: Boolean(settings.ageVerified),
        mature_mode: Boolean(settings.matureMode && settings.ageVerified),
        style: settings.style || "balanced"
      })
    })

    let data
    try {
      data = await response.json()
    } catch {
      throw new Error("Nova returned an invalid response")
    }

    if (!response.ok) {
      throw new Error(data.error || `Request failed ${response.status}`)
    }

    const answer = typeof data.response === "string" ? data.response.trim() : ""
    if (!answer) throw new Error("Nova returned an empty response")

    answerElement.textContent = answer
    currentChat.messages.push({ role: "assistant", content: answer })
    currentChat.updated = Date.now()
    saveChat(currentChat)
    renderHistory()
  } catch (error) {
    console.error("Nova error", error)
    answerElement.textContent = "Nova couldn't connect right now. Check the Worker and try again."
  } finally {
    generating = false
    sendElement.disabled = false
    inputElement.focus()
  }
}

function loadChat(chatData) {
  if (!chatData) return

  currentChat = {
    ...chatData,
    messages: Array.isArray(chatData.messages) ? chatData.messages : []
  }

  messagesElement.innerHTML = ""
  welcomeElement.style.display = currentChat.messages.length ? "none" : ""

  currentChat.messages.forEach(message => {
    if (message.role === "user" || message.role === "assistant") {
      addMessage(message.role, message.content)
    }
  })

  renderHistory()
  requestAnimationFrame(() => {
    chatElement.scrollTop = chatElement.scrollHeight
  })
}

function deleteChat(chatId) {
  saveChats(getChats().filter(chat => chat.id !== chatId))

  if (currentChat?.id === chatId) {
    currentChat = null
    messagesElement.innerHTML = ""
    welcomeElement.style.display = ""
  }

  renderHistory()
}

function renderHistory() {
  const historyElement = document.getElementById("chatHistory")
  if (!historyElement) return

  historyElement.innerHTML = ""

  getChats().forEach(chat => {
    const row = document.createElement("div")
    row.className = "chat-history-row"

    const button = document.createElement("button")
    button.type = "button"
    button.className = "chat-history-item"
    button.textContent = chat.title || "New chat"
    button.title = chat.title || "New chat"
    if (currentChat?.id === chat.id) button.classList.add("active")
    button.addEventListener("click", () => loadChat(chat))

    const deleteButton = document.createElement("button")
    deleteButton.type = "button"
    deleteButton.className = "chat-delete"
    deleteButton.setAttribute("aria-label", "Delete chat")
    deleteButton.title = "Delete chat"
    deleteButton.addEventListener("click", event => {
      event.preventDefault()
      event.stopPropagation()
      deleteChat(chat.id)
    })

    row.append(button, deleteButton)
    historyElement.appendChild(row)
  })
}

function startNewChat() {
  createChat()
  inputElement?.focus()
}

window.sendMessage = sendMessage
window.newChat = startNewChat
window.loadChat = loadChat
window.renderHistory = renderHistory
window.deleteChat = deleteChat
window.getChats = getChats
window.getCurrentChat = () => currentChat

renderHistory()
