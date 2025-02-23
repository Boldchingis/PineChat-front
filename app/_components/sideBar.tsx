import { MessageCircleCode } from 'lucide-react';
import { UsersRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SideBar() {
  return (
    <div className="h-[100% ] w-[1/5] bg-white border-r-1 border-gray-300 rounded-tl-2xl rounded-bl-2xl p-4">
      <div className="flex justify-center mb-8">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-center gap-5 mt-5">
        <MessageCircleCode className="h-8 w-8 text-black" />
        <UsersRound className="h-8 w-8 text-black" />
      </div>
    </div>
  );
}