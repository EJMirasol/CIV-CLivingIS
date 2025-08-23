import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useEffect, useRef, useState, type JSX } from "react";
import { MobileMenu } from "./MobileMenu";
import { useNavigate } from "react-router";
import Logo from "/assets/CIV.png";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SubModule {
  icon: JSX.Element;
  label: string;
  route: string;
  subModules?: SubModule[];
}

interface HeaderProps {
  sidebarItems: {
    icon: JSX.Element;
    label: string;
    route: string;
    key: string;
    subModules: SubModule[];
  }[];
  user: User;
  setOpen: (open: boolean) => void;
}

export function Header({ sidebarItems, user, setOpen }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  useEffect(() => {
    setOpen(isSideBarOpen);
  }, [isSideBarOpen]);
  return (
    <header className="bg-[#213b36] border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-2">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-[#2c4f48] hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 max-w-64 min-w-64 p-0">
              <MobileMenu
                sidebarItems={sidebarItems}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <div className="hidden lg:block">
            <Button
              onClick={() => {
                setIsSideBarOpen(!isSideBarOpen);
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#2c4f48] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <img
            src={Logo}
            alt="CIV Logo"
            width={40}
            height={40}
            className="object-contain bg-white rounded-full"
          />

          <h1 className="text-sm lg:text-lg font-semibold text-white truncate">
            <span className="hidden sm:inline">
              THE CHURCH IN VALENZUELA CITY
            </span>
            <span className="sm:hidden">CIV</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 relative">
          <span className="font-medium text-white">{user.name}</span>
          <span className="hidden sm:inline text-white">|</span>
          <div className="relative">
            <MenuDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return; // Only add listener when dropdown is open

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]); // Add 'open' to dependency array

  const handleLogout = () => {
    setOpen(false);
    navigate("/sign-out");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center text-white hover:bg-[#2c4f48] hover:text-white"
      >
        <span>Account</span>
        <svg
          className="ml-1 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
