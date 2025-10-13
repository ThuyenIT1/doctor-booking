"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Xin chào! Tôi là trợ lý ảo, tôi có thể giúp gì cho bạn?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = { text: data.reply, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = { text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="p-4 bg-primary text-primary-foreground rounded-t-lg">
        <h3 className="text-lg font-semibold">Chat với trợ lý ảo</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg break-words ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-[80%] p-2 rounded-lg bg-muted">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
