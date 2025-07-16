import { useEffect, useState } from "react";
import { useRepo } from "../libs/RepoContext";
import { Header } from "../components/header";
import { Link } from "wouter";

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
      <div className="flex flex-col w-full h-screen bg-background text-foreground">
        <Header />
        <div
          className="flex-1 mx-4 my-2 border border-background rounded-lg overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2
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
              <div className="bg-card text-card-foreground p-4 rounded-xl border border-muted flex flex-col justify-center items-center gap-2 shadow-md">
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="24"
                  data-view-component="true"
                  className="text-destructive"
                >
                  <path
                    fill="currentColor"
                    d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  ></path>
                  <path
                    fill="currentColor"
                    d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"
                  ></path>
                </svg>
                <div className="text-center">
                  <p className="text-2xl font-extrabold">
                    {repoInfo?.issues ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">Issues</p>
                </div>
              </div>
              <div className="bg-card text-card-foreground p-4 rounded-xl border border-muted flex flex-col justify-center items-center gap-2 shadow-md">
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="24"
                  data-view-component="true"
                  className="text-primary"
                >
                  <path
                    fill="currentColor"
                    d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
                  ></path>
                </svg>
                <div className="text-center">
                  <p className="text-2xl font-extrabold">
                    {repoInfo?.forks ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">Forks</p>
                </div>
              </div>
              <div className="bg-card text-card-foreground p-4 rounded-xl border border-muted flex flex-col justify-center items-center gap-2 shadow-md">
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="24"
                  data-view-component="true"
                  className="text-amber-400"
                >
                  <path
                    fill="currentColor"
                    d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"
                  ></path>
                </svg>
                <div className="text-center">
                  <p className="text-2xl font-extrabold">
                    {repoInfo?.stars ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">Stars</p>
                </div>
              </div>
              <div className="bg-card text-card-foreground p-4 rounded-xl border border-muted flex flex-col justify-center items-center gap-2 shadow-md">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 16 16"
                  width="24"
                  height="24"
                  className="text-amber-800"
                >
                  <path
                    fill="currentColor"
                    d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564.23.869.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z"
                  ></path>
                </svg>
                <div className="text-center">
                  <p className="text-2xl font-extrabold">
                    {repoInfo?.license ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">License</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Recent Activity:</h3>
                <div className="space-y-2">
                    repoInfo?.last_activity?.map(commit => (
                  <p key={commit.sha} className="p-3 text-sm bg-popover rounded-lg shadow-sm">
                    <div className="flex justify-between items-center text-foreground/50">
                      <span>{commit.date}</span>
                      <span>
                        <a href={commit.url} target="_blank">
                          {commit.sha}
                        </a>
                      </span>
                    </div>
                    <div  className="flex justify-between items-center">
                      <span>{commit.message}</span>
                      <span>{commit.author}</span>
                    </div>
                  </p>
                    ))
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-card text-card-foreground p-4 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
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
                  <div className="bg-card text-card-foreground p-4 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
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
                  <div className="bg-card text-card-foreground p-4 flex flex-col justify-center items-center gap-4 rounded-xl shadow-lg text-center relative overflow-hidden">
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
