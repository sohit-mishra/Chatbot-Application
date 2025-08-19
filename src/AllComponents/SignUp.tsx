import React, { useState } from "react";
import nhost from "@/lib/nhostClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "@/lib/toastUtils";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!acceptedTerms) {
      showWarningToast("You must accept the terms and conditions.");
      return;
    }

    if (password !== confirmPassword) {
      showWarningToast("Passwords do not match.");
      return;
    }

    const { error } = await nhost.auth.signUp({ email, password });

    if (error) {
      showErrorToast(error.message);
    } else {
      showSuccessToast(
        "Signup successful! You can check your email for verification."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
              Sign Up
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
              <button
                type="button"
                className="absolute right-2 top-9 p-0 bg-transparent border-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={16} className="mt-[-2px] mr-2" />
                ) : (
                  <EyeOff size={16} className="mt-[-2px] mr-2" />
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full relative">
              <Label className="pb-2">Confirm Password</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-9 p-0 bg-transparent border-none cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Eye size={16} className="mt-[-2px] mr-2" />
                ) : (
                  <EyeOff size={16} className="mt-[-2px] mr-2" />
                )}
              </button>
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
              <Button onClick={handleSignup} className="w-full">
                Sign Up
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="mt-2 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 font-bold hover:underline"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
