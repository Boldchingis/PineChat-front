import { Button } from "@/components/ui/button";
import { MessageCircleCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div>
      <header className="w-[95%] mx-auto flex">
        <div>
          <div className="text-2xl font-bold text-black">Pinecone</div>
          <p className="text-md font-medium text-black opacity-50">Chatting</p>
        </div>
        <div className="text-black mx-auto flex items-center gap-16">
          <p>Privacy</p>
          <p>Help center</p>
          <p>Blog</p>
          <p>For business</p>
          <p>Apps</p>
        </div>
        <Button className="rounded-full ml-auto my-auto">Download</Button>
      </header>

      <main className="relative">
        <Image
          className="w-full h-screen rounded-3xl mx-auto my-10 object-cover"
          src="/clean.png" // Ensure it's in the 'public' folder
          alt="Landing Page"
          width={1920} // Add width
          height={1080} // Add height
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <h1
            className="text-4xl font-bold text-white"
            style={{ WebkitTextStroke: "1px black" }}
          >
            Welcome to PineChatting
          </h1>

          <p className="text-lg mt-2 text-white drop-shadow-[1px_1px_1px_black]">
            Discover amazing things here
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/auth">
              <Button className="w-52 h-16 text-3xl rounded-full border-2 border-transparent hover:bg-green-600 transition duration-300">
                Start
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-black rounded-tr-3xl rounded-tl-3xl py-10">
        <div className="container mx-auto w-[80%] flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-2 text-3xl">
            <MessageCircleCode className="text-white w-10 h-10" />
            <p className="text-white font-bold">PineChatting</p>
          </div>
          <div className="text-white mt-5 text-center lg:text-left">
            <p className="text-sm opacity-75">
              &copy; 2025 PineChatting LLC. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-4">
              <p className="text-sm opacity-75 hover:opacity-100 cursor-pointer transition-all">
                Terms & Privacy Policy
              </p>
              <p className="text-sm opacity-75 hover:opacity-100 cursor-pointer transition-all">
                Help Center
              </p>
              <p className="text-sm opacity-75 hover:opacity-100 cursor-pointer transition-all">
                Security
              </p>
              <p className="text-sm opacity-75 hover:opacity-100 cursor-pointer transition-all">
                Contact Us
              </p>
            </div>
          </div>
          <Button className="mt-6 w-[250px] h-[70px] text-2xl bg-green-500 hover:bg-white hover:text-green-600 border-[3px] border-transparent hover:border-green-600 transition-all">
            Download
          </Button>
        </div>
      </footer>
    </div>
  );
}
