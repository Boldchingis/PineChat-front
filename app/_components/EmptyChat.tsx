import Image from "next/image";

export default function EmptyChat() {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-100">
      <div className="flex flex-col items-center max-w-md text-center p-8">
        <Image
          className="w-[350px] h-[350px]"
          src="/chatSec.png"
          alt="Chat Section"
          width={800}
          height={800}
          priority
        />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to PineChat</h2>
        <p className="font-medium text-gray-600 mb-2">
          Send and receive messages without keeping your phone online.
        </p>
        <p className="text-gray-500 text-sm">
          Select a chat from the sidebar or start a new conversation to begin messaging.
        </p>
      </div>
    </div>
  );
}
