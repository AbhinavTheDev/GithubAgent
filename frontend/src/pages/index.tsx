"use client";
import { useEffect, useState } from "react";
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
  const [pastRepos, setPastRepos] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const placeholders = [
    "AbhinavTheDev/fun-fact",
    "AbhinavTheDev/potion",
    "microsoft/WSL",
    "facebook/react",
  ];

  // Fetch past repos on mount
  useEffect(() => {
    fetch(`${API_URL}/get-all-repos`)
      .then((res) => res.json())
      .then((data) => setPastRepos(data))
      .catch(() => setPastRepos([]));
  }, [isDeleting, isProcessing]);

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

  // Handle open repo
  const handleOpenRepo = (repo: any) => {
    setRepoId(String(repo.id));
    setIsReady(true);
    setLocation("/dashboard");
  };

  // Handle delete repo
  const handleDeleteRepo = async (repoId: string) => {
    setIsDeleting(repoId);
    try {
      await fetch(`${API_URL}/repo/${repoId}`, { method: "DELETE" });
      setPastRepos((prev) =>
        prev.filter((r) => String(r.id) !== String(repoId))
      );
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsDeleting(null);
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
        <div className="absolute opacity-60 inset-0 h-full w-full bg-background bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
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
      {/* Past Repos List Box */}
      <div className="w-full border border-muted shadow-lg z-20 bg-background bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-2xl bg-muted border border-accent rounded-t-lg mx-auto p-4 ">
          <h2 className="text-xl font-bold mb-2">Past Repositories</h2>
          <div className="max-h-56 overflow-y-auto">
            {pastRepos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No past repositories found.
              </p>
            ) : (
              <ul className="divide-y divide-muted">
                {pastRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{repo.repo_url}</span>
                      <span className="text-xs text-muted-foreground">
                        {repo.collection_name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 text-xs"
                        onClick={() => handleOpenRepo(repo)}
                        disabled={isDeleting === String(repo.id)}
                      >
                        Open
                      </button>
                      <button
                        className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 text-xs"
                        onClick={() => handleDeleteRepo(repo.id)}
                        disabled={isDeleting === String(repo.id)}
                      >
                        {isDeleting === String(repo.id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
