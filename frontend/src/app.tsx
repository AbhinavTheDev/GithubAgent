import { Route, Switch } from "wouter";
import { RepoProvider } from "./libs/RepoContext";
import { ProtectedRoute } from "./libs/ProtectedRoute";
import { Index } from "./pages/index";
import { DashboardPage } from "./pages/dashboard";
import { ChatPage } from "./pages/chat";
import { FileTreePage } from "./pages/fileTree";
import { AudioPreviewPage } from "./pages/audio";

export default function App() {
  return (
    <RepoProvider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/chat">
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        </Route>
        <Route path="/file-tree">
          <ProtectedRoute>
            <FileTreePage />
          </ProtectedRoute>
        </Route>
        <Route path="/audio">
          <ProtectedRoute>
            <AudioPreviewPage />
          </ProtectedRoute>
        </Route>
        <Route>404: Not Found</Route>
      </Switch>
    </RepoProvider>
  );
}
