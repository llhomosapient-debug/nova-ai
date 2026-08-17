const API_URL = "https://muddy-tooth-d17c.llhomosapient.workers.dev"
const NOVA_CHAT_SETTINGS_KEY = "nova_settings_v2"
const NOVA_CHAT_AUTH_KEY = "nova_registered_v1"
const NOVA_USAGE_KEY = "nova_usage_v1"

let currentChat = null
let generating = false

const chatElement = document.getElementById("chat")
const messagesElement = document.getElementById("messages")
const welcomeElement = document.getElementById("welcome")
const inputElement = document.getElementById("messageInput")
const sendElement = document.getElementById("sendButton")

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2)
}

function chatStorage() {
  return localStorage.getItem(NOVA_CHAT_AUTH_KEY) === "true" ? localStorage : sessionStorage
}

function getNovaSettings() {
  try {
    const value = chatStorage().getItem(NOVA_CHAT_SETTINGS_KEY)
    const settings = value ? JSON.parse(value) : {}
    return settings && typeof settings === "object" ? settings : {}
  } catch {
    return {}
  }
}

function saveChat(chat) {
  if (!chat?.id || typeof window.getChats !== "function" || typeof window.saveChats !== "function") return
  const chats = window.getChats().filter(item => item.id !== chat.id)
  chats.unshift(chat)
  window.saveChats(chats)
}

function addUsageToTotals(usage) {
  if (!usage || typeof usage !== "object") return
  const input = Number(usage.input_tokens || 0)
  const output = Number(usage.output_tokens || 0)
  const total = Number(usage.total_tokens || input + output)
  if (!total && !input && !output) return

  try {
    const now = new Date()
    const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`
    const data = JSON.parse(localStorage.getItem(NOVA_USAGE_KEY) || "{}")
    data.days ||= {}
    data.days[key] = Number(data.days[key] || 0) + total
    data.total = Number(data.total || 0) + total
    localStorage.setItem(NOVA_USAGE_KEY, JSON.stringify(data))
  } catch {}
}

function getTokenTotal() {
  try {
    const data = JSON.parse(localStorage.getItem(NOVA_USAGE_KEY) || "{}")
    return Number(data.total || 0)
  } catch {
    return 0
  }
}

function createChat() {
  currentChat = { id: makeId(), title: "New chat", messages: [], updated: Date.now() }
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
  requestAnimationFrame(() => { chatElement.scrollTop = chatElement.scrollHeight })
  return content
}

function formatTokens(value) {
  const number = Number(value) || 0
  if (number < 1000) return String(number)
  if (number < 1000000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`
  return `${(number / 1000000).toFixed(1)}m`
}

function formatModelName(model) {
  const names = {
    fast: "Nova Fast",
    "nova-fast": "Nova Fast",
    balanced: "Nova Balanced",
    "nova-balanced": "Nova Balanced",
    think: "Nova Think",
    "nova-think": "Nova Think",
    max: "Nova Max",
    "nova-max": "Nova Max"
  }
  return names[model] || "Nova"
}

function addUsage(messageElement, usage, model) {
  if (!usage || typeof usage !== "object") return
  const total = Number(usage.total_tokens || 0)
  const input = Number(usage.input_tokens || 0)
  const output = Number(usage.output_tokens || 0)
  if (!total && !input && !output) return

  const meta = document.createElement("div")
  meta.className = "message-meta"
  meta.textContent = `${formatModelName(model)} · ${formatTokens(total || input + output)} tokens`
  messageElement.parentElement?.appendChild(meta)
}

function addImageMessage(url, alt = "Nova generated image") {
  welcomeElement.style.display = "none"
  const message = document.createElement("div")
  message.className = "message assistant image-message"
  const content = document.createElement("div")
  content.className = "message-content image-content"
  const image = document.createElement("img")
  image.src = url
  image.alt = alt
  image.loading = "lazy"
  image.decoding = "async"
  image.addEventListener("error", () => { content.textContent = "Nova received an image result but it could not be displayed" })
  content.appendChild(image)
  message.appendChild(content)
  messagesElement.appendChild(message)
  requestAnimationFrame(() => { chatElement.scrollTop = chatElement.scrollHeight })
  return message
}

function looksLikeImageRequest(text) {
  return /\b(generate|create|make|draw|render|image|picture|png|illustration|logo|wallpaper)\b/i.test(text)
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
  if (currentChat.title === "New chat") currentChat.title = text.length > 45 ? text.slice(0, 45) + "..." : text
  currentChat.updated = Date.now()
  saveChat(currentChat)
  renderHistory()

  generating = true
  sendElement.disabled = true
  const answerElement = addMessage("assistant", "")
  answerElement.innerHTML = `<div class="typing" aria-label="Nova is thinking"><span></span><span></span><span></span></div>`

  try {
    const settings = getNovaSettings()
    const selectedModel = settings.model || "balanced"
    const imageRequest = Boolean(settings.images && looksLikeImageRequest(text))

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: currentChat.messages.slice(-12),
        model: selectedModel,
        thinking: Boolean(settings.thinking),
        research: Boolean(settings.research),
        images: Boolean(settings.images),
        image_request: imageRequest,
        image_format: "png",
        image_size: settings.imageSize || "1024x1024",
        lab_mode: Boolean(settings.labMode),
        age_verified: Boolean(settings.ageVerified),
        mature_mode: Boolean(settings.matureMode && settings.ageVerified),
        style: settings.style || "balanced"
      })
    })

    let data
    try { data = await response.json() } catch { throw new Error("Nova returned an invalid response") }
    if (!response.ok) throw new Error(data?.error || `Request failed ${response.status}`)

    const usage = data?.usage || null
    const imageUrl = data?.image_url || data?.imageUrl || (typeof data?.image === "string" ? data.image : null) || (Array.isArray(data?.images) ? (data.images[0]?.url || data.images[0]) : null)

    if (imageUrl && imageRequest) {
      answerElement.parentElement?.remove()
      const imageMessage = addImageMessage(imageUrl, data.image_alt || text)
      addUsage(imageMessage.querySelector(".message-content"), usage, data.model || selectedModel)
      currentChat.messages.push({ role: "assistant", type: "image", content: imageUrl, usage, model: data.model || selectedModel })
    } else {
      const answer = typeof data?.response === "string" ? data.response.trim() : ""
      if (!answer) throw new Error("Nova returned an empty response")
      answerElement.textContent = answer
      addUsage(answerElement, usage, data.model || selectedModel)
      currentChat.messages.push({ role: "assistant", content: answer, usage, model: data.model || selectedModel })
    }

    addUsageToTotals(usage)
    currentChat.updated = Date.now()
    saveChat(currentChat)
    renderHistory()
  } catch (error) {
    console.error("Nova error:", error)
    answerElement.textContent = error instanceof Error ? error.message : "Nova couldn't connect right now"
  } finally {
    generating = false
    sendElement.disabled = false
    inputElement.focus()
  }
}

