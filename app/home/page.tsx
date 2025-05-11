"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../_components/sideBar";
import ChatList from "../_components/ChatList";
import EmptyChat from "../_components/EmptyChat";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth");
      return;
    }

    // Verify the token and check if user has profile
    const validateAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/profile", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token is invalid or expired
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            router.push("/auth");
            return;
          }
        }

        const data = await response.json();
        
        // Store userId for later use
        localStorage.setItem("userId", data.data.id.toString());
        
        // If user doesn't have a profile, redirect to profile page
        if (data.success && !data.data.profile) {
          router.push("/profile");
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth validation error:", error);
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-screen w-full flex items-center justify-center">
      <div className="w-[90%] h-[90%] flex bg-white rounded-xl shadow-lg overflow-hidden">
        <SideBar />
        <div className="flex-1 flex">
          <div className="w-1/3 border-r border-gray-200">
            <ChatList />
          </div>
          <div className="w-2/3 flex items-center justify-center bg-gray-50">
            <EmptyChat />
          </div>
        </div>
      </div>
    </div>
  );
}