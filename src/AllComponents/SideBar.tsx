import React, { useEffect, useState } from "react";
import { X, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useUserId } from "@nhost/react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelectChat: (chat: { chat_id: string; title: string }) => void;
  selectedChatId: string | null;
}

interface BotUser {
  id: string;
  title: string;
  created_at: string;
}

interface GetChatsData {
  chats: BotUser[];
}

interface CreateChatData {
  insert_chats: {
    returning: BotUser[];
  };
}

interface DeleteChatData {
  delete_chats: {
    affected_rows: number;
  };
}

const GET_BOT_USERS = gql`
  query GetChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

const CREATE_BOT_USER = gql`
  mutation CreateChat($title: String!, $user_id: uuid!) {
    insert_chats(objects: { title: $title, user_id: $user_id }) {
      returning {
        id
        title
        created_at
      }
    }
  }
`;

const DELETE_BOT_USER = gql`
  mutation DeleteChat($id: uuid!) {
    delete_chats(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export default function SideBar({
  isOpen,
  setIsOpen,
  onSelectChat,
  selectedChatId,
}: SideBarProps) {
  const [input, setInput] = useState("");
  const userId = useUserId();
  const [users, setUsers] = useState<BotUser[]>([]);

  const { data, loading, error } = useQuery<GetChatsData>(GET_BOT_USERS, {
    variables: { user_id: userId! },
    skip: !userId,
  });

  const [createBotUser, { loading: creating }] = useMutation<CreateChatData>(
    CREATE_BOT_USER,
    {
      update(cache, { data }) {
        const newChat = data?.insert_chats.returning[0];
        if (!newChat) return;

        const existingChats = cache.readQuery<GetChatsData>({
          query: GET_BOT_USERS,
          variables: { user_id: userId! },
        });

        cache.writeQuery({
          query: GET_BOT_USERS,
          variables: { user_id: userId! },
          data: { chats: [newChat, ...(existingChats?.chats || [])] },
        });
      },
    }
  );

  const [deleteBotUser] = useMutation<DeleteChatData>(DELETE_BOT_USER, {
    update(cache, { data }, { variables }) {
      if (!data?.delete_chats?.affected_rows) return;

      const existingChats = cache.readQuery<GetChatsData>({
        query: GET_BOT_USERS,
        variables: { user_id: userId! },
      });

      cache.writeQuery({
        query: GET_BOT_USERS,
        variables: { user_id: userId! },
        data: {
          chats:
            existingChats?.chats.filter((chat) => chat.id !== variables?.id) ||
            [],
        },
      });
    },
  });

  useEffect(() => {
    if (data?.chats) setUsers(data.chats);
  }, [data]);

  const handleCreateBotUser = async () => {
    if (!input.trim() || !userId) return;

    try {
      const res = await createBotUser({
        variables: { title: input.trim(), user_id: userId },
      });
      if (res.data?.insert_chats.returning.length) setInput("");
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleDeleteBotUser = async (id: string) => {
    try {
      await deleteBotUser({ variables: { id } });
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleSelectChat = (user: BotUser) => {
    if (user.id && user.title) {
      onSelectChat({ chat_id: user.id, title: user.title });
      setIsOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col"
        initial={{ x: -300 }} 
        animate={{ x: 0 }} 
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Chat Users</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b space-y-2">
          <Input
            placeholder="Enter chat title"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={handleCreateBotUser}
            className="w-full"
            disabled={creating}
          >
            + Add Chat
          </Button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-gray-500"></p>
          ) : error ? (
            <p className="text-red-500">Error loading chats</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center">No chats found</p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                    selectedChatId === user.id ? "bg-gray-200" : ""
                  }`}
                >
                  <div
                    onClick={() => handleSelectChat(user)}
                    className="flex items-center gap-3"
                  >
                    <User className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="font-medium">{user.title}</p>
                      <p className="text-sm text-gray-500">
                        {user.created_at
                          ? formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBotUser(user.id);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  );
}
