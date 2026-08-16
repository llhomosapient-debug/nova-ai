const input = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const newChatButton = document.getElementById("newChat")
const mobileMenu = document.getElementById("mobileMenu")
const sidebar = document.getElementById("sidebar")

function resizeInput() {
  if (!input) return

  input.style.height = "auto"
  input.style.height =
    Math.min(input.scrollHeight, 180) + "px"
}

input?.addEventListener("input", resizeInput)

input?.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()

    if (typeof window.sendMessage === "function") {
      window.sendMessage()
    }
  }
})

sendButton?.addEventListener("click", event => {
  event.preventDefault()

  if (typeof window.sendMessage === "function") {
    window.sendMessage()
  }
})

newChatButton?.addEventListener("click", () => {
  if (typeof window.newChat === "function") {
    window.newChat()
  }
})

mobileMenu?.addEventListener("click", () => {
  sidebar?.classList.toggle("open")
})

document.querySelectorAll(".suggestions button").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt || ""
    resizeInput()
    input.focus()
  })
})

input?.focus()
