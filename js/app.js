const input = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const newChatButton = document.getElementById("newChat")
const mobileMenu = document.getElementById("mobileMenu")
const sidebar = document.getElementById("sidebar")

function resizeInput() {
  if (!input) return

  input.style.height = "auto"
  input.style.height = Math.min(input.scrollHeight, 180) + "px"
}

function closeSidebar() {
  sidebar?.classList.remove("open")
}

function showNovaPanel(title, text, actionLabel = "Close") {
  document.querySelector(".nova-modal-backdrop")?.remove()

  const backdrop = document.createElement("div")
  backdrop.className = "nova-modal-backdrop"

  const panel = document.createElement("div")
  panel.className = "nova-modal"
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-modal", "true")

  panel.innerHTML = `
    <div class="nova-modal-glow"></div>
    <div class="nova-modal-mark">N</div>
    <div class="nova-modal-title"></div>
    <div class="nova-modal-text"></div>
    <button class="nova-modal-close" type="button"></button>
  `

  panel.querySelector(".nova-modal-title").textContent = title
  panel.querySelector(".nova-modal-text").textContent = text
  panel.querySelector(".nova-modal-close").textContent = actionLabel

  const close = () => backdrop.remove()

  panel.querySelector(".nova-modal-close").addEventListener("click", close)
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) close()
  })

  document.addEventListener("keydown", function escape(event) {
    if (event.key !== "Escape") return
    close()
    document.removeEventListener("keydown", escape)
  })

  backdrop.appendChild(panel)
  document.body.appendChild(backdrop)

  requestAnimationFrame(() => backdrop.classList.add("visible"))

  panel.querySelector(".nova-modal-close").focus()
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
  closeSidebar()
})

mobileMenu?.addEventListener("click", () => {
  sidebar?.classList.toggle("open")
})

document.querySelectorAll(".suggestions button").forEach(button => {
  button.addEventListener("click", () => {
    if (!input) return

    input.value = button.dataset.prompt || ""
    resizeInput()
    input.focus()
  })
})

document.getElementById("projects")?.addEventListener("click", () => {
  showNovaPanel("Projects", "Projects will live here. Organize chats, files, instructions and tools around one workspace.")
  closeSidebar()
})

document.getElementById("library")?.addEventListener("click", () => {
  showNovaPanel("Library", "Your saved files, generated content and useful Nova items will appear here.")
  closeSidebar()
})

document.getElementById("plugins")?.addEventListener("click", () => {
  showNovaPanel("Plugins", "Plugins will let Nova connect to supported tools and services from one place.")
  closeSidebar()
})

document.getElementById("settings")?.addEventListener("click", () => {
  showNovaPanel("Settings", "Nova settings are being prepared. This panel is ready for the real controls next.")
})

document.getElementById("searchChats")?.addEventListener("click", () => {
  showNovaPanel("Search chats", "Chat search is ready for the next feature pass. Your conversations are currently stored locally in this browser.")
  closeSidebar()
})

document.getElementById("attach")?.addEventListener("click", () => {
  showNovaPanel("Attachments", "File attachments are not connected yet. The composer is ready for them when the backend supports uploads.")
})

document.getElementById("modelSelector")?.addEventListener("click", () => {
  showNovaPanel("Nova model", "Nova is using the model configured by your Worker. Backup model routing can be added at the Worker layer when credits run low.")
})

document.getElementById("shareButton")?.addEventListener("click", async () => {
  if (!window.currentChat) {
    showNovaPanel("Nothing to share", "Start a chat first and Nova can create a shareable link for the current conversation.")
    return
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    showNovaPanel("Link copied", "The current Nova page link was copied to your clipboard.")
  } catch {
    showNovaPanel("Couldn't copy", "Your browser blocked clipboard access. You can copy the page address manually.")
  }
})

input?.focus()
