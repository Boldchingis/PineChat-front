"use client";

import { useState, useEffect } from 'react';
import { MessageCircleCode, Users, Settings, LogOut, Plus, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import algoliaService from "@/lib/algolia";

export default function SideBar() {
  const [activeIcon, setActiveIcon] = useState('chats');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/auth");
          return;
        }

        const response = await fetch("http://localhost:5000/profile", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            router.push("/auth");
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setUserProfile(data.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    // Redirect to login page
    router.push('/auth');
  };

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
      const response = await fetch(`http://localhost:5000/chats/search/users?query=${encodeURIComponent(searchUsers)}`, {
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

  return (
    <div className="h-full w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <Toaster position="top-center" />

      {/* User avatar with dropdown */}
      <div className="mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent relative">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userProfile?.profile?.image || ""} />
                  <AvatarFallback>
                    {userProfile?.name
                      ? userProfile.name.substring(0, 2).toUpperCase()
                      : "UN"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveIcon('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation icons */}
      <div className="flex flex-col items-center gap-8 mt-2">
        <Button
          variant="ghost"
          size="icon"
          className={`p-3 rounded-xl ${activeIcon === 'chats' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          onClick={() => {
            setActiveIcon('chats');
            router.push('/home');
          }}
        >
          <MessageCircleCode className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`p-3 rounded-xl ${activeIcon === 'users' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          onClick={() => setActiveIcon('users')}
        >
          <Users className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`p-3 rounded-xl ${activeIcon === 'settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          onClick={() => setActiveIcon('settings')}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* New chat button */}
      <div className="mt-auto">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 shadow-md"
            >
              <Plus className="h-6 w-6" />
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
      </div>
    </div>
  );
}