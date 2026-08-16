const API_URL =
  "https://muddy-tooth-d17c.llhomosapient.workers.dev"

let currentChatId = null
let messages = []
let generating = false

const chat = document.getElementById("chat")
const messagesEl = document.getElementById("messages")
const input = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const welcome = document.getElementById("welcome")

function createChat() {
  currentChatId = crypto.randomUUID()
  messages = []

  messagesEl.innerHTML = ""
  welcome.style.display = "block"

  saveCurrentChat()
}

function addMessage(role, text) {
  welcome.style.display = "none"

  const message = document.createElement("div")
  message.className = `message ${role}`

  const avatar = document.createElement("div")
  avatar.className = "message-avatar"
  avatar.textContent = role === "user" ? "U" : "N"

  const content = document.createElement("div")
  content.className = "message-content"
  content.textContent = text

  message.appendChild(avatar)
  message.appendChild(content)

  messagesEl.appendChild(message)

  chat.scrollTop = chat.scrollHeight

  return content
}

async function sendMessage() {
  if (generating) return

  const text = input.value.trim()

  if (!text) return

  if (!currentChatId) {
    createChat()
  }

  input.value = ""
  input.style.height = "auto"

  messages.push({
    role: "user",
    content: text
  })

  addMessage("user", text)

  generating = true
  sendButton.disabled = true

  const nova = addMessage("assistant", "")

  nova.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        history: messages.slice(-12)
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Nova request failed")
    }

    const answer =
      data.response ||
      "Nova didn't return a response"

    nova.textContent = answer

    messages.push({
      role: "assistant",
      content: answer
    })

    saveCurrentChat(text)

    renderHistory()

  } catch (error) {
    console.error(error)

    nova.textContent =
      "Nova couldn't connect right now"

  } finally {
    generating = false
    sendButton.disabled = false
    input.focus()
  }
}

function loadChat(chatData) {
  currentChatId = chatData.id
  messages = chatData.messages || []

  messagesEl.innerHTML = ""

  if (!messages.length) {
    welcome.style.display = "block"
    return
  }

  welcome.style.display = "none"

  for (const message of messages) {
    addMessage(
      message.role,
      message.content
    )
  }

  chat.scrollTop = chat.scrollHeight

  renderHistory()
}

function saveCurrentChat(firstMessage = "") {
  if (!currentChatId) return

  const chats =
    JSON.parse(
      localStorage.getItem("nova_chats") || "[]"
    )

  const existing =
    chats.find(x => x.id === currentChatId)

  const title =
    existing?.title ||
    firstMessage ||
    "New chat"

  const data = {
    id: currentChatId,
    title:
      title.length > 45
        ? title.slice(0, 45) + "..."
        : title,
    messages,
    updated:
      Date.now()
  }

  const filtered =
    chats.filter(
      x => x.id !== currentChatId
    )

  filtered.unshift(data)

  localStorage.setItem(
    "nova_chats",
    JSON.stringify(filtered.slice(0, 100))
  )
}

function renderHistory() {
  const history =
    document.getElementById("chatHistory")

  if (!history) return

  history.innerHTML = ""

  const chats =
    JSON.parse(
      localStorage.getItem("nova_chats") || "[]"
    )

  for (const item of chats) {
    const button =
      document.createElement("button")

    button.className =
      "chat-history-item"

    if (item.id === currentChatId) {
      button.classList.add("active")
    }

    button.textContent =
      item.title || "New chat"

    button.onclick = () => {
      loadChat(item)
    }

    history.appendChild(button)
  }
}

function newChat() {
  createChat()
  renderHistory()
  input.focus()
}

window.sendMessage = sendMessage
window.newChat = newChat
window.loadChat = loadChat

renderHistory()
