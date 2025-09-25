"use client";
import { RemoveScroll } from "react-remove-scroll";
import {
  type ComponentProps,
  createContext,
  type SyntheticEvent,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, RefreshCw, SearchIcon, Send, X } from "lucide-react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./ui/button";
import Link from "fumadocs-core/link";
import { type UIMessage, useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { ProvideLinksToolSchema } from "../lib/ai-tools-schema";
import type { z } from "zod";
import { DefaultChatTransport } from "ai";
import { Markdown } from "./markdown";
import { Presence } from "@radix-ui/react-presence";

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
} | null>(null);

function useChatContext() {
  return use(Context)!.chat;
}

function SearchAIActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === "streaming";

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === "assistant" && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: "secondary",
              size: "sm",
              className: "gap-1.5 rounded-full",
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          Retry
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: "secondary",
            size: "sm",
            className: "rounded-full",
          }),
        )}
        onClick={() => setMessages([])}
      >
        Clear Chat
      </button>
    </>
  );
}

function SearchAIInput(props: ComponentProps<"form">) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    void sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    if (isLoading) document.getElementById("nd-ai-input")?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn("flex items-start pe-2", props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? "AI is answering..." : "Ask AI"}
        autoFocus
        className="p-4"
        disabled={status === "streaming" || status === "submitted"}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: "secondary",
              className: "mt-2 gap-2 rounded-full transition-all",
            }),
          )}
          onClick={stop}
        >
          <Loader2 className="text-fd-muted-foreground size-4 animate-spin" />
          Abort Answer
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: "secondary",
              className: "mt-2 rounded-full transition-all",
            }),
          )}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<"div">, "dir">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "instant",
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn("fd-scroll-container flex min-w-0 flex-col overflow-y-auto", props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<"textarea">) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn("col-start-1 row-start-1", props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          "placeholder:text-fd-muted-foreground resize-none bg-transparent focus-visible:outline-none",
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, "invisible break-all")}>
        {`${props.value?.toString() ?? ""}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: "you",
  assistant: "fumadocs",
};

function Message({ message, ...props }: { message: UIMessage } & ComponentProps<"div">) {
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

  return (
    <div {...props}>
      <p
        className={cn(
          "text-fd-muted-foreground mb-1 text-sm font-medium",
          message.role === "assistant" && "text-fd-primary",
        )}
      >
        {roleName[message.role] ?? "unknown"}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>
      {links && links.length > 0 ? (
        <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
          {links.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="hover:bg-fd-accent hover:text-fd-accent-foreground block rounded-lg border p-3 text-xs"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-fd-muted-foreground">Reference {item.label}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AISearchTrigger() {
  const [open, setOpen] = useState(false);
  const chat = useChat({
    id: "search",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === "/" && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  };

  const onKeyPressRef = useRef(onKeyPress);
  onKeyPressRef.current = onKeyPress;
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyPressRef.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>
      <RemoveScroll enabled={open}>
        <Presence present={open}>
          <div
            className={cn(
              "bg-fd-background/80 fixed inset-0 right-(--removed-body-scroll-bar-size,0) z-50 flex flex-col items-center p-2 pb-[8.375rem] backdrop-blur-sm",
              open ? "animate-fd-fade-in" : "animate-fd-fade-out",
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setOpen(false);
                e.preventDefault();
              }
            }}
          >
            <div className="sticky top-0 flex w-full max-w-[600px] items-center gap-2 py-2">
              {/* <p className="text-fd-muted-foreground flex-1 text-xs">Powered by OpenAI</p> */}
              <button
                aria-label="Close"
                tabIndex={-1}
                className={cn(
                  buttonVariants({
                    size: "icon-sm",
                    color: "secondary",
                    className: "rounded-full",
                  }),
                )}
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            <List
              className="w-full max-w-[600px] overscroll-contain py-10 pr-2"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, white 4rem, white calc(100% - 2rem), transparent 100%)",
              }}
            >
              <div className="flex flex-col gap-4">
                {chat.messages
                  .filter((msg) => msg.role !== "system")
                  .map((item) => (
                    <Message key={item.id} message={item} />
                  ))}
              </div>
            </List>
          </div>
        </Presence>
        <div
          className={cn(
            "fixed bottom-2 z-50 -translate-x-1/2 overflow-hidden rounded-2xl border shadow-xl transition-[width,height] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            open
              ? "bg-fd-popover h-32 w-[min(600px,90vw)]"
              : "bg-fd-secondary text-fd-secondary-foreground shadow-fd-background h-10 w-40",
          )}
          style={{
            left: "calc(50% - var(--removed-body-scroll-bar-size,0px)/2)",
          }}
        >
          <Presence present={!open}>
            <button
              className={cn(
                "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground absolute inset-0 p-2 text-center text-sm transition-colors",
                !open ? "animate-fd-fade-in" : "animate-fd-fade-out bg-fd-accent",
              )}
              onClick={() => setOpen(true)}
            >
              <SearchIcon className="absolute top-1/2 size-4.5 -translate-y-1/2" />
              Ask AI
            </button>
          </Presence>
          <Presence present={open}>
            <div
              className={cn(
                "absolute inset-0 flex flex-col",
                open ? "animate-fd-fade-in" : "animate-fd-fade-out",
              )}
            >
              <SearchAIInput className="flex-1" />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <SearchAIActions />
              </div>
            </div>
          </Presence>
        </div>
      </RemoveScroll>
    </Context>
  );
}
