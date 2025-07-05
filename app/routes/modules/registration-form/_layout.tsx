import { Outlet } from "react-router";
import { Toaster } from "sonner";

export default function ApplicationFormLayout() {
  return (
    <div className="w-full h-full flex flex-col">
      <header className=" w-full bg-[#213b36] py-5 px-26">
        <h2 className="uppercase font-bold text-[#ffffff]">
          CIV YOUNG PEOPLE CHURCH LIVING
        </h2>
      </header>
      <Outlet />
      <Toaster richColors={true} position="top-right" />
    </div>
  );
}
