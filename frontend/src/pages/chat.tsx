import { useState, useEffect } from "react";
import { ChatInputForm } from "../components/chatInputForm";
import { Header } from "../components/header";
import { useRepo } from "../libs/RepoContext";

const API_URL = "http://127.0.0.1:8000/api";

interface Message {
  id: number;
  type: "user" | "agent";
  text: string;
}

export const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { repoId } = useRepo();

  useEffect(() => {
    if (repoId) {
      fetch(`${API_URL}/chat/${repoId}/history`)
        .then((res) => res.json())
        .then((history) => {
          const formattedHistory = history.flatMap(
            (item: any, index: number) => [
              { id: index * 2, type: "user", text: item.query },
              { id: index * 2 + 1, type: "agent", text: item.response },
            ]
          );
          setMessages(formattedHistory);
        })
        .catch((err) => console.error("Failed to fetch history", err));
    }
  }, [repoId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim() || !repoId || isLoading) return;

    const userMessage: Message = {
      id: messages.length,
      type: "user",
      text: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/${repoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from agent.");
      }

      const data = await response.json();
      const agentMessage: Message = {
        id: messages.length + 1,
        type: "agent",
        text: data.response,
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: messages.length + 1,
        type: "agent",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="flex flex-col w-full h-screen bg-background text-foreground">
      <Header />
      <div className="flex-1 flex flex-col mx-4 my-2 border border-secondary rounded-lg bg-secondary/40 overflow-hidden">
        <div
          className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:m-0.5
            [&::-webkit-scrollbar-track]:rounded-lg
            [&::-webkit-scrollbar-track]:bg-background
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-accent"
        >
          <div className="max-w-3xl mx-auto">
            {!hasStarted && !isLoading && (
              <div className="flex justify-center items-center flex-col w-full h-full">
                <h1 className="text-2xl md:text-4xl font-bold font-serif mb-8">
                  Hi! How can I help you today?
                </h1>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-lg ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    }`}
                  >
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg max-w-lg bg-card border">
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <ChatInputForm
            onSubmit={handleSubmit}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            disabled={isLoading || !repoId}
          />
        </div>
      </div>
    </div>
  );
};
