import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
});

const DiagramRenderer = ({ diagram }) => {
    const mermaidRef = useRef(null);

    useEffect(() => {
        if (mermaidRef.current && diagram) {
            mermaidRef.current.removeAttribute("data-processed");
            mermaid.run({
                nodes: [mermaidRef.current],
            });
        }
    }, [diagram]);


    if (!diagram) return null;

    return (
        <div style={{
            background: "#111",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "20px",
            width: "100%",
            overflow: "auto"
        }}>
            <h3 style={{ color: "#4b99ff", marginBottom: "15px" }}>Generated Diagram</h3>
            <div className="mermaid" ref={mermaidRef}>
                {diagram}
            </div>
        </div>
    );
};

export default DiagramRenderer;