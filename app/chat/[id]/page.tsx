"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chatData, setChatData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat data and messages
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/auth");
          return;
        }

        // Fetch chat details
        const chatResponse = await fetch(`http://localhost:5000/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!chatResponse.ok) {
          if (chatResponse.status === 401) {
            localStorage.removeItem("accessToken");
            router.push("/auth");
            return;
          }
          throw new Error("Failed to fetch chat");
        }

        const chatData = await chatResponse.json();
        
        // Fetch messages
        const messagesResponse = await fetch(`http://localhost:5000/chats/${chatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages");
        }

        const messagesData = await messagesResponse.json();
        
        setChatData(chatData.data);
        setMessages(messagesData.data || []);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChatData();
    }
  }, [chatId, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setSending(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch(`http://localhost:5000/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      if (data.success) {
        // Add the new message to the messages array
        setMessages([...messages, data.data]);
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherUser = chatData?.participants?.find((p: any) => p.id.toString() !== localStorage.getItem("userId"));

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Chat Header */}
      <header className="p-4 bg-white border-b border-gray-200 flex items-center">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => router.push("/home")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.profile?.image || ""} />
          <AvatarFallback>{otherUser?.name?.substring(0, 2)?.toUpperCase() || "UN"}</AvatarFallback>
        </Avatar>

        <div className="ml-3 flex-1">
          <h2 className="text-lg font-medium text-gray-900">{otherUser?.name || chatData?.name || "Chat"}</h2>
          <p className="text-xs text-gray-500">Online</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Block Contact</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages.map((msg: any) => {
              const isCurrentUser = msg.senderId.toString() === localStorage.getItem("userId");
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 text-right ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Textarea
            className="flex-1 resize-none max-h-32 min-h-10"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className={`rounded-full ${message.trim() && !sending ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}