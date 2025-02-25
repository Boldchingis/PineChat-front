import SideBar from "../_components/sideBar";
import ChatSection from "../_components/chatSection";
import MainChat from "../_components/EmptyChat";

export default function Signup() {
  return (
    <div className="bg-gray-600 h-screen text-white w-full flex items-center justify-center">
      <div className="w-[80%] h-[90%] flex bg-white rounded-2xl">
        <SideBar />
        <ChatSection /> 
        <MainChat />
      </div>
    </div>
  );
}
