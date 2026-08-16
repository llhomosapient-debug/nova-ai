const API_URL =
  "https://muddy-tooth-d17c.llhomosapient.workers.dev"

let currentChat = null
let generating = false

const chatElement =
  document.getElementById("chat")

const messagesElement =
  document.getElementById("messages")

const welcomeElement =
  document.getElementById("welcome")

const inputElement =
  document.getElementById("messageInput")

const sendElement =
  document.getElementById("sendButton")

function createChat() {

  currentChat = {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    updated: Date.now()
  }

  messagesElement.innerHTML = ""
  welcomeElement.style.display = ""

  renderHistory()
}

function addMessage(role, text) {

  welcomeElement.style.display = "none"

  const message =
    document.createElement("div")

  message.className =
    `message ${role}`

  const content =
    document.createElement("div")

  content.className =
    "message-content"

  content.textContent = text

  message.appendChild(content)
  messagesElement.appendChild(message)

  chatElement.scrollTop =
    chatElement.scrollHeight

  return content
}

async function sendMessage() {

  if (generating) return

  const text =
    inputElement.value.trim()

  if (!text) return

  if (!currentChat) {
    createChat()
  }

  inputElement.value = ""
  inputElement.style.height = "auto"

  addMessage("user", text)

  currentChat.messages.push({
    role: "user",
    content: text
  })

  if (
    currentChat.title === "New chat"
  ) {
    currentChat.title =
      text.length > 45
        ? text.slice(0, 45) + "..."
        : text
  }

  currentChat.updated = Date.now()

  saveChat(currentChat)
  renderHistory()

  generating = true
  sendElement.disabled = true

  const answerElement =
    addMessage("assistant", "")

  answerElement.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `

  try {

    const response =
      await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: text,
          history:
            currentChat.messages.slice(-12)
        })
      })

    let data

    try {
      data = await response.json()
    } catch {
      throw new Error(
        "Nova returned an invalid response"
      )
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        `Request failed ${response.status}`
      )
    }

    const answer =
      typeof data.response === "string"
        ? data.response.trim()
        : ""

    if (!answer) {
      throw new Error(
        "Nova returned an empty response"
      )
    }

    answerElement.textContent =
      answer

    currentChat.messages.push({
      role: "assistant",
      content: answer
    })

    currentChat.updated = Date.now()

    saveChat(currentChat)
    renderHistory()

  } catch (error) {

    console.error("Nova error:", error)

    answerElement.textContent =
      "Nova couldn't connect right now. Check the Worker and try again."

  } finally {

    generating = false
    sendElement.disabled = false

    inputElement.focus()

  }
}

function loadChat(chatData) {

  currentChat = {
    ...chatData,
    messages:
      Array.isArray(chatData.messages)
        ? chatData.messages
        : []
  }

  messagesElement.innerHTML = ""

  if (!currentChat.messages.length) {
    welcomeElement.style.display = ""
    renderHistory()
    return
  }

  welcomeElement.style.display = "none"

  currentChat.messages.forEach(message => {

    if (
      message.role !== "user" &&
      message.role !== "assistant"
    ) {
      return
    }

    addMessage(
      message.role,
      message.content
    )
  })

  renderHistory()

  requestAnimationFrame(() => {
    chatElement.scrollTop =
      chatElement.scrollHeight
  })
}

function renderHistory() {

  const historyElement =
    document.getElementById("chatHistory")

  if (!historyElement) return

  historyElement.innerHTML = ""

  const chats = getChats()

  chats.forEach(chat => {

    const button =
      document.createElement("button")

    button.className =
      "chat-history-item"

    if (
      currentChat &&
      chat.id === currentChat.id
    ) {
      button.classList.add("active")
    }

    button.textContent =
      chat.title || "New chat"

    button.addEventListener(
      "click",
      () => loadChat(chat)
    )

    historyElement.appendChild(button)
  })
}

function startNewChat() {
  createChat()
  inputElement.focus()
}

window.sendMessage = sendMessage
window.newChat = startNewChat
window.loadChat = loadChat
window.renderHistory = renderHistory

renderHistory()
