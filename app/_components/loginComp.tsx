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

export default function LoginComp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    // Validate Password
    if (!password) {
      setPasswordError("Password is required.");
      toast.error("Password is required.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (!hasError) {
      console.log("Form submitted", { email, password });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row justify-center items-center bg-gray-100">
      <Toaster position="top-center" />

      {/* Login Form */}
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
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-sm text-blue-600 hover:underline text-end"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full py-3 hover:bg-green-600 text-white rounded-md"
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Auth Image (Only shown on larger screens) */}
      <div className="hidden md:block flex-1">
        <Image
          className="w-full h-screen object-cover"
          src="/auth.png"
          alt="authpic"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}
