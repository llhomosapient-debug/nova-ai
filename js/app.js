const inputBox =
  document.getElementById("messageInput")

const newChatButton =
  document.getElementById("newChat")

const mobileMenu =
  document.getElementById("mobileMenu")

const sidebar =
  document.getElementById("sidebar")

const suggestionButtons =
  document.querySelectorAll(
    ".suggestions button"
  )

if (inputBox) {

  inputBox.addEventListener(
    "input",
    () => {
      inputBox.style.height = "auto"

      inputBox.style.height =
        Math.min(
          inputBox.scrollHeight,
          180
        ) + "px"
    }
  )

  inputBox.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault()
        sendMessage()
      }

    }
  )
}

if (newChatButton) {
  newChatButton.onclick = () => {
    newChat()
  }
}

if (mobileMenu) {
  mobileMenu.onclick = () => {
    sidebar.classList.toggle("open")
  }
}

suggestionButtons.forEach(button => {

  button.onclick = () => {

    inputBox.value =
      button.dataset.prompt || ""

    inputBox.focus()

    inputBox.dispatchEvent(
      new Event("input")
    )
  }

})
