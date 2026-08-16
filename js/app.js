const input = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const newChatButton = document.getElementById("newChat")
const mobileMenu = document.getElementById("mobileMenu")
const sidebar = document.getElementById("sidebar")

const SETTINGS_KEY = "nova_settings_v1"

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function resizeInput() {
  if (!input) return

  input.style.height = "auto"
  input.style.height = Math.min(input.scrollHeight, 180) + "px"
}

function closeSidebar() {
  sidebar?.classList.remove("open")
}

function closeNovaPanel(backdrop) {
  if (!backdrop) return
  backdrop.classList.remove("visible")
  setTimeout(() => backdrop.remove(), 180)
}

function createModalBase(title, subtitle) {
  document.querySelector(".nova-modal-backdrop")?.remove()

  const backdrop = document.createElement("div")
  backdrop.className = "nova-modal-backdrop"

  const panel = document.createElement("div")
  panel.className = "nova-modal nova-modal-wide"
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-modal", "true")

  panel.innerHTML = `
    <div class="nova-modal-glow"></div>
    <div class="nova-modal-header">
      <div class="nova-modal-mark">N</div>
      <div>
        <div class="nova-modal-title"></div>
        <div class="nova-modal-subtitle"></div>
      </div>
      <button class="nova-modal-x" type="button" aria-label="Close">×</button>
    </div>
    <div class="nova-modal-body"></div>
  `

  panel.querySelector(".nova-modal-title").textContent = title
  panel.querySelector(".nova-modal-subtitle").textContent = subtitle

  const close = () => closeNovaPanel(backdrop)

  panel.querySelector(".nova-modal-x").addEventListener("click", close)
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) close()
  })

  const escape = event => {
    if (event.key !== "Escape") return
    close()
    document.removeEventListener("keydown", escape)
  }

  document.addEventListener("keydown", escape)

  backdrop.appendChild(panel)
  document.body.appendChild(backdrop)

  requestAnimationFrame(() => backdrop.classList.add("visible"))

  return { backdrop, panel, body: panel.querySelector(".nova-modal-body"), close }
}

function showNovaPanel(title, text) {
  const modal = createModalBase(title, "Nova workspace")

  modal.body.innerHTML = `
    <p class="nova-modal-text"></p>
    <button class="nova-primary-button" type="button">Close</button>
  `

  modal.body.querySelector(".nova-modal-text").textContent = text
  modal.body.querySelector(".nova-primary-button").addEventListener("click", modal.close)
}

function showAuthPanel() {
  const modal = createModalBase("Sign in to Nova", "Sync your workspace across devices")

  modal.body.innerHTML = `
    <div class="auth-hero">
      <div class="auth-visual">
        <div class="auth-visual-orb">N</div>
      </div>
      <h3>Make Nova yours</h3>
      <p>Sign in will sync chats, settings, projects and library items once Nova's account backend is connected.</p>
    </div>

    <div class="auth-options">
      <button class="auth-button" data-provider="Google" type="button">
        <span class="auth-logo google">G</span>
        <span>Continue with Google</span>
        <span>›</span>
      </button>

      <button class="auth-button" data-provider="GitHub" type="button">
        <span class="auth-logo github">GH</span>
        <span>Continue with GitHub</span>
        <span>›</span>
      </button>

      <button class="auth-button" data-provider="Email" type="button">
        <span class="auth-logo email">@</span>
        <span>Continue with email</span>
        <span>›</span>
      </button>
    </div>

    <div class="auth-note">Your current chats stay in this browser until account sync is enabled.</div>
  `

  modal.body.querySelectorAll(".auth-button").forEach(button => {
    button.addEventListener("click", () => {
      showNovaPanel(`${button.dataset.provider} sign in`, "The Nova sign in screen is ready. OAuth needs to be connected to the Worker before real accounts can be created.")
    })
  })
}

