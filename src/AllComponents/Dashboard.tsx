import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/AllComponents/Navbar";
import SideBar from "@/AllComponents/SideBar";
import Message from "@/AllComponents/Message";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <SideBar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            selectedChatId={selectedChatId}
            onSelectChat={(chat) => setSelectedChatId(chat.chat_id)}
          />
        </aside>

        <main className="flex-1 p-4 overflow-y-auto md:ml-0">
          <Card className="h-full shadow-md">
            <CardContent className="h-full p-4">
              <Message chatId={selectedChatId} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
