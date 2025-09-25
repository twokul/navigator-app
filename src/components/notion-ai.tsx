"use client";
import { useState, useRef, useEffect } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { Presence } from "@radix-ui/react-presence";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  SearchIcon,
  Send,
  X,
  Loader2,
  RefreshCw,
  Paperclip,
  Infinity,
  Globe,
  Brain,
  FileText,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./ui/button";
import { Markdown } from "./markdown";
import Link from "fumadocs-core/link";
import type { ProvideLinksToolSchema } from "../lib/ai-tools-schema";
import type { z } from "zod";

interface NotionAIProps {
  className?: string;
}

export function NotionAI({ className }: NotionAIProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = useChat({
    id: "notion-ai",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const { messages, status, sendMessage, stop, setMessages } = chat;
  const isLoading = status === "streaming" || status === "submitted";

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        e.preventDefault();
      }
      if (e.key === "/" && (e.metaKey || e.ctrlKey) && !open) {
        setOpen(true);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickActions = [
    {
      icon: <Brain className="size-5" />,
      title: "What's new in Navigator AI",
      description: "Discover latest features",
    },
    {
      icon: <FileText className="size-5" />,
      title: "Write application guide",
      description: "Get step-by-step help",
    },
    {
      icon: <BarChart3 className="size-5" />,
      title: "Analyze school requirements",
      description: "Compare programs",
    },
    {
      icon: <CheckCircle className="size-5" />,
      title: "Create study checklist",
      description: "Track your progress",
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex h-10 w-40 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 shadow-sm transition-all hover:scale-[1.02] hover:border-gray-300 hover:shadow-md active:scale-[0.98]",
          className,
        )}
      >
        <SearchIcon className="size-4 transition-transform group-hover:scale-110" />
        <span className="font-medium">Ask AI</span>
        <kbd className="pointer-events-none absolute top-1.5 right-1.5 hidden h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>/
        </kbd>
      </button>

      {/* Modal Overlay */}
      <RemoveScroll enabled={open}>
        <Presence present={open}>
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
              open ? "animate-in fade-in-0" : "animate-out fade-out-0",
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div
              className={cn(
                "relative w-full max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl",
                open
                  ? "animate-in zoom-in-95 duration-300 ease-out"
                  : "animate-out zoom-out-95 duration-200 ease-in",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Brain className="size-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Navigator AI</h2>
                    <p className="text-sm text-gray-500">
                      Your dental school application assistant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex h-[600px]">
                {/* Chat Area */}
                <div className="flex flex-1 flex-col">
                  {messages.length === 0 ? (
                    /* Welcome Screen */
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                      <div className="mb-8">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                          <Brain className="size-8 text-white" />
                        </div>
                        <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                          How can I help you today?
                        </h3>
                        <p className="text-gray-500">
                          Ask me anything about dental school applications, requirements, or
                          processes.
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInput(action.title);
                              inputRef.current?.focus();
                            }}
                            className="group flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-left transition-all hover:scale-[1.02] hover:border-gray-300 hover:shadow-sm"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
                              {action.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                                {action.title}
                              </h4>
                              <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Chat Messages */
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                      {messages
                        .filter((msg) => msg.role !== "system")
                        .map((message) => (
                          <Message key={message.id} message={message} />
                        ))}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="size-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="border-t border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="relative">
                      <div className="flex items-end gap-3">
                        <div className="relative flex-1">
                          <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                              isLoading ? "AI is answering..." : "Ask, search, or make anything..."
                            }
                            disabled={isLoading}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            rows={1}
                            style={{
                              minHeight: "48px",
                              maxHeight: "120px",
                            }}
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              title="Attach files"
                            >
                              <Paperclip className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              title="Research mode"
                            >
                              <Infinity className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              title="All sources"
                            >
                              <Globe className="size-4" />
                            </button>
                          </div>
                        </div>
                        {isLoading ? (
                          <button
                            type="button"
                            onClick={stop}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
                          >
                            <X className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={!input.trim()}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <Send className="size-4" />
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Action Buttons */}
                    {messages.length > 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        {!isLoading && messages.at(-1)?.role === "assistant" && (
                          <button
                            onClick={() => chat.regenerate()}
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                          >
                            <RefreshCw className="size-4" />
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => setMessages([])}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        >
                          <X className="size-4" />
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Presence>
      </RemoveScroll>
    </>
  );
}

function Message({ message }: { message: any }) {
  let markdown = "";
  let links: z.infer<typeof ProvideLinksToolSchema>["links"] = [];

  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      markdown += part.text;
      continue;
    }

    if (part.type === "tool-provideLinks" && part.input) {
      links = (part.input as z.infer<typeof ProvideLinksToolSchema>).links;
    }
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white",
          isUser ? "bg-blue-500" : "bg-gradient-to-br from-blue-500 to-purple-600",
        )}
      >
        {isUser ? "U" : <Brain className="size-4" />}
      </div>
      <div className={cn("flex-1", isUser ? "text-right" : "text-left")}>
        <div
          className={cn(
            "inline-block max-w-[80%] rounded-2xl px-4 py-2",
            isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900",
          )}
        >
          <div className="prose prose-sm max-w-none">
            <Markdown text={markdown} />
          </div>
        </div>
        {links && links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((item, i) => (
              <Link
                key={i}
                href={item.url}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
