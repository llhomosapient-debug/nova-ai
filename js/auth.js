const NOVA_AUTH_KEY = "nova_registered_v1"
const NOVA_PROFILE_KEY = "nova_profile_v1"

function novaRegistered() {
  return localStorage.getItem(NOVA_AUTH_KEY) === "true"
}

function authPanel() {
  document.querySelector(".nova-auth-backdrop")?.remove()

  const backdrop = document.createElement("div")
  backdrop.className = "nova-auth-backdrop"
  backdrop.innerHTML = `
    <div class="nova-auth-orb nova-auth-orb-a"></div>
    <div class="nova-auth-orb nova-auth-orb-b"></div>
    <section class="nova-auth-card" role="dialog" aria-modal="true" aria-labelledby="novaAuthTitle">
      <button class="nova-auth-close" type="button" aria-label="Close">×</button>
      <div class="nova-auth-logo">N</div>
      <div class="nova-auth-eyebrow">NOVA WORKSPACE</div>
      <h2 id="novaAuthTitle">Keep your Nova saved</h2>
      <p>Register to keep chats, settings and workspace data when you leave. Guest data stays temporary and disappears when the browser session ends.</p>
      <form class="nova-auth-form">
        <input id="novaName" autocomplete="name" placeholder="Your name" required maxlength="60">
        <input id="novaEmail" type="email" autocomplete="email" placeholder="Email address" required maxlength="120">
        <button class="nova-auth-primary" type="submit">Create Nova account</button>
      </form>
      <button class="nova-auth-guest" type="button">Continue as guest</button>
      <small>No real password or OAuth is created here yet. The Worker will handle real authentication later.</small>
    </section>
  `

  const close = () => backdrop.remove()
  backdrop.querySelector(".nova-auth-close").addEventListener("click", close)
  backdrop.querySelector(".nova-auth-guest").addEventListener("click", close)
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) close()
  })

  backdrop.querySelector("form").addEventListener("submit", event => {
    event.preventDefault()
    const name = backdrop.querySelector("#novaName").value.trim()
    const email = backdrop.querySelector("#novaEmail").value.trim()
    if (!name || !email) return

    const guestChats = sessionStorage.getItem("nova_chats_v2")
    const guestSettings = sessionStorage.getItem("nova_settings_v2")

    localStorage.setItem(NOVA_AUTH_KEY, "true")
    localStorage.setItem(NOVA_PROFILE_KEY, JSON.stringify({ name, email, created: Date.now() }))

    if (guestChats) localStorage.setItem("nova_chats_v2", guestChats)
    if (guestSettings) localStorage.setItem("nova_settings_v2", guestSettings)

    sessionStorage.removeItem("nova_chats_v2")
    sessionStorage.removeItem("nova_settings_v2")
    close()
    updateAccountButton()
    window.renderHistory?.()
  })

  document.body.appendChild(backdrop)
  requestAnimationFrame(() => backdrop.classList.add("visible"))
}

function updateAccountButton() {
  const button = document.getElementById("accountButton")
  if (!button) return
  const copy = button.querySelector(".profile-copy")
  if (!copy) return

  if (novaRegistered()) {
    let profile = {}
    try { profile = JSON.parse(localStorage.getItem(NOVA_PROFILE_KEY) || "{}") } catch {}
    copy.innerHTML = `<strong>${String(profile.name || "Nova").replace(/[<>&]/g, "")}</strong><span>Registered workspace</span>`
  } else {
    copy.innerHTML = `<strong>Register</strong><span>Save your Nova workspace</span>`
  }
}

document.addEventListener("click", event => {
  const account = event.target.closest("#accountButton, #settingsSignIn")
  if (!account) return
  event.preventDefault()
  event.stopImmediatePropagation()
  authPanel()
}, true)

window.addEventListener("beforeunload", () => {
  if (!novaRegistered()) {
    sessionStorage.removeItem("nova_chats_v2")
    sessionStorage.removeItem("nova_settings_v2")
  }
})

updateAccountButton()

if (!novaRegistered() && sessionStorage.getItem("nova_auth_seen_v1") !== "true") {
  sessionStorage.setItem("nova_auth_seen_v1", "true")
  setTimeout(authPanel, 350)
}
