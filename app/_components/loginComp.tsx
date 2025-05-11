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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function LoginComp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading

  const router = useRouter(); 

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      toast.error("Password is required.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (!hasError) {
      setLoading(true); // Start loading
      try {
        const response = await fetch("http://localhost:5000/users/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          // Store tokens in localStorage
          localStorage.setItem("accessToken", data.tokens.accessToken);
          localStorage.setItem("refreshToken", data.tokens.refreshToken);

          toast.success("Signed in successfully!");
          console.log("User Data:", data.data);

          // Check if user has profile and redirect accordingly
          if (data.data.profile) {
            router.push("/home");
          } else {
            router.push("/profile");
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error during sign-in:", error);
        toast.error("Something went wrong, please try again.");
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row justify-center border-none shadow-none items-center bg-gray-100">
      <Toaster position="top-center" expand={true} />
      <div className="flex-1 flex justify-center items-center">
        <Card className="w-[90%] sm:w-[400px] border-none mx-auto">
          <CardHeader className="text-start">
            <CardTitle className="text-2xl font-semibold">Welcome back!</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your Credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email here"
              className={`border-2 p-2 rounded-lg ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />

            <div className="flex flex-col gap-2">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password here"
                type={showPassword ? "text" : "password"}
                className={`border-2 p-2 rounded-lg ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex justify-between items-center">
                <Link href="/auth/forgotpassword">
                  <div className="text-sm text-black hover:underline">Forgot password?</div>
                </Link>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showPassword ? "Hide Password" : "Show Password"}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full py-3 text-white rounded-md relative"
              disabled={loading} // Disable button while loading
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
      </div>

      <div className="hidden md:block flex-1">
        <Image
          className="w-full h-screen object-cover rounded-tl-3xl rounded-bl-3xl"
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
    </div>
  );
}
