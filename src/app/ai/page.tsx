"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Brain, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";

export default function AIPage() {
  const [input, setInput] = useState("");
  // const [contextMode, setContextMode] = useState<"auto" | "research" | "all">("auto");
  // const [showQuickActions, setShowQuickActions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = useChat({
    id: "ai-companion",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const { messages, status, sendMessage } = chat;
  const isLoading = status === "streaming" || status === "submitted";

  // Debug: log messages to see what we're getting
  useEffect(() => {
    console.log("Messages:", messages);
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
      // setShowQuickActions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // const quickActions = [
  //   {
  //     icon: <Sparkles className="size-5" />,
  //     title: "What's new in Navigator AI",
  //     description: "Learn about the latest features and capabilities",
  //   },
  //   {
  //     icon: <FileText className="size-5" />,
  //     title: "Write application timeline",
  //     description: "Create a personalized dental school application schedule",
  //   },
  //   {
  //     icon: <FileText className="size-5" />,
  //     title: "Analyze school requirements",
  //     description: "Get detailed analysis of specific dental school requirements",
  //   },
  //   {
  //     icon: <CheckSquare className="size-5" />,
  //     title: "Create study plan",
  //     description: "Build a comprehensive INBDE preparation schedule",
  //   },
  // ];

  // const appIntegrations = [
  //   { name: "Notion", icon: "📝" },
  //   { name: "Calendar", icon: "📅" },
  //   { name: "Teams", icon: "👥" },
  //   { name: "GitHub", icon: "🐙" },
  //   { name: "Chrome", icon: "🌐" },
  //   { name: "Slack", icon: "💬" },
  //   { name: "Spotify", icon: "🎵" },
  // ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="size-4 text-white" />
              </div> */}
              {/* <div>
                <h1 className="text-lg font-semibold text-gray-900">Navigator AI</h1>
                <p className="text-sm text-gray-500">Your dental school application assistant</p>
              </div> */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* AI Icon and Greeting */}
            <div className="text-center">
              <div className="rounded-ful mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                <Brain className="size-8" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                How can I help you today?
              </h2>
            </div>

            {/* Input Field */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask, search, or make anything..."
                  className="h-12 px-4 pr-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>

              {/* Context Options */}
              {/* <div className="mt-4 flex items-center gap-4">
                <Button
                  variant={contextMode === "auto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContextMode("auto")}
                  className="text-xs"
                >
                  📎 Auto
                </Button>
                <Button
                  variant={contextMode === "research" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContextMode("research")}
                  className="text-xs"
                >
                  🔍 Research
                </Button>
                <Button
                  variant={contextMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContextMode("all")}
                  className="text-xs"
                >
                  🌐 All sources
                </Button>
              </div> */}

              {/* App Integrations */}
              {/* <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Get better answers from your apps</span>
                <div className="flex gap-1">
                  {appIntegrations.map((app, index) => (
                    <div
                      key={index}
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs"
                      title={app.name}
                    >
                      {app.icon}
                    </div>
                  ))}
                </div>
              </div> */}
            </form>

            {/* Quick Actions */}
            {/* {showQuickActions && (
              <div className="w-full max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Get started</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(action.title);
                        setShowQuickActions(false);
                      }}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-600">
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        ) : (
          /* Chat Interface */
          <div className="space-y-6">
            {messages.map((message: UIMessage, index) => {
              // Extract text content from message parts
              let textContent = "";
              for (const part of message.parts ?? []) {
                if (part.type === "text") {
                  textContent += part.text;
                }
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-3xl rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-900",
                    )}
                  >
                    <div
                      className={cn(
                        "prose prose-sm max-w-none text-sm leading-relaxed",
                        message.role === "user"
                          ? "prose-invert [&_*]:text-opacity-90 [&_*]:text-white"
                          : "prose-gray",
                      )}
                    >
                      <Markdown text={textContent} />
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <Brain className="size-4 text-gray-600" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}

            {/* New Input */}
            <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white pt-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up question..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
