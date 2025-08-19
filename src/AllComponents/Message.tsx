import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
import { useUserId } from "@nhost/react";
import { formatDistanceToNow } from "date-fns";
import { FaUser, FaRobot } from "react-icons/fa";

const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      sender
      user_id
      chat_id
      content
      created_at
    }
  }
`;

const SEND_USER_MESSAGE = gql`
  mutation SendUserMessage(
    $userId: uuid!
    $send: String!
    $chatId: uuid!
    $content: String!
  ) {
    insert_messages(
      objects: {
        user_id: $userId
        sender: $send
        chat_id: $chatId
        content: $content
      }
    ) {
      returning {
        id
        user_id
        sender
        chat_id
        content
        created_at
      }
    }
  }
`;

interface MessageProps {
  chatId: string | null;
}

interface MessageType {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function Message({ chatId }: MessageProps) {
  const userId = useUserId();
  const { data, refetch } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "network-only",
  });

  const [content, setContent] = useState("");
  const [sendUserMessage] = useMutation(SEND_USER_MESSAGE);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const handleSend = async () => {
    if (!content.trim() || !chatId || !userId) return;

    const userMessage = content.trim();
    setContent("");

    try {
      await sendUserMessage({
        variables: {
          userId,
          send: "user",
          chatId,
          content: userMessage,
        },
      });

      await refetch();


      const response = await fetch("https://openrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL,
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      const aiMessage = data?.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";

      console.log(aiMessage)


      await sendUserMessage({
        variables: {
          userId,
          send: "bot",
          chatId,
          content: aiMessage,
        },
      });

      await refetch();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Please select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {data?.messages?.map((m: MessageType) => (
          <div
            key={m.id}
            className={`flex items-end p-2 rounded max-w-xs break-words ${
              m.sender === "bot"
                ? "bg-gray-600 text-white mr-auto"
                : "bg-gray-200 text-black ml-auto"
            }`}
          >
            <div className="mr-2">
              {m.sender === "bot" ? <FaRobot /> : <FaUser />}
            </div>
            <div>
              <div className="text-sm">{m.content}</div>
              <div className="text-xs text-gray-300 mt-1">
                {formatDistanceToNow(new Date(m.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
