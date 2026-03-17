import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { assets } from "../../assets/assets";
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

const Dashboard = ({ extended }) => {
    const [pins, setPins] = useState([]);

    useEffect(() => {
        const savedPins = JSON.parse(localStorage.getItem("dashboardPins")) || [];
        setPins(savedPins);
    }, []);

    const removePin = (index) => {
        const updatedPins = pins.filter((_, i) => i !== index);
        setPins(updatedPins);
        localStorage.setItem("dashboardPins", JSON.stringify(updatedPins));
    };

    const renderChart = (chart) => {
        const colors = ["#4b99ff", "#ff5546", "#4caf50", "#ffb300", "#9c27b0", "#00acc1", "#ff6f61", "#26a69a"];
        const data = {
            labels: chart.labels,
            datasets: [{
                label: "Analytics",
                data: chart.values,
                backgroundColor: colors.slice(0, chart.labels.length)
            }]
        };

        if (chart.type === "bar") return <Bar data={data} />;
        if (chart.type === "line") return <Line data={data} />;
        return <Pie data={data} />;
    };

    return (
        <div className={`dashboard ${extended ? "extended" : "collapsed"}`}>
            <div className="dashboard-container">
                <div className="greet">
                    <p><span>Your Dashboard</span></p>
                    <p>View your pinned visualizations here.</p>
                </div>

                <div className="pins-grid">
                    {pins.length === 0 ? (
                        <p className="no-pins">No visualizations pinned yet. Go to chat to generate some!</p>
                    ) : (
                        pins.map((pin, index) => (
                            <div key={index} className="pin-card">
                                <div className="pin-header">
                                    <h3>{pin.chart ? "Chart" : "Diagram"}</h3>
                                    <button onClick={() => removePin(index)} className="remove-btn">Remove</button>
                                </div>
                                <div className="pin-content">
                                    {pin.chart ? renderChart(pin.chart) : <DiagramRenderer diagram={pin.diagram} />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;