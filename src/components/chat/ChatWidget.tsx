// src/components/chat/ChatWidget.tsx
"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import MessageCircleIcon from "./MessageCircleIcon";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && <ChatWindow />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-4 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <MessageCircleIcon className="w-8 h-8" />
        )}
      </button>
    </div>
  );
}
