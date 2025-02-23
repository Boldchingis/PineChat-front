import SideBar from "../_components/sideBar";

export default function Signup() {
  return (
    <div className="bg-gray-600 h-screen text-white w-full flex items-center justify-center">
      <div className="w-[80%] h-[90%] flex bg-green-200 rounded-2xl">
        <SideBar />
        <div className="flex-grow flex items-center justify-center">
          <span>Home</span>
        </div>
      </div>
    </div>
  );
}
