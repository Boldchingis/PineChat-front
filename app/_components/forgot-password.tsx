"use client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showOtpDialog, setShowOtpDialog] = useState(false);
  
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    };
  
    const validateEmail = () => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!regex.test(email)) {
        setEmailError("Please enter a valid email address");
        toast.error("Please enter a valid email address");
        return false;
      }
      setEmailError("");
      return true;
    };
  
    const handleSubmit = async () => {
      if (!validateEmail()) return;
  
  
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
      
          const success = true;
          if (success) {
            resolve({ });
          } else {
            reject('Error sending OTP');
          }
        }, 2000);
      });
  
      toast.promise(promise, {
        loading: 'Loading...',
        success: () => `Your OTP has been sent to your email.`,
        error: 'Error occurred',
      });
  
      setShowOtpDialog(true); 
    };
  
    const handleOtpDialogClose = () => {
      setShowOtpDialog(false); 
    };
  
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
        <Toaster position="top-center" />
        <Image className="h-screen relative" src="/clean.png" width={1920} height={1080} alt="logo" />
        <Card className="absolute top-1/2 transform -translate-y-1/2 w-full max-w-md mx-auto p-6 shadow-xl rounded-lg bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600">
              Enter your Gmail to receive a 6-digit verification code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Input
                type="email"
                placeholder="Enter your Gmail"
                className={`w-full mb-4 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <p className="text-sm text-red-500"></p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full text-white focus:outline-none focus:ring-2 py-2 rounded-lg "
            >
              Send
            </Button>
          </CardFooter>
        </Card>
        <Dialog open={showOtpDialog} onOpenChange={handleOtpDialogClose}>
          <DialogTrigger asChild />
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Verification Code</DialogTitle>
              <DialogDescription className="flex flex-col items-center space-y-4">
                <InputOTP maxLength={6} className="flex justify-center space-x-2">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

       
                <Button
                  className="mt-4 w-full text-white py-2 rounded-md"
                >
                  Confirm
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    );
}