function loadChat(chatData) {
  if (!chatData) return
  currentChat = { ...chatData, messages: Array.isArray(chatData.messages) ? chatData.messages : [] }
  messagesElement.innerHTML = ""
  welcomeElement.style.display = currentChat.messages.length ? "none" : ""
  currentChat.messages.forEach(message => {
    if (message.role !== "user" && message.role !== "assistant") return
    if (message.type === "image" && message.content) {
      const imageMessage = addImageMessage(message.content)
      addUsage(imageMessage.querySelector(".message-content"), message.usage, message.model)
    } else {
      const content = addMessage(message.role, message.content)
      addUsage(content, message.usage, message.model)
    }
  })
  renderHistory()
  requestAnimationFrame(() => { chatElement.scrollTop = chatElement.scrollHeight })
}

function deleteChat(chatId) {
  if (typeof window.getChats !== "function" || typeof window.saveChats !== "function") return
  window.saveChats(window.getChats().filter(chat => chat.id !== chatId))
  if (currentChat?.id === chatId) {
    currentChat = null
    messagesElement.innerHTML = ""
    welcomeElement.style.display = ""
  }
  renderHistory()
}

function renderHistory() {
  const historyElement = document.getElementById("chatHistory")
  if (!historyElement || typeof window.getChats !== "function") return
  historyElement.innerHTML = ""
  window.getChats().forEach(chat => {
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
    deleteButton.textContent = "×"
    deleteButton.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); deleteChat(chat.id) })
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
window.getCurrentChat = () => currentChat
window.getNovaTokenTotal = getTokenTotal

renderHistory()
