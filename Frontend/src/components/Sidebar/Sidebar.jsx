import React from "react"
import { Link, useLocation } from "react-router-dom"
import "./Sidebar.css"
import { assets } from "../../assets/assets"

const Sidebar = ({
  chats,
  currentChat,
  setCurrentChat,
  newChat,
  extended,
  setExtended,
  darkMode,
  setDarkMode
}) => {

  const location = useLocation();

  return (

    <div className={`sidebar ${extended ? "extended" : "collapsed"}`}>

      {/* TOP SECTION */}
      <div className="top">

        {/* MENU BUTTON */}
        <img
          className="menu"
          src={assets.menu_icon}
          alt="menu"
          onClick={() => setExtended(prev => !prev)}
        />

        {/* NEW CHAT BUTTON */}
        <Link to="/" style={{ textDecoration: 'none' }}>
        <div className="new-chat" onClick={newChat}>
          <img src={assets.plus_icon} alt="new chat"/>
          {extended && <p>New Chat</p>}
        </div>
        </Link>

        {/* CHAT HISTORY */}
        {extended && (
          <div className="recent">

            <p className="recent-title">Recent</p>

            {chats.map((chat) => {

              const lastMessage = chat.messages[chat.messages.length - 1]

              const title =
                lastMessage?.text
                  ? lastMessage.text.slice(0, 25)
                  : "New Chat"

              return (

                <div
                  key={chat.id}
                  className={`recent-entry ${currentChat === chat.id ? "active" : ""}`}
                  onClick={() => setCurrentChat(chat.id)}
                >

                  <img src={assets.message_icon} alt="chat" />
                  <p>{title}</p>

                </div>

              )

            })}

          </div>
        )}

      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom">

        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={`bottom-item recent-entry ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <img src={assets.history_icon} alt="dashboard" />
            {extended && <p>Dashboard</p>}
          </div>
        </Link>

        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="help" />
          {extended && <p>Help</p>}
        </div>

        {/* DARK MODE BUTTON */}
        <div
          className="bottom-item recent-entry"
          onClick={() => setDarkMode(prev => !prev)}
        >
          <img src={assets.bulb_icon} alt="theme" />
          {extended && <p>{darkMode ? "Light Mode" : "Dark Mode"}</p>}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="settings" />
          {extended && <p>Settings</p>}
        </div>

        {/* PROFILE SECTION */}
        <div className="profile">
          <img src={assets.user_icon} alt="profile"/>
          {extended && <p>Dev</p>}
        </div>

      </div>

    </div>

  )

}

export default Sidebar