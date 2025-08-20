import { useState, useEffect, useRef } from "react";
import { useUserId } from "@nhost/react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MESSAGES, SEND_USER_MESSAGE } from "@/graphql/mutations";
import { motion, AnimatePresence } from "framer-motion";

interface MessageType {
  id: string;
  sender: "user" | "bot";
  content: string;
  created_at: string;
}

interface MessageProps {
  chatId: string | null;
}

export default function Message({ chatId }: MessageProps) {
  const userId = useUserId();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data, loading: queryLoading } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  });

  const [sendMessage] = useMutation(SEND_USER_MESSAGE);

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || !chatId || !userId) return;

    const userMessage = content.trim();
    setContent("");

    const userMsgObj: MessageType = {
      id: Date.now().toString(),
      sender: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);

    try {
      setLoading(true);

      await sendMessage({
        variables: { userId, send: "user", chatId, content: userMessage },
      });

      const typingMsg: MessageType = {
        id: "bot_typing",
        sender: "bot",
        content: "Bot is typing...",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, typingMsg]);

      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      const username = import.meta.env.VITE_USERNAME;
      const password = import.meta.env.VITE_PASSWORD;
      const basicAuth = btoa(`${username}:${password}`);

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({ chat_id: chatId, text: userMessage }),
      });

      const data = await res.json();
      const aiMessage = data?.text || "Sorry, I couldn't respond.";

      await sendMessage({
        variables: { userId, send: "bot", chatId, content: aiMessage },
      });

      setMessages((prev) => prev.filter((m) => m.id !== "bot_typing"));

      const botMsgObj: MessageType = {
        id: Date.now().toString() + "_bot",
        sender: "bot",
        content: aiMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsgObj]);
    } catch (err) {
      console.error("Error sending message:", err);

      setMessages((prev) => prev.filter((m) => m.id !== "bot_typing"));

      const errorMsg: MessageType = {
        id: Date.now().toString() + "_err",
        sender: "bot",
        content: "Error: Could not reach AI or save message.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Please select a chat
      </div>
    );
  }

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end ${
                m.sender === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`p-3 rounded-lg break-words max-w-[75%] md:max-w-[50%] ${
                  m.sender === "bot"
                    ? "bg-gray-300 text-black rounded-bl-none"
                    : "bg-blue-500 text-white rounded-br-none"
                }`}
              >
                {m.content}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef}></div>
      </div>


      <div className="p-3 border-t bg-white flex gap-2 sticky bottom-0">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
