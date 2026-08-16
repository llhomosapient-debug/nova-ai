const input = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const newChatButton = document.getElementById("newChat")
const mobileMenu = document.getElementById("mobileMenu")
const sidebar = document.getElementById("sidebar")

const SETTINGS_KEY = "nova_settings_v2"
let audioContext = null

function getSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
    return settings && typeof settings === "object" ? settings : {}
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function playClickSound() {
  if (getSettings().sounds === false) return
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === "suspended") audioContext.resume()

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(720, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1080, audioContext.currentTime + 0.045)
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.075)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.08)
  } catch {}
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, [role=button]")
  if (target && !target.disabled) playClickSound()
})

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

function createModalBase(title, subtitle, wide = true) {
  document.querySelector(".nova-modal-backdrop")?.remove()

  const backdrop = document.createElement("div")
  backdrop.className = "nova-modal-backdrop"

  const panel = document.createElement("div")
  panel.className = `nova-modal${wide ? " nova-modal-wide" : ""}`
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-modal", "true")

  panel.innerHTML = `
    <div class="nova-modal-glow"></div>
    <div class="nova-modal-header">
      <div class="nova-modal-mark">N</div>
      <div class="nova-modal-heading">
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
  setTimeout(() => panel.querySelector(".nova-modal-x")?.focus(), 0)

  return { backdrop, panel, body: panel.querySelector(".nova-modal-body"), close }
}

function showNovaPanel(title, text) {
  const modal = createModalBase(title, "Nova workspace", false)
  modal.body.innerHTML = `<p class="nova-modal-text"></p><button class="nova-primary-button" type="button">Close</button>`
  modal.body.querySelector(".nova-modal-text").textContent = text
  modal.body.querySelector(".nova-primary-button").addEventListener("click", modal.close)
}

function showAuthPanel() {
  const modal = createModalBase("Sign in to Nova", "One account for your whole Nova workspace")
  modal.body.innerHTML = `
    <div class="auth-hero">
      <div class="auth-visual"><div class="auth-orbit orbit-a"></div><div class="auth-orbit orbit-b"></div><div class="auth-visual-orb">N</div></div>
      <h3>Welcome to Nova</h3>
      <p>Sync chats, settings, projects and library items across your devices when account services are connected.</p>
    </div>
    <div class="auth-options">
      <button class="auth-button" data-provider="Google" type="button"><span class="auth-logo">G</span><span>Continue with Google</span><span>›</span></button>
      <button class="auth-button" data-provider="GitHub" type="button"><span class="auth-logo">GH</span><span>Continue with GitHub</span><span>›</span></button>
      <button class="auth-button" data-provider="Email" type="button"><span class="auth-logo">@</span><span>Continue with email</span><span>›</span></button>
    </div>
    <div class="auth-note">Authentication is UI-ready. Real OAuth and account sessions belong in the Worker, not in frontend code.</div>
  `
  modal.body.querySelectorAll(".auth-button").forEach(button => {
    button.addEventListener("click", () => showNovaPanel(`${button.dataset.provider} sign in`, "The Nova sign-in interface is ready. Connect OAuth in the Worker before accepting real credentials."))
  })
}

function toggleRow(id, title, description, checked) {
  return `<label class="settings-row settings-toggle-row"><div class="settings-row-copy"><strong>${title}</strong><span>${description}</span></div><input id="${id}" type="checkbox" ${checked ? "checked" : ""}><span class="toggle-ui"></span></label>`
}

function bindSettingToggle(modal, id, key) {
  modal.body.querySelector(`#${id}`)?.addEventListener("change", event => {
    const settings = getSettings()
    settings[key] = event.target.checked
    saveSettings(settings)
  })
}

