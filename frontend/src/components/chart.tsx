import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false });

export const MermaidChart = ({ chart, onChartReady }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      mermaid.render("mermaid-svg", chart).then(({ svg }) => {
        containerRef.current.innerHTML = svg;
        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement) {
          // Remove the inline style from Mermaid which includes max-width
          svgElement.removeAttribute("style");
          svgElement
          if (onChartReady) {
            onChartReady(svgElement);
          }
        }
      });
    }
  }, [chart, onChartReady]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-accent"
    />
  );
};