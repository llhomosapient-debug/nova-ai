function getChats() {
  return JSON.parse(
    localStorage.getItem("nova_chats") || "[]"
  )
}

function clearChats() {
  localStorage.removeItem("nova_chats")
  location.reload()
}
