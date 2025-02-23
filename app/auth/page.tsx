"use client";

import { motion, AnimatePresence } from "framer-motion";
import LoginComp from "../_components/loginComp";
import SignupComp from "../_components/signupComp";
import { useState } from "react";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const handleSwitch = () => {
    setIsSliding(true); 
    setTimeout(() => {
      setIsSignup(!isSignup);
      setIsSliding(false); 
    }, 600); 
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gray-100">
      <AnimatePresence>
        {isSliding && (
          <motion.div
            key="slide-overlay"
            initial={{ x: isSignup ? "100%" : "0%" }}
            animate={{ x: isSignup ? "0%" : "100%", transition: { duration: 0.8, ease: "easeInOut" } }}
            exit={{ x: isSignup ? "0%" : "100%" }}
            className="absolute top-0 left-0 w-full h-full bg-green-600 z-30"
          />
        )}
      </AnimatePresence>
      {!isSliding && (
        <motion.div
          key={isSignup ? "signup-content" : "login-content"}
          initial={{ opacity: 0, x: isSignup ? 50 : -50 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.3 } }}
          exit={{ opacity: 0, x: isSignup ? -50 : 50 }}
          className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
        >
          {!isSignup ? <LoginComp /> : <SignupComp />}
        </motion.div>
      )}

      <button
        onClick={handleSwitch}
        className="absolute top-6 left-6 p-3 bg-black text-white rounded z-40"
        disabled={isSliding} 
      >
         {isSignup ? "Login" : "Signup"}
      </button>
    </div>
  );
}
