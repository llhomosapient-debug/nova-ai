const NOVA_ENHANCE_SETTINGS = "nova_settings_v2"

function novaEnhanceSettings() {
  const registered = localStorage.getItem("nova_registered_v1") === "true"
  const store = registered ? localStorage : sessionStorage
  try {
    const value = JSON.parse(store.getItem(NOVA_ENHANCE_SETTINGS) || "{}")
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

function saveNovaEnhanceSettings(next) {
  const registered = localStorage.getItem("nova_registered_v1") === "true"
  const store = registered ? localStorage : sessionStorage
  store.setItem(NOVA_ENHANCE_SETTINGS, JSON.stringify(next))
}

function openModelChooser(event) {
  event.preventDefault()
  event.stopPropagation()
  document.querySelector(".nova-model-backdrop")?.remove()

  const settings = novaEnhanceSettings()
  const backdrop = document.createElement("div")
  backdrop.className = "nova-model-backdrop"
  backdrop.innerHTML = `
    <section class="nova-model-picker" role="dialog" aria-modal="true">
      <button class="nova-model-close" type="button" aria-label="Close">×</button>
      <div class="nova-model-kicker">NOVA INTELLIGENCE</div>
      <h2>Choose a model</h2>
      <p>Use a lighter model for simple chats or a deeper route when the Worker supports it.</p>
      <div class="nova-model-options">
        <button data-model="nova-fast" type="button"><strong>Nova Fast</strong><span>Simple questions · low latency · lower token use</span><i>FAST</i></button>
        <button data-model="nova-balanced" type="button"><strong>Nova Balanced</strong><span>Everyday coding, writing and research</span><i>DEFAULT</i></button>
        <button data-model="nova-think" type="button"><strong>Nova Think</strong><span>Harder reasoning · deeper work · higher usage</span><i>DEEP</i></button>
      </div>
      <small>The Worker decides the real provider and model mapping. These names are routing preferences, not exposed API keys.</small>
    </section>
  `

  const close = () => backdrop.remove()
  backdrop.querySelector(".nova-model-close").addEventListener("click", close)
  backdrop.addEventListener("click", e => { if (e.target === backdrop) close() })
  backdrop.querySelectorAll("[data-model]").forEach(button => {
    if ((settings.model || "nova-balanced") === button.dataset.model) button.classList.add("selected")
    button.addEventListener("click", () => {
      const next = novaEnhanceSettings()
      next.model = button.dataset.model
      if (button.dataset.model === "nova-think") next.thinking = true
      saveNovaEnhanceSettings(next)
      close()
    })
  })

  document.body.appendChild(backdrop)
  requestAnimationFrame(() => backdrop.classList.add("visible"))
}

document.addEventListener("click", event => {
  if (event.target.closest("#modelSelector")) openModelChooser(event)
}, true)

function playLouderGlassSound() {
  const settings = novaEnhanceSettings()
  if (settings.sounds === false) return
  try {
    const Audio = window.AudioContext || window.webkitAudioContext
    if (!Audio) return
    const ctx = new Audio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(780, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1180, ctx.currentTime + 0.055)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
    setTimeout(() => ctx.close?.(), 180)
  } catch {}
}

document.addEventListener("pointerdown", event => {
  const target = event.target.closest("button, [role=button]")
  if (target && !target.disabled) playLouderGlassSound()
})
