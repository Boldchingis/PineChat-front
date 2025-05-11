"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus } from 'lucide-react';
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import algoliaService from "@/lib/algolia";

export default function ChatList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsers, setSearchUsers] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        
        if (!token) {
          router.push("/auth");
          return;
        }

        const response = await fetch("http://localhost:5000/chats", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            router.push("/auth");
          }
          throw new Error("Failed to fetch chats");
        }

        const data = await response.json();
        
        if (data.success) {
          setChats(data.data);
          setFilteredChats(data.data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [router]);

  // Filter chats when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat => 
      chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.messages[0]?.content && chat.messages[0]?.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  // Search for users to start new chat using Algolia
  const handleUserSearch = async () => {
    if (searchUsers.trim() === "") return;

    setSearching(true);
    try {
      // Try to use Algolia first
      try {
        const results = await algoliaService.searchUsers(searchUsers);
        if (results && results.length > 0) {
          setSearchResults(results);
          setSearching(false);
          return;
        }
      } catch (algoliaError) {
        console.error("Algolia search failed, falling back to API:", algoliaError);
      }

      // Fall back to API search if Algolia fails or returns no results
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/auth");
        return;
      }

      // Try the Algolia-powered backend endpoint first
      try {
        const response = await fetch(`http://localhost:5000/chat/search/algolia?query=${encodeURIComponent(searchUsers)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setSearchResults(data.data);
            setSearching(false);
            return;
          }
        }
      } catch (error) {
        console.error("Algolia backend search failed, using standard search:", error);
      }

      // Fall back to standard search if all else fails
      const response = await fetch(`http://localhost:5000/chat/search/users?query=${encodeURIComponent(searchUsers)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  // Start new chat with user
  const startChat = async (userId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        router.push("/auth");
        return;
      }

      const response = await fetch("http://localhost:5000/chats", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: [userId],
          isGroup: false
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await response.json();
      
      if (data.success) {
        setDialogOpen(false);
        // Refresh chat list
        const updatedChats = [...chats];
        if (!chats.some(chat => chat.id === data.data.id)) {
          updatedChats.unshift(data.data);
          setChats(updatedChats);
          setFilteredChats(updatedChats);
        }
        
        // Navigate to the chat
        router.push(`/chat/${data.data.id}`);
      } else {
        toast.error(data.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  const formatLastMessage = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "No messages yet";
    }
    
    const lastMessage = chat.messages[0];
    return lastMessage.content.length > 30 
      ? `${lastMessage.content.substring(0, 30)}...` 
      : lastMessage.content;
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Within last week
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    
    // Earlier
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Toaster position="top-center" />
      <header className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Chats</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <UserPlus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a new chat</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative flex items-center mb-4">
                <Input
                  className="pr-20"
                  placeholder="Search by name or email..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                />
                <Button 
                  onClick={handleUserSearch}
                  className="absolute right-0 rounded-l-none"
                  disabled={searching || !searchUsers.trim()}
                >
                  {searching ? 
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> :
                    "Search"
                  }
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    {searchUsers.trim() ? "No users found" : "Search for users to start a chat"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        className="p-2 flex items-center hover:bg-gray-100 rounded-lg cursor-pointer"
                        onClick={() => startChat(user.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile?.image || ""} />
                          <AvatarFallback>{user.name?.substring(0, 2)?.toUpperCase() || "UN"}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-gray-500 mb-4">No chats found</p>
            <Button onClick={() => setDialogOpen(true)}>
              Start a new conversation
            </Button>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className="p-3 flex items-center hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.picture || ""} />
                <AvatarFallback>{chat.displayName?.substring(0, 2)?.toUpperCase() || "UN"}</AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{chat.displayName}</h3>
                  <span className="text-xs text-gray-500">
                    {chat.messages && chat.messages.length > 0 
                      ? formatTime(chat.messages[0]?.createdAt) 
                      : formatTime(chat.updatedAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{formatLastMessage(chat)}</p>
              </div>

              {/* Add unread count indicator if needed */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}