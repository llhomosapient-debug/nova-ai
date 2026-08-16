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
  localStorage.setItem(
    NOVA_STORAGE_KEY,
    JSON.stringify(chats.slice(0, 100))
  )
}

function saveChat(chat) {
  if (!chat?.id) return

  const chats = getChats()

  const filtered = chats.filter(
    item => item.id !== chat.id
  )

  filtered.unshift(chat)

  saveChats(filtered)
}

function deleteChat(id) {
  saveChats(
    getChats().filter(
      chat => chat.id !== id
    )
  )
}

window.getChats = getChats
window.saveChat = saveChat
window.deleteChat = deleteChat
