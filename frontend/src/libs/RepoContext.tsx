import React, { createContext, useContext, useState, useEffect } from "react";

type RepoContextType = {
  repoId: string | null;
  setRepoId: (id: string | null) => void;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
};

const RepoContext = createContext<RepoContextType | undefined>(undefined);

const API_URL = "http://127.0.0.1:8000/api";

export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repoId, setRepoId] = useState<string | null>(localStorage.getItem("repo_id"));
  const [isReady, setIsReady] = useState<boolean>(false);

  // Validate repoId on mount and whenever repoId changes
  useEffect(() => {
    if (repoId) {
      // Check with backend if repo exists
      fetch(`${API_URL}/repo/${repoId}`)
        .then(res => {
          if (res.ok) {
            localStorage.setItem("repo_id", repoId);
            setIsReady(true);
          } else {
            localStorage.removeItem("repo_id");
            setRepoId(null);
            setIsReady(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("repo_id");
          setRepoId(null);
          setIsReady(false);
        });
    } else {
      localStorage.removeItem("repo_id");
      setIsReady(false);
    }
  }, [repoId]);

  return (
    <RepoContext.Provider value={{ repoId, setRepoId, isReady, setIsReady }}>
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepo must be used within RepoProvider");
  return ctx;
};