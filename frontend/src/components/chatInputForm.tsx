import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";

export const ChatInputForm = ({
  onSubmit,
  inputValue,
  onInputChange,
  disabled = false,
}: {
  onSubmit: any;
  inputValue: any;
  onInputChange: any;
  disabled?: boolean;
}) => {
  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-start w-full max-w-3xl mx-auto p-1.5 rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring"
    >
      <Textarea
        placeholder="Ask anything about the repository..."
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent border-none shadow-none resize-none focus-visible:ring-0 py-2 text-base"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="ml-2 self-center bg-primary text-background"
        disabled={!inputValue.trim()}
      >
        <SendIcon className="size-5" />
      </Button>
    </form>
  );
};
