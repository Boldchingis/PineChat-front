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
  
  export default function SignupComp() {
    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <Link href={"/login"}>
          <Button className="absolute top-6 right-6 w-[100px] h-[55px] text-lg hover:bg-green-600">
            Login
          </Button>
        </Link>
        <Card className="w-[90%] sm:w-[400px] mx-auto p-6 shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">PineChatting</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Message privately
            </CardDescription>
          </CardHeader>
  
          <CardContent className="flex flex-col gap-4">
            <Input placeholder="Enter your Username" />
            <Input placeholder="Enter your email" />
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Create your password"
                type={showPassword ? "text" : "password"}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-sm text-blue-600 hover:underline"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          </CardContent>
  
          <CardFooter>
            <Button className="w-full py-3 hover:bg-green-600 text-white rounded-md">
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  