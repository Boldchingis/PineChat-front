"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function SignupComp() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
  
    let hasError = false;
  
    // Validate name
    if (!name || name.length < 6 || name.length > 12) {
      const msg = "Name must be between 6-12 characters.";
      setNameError(msg);
      toast.error(msg);
      hasError = true;
    }
  
    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      const msg = "Invalid email format.";
      setEmailError(msg);
      toast.error(msg);
      hasError = true;
    }
  
    // Validate password
    if (!password || password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setPasswordError(msg);
      toast.error(msg);
      hasError = true;
    }
  
    if (hasError) return;
  
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/users/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        try {
          const errData = JSON.parse(text);
          toast.error(errData.message || `Signup failed (Status ${response.status})`);
        } catch {
          toast.error(`Unexpected server error (Status ${response.status})`);
        }
        return;
      }
  
      const data = JSON.parse(text);
  
      if (data.success) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
        toast.success("Account created successfully!");
      } else {
        toast.error(data.message || "Sign-up failed");
      }
    } catch (error) {
      console.error("Network or unknown error:", error);
      toast.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
      <Toaster position="top-center" expand={true} />
      <Card className="w-[90%] sm:w-[400px] border-none mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Get Started Now</CardTitle>
          <CardDescription>Message privately</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`border-2 p-2 rounded-lg ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          <div>
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border-2 p-2 rounded-lg ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>

          <div>
            <Input
              placeholder="Create Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border-2 p-2 rounded-lg ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button
              onClick={togglePasswordVisibility}
              className="text-sm text-blue-600 hover:underline text-end"
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Image
        className="w-1/2 h-screen object-cover rounded-tl-3xl rounded-bl-3xl"
        src="/clean.png"
        alt="authpic"
        width={1920}
        height={1080}
        style={{
          borderLeft: "2px solid black", 
          borderTopLeftRadius: "3.5rem", 
          borderBottomLeftRadius: "3.5rem", 
        }}
      />
    </div>
  );
}
