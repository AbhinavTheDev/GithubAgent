import { useEffect, useState } from "react";
import { useRepo } from "../libs/RepoContext";
import { Header } from "../components/header";
import { Link } from "wouter";
import { GitFork, Star, CircleDotIcon, Scale } from "lucide-react";
const API_URL = "http://127.0.0.1:8000/api";

type RepoInfo = {
  id: number;
  name?: string;
  repo_url: string;
  collection_name: string;
  created_at: string;
  description?: string;
  stars?: number;
  forks?: number;
  issues?: number;
  license?: string;
  owner?: string;
  last_activity?: string;
};

export function DashboardPage() {
  const { repoId } = useRepo();
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoId) return;
    setLoading(true);
    fetch(`${API_URL}/repo/${repoId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to fetch repo info");
        }
        return res.json();
      })
      .then((data) => {
        setRepoInfo(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setRepoInfo(null);
      })
      .finally(() => setLoading(false));
  }, [repoId]);

  return (
    <>
      <div className="flex flex-col w-full h-screen bg-white dark:bg-black text-foreground">
        <Header />
        <div
          className="flex-1 mx-4 my-2 border border-background bg-background/80 rounded-lg overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:m-0.5
  [&::-webkit-scrollbar-track]:rounded-lg
  [&::-webkit-scrollbar-track]:bg-background
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-accent"
        >
          <div>
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-extrabold font-sans">
                {repoInfo?.name || repoInfo?.repo_url}
              </h1>
              <p className="text-muted-foreground mt-0">
                {repoInfo?.description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-4">
              <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      {repoInfo?.issues ?? "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Issues
                    </span>
                  </div>
                  <CircleDotIcon className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      {repoInfo?.forks ?? "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">Forks</span>
                  </div>
                  <GitFork className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      {repoInfo?.stars ?? "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">Stars</span>
                  </div>
                  <Star className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      {repoInfo?.license ?? "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      License
                    </span>
                  </div>
                  <Scale className="w-6 h-6 text-red-800" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Recent Activity:</h3>
                <div className="space-y-2">
                  {Array.isArray(repoInfo?.last_activity) &&
                  repoInfo.last_activity.length > 0 ? (
                    repoInfo.last_activity.map((commit: any) => (
                      <div
                        key={commit.sha}
                        className="p-3 text-sm bg-popover rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-center text-foreground/50">
                          <span>
                            {" "}
                            {new Date(commit.date).toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>
                            <a
                              href={commit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {commit.sha.slice(0, 5)}
                            </a>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{commit.message}</span>
                          <span>By {commit.author}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No recent commits found.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-card text-card-foreground p-7 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute -bottom-6 -right-6 text-muted-foreground opacity-20"
                  >
                    <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                    <path d="M12 12l8 -4.5" />
                    <path d="M12 12l0 9" />
                    <path d="M12 12l-8 -4.5" />
                  </svg>
                  <div className="z-10 flex flex-col items-center gap-4">
                    <p className="text-xl">Take help about your problem</p>
                    <Link
                      href="/chat"
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Ask
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-card text-card-foreground p-7 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute -bottom-6 -right-6 text-muted-foreground opacity-20"
                    >
                      <path d="M3 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                      <path d="M15 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                      <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                      <path d="M6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1" />
                      <path d="M12 9l0 3" />
                    </svg>
                    <div className="z-10 flex flex-col items-center gap-4">
                      <p className="text-lg">Analyze file structure</p>
                      <Link
                        href="/file-tree"
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Get File Tree
                      </Link>
                    </div>
                  </div>
                  <div className="bg-card text-card-foreground p-7 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="absolute -bottom-6 -right-6 text-muted-foreground opacity-20"
                    >
                      <path d="M16 3.937a9 9 0 1 0 5 8.063" />
                      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M20 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M20 4l-3.5 10l-2.5 2" />
                    </svg>

                    <div className="z-10 flex flex-col items-center gap-4">
                      <p className="text-lg">Don't have much time..</p>
                      <Link
                        href="/audio"
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Get Audio Preview
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
