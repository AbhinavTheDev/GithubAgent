import { useState, useRef } from "react";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { useRepo } from "../libs/RepoContext";

const API_URL = "http://127.0.0.1:8000/api";

export const AudioPreviewPage = () => {
  const { repoId } = useRepo();
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleGenerate = async () => {
    if (!repoId) {
      setError("No repository selected. Please go back and select one.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setScript("");
    setIsPlaying(false);

    try {
      const response = await fetch(`${API_URL}/podcast/${repoId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to generate podcast script.");
      }

      const data = await response.json();
      setScript(data.script);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (!script) return;
    if (isPlaying) {
      handleStop();
      return;
    }
    const synth = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(script);

    // Try to use Zira voice if available
    const voices = synth.getVoices();
    const zira = voices.find((v) => v.name.toLowerCase().includes("zira"));
    if (zira) {
      utterance.voice = zira;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    setIsPlaying(true);
    synth.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <Header />
      <div className="flex-1 m-2 overflow-hidden relative border border-accent bg-accent/50 rounded-lg flex flex-col justify-center items-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">Generating script...</p>
          </div>
        ) : script ? (
          <div className="w-full h-full flex flex-col">
            <h2 className="absolute top-8 left-8 text-lg font-semibold bg-background/80 backdrop-blur-sm p-2 rounded-md">
              Audio Preview
            </h2>
            {isPlaying && (
              <div className="flex justify-center mt-8">
                {/* Simple animated pattern */}
                <div className="flex gap-2">
                  <div
                    className="w-3 h-8 bg-primary animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-3 h-6 bg-primary animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-10 bg-primary animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-7 bg-primary animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-3 h-9 bg-primary animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">
              Create Audio Preview
            </h1>
            <div className="flex justify-center mb-4">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Generating..." : "Generate"}
              </Button>
              <Button
                className="ml-4"
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading || !script}
              >
                {isPlaying ? "Stop" : "Play"}
              </Button>
            </div>
            {error && <p className="text-destructive mt-4">{error}</p>}
            <p className="text-sm text-muted-foreground max-w-[500px] mx-auto">
              Click "Generate" to create a podcast script based on the selected
              repository's content. Our AI will analyze the code and
              documentation to produce an engaging overview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
