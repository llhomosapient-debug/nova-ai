const input = document.getElementById("messageInput")
const send = document.getElementById("sendButton")
const newChat = document.getElementById("newChat")
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

send?.addEventListener("click", () => {
  window.sendMessage()
})

newChat?.addEventListener("click", () => {
  window.newChat()
})

mobileMenu?.addEventListener("click", () => {
  sidebar?.classList.toggle("open")
})

document
  .querySelectorAll(".suggestions button")
  .forEach(button => {

    button.addEventListener("click", () => {

      input.value =
        button.dataset.prompt || ""

      resizeInput()
      input.focus()
    })

  })

document
  .getElementById("projects")
  ?.addEventListener("click", () => {
    alert("Projects coming next")
  })

document
  .getElementById("library")
  ?.addEventListener("click", () => {
    alert("Library coming next")
  })

document
  .getElementById("plugins")
  ?.addEventListener("click", () => {
    alert("Plugins coming next")
  })

document
  .getElementById("settings")
  ?.addEventListener("click", () => {
    alert("Settings coming next")
  })

document
  .getElementById("searchChats")
  ?.addEventListener("click", () => {
    alert("Chat search coming next")
  })

input?.focus()
