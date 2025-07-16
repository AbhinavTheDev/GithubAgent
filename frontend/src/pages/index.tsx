"use client";
import { useState } from "react";
import { useRepo } from "../libs/RepoContext";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholder-and-vanish-input";
import { useLocation } from "wouter";
import { Loader } from "../components/loader";

const API_URL = "http://127.0.0.1:8000/api";

export function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState("");
  const [location, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const { setRepoId, setIsReady } = useRepo();

  const placeholders = [
    "AbhinavTheDev/fun-fact",
    "AbhinavTheDev/potion",
    "microsoft/WSL",
    "facebook/react",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const pollStatus = (
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  ) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();

        setProcessingState(data.status);

        if (data.status === "ready") {
          clearInterval(interval);
          resolve(data.repo_id);
        } else if (data.status === "error") {
          clearInterval(interval);
          reject(new Error(data.message || "Processing failed."));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsProcessing(true);
    setProcessingState("setup");

    let repoUrl = inputValue.trim();
    if (!repoUrl.startsWith("http")) {
      repoUrl = `https://github.com/${repoUrl}`;
    }

    try {
      const setupResponse = await fetch(`${API_URL}/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: repoUrl }),
      });

      if (!setupResponse.ok) {
        throw new Error("Failed to start repository setup.");
      }

      const repoId = await new Promise(pollStatus);

      setRepoId(String(repoId));
      setIsReady(true);

      setProcessingState("done");
      setTimeout(() => setLocation("/dashboard"), 1000);
    } catch (error) {
      console.error("Processing error:", error);
      setIsProcessing(false);
      setProcessingState("");
    }
  };

  return (
    <>
      {isProcessing && <Loader processingState={processingState} />}
      <div
        className={`flex justify-center items-center h-screen transition-opacity duration-300 ${
          isProcessing ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute opacity-60 inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="w-full max-w-2xl z-10 backdrop-blur-[1.2px] p-4 rounded-lg">
          <div className="text-center">
            <h1 className="mb-4 font-serif text-5xl sm:text-7xl font-bold">
              Dev Compass
            </h1>
            <p className="text-muted-foreground mb-7.5 sm:mb-15 text-lg">
              Get insights into any GitHub repository.
            </p>
          </div>
          <div className="grid w-full max-w-xl mx-auto items-center gap-1.5">
            <label
              htmlFor="repository-url"
              className="text-sm sm:text-base ml-4 font-medium text-muted-foreground"
            >
              Enter a repository url
            </label>

            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
