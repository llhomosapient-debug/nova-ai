const NOVA_LAB_SETTINGS_KEY = "nova_settings_v2"

function novaLabSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(NOVA_LAB_SETTINGS_KEY) || "{}")
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

function saveNovaLabSettings(value) {
  localStorage.setItem(NOVA_LAB_SETTINGS_KEY, JSON.stringify(value))
}

function openLabPanel() {
  document.querySelector(".nova-modal-backdrop")?.remove()

  const settings = novaLabSettings()
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
      <div class="nova-modal-heading">
        <div class="nova-modal-title">Nova Lab</div>
        <div class="nova-modal-subtitle">Educational coding and security workspace</div>
      </div>
      <button class="nova-modal-x" type="button" aria-label="Close">×</button>
    </div>
    <div class="nova-modal-body">
      <div class="tool-hero">
        <div class="tool-hero-icon">⌘</div>
        <div><strong>Lab mode</strong><span>Made for learning, debugging, CTFs and controlled experiments</span></div>
      </div>
      <label class="settings-row settings-toggle-row">
        <div class="settings-row-copy"><strong>Enable Nova Lab</strong><span>Give Nova more room for educational security and programming experiments</span></div>
        <input id="labToggle" type="checkbox" ${settings.labMode ? "checked" : ""}>
        <span class="toggle-ui"></span>
      </label>
      <div class="settings-section-title">18+ preference</div>
      <label class="settings-row settings-toggle-row">
        <div class="settings-row-copy"><strong>18+ Lab content preference</strong><span>Requires age confirmation and only changes the content preference</span></div>
        <input id="labMatureToggle" type="checkbox" ${settings.matureMode ? "checked" : ""}>
        <span class="toggle-ui"></span>
      </label>
      <div class="age-gate" id="labAgeGate" ${settings.matureMode ? "" : "hidden"}>
        <strong>Age confirmation</strong>
        <span>Confirming age does not remove Nova's core safety boundaries</span>
        <button id="labVerify" class="nova-small-button" type="button">${settings.ageVerified ? "18+ verified" : "Confirm 18+"}</button>
      </div>
      <div class="settings-section-title">What Lab is for</div>
      <div class="connection-card"><div class="connection-icon">PY</div><div class="connection-copy"><strong>Python and programming labs</strong><span>Small educational programs, debugging and controlled demonstrations</span></div><span class="settings-pill">LAB</span></div>
      <div class="connection-card"><div class="connection-icon">CTF</div><div class="connection-copy"><strong>Security education</strong><span>CTFs, toy vulnerabilities, defensive analysis and sandboxed experiments</span></div><span class="settings-pill">LAB</span></div>
      <div class="connection-card"><div class="connection-icon">ESP</div><div class="connection-copy"><strong>Hardware learning</strong><span>ESP32 projects, sensors and safe local testing</span></div><span class="settings-pill">LAB</span></div>
      <div class="settings-warning">Lab mode does not provide instructions for credential theft, destructive malware, ransomware, real-world intrusion or other harmful abuse. It can still explain harmless simulations and defensive concepts in detail.</div>
    </div>
  `

  const close = () => {
    backdrop.classList.remove("visible")
    setTimeout(() => backdrop.remove(), 180)
  }

  panel.querySelector(".nova-modal-x").addEventListener("click", close)
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) close()
  })

  const labToggle = panel.querySelector("#labToggle")
  labToggle.addEventListener("change", event => {
    const next = novaLabSettings()
    next.labMode = event.target.checked
    saveNovaLabSettings(next)
  })

  const matureToggle = panel.querySelector("#labMatureToggle")
  matureToggle.addEventListener("change", event => {
    const next = novaLabSettings()
    next.matureMode = event.target.checked
    if (!event.target.checked) next.ageVerified = false
    saveNovaLabSettings(next)
    panel.querySelector("#labAgeGate").hidden = !event.target.checked
  })

  panel.querySelector("#labVerify").addEventListener("click", () => {
    const next = novaLabSettings()
    next.ageVerified = true
    saveNovaLabSettings(next)
    panel.querySelector("#labVerify").textContent = "18+ verified"
  })

  backdrop.appendChild(panel)
  document.body.appendChild(backdrop)
  requestAnimationFrame(() => backdrop.classList.add("visible"))
}

document.getElementById("labMode")?.addEventListener("click", openLabPanel)
