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
    window.sendMessage()
  }
})

sendButton?.addEventListener("click", () => {
  window.sendMessage()
})

newChatButton?.addEventListener("click", () => {
  window.newChat()
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

document.getElementById("projects")?.addEventListener("click", () => {
  alert("Projects will be added next")
})

document.getElementById("library")?.addEventListener("click", () => {
  alert("Library will be added next")
})

document.getElementById("plugins")?.addEventListener("click", () => {
  alert("Plugins will be added next")
})

document.getElementById("settings")?.addEventListener("click", () => {
  alert("Settings will be added next")
})

document.getElementById("searchChats")?.addEventListener("click", () => {
  alert("Chat search will be added next")
})

document.getElementById("attach")?.addEventListener("click", () => {
  alert("Attachments will be added next")
})

document.getElementById("modelSelector")?.addEventListener("click", () => {
  alert("Model selector will be added next")
})

input?.focus()
