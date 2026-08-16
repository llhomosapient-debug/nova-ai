const NOVA_STORAGE_KEY = "nova_chats_v2"

function getChats() {
  try {
    const chats = JSON.parse(
      localStorage.getItem(NOVA_STORAGE_KEY) || "[]"
    )

    return Array.isArray(chats) ? chats : []
  } catch {
    return []
  }
}

function saveChats(chats) {
  try {
    localStorage.setItem(
      NOVA_STORAGE_KEY,
      JSON.stringify(chats.slice(0, 100))
    )
  } catch (error) {
    console.error("Nova history error:", error)
  }
}

window.getChats = getChats
window.saveChats = saveChats