function showSettingsPanel() {
  const settings = getSettings()
  const modal = createModalBase("Settings", "Control your Nova workspace")

  modal.body.innerHTML = `
    <div class="settings-profile-card">
      <div class="settings-profile-image">N</div>
      <div>
        <strong>Nova account</strong>
        <span>Not signed in</span>
      </div>
      <button class="nova-small-button" id="settingsSignIn" type="button">Sign in</button>
    </div>

    <div class="settings-section-title">Appearance</div>

    <div class="settings-row">
      <div class="settings-row-copy">
        <strong>Glass interface</strong>
        <span>Keep Nova's translucent workspace enabled</span>
      </div>
      <span class="settings-pill">ON</span>
    </div>

    <div class="settings-section-title">Intelligence</div>

    <label class="settings-row settings-toggle-row">
      <div class="settings-row-copy">
        <strong>Thinking mode</strong>
        <span>Ask the Worker to use deeper reasoning when supported</span>
      </div>
      <input id="thinkingToggle" type="checkbox" ${settings.thinking ? "checked" : ""}>
      <span class="toggle-ui"></span>
    </label>

    <div class="settings-row">
      <div class="settings-row-copy">
        <strong>Model routing</strong>
        <span>Primary model plus future fallback providers</span>
      </div>
      <span class="settings-status"><i></i> Connected</span>
    </div>

    <div class="settings-section-title">Connections</div>

    <div class="connection-card">
      <div class="connection-icon">API</div>
      <div class="connection-copy">
        <strong>Nova Worker API</strong>
        <span>Secure requests are routed through your Cloudflare Worker</span>
      </div>
      <span class="settings-status"><i></i> Online</span>
    </div>

    <div class="connection-card muted-card">
      <div class="connection-icon">+</div>
      <div class="connection-copy">
        <strong>More providers</strong>
        <span>OpenAI, Anthropic, Gemini and custom endpoints can be added server side</span>
      </div>
      <span class="settings-pill">NEXT</span>
    </div>

    <div class="settings-warning">
      Never put private API keys directly in this frontend. Store provider keys in Worker secrets instead.
    </div>
  `

  modal.body.querySelector("#settingsSignIn").addEventListener("click", showAuthPanel)

  modal.body.querySelector("#thinkingToggle").addEventListener("change", event => {
    const next = getSettings()
    next.thinking = event.target.checked
    saveSettings(next)
  })
}

input?.addEventListener("input", resizeInput)

input?.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    if (typeof window.sendMessage === "function") window.sendMessage()
  }
})

sendButton?.addEventListener("click", event => {
  event.preventDefault()
  if (typeof window.sendMessage === "function") window.sendMessage()
})

newChatButton?.addEventListener("click", () => {
  if (typeof window.newChat === "function") window.newChat()
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
  showNovaPanel("Projects", "Projects will become your focused workspaces for chats, files, instructions and tools.")
  closeSidebar()
})

document.getElementById("library")?.addEventListener("click", () => {
  showNovaPanel("Library", "Your saved files, generated content and useful Nova items will live here.")
  closeSidebar()
})

document.getElementById("plugins")?.addEventListener("click", () => {
  showNovaPanel("Plugins", "Plugins will connect Nova to tools and services through controlled server-side integrations.")
  closeSidebar()
})

document.getElementById("settings")?.addEventListener("click", showSettingsPanel)

document.getElementById("searchChats")?.addEventListener("click", () => {
  showNovaPanel("Search chats", "Search is planned across your local conversation history. Account sync will make it available across devices.")
  closeSidebar()
})

document.getElementById("attach")?.addEventListener("click", () => {
  showNovaPanel("Attachments", "File uploads will be connected to the Worker so files can be processed without exposing private credentials.")
})

document.getElementById("modelSelector")?.addEventListener("click", () => {
  const settings = getSettings()
  const modal = createModalBase("Nova intelligence", "Choose how Nova spends its reasoning budget")

  modal.body.innerHTML = `
    <div class="model-card active">
      <div class="model-card-icon">N</div>
      <div class="model-card-copy">
        <strong>Nova</strong>
        <span>Balanced everyday model routing</span>
      </div>
      <span class="settings-status"><i></i> Active</span>
    </div>

    <label class="settings-row settings-toggle-row">
      <div class="settings-row-copy">
        <strong>Deeper thinking</strong>
        <span>Send a reasoning preference to the Worker when enabled</span>
      </div>
      <input id="modelThinkingToggle" type="checkbox" ${settings.thinking ? "checked" : ""}>
      <span class="toggle-ui"></span>
    </label>

    <div class="settings-warning">Thinking controls can only affect the actual model if your Worker forwards the setting to the provider.</div>
  `

  modal.body.querySelector("#modelThinkingToggle").addEventListener("change", event => {
    const next = getSettings()
    next.thinking = event.target.checked
    saveSettings(next)
  })
})

document.getElementById("shareButton")?.addEventListener("click", async () => {
  const chat = typeof window.getCurrentChat === "function" ? window.getCurrentChat() : null

  if (!chat) {
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
