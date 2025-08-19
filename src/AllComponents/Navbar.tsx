import React from "react";
import { Link } from "react-router-dom";
import { useSignOut, useUserDisplayName } from "@nhost/react";
import { Menu } from "lucide-react";
import Logo from "@/assets/image.png";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Navbar({ isOpen, setIsOpen }: NavbarProps) {
  const { signOut } = useSignOut();
  const displayName = useUserDisplayName();

  return (
    <motion.nav
      className="bg-white relative border-1"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center w-full h-16 justify-between">
          <div className="flex items-center space-x-3">
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 focus:outline-none"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <Menu size={24} />
              </motion.button>
            </div>

            <Link to="/" className="flex items-center">
              <img src={Logo} alt="Logo" className="w-10 h-auto" />
              <p className="text-2xl font-medium ml-2">Chat Ai</p>
            </Link>
          </div>

          <div className="flex items-center">
            <div className="md:hidden">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {displayName && (
                <span className="text-gray-600 font-medium">{displayName}</span>
              )}
              <Button
                variant="destructive"
                onClick={() => signOut()}
                className="ml-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
