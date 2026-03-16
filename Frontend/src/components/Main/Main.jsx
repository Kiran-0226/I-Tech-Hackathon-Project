import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import axios from "axios";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { Pie, Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
} from "chart.js";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DiagramRenderer from "../DiagramRenderer";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const Main = ({ chats, setChats, currentChat, extended }) => {

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);

  const chat = chats.find((c) => c.id === currentChat);
  const messages = chat ? chat.messages : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ================= PIN TO DASHBOARD ================= */

  const pinToDashboard = (msg) => {

    const savedPins =
      JSON.parse(localStorage.getItem("dashboardPins")) || [];

    savedPins.push(msg);

    localStorage.setItem("dashboardPins", JSON.stringify(savedPins));

    alert("📌 Pinned to Dashboard");

  };

  /* ================= DOWNLOAD PNG ================= */

  const downloadPNG = async (index) => {

    const element = document.getElementById(`visual-${index}`);
    if (!element) return;

    const buttons = element.querySelector(".chart-actions");
    if (buttons) buttons.style.display = "none";

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    if (buttons) buttons.style.display = "flex";

    const link = document.createElement("a");
    link.href = imgData;
    link.download = "visualization.png";
    link.click();

  };

  /* ================= DOWNLOAD PDF ================= */

  const downloadPDF = async (index) => {

    const element = document.getElementById(`visual-${index}`);
    if (!element) return;

    const buttons = element.querySelector(".chart-actions");
    if (buttons) buttons.style.display = "none";

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    if (buttons) buttons.style.display = "flex";

    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("AI Generated Visualization", 10, 10);

    pdf.addImage(imgData, "PNG", 10, 20, 180, 120);

    pdf.save("visualization.pdf");

  };

  /* ================= SEND PROMPT ================= */

  const sendPrompt = async () => {

    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      text: input
    };

    const promptText = input;

    setInput("");
    setLoading(true);

    setChats(prev =>
      prev.map(chat =>
        chat.id === currentChat
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    try {

      const res = await axios.post("http://localhost:5000/api/chat", {
        message: promptText
      });

      let aiMessage;

      if (res.data.chart) {

        aiMessage = {
          role: "assistant",
          chart: res.data.chart
        };

      } else if (res.data.diagram) {

        aiMessage = {
          role: "assistant",
          diagram: res.data.diagram
        };

      } else {

        aiMessage = {
          role: "assistant",
          text: res.data.reply
        };

      }

      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );

    } catch (error) {

      console.error(error);

      const errMsg = {
        role: "assistant",
        text: "⚠️ Error contacting AI server."
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, errMsg] }
            : chat
        )
      );
    }

    setLoading(false);
  };

  /* ================= CHART RENDER ================= */

  const renderChart = (msg) => {

    const colors = [
      "#4b99ff",
      "#ff5546",
      "#4caf50",
      "#ffb300",
      "#9c27b0",
      "#00acc1",
      "#ff6f61",
      "#26a69a"
    ];

    const data = {
      labels: msg.chart.labels,
      datasets: [
        {
          label: "Analytics",
          data: msg.chart.values,
          backgroundColor: colors.slice(0, msg.chart.labels.length)
        }
      ]
    };

    if (msg.chart.type === "bar") return <Bar data={data} />;
    if (msg.chart.type === "line") return <Line data={data} />;
    return <Pie data={data} />;
  };

  return (

    <div className={`main ${extended ? "extended" : "collapsed"}`}>

      <div className="main-container">

        {messages.length === 0 ? (

          <div className="greet">
            <p><span>Hello, Dev</span></p>
            <p>How can I help you today?</p>
          </div>

        ) : (

          <div className="chat-area">

            {messages.map((msg, index) => (

              <div key={index} className={`message ${msg.role}`}>

                {msg.diagram ? (

                  <div className="diagram-container" id={`visual-${index}`}>

                    <DiagramRenderer code={msg.diagram} />

                    <div className="chart-actions">
                      <button onClick={() => downloadPNG(index)}>PNG</button>
                      <button onClick={() => downloadPDF(index)}>PDF</button>
                      <button onClick={() => pinToDashboard(msg)}>📌 Pin</button>
                    </div>

                  </div>

                ) : msg.chart ? (

                  <div className="chart-container" id={`visual-${index}`}>

                    {renderChart(msg)}

                    <div className="chart-actions">
                      <button onClick={() => downloadPNG(index)}>PNG</button>
                      <button onClick={() => downloadPDF(index)}>PDF</button>
                      <button onClick={() => pinToDashboard(msg)}>📌 Pin</button>
                    </div>

                  </div>

                ) : (

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children }) {

                        const match = /language-(\w+)/.exec(className || "");

                        return !inline ? (
                          <SyntaxHighlighter language={match?.[1] || "javascript"}>
                            {String(children)}
                          </SyntaxHighlighter>
                        ) : (
                          <code>{children}</code>
                        );

                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>

                )}

              </div>

            ))}

            {loading && <p className="thinking">Thinking...</p>}

            <div ref={endRef}></div>

          </div>

        )}

      </div>

      <div className="main-bottom">

        <div className="search-box">

          <input
            type="text"
            placeholder="Enter a prompt here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendPrompt();
              }
            }}
          />

          <img
            src={assets.send_icon}
            alt="send"
            onClick={sendPrompt}
            style={{ cursor: "pointer" }}
          />

        </div>

      </div>

    </div>

  );
};

export default Main;