function showSettingsPanel() {
  const settings = getSettings()
  const modal = createModalBase("Settings", "Make Nova feel like your own AI", true)

  modal.body.innerHTML = `
    <div class="settings-profile-card settings-profile-hero"><div class="settings-profile-image">N</div><div><strong>Nova workspace</strong><span>Not signed in · local mode</span></div><button class="nova-small-button" id="settingsSignIn" type="button">Sign in</button></div>
    <div class="settings-section-title">Interface</div>
    <div class="settings-row"><div class="settings-row-copy"><strong>Glass interface</strong><span>Translucent panels, calm blue lighting and soft depth</span></div><span class="settings-pill">ON</span></div>
    ${toggleRow("soundToggle", "Glass click sounds", "Play a tiny soft sound when you interact with Nova", settings.sounds !== false)}
    <div class="settings-section-title">Intelligence</div>
    ${toggleRow("thinkingToggle", "Deep thinking", "Ask the Worker for deeper reasoning when the selected provider supports it", settings.thinking)}
    ${toggleRow("researchToggle", "Web research", "Allow Nova to use a server-side research tool when the Worker supports it", settings.research)}
    ${toggleRow("imageToggle", "Image generation", "Allow image requests to be routed through a configured image provider", settings.images)}
    <div class="settings-row"><div class="settings-row-copy"><strong>Response style</strong><span>Balanced · concise answers with room for depth</span></div><select id="styleSelect" class="nova-select"><option value="balanced">Balanced</option><option value="precise">Precise</option><option value="creative">Creative</option></select></div>
    <div class="settings-section-title">Safety</div>
    ${toggleRow("matureToggle", "Mature content mode", "Age-gated content preferences. This never disables Nova's core safety protections", settings.matureMode)}
    <div class="age-gate" id="ageGate" ${settings.matureMode ? "" : "hidden"}><strong>18+ confirmation</strong><span>Confirming age only changes the content preference. It does not unlock illegal, dangerous or harmful assistance.</span><button id="verifyAge" class="nova-small-button" type="button">${settings.ageVerified ? "18+ verified" : "Confirm 18+"}</button></div>
    <div class="settings-section-title">API & providers</div>
    <div class="connection-card"><div class="connection-icon">API</div><div class="connection-copy"><strong>Nova Worker</strong><span>Primary gateway for models, research and image providers</span></div><span class="settings-status"><i></i> Ready</span></div>
    <div class="connection-card"><div class="connection-icon">IMG</div><div class="connection-copy"><strong>Image provider</strong><span>Configured server-side. Keep private keys inside Worker secrets</span></div><span class="settings-pill">SERVER</span></div>
    <div class="connection-card"><div class="connection-icon">WEB</div><div class="connection-copy"><strong>Research provider</strong><span>Search, fetch, compare and cite through the Worker</span></div><span class="settings-pill">SERVER</span></div>
    <div class="settings-section-title">Data</div>
    <div class="settings-row"><div class="settings-row-copy"><strong>Local chats</strong><span>Current conversations are stored in this browser</span></div><button id="clearChats" class="nova-small-button" type="button">Clear</button></div>
    <div class="settings-warning">Never place provider API keys in index.html or frontend JavaScript. Use Worker secrets and validate every tool request server-side.</div>
  `

  modal.body.querySelector("#settingsSignIn").addEventListener("click", showAuthPanel)
  bindSettingToggle(modal, "thinkingToggle", "thinking")
  bindSettingToggle(modal, "researchToggle", "research")
  bindSettingToggle(modal, "imageToggle", "images")
  bindSettingToggle(modal, "soundToggle", "sounds")

  modal.body.querySelector("#matureToggle").addEventListener("change", event => {
    const next = getSettings()
    next.matureMode = event.target.checked
    if (!event.target.checked) next.ageVerified = false
    saveSettings(next)
    modal.body.querySelector("#ageGate").hidden = !event.target.checked
  })

  modal.body.querySelector("#verifyAge").addEventListener("click", () => {
    const next = getSettings()
    next.ageVerified = true
    saveSettings(next)
    modal.body.querySelector("#verifyAge").textContent = "18+ verified"
  })

  modal.body.querySelector("#styleSelect").value = settings.style || "balanced"
  modal.body.querySelector("#styleSelect").addEventListener("change", event => {
    const next = getSettings()
    next.style = event.target.value
    saveSettings(next)
  })

  modal.body.querySelector("#clearChats").addEventListener("click", () => {
    localStorage.removeItem("nova_chats_v2")
    window.renderHistory?.()
    modal.body.querySelector("#clearChats").textContent = "Cleared"
  })
}

