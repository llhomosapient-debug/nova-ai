const NOVA_MODEL_KEY = "nova_settings_v2"

function novaModelSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(NOVA_MODEL_KEY) || "{}")
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

function saveNovaModel(model) {
  const settings = novaModelSettings()
  settings.model = model
  localStorage.setItem(NOVA_MODEL_KEY, JSON.stringify(settings))
}

function novaModelLabel(model) {
  return {
    fast: "Nova Fast",
    balanced: "Nova Balanced",
    think: "Nova Think",
    max: "Nova Max"
  }[model] || "Nova Balanced"
}

function closeModelPicker(backdrop) {
  backdrop?.classList.remove("visible")
  setTimeout(() => backdrop?.remove(), 180)
}

function openModelPicker(event) {
  event.preventDefault()
  event.stopImmediatePropagation()

  document.querySelector(".nova-model-picker")?.remove()

  const settings = novaModelSettings()
  const selected = settings.model || "balanced"

  const backdrop = document.createElement("div")
  backdrop.className = "nova-modal-backdrop nova-model-picker"

  const panel = document.createElement("div")
  panel.className = "nova-modal nova-modal-wide"
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-modal", "true")

  panel.innerHTML = `
    <div class="nova-modal-glow"></div>
    <div class="nova-modal-header">
      <div class="nova-modal-mark">N</div>
      <div class="nova-modal-heading">
        <div class="nova-modal-title">Choose Nova model</div>
        <div class="nova-modal-subtitle">Pick the brain for this chat</div>
      </div>
      <button class="nova-modal-x" type="button" aria-label="Close">×</button>
    </div>
    <div class="nova-modal-body">
      <div class="nova-model-grid">
        <button class="nova-model-option" data-model="fast" type="button">
          <span class="nova-model-icon">F</span>
          <span><strong>Nova Fast</strong><small>Lightweight everyday replies</small></span>
          <i></i>
        </button>
        <button class="nova-model-option" data-model="balanced" type="button">
          <span class="nova-model-icon">B</span>
          <span><strong>Nova Balanced</strong><small>Best general purpose quality</small></span>
          <i></i>
        </button>
        <button class="nova-model-option" data-model="think" type="button">
          <span class="nova-model-icon">T</span>
          <span><strong>Nova Think</strong><small>More reasoning for harder tasks</small></span>
          <i></i>
        </button>
        <button class="nova-model-option" data-model="max" type="button">
          <span class="nova-model-icon">M</span>
          <span><strong>Nova Max</strong><small>Maximum reasoning and capability</small></span>
          <i></i>
        </button>
      </div>
      <div class="nova-model-note">Token usage is shown under each response. Model availability is controlled by the Nova Worker.</div>
    </div>
  `

  panel.querySelectorAll(".nova-model-option").forEach(button => {
    const isSelected = button.dataset.model === selected
    button.classList.toggle("active", isSelected)

    button.addEventListener("click", () => {
      saveNovaModel(button.dataset.model)
      document.querySelector("#modelSelector span:nth-child(2)")?.replaceChildren(document.createTextNode(novaModelLabel(button.dataset.model)))
      closeModelPicker(backdrop)
    })
  })

  const close = () => closeModelPicker(backdrop)
  panel.querySelector(".nova-modal-x").addEventListener("click", close)
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) close()
  })

  backdrop.appendChild(panel)
  document.body.appendChild(backdrop)
  requestAnimationFrame(() => backdrop.classList.add("visible"))
}

document.getElementById("modelSelector")?.addEventListener("click", openModelPicker, true)

document.addEventListener("DOMContentLoaded", () => {
  const settings = novaModelSettings()
  const model = settings.model || "balanced"
  const label = document.querySelector("#modelSelector span:nth-child(2)")
  if (label) label.textContent = novaModelLabel(model)
})
