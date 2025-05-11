"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

// Mock data for development - will be replaced with real API data
const mockChats = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Hey, how are you doing?",
    time: "10:30 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Let's meet tomorrow.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 3,
    name: "Team Project",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Alice: We need to finish the report.",
    time: "2 days ago",
    unread: 5,
    isGroup: true,
  },
];

// Mock messages for development
const mockMessages = [
  {
    id: 1,
    content: "Hey, how are you?",
    senderId: 999, // not current user
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    content: "I'm good, thanks! How about you?",
    senderId: 1, // current user
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    content: "I'm doing well. Did you finish the project we discussed yesterday?",
    senderId: 999, // not current user
    timestamp: "10:32 AM",
  },
  {
    id: 4,
    content: "Yes, I've completed most of it. Just need to finalize a few details and then I'll send it over to you for review.",
    senderId: 1, // current user
    timestamp: "10:33 AM",
  },
  {
    id: 5,
    content: "That sounds great! Looking forward to seeing what you've done.",
    senderId: 999, // not current user
    timestamp: "10:34 AM",
  },
];

export default function ChatSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [filteredChats, setFilteredChats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter chats when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(mockChats);
      return;
    }

    const filtered = mockChats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // In a real app, this would send data to the server
    const newMessage = {
      id: chatMessages.length + 1,
      content: message,
      senderId: 1, // Current user ID
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-[800px] border h-full flex">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 h-full flex flex-col">
        <header className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Chats</h1>
        </header>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10 text-sm text-gray-800 bg-gray-100 border-none"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`p-3 flex items-center hover:bg-gray-100 cursor-pointer ${selectedChat === chat.id ? 'bg-gray-100' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>

              {chat.unread > 0 && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                    {chat.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="w-2/3 flex flex-col h-full">
        {/* Chat Header */}
        <header className="p-4 border-b border-gray-200 flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>

          <div className="ml-3 flex-1">
            <h2 className="text-lg font-medium text-gray-900">John Doe</h2>
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
          <div className="space-y-4">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 1 ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    msg.senderId === 1
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${
                    msg.senderId === 1 ? 'text-blue-100' : 'text-gray-500'
                  }`}>{msg.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
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
              className={`rounded-full ${message.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
