import { useRepo } from "./RepoContext";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isReady } = useRepo();
  const [location, setLocation] = useLocation();

  if (!isReady) {
    setLocation("/");
    return null;
  }
  return <>{children}</>;
}