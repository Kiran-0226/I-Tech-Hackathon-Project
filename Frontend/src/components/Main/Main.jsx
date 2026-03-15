import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const Main = ({ chats, setChats, currentChat, extended }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);

  const chat = chats.find((c) => c.id === currentChat);
  const messages = chat ? chat.messages : [];

  /* Auto scroll */

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendPrompt = async () => {
    if (!input.trim() || !currentChat || loading) return;

    const promptText = input;

    const userMessage = {
      role: "user",
      text: promptText,
    };

    setInput("");
    setLoading(true);

    /* Show user message instantly */

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChat
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat,
      ),
    );

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: promptText,
      });

      const replyText = res?.data?.reply || "⚠️ No response from AI.";

      const aiMessage = {
        role: "assistant",
        text: replyText,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat,
        ),
      );
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: "⚠️ Error contacting AI server.",
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat,
        ),
      );

      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className={`main ${extended ? "extended" : "collapsed"}`}>
      {/* CHAT AREA */}

      <div className="main-container">
        {messages.length === 0 ? (
          <div className="greet">
            <p>
              <span>Hello, Dev</span>
            </p>
            <p>How can I help you today?</p>
          </div>
        ) : (
          <div className="chat-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <ReactMarkdown
                  components={{
                    code({ inline, className, children }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline ? (
                        <SyntaxHighlighter
                          language={match?.[1] || "javascript"}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code>{children}</code>
                      );
                    },
                  }}
                >
                  {msg.text.startsWith("http") ? (
                    <img
                      src={msg.text}
                      alt="generated"
                      style={{
                        maxWidth: "400px",
                        borderRadius: "12px",
                        marginTop: "10px",
                      }}
                    />
                  ) : (
                    msg.text
                  )}
                </ReactMarkdown>
              </div>
            ))}

            {loading && <p className="thinking">Thinking...</p>}

            <div ref={endRef}></div>
          </div>
        )}
      </div>

      {/* INPUT BAR */}

      <div className="main-bottom">
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter a prompt here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendPrompt();
              }
            }}
          />

          <div>
            <img src={assets.gallery_icon} alt="gallery" />
            <img src={assets.mic_icon} alt="mic" />

            <img
              src={assets.send_icon}
              alt="send"
              onClick={sendPrompt}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
