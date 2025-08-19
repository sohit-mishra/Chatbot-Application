import React, { useState } from "react";
import nhost from "../lib/nhostClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!acceptedTerms) {
      showErrorToast("You must accept the terms and conditions.");
      return;
    }

    const { error } = await nhost.auth.signIn({ email, password });

    if (error) {
      console.log(error.message);
      showErrorToast(error.message);
    } else {
      showSuccessToast("You are now logged in!");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 20 },
    },
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="w-96 shadow-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Login
              <Toaster richColors position="top-center" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
            <motion.div variants={itemVariants} className="w-full">
              <Label className="pb-2">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full relative">
              <Label className="pb-2">Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <motion.button
                type="button"
                className="absolute right-2 top-9 p-0 bg-transparent border-none cursor-pointer"
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={16} className="mt-[-2px] mr-2" />
                ) : (
                  <EyeOff size={16} className="mt-[-2px] mr-2" />
                )}
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="w-full flex items-center gap-2"
            >
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              />
              <Label>I accept the terms and conditions</Label>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full mt-2">
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="mt-2 text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-500 font-bold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
