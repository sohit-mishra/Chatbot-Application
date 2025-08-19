import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthenticationStatus } from "@nhost/react";

interface PrivateRouterProps {
  children: ReactNode;
}

export default function PrivateRouter({ children }: PrivateRouterProps) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
