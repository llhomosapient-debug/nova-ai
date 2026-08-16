const API_URL =
  "https://muddy-tooth-d17c.llhomosapient.workers.dev"

const STORAGE_KEY = "nova_chats_v2"

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


/* =========================
   STORAGE
========================= */

function getChats() {

  try {

    const chats =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      )

    return Array.isArray(chats)
      ? chats
      : []

  } catch {

    return []

  }
}


function saveChats(chats) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(chats)
  )

}


function saveChat(chat) {

  if (!chat) return

  const chats = getChats()

  const index =
    chats.findIndex(
      item => item.id === chat.id
    )

  if (index === -1) {

    chats.push(chat)

  } else {

    chats[index] = chat

  }

  chats.sort(
    (a, b) =>
      (b.updated || 0) -
      (a.updated || 0)
  )

  saveChats(chats)

}


/* =========================
   CREATE CHAT
========================= */

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


/* =========================
   MESSAGES
========================= */

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

  requestAnimationFrame(() => {

    chatElement.scrollTop =
      chatElement.scrollHeight

  })

  return content

}


/* =========================
   SEND
========================= */

async function sendMessage() {

  if (generating) return

  const text =
    inputElement.value.trim()

  if (!text) return

  if (!currentChat) {
    createChat()
  }

  inputElement.value = ""

  inputElement.style.height =
    "auto"

  addMessage(
    "user",
    text
  )

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

  currentChat.updated =
    Date.now()

  saveChat(currentChat)

  renderHistory()

  generating = true

  sendElement.disabled = true

  const answerElement =
    addMessage(
      "assistant",
      ""
    )

  answerElement.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `

  try {

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: text,

            history:
              currentChat.messages
                .slice(-12)
          })
        }
      )

    let data

    try {

      data =
        await response.json()

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

    currentChat.updated =
      Date.now()

    saveChat(currentChat)

    renderHistory()

  } catch (error) {

    console.error(
      "Nova error:",
      error
    )

    answerElement.textContent =
      "Nova couldn't connect right now. Check the Worker and try again."

  } finally {

    generating = false

    sendElement.disabled =
      false

    inputElement.focus()

  }

}


/* =========================
   LOAD CHAT
========================= */

function loadChat(chatData) {

  if (!chatData) return

  currentChat = {
    ...chatData,

    messages:
      Array.isArray(
        chatData.messages
      )
        ? chatData.messages
        : []
  }

  messagesElement.innerHTML =
    ""

  if (
    !currentChat.messages.length
  ) {

    welcomeElement.style.display =
      ""

    renderHistory()

    return

  }

  welcomeElement.style.display =
    "none"

  currentChat.messages.forEach(
    message => {

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

    }
  )

  renderHistory()

}


/* =========================
   DELETE CHAT
========================= */

function deleteChat(chatId) {

  const chats =
    getChats().filter(
      chat => chat.id !== chatId
    )

  saveChats(chats)

  if (
    currentChat &&
    currentChat.id === chatId
  ) {

    currentChat = null

    messagesElement.innerHTML = ""

    welcomeElement.style.display =
      ""

  }

  renderHistory()

}


/* =========================
   HISTORY UI
========================= */

function renderHistory() {

  const historyElement =
    document.getElementById(
      "chatHistory"
    )

  if (!historyElement) return

  historyElement.innerHTML = ""

  const chats =
    getChats()

  chats.forEach(chat => {

    const row =
      document.createElement("div")

    row.className =
      "chat-history-row"

    const button =
      document.createElement("button")

    button.className =
      "chat-history-item"

    if (
      currentChat &&
      chat.id === currentChat.id
    ) {

      button.classList.add(
        "active"
      )

    }

    button.textContent =
      chat.title || "New chat"

    button.addEventListener(
      "click",
      () => loadChat(chat)
    )

    const deleteButton =
      document.createElement("button")

    deleteButton.className =
      "chat-delete"

    deleteButton.textContent =
      "×"

    deleteButton.title =
      "Delete chat"

    deleteButton.addEventListener(
      "click",
      event => {

        event.stopPropagation()

        deleteChat(chat.id)

      }
    )

    row.appendChild(button)

    row.appendChild(deleteButton)

    historyElement.appendChild(row)

  })

}


/* =========================
   NEW CHAT
========================= */

function startNewChat() {

  createChat()

  inputElement.focus()

}


/* =========================
   GLOBALS
========================= */

window.sendMessage =
  sendMessage

window.newChat =
  startNewChat

window.loadChat =
  loadChat

window.renderHistory =
  renderHistory

window.deleteChat =
  deleteChat

window.getChats =
  getChats


renderHistory()
