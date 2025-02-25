import Image from "next/image";

export default function MainChat() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col items-center">
        <Image className="w-[350px] h-[350px]" src="/chatSec.png" alt="Chat Section" width={800} height={800} />
        <p className="font-medium opacity-60 text-black -mt-8 text-center">
          Send and receive messages without keeping your phone online.
        </p>
      </div>
    </div>
  );
}
