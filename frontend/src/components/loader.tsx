export function Loader({ processingState }: { processingState: string }) {
  const processingMessages: { [key: string]: string } = {
    setup: "Starting setup...",
    processing: "Processing repository...",
    ready: "Processing complete!",
    done: "Redirecting...",
    error: "An error occurred.",
  };

  const progressWidths: { [key: string]: string } = {
    setup: "w-1/4",
    processing: "w-1/2",
    ready: "w-3/4",
    done: "w-full",
    error: "w-full",
  };

  const message = processingMessages[processingState] || "Please wait...";
  const widthClass = progressWidths[processingState] || "w-0";
  const bgColor = processingState === "error" ? "bg-destructive" : "bg-primary";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="rounded-lg bg-card text-foreground p-6 shadow-xl w-full max-w-md">
        <div className="flex items-center space-x-4 mb-4">
          <p className="text-lg font-medium">{message}</p>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-in-out ${widthClass} ${bgColor}`}
          ></div>
        </div>
      </div>
    </div>
  );
}