import React, { useEffect, useState } from "react"
import axios from "axios"
import { Pie, Bar, Line } from "react-chartjs-2"
import { FaPlus } from "react-icons/fa"
import DiagramRenderer from "../DiagramRenderer"
import "./Dashboard.css"

const Dashboard = ({ setPage }) => {

  const [data, setData] = useState(null)
  const [pins, setPins] = useState([])

  /* LOAD DATABASE DASHBOARD DATA */

  const loadData = () => {
    axios.get("http://localhost:5000/api/dashboard")
      .then(res => setData(res.data))
  }

  /* LOAD PINNED VISUALS */

  const loadPins = () => {
    const saved =
      JSON.parse(localStorage.getItem("dashboardPins")) || []
    setPins(saved)
  }

  useEffect(() => {

    loadData()
    loadPins()

    const interval = setInterval(loadData, 5000)

    return () => clearInterval(interval)

  }, [])

  if (!data) return <p className="loading">Loading dashboard...</p>

  /* REMOVE PIN */

  const removePin = (index) => {

    const updated = pins.filter((_, i) => i !== index)

    setPins(updated)

    localStorage.setItem("dashboardPins", JSON.stringify(updated))

  }

  /* RENDER CHART */

  const renderChart = (msg) => {

    const chartData = {
      labels: msg.chart.labels,
      datasets: [{
        data: msg.chart.values,
        backgroundColor: msg.chart.labels.map(
          () => `hsl(${Math.random()*360},70%,60%)`
        )
      }]
    }

    if (msg.chart.type === "bar") return <Bar data={chartData}/>
    if (msg.chart.type === "line") return <Line data={chartData}/>
    return <Pie data={chartData}/>

  }

  const pieColors = [
    "#4b99ff",
    "#ff5546",
    "#4caf50",
    "#ffb300",
    "#9c27b0",
    "#00acc1"
  ]

  return (

    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <button
          className="ai-chat-btn"
          onClick={() => setPage("chat")}
        >
          <FaPlus /> AI Chat
        </button>

        <div className="stats">

          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{data.totalProducts}</p>
          </div>

          <div className="stat-card">
            <h3>Total Locations</h3>
            <p>{data.locations.labels.length}</p>
          </div>

          <div className="stat-card">
            <h3>Total Industries</h3>
            <p>{data.industries.labels.length}</p>
          </div>

        </div>

      </div>

      {/* DEFAULT DASHBOARD CHARTS */}

      <div className="dashboard-grid">

        <div className="card">

          <h3>Location Distribution</h3>

          <Pie
            data={{
              labels: data.locations.labels,
              datasets: [{
                data: data.locations.values,
                backgroundColor: pieColors
              }]
            }}
          />

        </div>

        <div className="card">

          <h3>Industry Distribution</h3>

          <Bar
            data={{
              labels: data.industries.labels,
              datasets: [{
                label: "Industry Count",
                data: data.industries.values,
                backgroundColor: "#4b99ff"
              }]
            }}
          />

        </div>

      </div>

      {/* PINNED INSIGHTS */}

      <h2 style={{marginTop:"40px"}}>Pinned Insights</h2>

      <div className="dashboard-grid">

        {pins.length === 0 && (
          <p className="empty">
            No pinned charts yet. Generate charts in chat and press 📌 Pin.
          </p>
        )}

        {pins.map((item, i) => (

          <div className="card" key={i}>

            <button
              className="remove-pin"
              onClick={() => removePin(i)}
            >
              ❌
            </button>

            {item.chart && renderChart(item)}

            {item.diagram && (
              <DiagramRenderer code={item.diagram}/>
            )}

          </div>

        ))}

      </div>

    </div>

  )

}

export default Dashboard