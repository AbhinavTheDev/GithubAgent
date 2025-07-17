"use client";
import { useEffect, useState } from "react";
import { useRepo } from "../libs/RepoContext";
import { Star, GitFork, BarChart3 } from "lucide-react";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholder-and-vanish-input";
import { useLocation } from "wouter";
import { Loader } from "../components/loader";
import Meta from "../assets/metaIcon";
import GitHub from "../assets/githubIcon";

const API_URL = "http://127.0.0.1:8000/api";

const SkillBar = ({ skill, percentage, colorClass }: any) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-foreground">{skill}</span>
      <span className="text-sm font-medium text-muted-foreground">
        {percentage}%
      </span>
    </div>
    <div className="w-full bg-input rounded-full h-2">
      <div
        className={`${colorClass} h-2 rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);
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
        className={`h-screen transition-opacity duration-300 ${
          isProcessing ? "opacity-0 overflow-hidden" : "opacity-100"
        }`}
      >
        <div className="flex flex-col min-h-screen dark:bg-transparent font-sans">
          <main className="flex-1 bg-background">
            <div className="container mx-auto px-4 py-16">
              {/* Main Content Card */}
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Column: Text & Input */}
                  <div className="flex flex-col items-start text-left space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif text-foreground">
                      <span className="block text-muted-foreground">
                        Navigate Codebases.
                      </span>
                      Instantly.
                    </h1>
                    <p className="max-w-md text-lg text-muted-foreground">
                      Enter any GitHub repository to get a deep, automated
                      analysis of its structure, dependencies, and quality.
                    </p>
                    <form className="w-full max-w-md">
                      <div className="relative">
                        <GitHub className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <PlaceholdersAndVanishInput
                          placeholders={placeholders}
                          onChange={handleChange}
                          onSubmit={onSubmit}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Visual Mockup */}
                  <div className="transform lg:rotate-3 lg:hover:rotate-0 transition-transform duration-500">
                    <div className="w-full p-6 bg-card/90 backdrop-blur-lg border border-border rounded-xl shadow-2xl">
                      <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Meta className="w-6 h-6" />
                          <h3 className="font-semibold text-foreground">
                            facebook/react
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" /> 219k
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" /> 45k
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 space-y-4">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />{" "}
                          Language Distribution
                        </h4>
                        <SkillBar
                          skill="JavaScript"
                          percentage={65}
                          colorClass="bg-chart-1"
                        />
                        <SkillBar
                          skill="HTML"
                          percentage={18}
                          colorClass="bg-chart-2"
                        />
                        <SkillBar
                          skill="CSS"
                          percentage={9}
                          colorClass="bg-chart-3"
                        />
                        <SkillBar
                          skill="Other"
                          percentage={8}
                          colorClass="bg-chart-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* Past Repo List */}
        <div className="w-full z-20 bg-background">
          <div className="max-w-2xl bg-secondary/60 border border-accent rounded-t-lg mx-auto p-4 ">
            <h2 className="text-xl font-bold mb-2">Past Repositories</h2>
            <div className="max-h-56 overflow-y-auto">
              {pastRepos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No repositories found.
                </p>
              ) : (
                <ul className="divide-y divide-muted">
                  {pastRepos.map((repo) => (
                    <li
                      key={repo.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {repo.repo_url}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {repo.collection_name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-primary border-primary border rounded-sm inline-flex items-center justify-center py-0.5 px-4 text-center text-sm text-background hover:bg-primary/90 hover:border-primary/90 disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-primary/90 active:border-primary/90"
                          onClick={() => handleOpenRepo(repo)}
                          disabled={isDeleting === String(repo.id)}
                        >
                          Open
                        </button>
                        <button
                          className="bg-destructive border-destructive border rounded-sm inline-flex items-center justify-center py-0.5 px-4 text-center text-sm text-background hover:bg-destructive/90 hover:border-destructive/90 disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-destructive/90 active:border-destructive/90"
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
      </div>
    </>
  );
}
