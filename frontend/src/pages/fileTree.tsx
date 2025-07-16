import { useEffect, useState, useCallback, useRef } from "react";
import * as d3 from "d3";
import { MermaidChart } from "../components/chart";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { useRepo } from "../libs/RepoContext";

const API_URL = "http://127.0.0.1:8000/api";

export const FileTreePage = () => {
  const { repoId } = useRepo();
  const [chart, setChart] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgNode, setSvgNode] = useState<SVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);
  const svgRef = useRef<d3.Selection<
    SVGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  useEffect(() => {
    if (repoId) {
      fetch(`${API_URL}/diagram/${repoId}`)
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to fetch diagram");
          }
          return res.json();
        })
        .then((data) => {
          let script = data.graph_script?.trim() ?? "";
          // Remove code block markers and language tag if present
          if (script.startsWith("```")) {
            script = script.replace(/^```mermaid\s*/i, "").replace(/```$/, "").trim();
          }
          setChart(script);
        })
        .catch((err) => {
          setError(err.message);
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("No repository selected.");
      setLoading(false);
    }
  }, [repoId]);

  const handleChartReady = useCallback((node: SVGElement) => {
    if (node) {
      setSvgNode(node);
    }
  }, []);

  useEffect(() => {
    if (svgNode) {
      const svg = d3.select(svgNode);
      svgRef.current = svg;
      svg.attr("width", "100%").attr("height", "100%");

      const inner = svg.select("g");

      const zoom = d3
        .zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          inner.attr("transform", event.transform);
        });

      zoomRef.current = zoom;
      svg.call(zoom as any);
    }
  }, [svgNode]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      zoomRef.current.scaleBy(svgRef.current.transition().duration(750), 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      zoomRef.current.scaleBy(svgRef.current.transition().duration(750), 0.75);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      svgRef.current
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <Header />
      <main className="flex-1 overflow-hidden relative">
        <div className="w-full h-full p-4">
          <div className="w-full h-full border border-background rounded-lg flex justify-center items-center">
            {loading && <p>Loading diagram...</p>}
            {error && <p className="text-destructive">{error}</p>}
            {!loading && !error && chart && (
              <MermaidChart chart={chart} onChartReady={handleChartReady} />
            )}
          </div>
        </div>
        <h2 className="absolute top-8 left-8 text-lg font-semibold bg-background/80 backdrop-blur-sm p-2 rounded-md">
          File Structure
        </h2>
        <div className="absolute bottom-8 right-8 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleResetZoom}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};