function showToolPanel(kind) {
  const settings = getSettings()
  const isWeb = kind === "web"
  const modal = createModalBase(isWeb ? "Web research" : "Image generation", isWeb ? "Ground answers in fresh sources" : "Create visuals through a server-side image provider", true)
  modal.body.innerHTML = isWeb ? `
    <div class="tool-hero"><div class="tool-hero-icon">◎</div><div><strong>Research mode</strong><span>Search → read → compare → cite</span></div></div>
    ${toggleRow("toolResearch", "Enable research requests", "Nova may ask the Worker to search and summarize current sources", settings.research)}
    <div class="settings-row"><div class="settings-row-copy"><strong>Source handling</strong><span>Prefer primary and trustworthy sources, then show citations</span></div><span class="settings-pill">CITED</span></div>
    <div class="settings-warning">The browser does not get direct access to private search credentials. The Worker should perform searches and return source metadata.</div>
  ` : `
    <div class="tool-hero"><div class="tool-hero-icon">▧</div><div><strong>Image generation</strong><span>Prompt → provider → image result</span></div></div>
    ${toggleRow("toolImages", "Enable image requests", "Nova may route image prompts to the configured server-side provider", settings.images)}
    <div class="settings-row"><div class="settings-row-copy"><strong>Provider</strong><span>Configured in Worker environment secrets</span></div><span class="settings-pill">PRIVATE</span></div>
    <div class="settings-warning">Do not expose image API keys in the frontend. The Worker should validate prompts, call the provider and return the result.</div>
  `

  bindSettingToggle(modal, isWeb ? "toolResearch" : "toolImages", isWeb ? "research" : "images")
}

function showModelPanel() {
  const settings = getSettings()
  const modal = createModalBase("Nova intelligence", "Choose how much work Nova asks the backend to do", true)
  modal.body.innerHTML = `
    <div class="model-card active"><div class="model-card-icon">N</div><div class="model-card-copy"><strong>Nova balanced</strong><span>Fast everyday routing with clean answers</span></div><span class="settings-status"><i></i> Active</span></div>
    ${toggleRow("modelThinkingToggle", "Deep thinking", "Send a reasoning preference to the Worker when supported", settings.thinking)}
    ${toggleRow("modelResearchToggle", "Web research", "Permit the Worker to use search and source retrieval", settings.research)}
    ${toggleRow("modelImageToggle", "Image generation", "Permit image requests through the configured provider", settings.images)}
    <div class="settings-warning">The frontend only expresses preferences. The Worker decides which providers, tools and safety checks are actually available.</div>
  `
  bindSettingToggle(modal, "modelThinkingToggle", "thinking")
  bindSettingToggle(modal, "modelResearchToggle", "research")
  bindSettingToggle(modal, "modelImageToggle", "images")
}

input?.addEventListener("input", resizeInput)
input?.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    window.sendMessage?.()
  }
})

sendButton?.addEventListener("click", event => {
  event.preventDefault()
  window.sendMessage?.()
})

newChatButton?.addEventListener("click", () => {
  window.newChat?.()
  closeSidebar()
})

mobileMenu?.addEventListener("click", () => sidebar?.classList.toggle("open"))

document.querySelectorAll(".suggestions button").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt || ""
    resizeInput()
    input.focus()
  })
})

document.getElementById("accountButton")?.addEventListener("click", showAuthPanel)
document.getElementById("settings")?.addEventListener("click", showSettingsPanel)
document.getElementById("webResearch")?.addEventListener("click", () => { showToolPanel("web"); closeSidebar() })
document.getElementById("imageTools")?.addEventListener("click", () => { showToolPanel("image"); closeSidebar() })
document.getElementById("projects")?.addEventListener("click", () => { showNovaPanel("Projects", "Focused workspaces for chats, files, instructions and tools are coming next."); closeSidebar() })
document.getElementById("library")?.addEventListener("click", () => { showNovaPanel("Library", "Saved files, generated content and useful Nova items will live here."); closeSidebar() })
document.getElementById("plugins")?.addEventListener("click", () => { showNovaPanel("Plugins", "Controlled server-side integrations for Nova tools are coming next."); closeSidebar() })
document.getElementById("searchChats")?.addEventListener("click", () => { showNovaPanel("Search chats", "Search across your local conversation history. Account sync will make this available across devices."); closeSidebar() })
document.getElementById("attach")?.addEventListener("click", () => showNovaPanel("Attachments", "File uploads will be routed through the Worker so private credentials stay server-side."))
document.getElementById("modelSelector")?.addEventListener("click", showModelPanel)

document.getElementById("shareButton")?.addEventListener("click", async () => {
  const chat = window.getCurrentChat?.()
  if (!chat) return showNovaPanel("Nothing to share", "Start a chat first and Nova can create a shareable link for the current conversation.")
  try {
    await navigator.clipboard.writeText(window.location.href)
    showNovaPanel("Link copied", "The current Nova page link was copied to your clipboard.")
  } catch {
    showNovaPanel("Couldn't copy", "Your browser blocked clipboard access. Copy the page address manually.")
  }
})

input?.focus()
