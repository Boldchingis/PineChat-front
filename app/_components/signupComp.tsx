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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length < 6 || name.length > 12) {
      toast.error("Name must be between 6-12 characters.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Invalid email format.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account created successfully!");
      } else {
        toast.error(data.message || "Sign-up failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong, please try again.");
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
          <Input placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <Input placeholder="Create Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={togglePasswordVisibility} className="text-sm text-blue-600 hover:underline text-end">
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={handleSubmit}>Continue</Button>
        </CardFooter>
      </Card>
      <Image
      className="w-1/2 h-screen object-cover rounded-tl-3xl rounded-bl-3xl"
      src="/clean.png"
      alt="authpic"
      width={1920}
      height={1080}
      style={{
        borderLeft: "2px solid black", // Add black left border
        borderTopLeftRadius: "3.5rem", // Adjust the radius for top left
        borderBottomLeftRadius: "3.5rem", // Adjust the radius for bottom left
      }}
    />
    </div>
  );
}
