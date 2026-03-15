import React, { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar/Sidebar"
import Main from "./components/Main/Main"
import "./App.css"

const App = () => {

  const [extended, setExtended] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const [chats, setChats] = useState([
    { id: Date.now(), messages: [] }
  ])

  const [currentChat, setCurrentChat] = useState(chats[0].id)

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [darkMode])

  const newChat = () => {
    const chat = {
      id: Date.now(),
      messages: []
    }

    setChats(prev => [...prev, chat])
    setCurrentChat(chat.id)
  }

  return (
    <div className="app">

      <Sidebar
        chats={chats}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        newChat={newChat}
        extended={extended}
        setExtended={setExtended}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Main
        chats={chats}
        setChats={setChats}
        currentChat={currentChat}
        extended={extended}
      />

    </div>
  )
}

export default App