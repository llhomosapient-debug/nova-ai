const NOVA_STORAGE_KEY = "nova_chats_v2"
const NOVA_REGISTERED_KEY = "nova_registered_v1"

function novaIsRegistered() {
  return localStorage.getItem(NOVA_REGISTERED_KEY) === "true"
}

function novaStorage() {
  return novaIsRegistered() ? localStorage : sessionStorage
}

function getChats() {
  try {
    const chats = JSON.parse(novaStorage().getItem(NOVA_STORAGE_KEY) || "[]")
    return Array.isArray(chats) ? chats : []
  } catch {
    return []
  }
}

function saveChats(chats) {
  try {
    novaStorage().setItem(
      NOVA_STORAGE_KEY,
      JSON.stringify(chats.slice(0, 100))
    )
  } catch (error) {
    console.error("Nova history error", error)
  }
}

function clearNovaLocalData() {
  sessionStorage.removeItem(NOVA_STORAGE_KEY)
  sessionStorage.removeItem("nova_settings_v2")
  if (!novaIsRegistered()) {
    localStorage.removeItem("nova_settings_v2")
  }
}

window.getChats = getChats
window.saveChats = saveChats
window.novaIsRegistered = novaIsRegistered
window.clearNovaLocalData = clearNovaLocalData
