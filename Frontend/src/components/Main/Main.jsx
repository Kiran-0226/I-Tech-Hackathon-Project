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

  /* AUTO SCROLL */

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* EXPORT PNG REPORT */

  const downloadImage = async (msg, index) => {

    const container = document.createElement("div");

    container.style.padding = "20px";
    container.style.background = "white";
    container.style.width = "700px";
    container.style.fontFamily = "Arial";

    const chartCanvas = document.querySelector(`#chart-${index} canvas`);

    const clonedCanvas = chartCanvas.cloneNode(true);

    const title = document.createElement("h2");
    title.innerText = "Analytics Report";

    const date = document.createElement("p");
    date.innerText = `Generated: ${new Date().toLocaleString()}`;

    container.appendChild(title);
    container.appendChild(date);
    container.appendChild(clonedCanvas);

    const table = document.createElement("table");
    table.style.marginTop = "20px";
    table.style.borderCollapse = "collapse";

    const header = `
      <tr>
        <th style="border:1px solid #ccc;padding:6px">Category</th>
        <th style="border:1px solid #ccc;padding:6px">Value</th>
      </tr>
    `;

    const rows = msg.chart.labels
      .map((l, i) => `
        <tr>
          <td style="border:1px solid #ccc;padding:6px">${l}</td>
          <td style="border:1px solid #ccc;padding:6px">${msg.chart.values[i]}</td>
        </tr>
      `)
      .join("");

    table.innerHTML = header + rows;

    container.appendChild(table);

    document.body.appendChild(container);

    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL("image/png");

    document.body.removeChild(container);

    const link = document.createElement("a");
    link.href = imgData;
    link.download = "analytics-report.png";
    link.click();
  };

  /* EXPORT PDF REPORT */

  const downloadPDF = async (msg, index) => {

    const element = document.getElementById(`chart-${index}`);
    const buttons = element.querySelector(".chart-actions");

    if (buttons) buttons.style.display = "none";

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    if (buttons) buttons.style.display = "flex";

    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("Analytics Report", 10, 10);

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 18);

    pdf.addImage(imgData, "PNG", 10, 30, 180, 100);

    pdf.save("analytics-report.pdf");
  };

  const sendPrompt = async () => {

    if (!input.trim() || !currentChat || loading) return;

    const promptText = input;

    const userMessage = {
      role: "user",
      text: promptText
    };

    setInput("");
    setLoading(true);

    setChats((prev) =>
      prev.map((chat) =>
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

      } else {

        aiMessage = {
          role: "assistant",
          text: res?.data?.reply || "⚠️ No response from AI."
        };

      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );

    } catch (error) {

      const errorMessage = {
        role: "assistant",
        text: "⚠️ Error contacting AI server."
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );

      console.error(error);
    }

    setLoading(false);
  };

  const renderChart = (msg) => {

    const chartData = {
      labels: msg.chart.labels,
      datasets: [
        {
          label: "Analytics",
          data: msg.chart.values,
          backgroundColor: [
            "#4b99ff",
            "#ff5546",
            "#4caf50",
            "#ffb300",
            "#9c27b0",
            "#00acc1"
          ]
        }
      ]
    };

    if (msg.chart.type === "bar") return <Bar data={chartData} />;
    if (msg.chart.type === "line") return <Line data={chartData} />;
    return <Pie data={chartData} />;
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

                {msg.chart ? (

                  <div className="chart-container" id={`chart-${index}`}>

                    {renderChart(msg)}

                    <div className="chart-actions">

                      <button onClick={() => downloadImage(msg, index)}>
                        Download PNG
                      </button>

                      <button onClick={() => downloadPDF(msg, index)}>
                        Download PDF
                      </button>

                    </div>

                  </div>

                ) : msg.text?.startsWith("http") ? (

                  <img
                    src={msg.text}
                    alt="generated"
                    style={{
                      maxWidth: "400px",
                      borderRadius: "12px",
                      marginTop: "10px"
                    }}
                  />

                ) : (

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children }) {

                        const match = /language-(\w+)/.exec(className || "");

                        return !inline ? (
                          <SyntaxHighlighter language={match?.[1] || "javascript"}>
                            {String(children).replace(/\n$/, "")}
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