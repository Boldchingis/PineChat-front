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
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Toaster, toast } from 'sonner';

export default function SignupComp() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;


    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a correct email address.");
      toast.error('Please enter a correct email address.');
      hasError = true;
    } else {
      setEmailError("");
    }

  
    if (!username || !/^[a-zA-Z]/.test(username)) {
      setUsernameError("Username must start with a letter.");
      toast.error('Username must start with a letter.');
      hasError = true;
    } else {
      setUsernameError("");
    }

    if (!hasError) {
      console.log("Form submitted", { username, email, password });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row justify-center items-center bg-gray-100">
      <Toaster position="top-center" expand={true} />

      <div className="flex-1 flex justify-center items-center">
        <Card className="w-[90%] sm:w-[400px] border-none mx-auto">
          <CardHeader className="text-start">
            <CardTitle className="text-2xl font-semibold">Get Started Now</CardTitle>
            <CardDescription className="text-sm text-gray-500">Message privately</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Input placeholder="Enter Username" className="border-2 border-gray-300 rounded-lg p-2" />
            <Input placeholder="Enter Email" className="border-2 border-gray-300 rounded-lg p-2" />
            <div className="flex flex-col gap-2">
              <Input placeholder="Create Password" type="password" className="border-2 border-gray-300 rounded-lg p-2" />
              <button type="button" className="text-sm text-blue-600 hover:underline text-end">
                Show Password
              </button>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full py-3 hover:bg-green-600 text-white rounded-md">Continue</Button>
          </CardFooter>
        </Card>
      </div>

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
