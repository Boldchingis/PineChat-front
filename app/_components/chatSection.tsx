import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { ChevronDown } from 'lucide-react';
export default function ChatSection() {
    return(
        <div className="w-[800px] border h-[100%]"> 
            <header className="w-[90%] mt-2 mx-auto">
                <p className="text-2xl text-black font-bold">Pinechat</p>
            </header>
            <main className=" mt-4">
                <div> <Input className="w-[90%] text-black mx-auto outline-none " placeholder="search.."></Input>  </div>

                <div className="border mt-6 h-16 w-[95%] mx-auto rounded-2xl flex items-center justify-start px-4 ">
                    <div> <Avatar className="w-12 h-12">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
    </Avatar>  </div>
    <div className="text-black ml-2"><p>Username </p>
    <p className="opacity-60">The last messenger your friends sent to you.</p></div>
    <div className="ml-auto">     

    <DropdownMenu>
  <DropdownMenuTrigger className="border text-[12px] text-gray-400  rounded-md"><ChevronDown/></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Delete chat</DropdownMenuItem>

  </DropdownMenuContent>
</DropdownMenu>

</div>
</div>
            </main>
        </div>
    )
}
