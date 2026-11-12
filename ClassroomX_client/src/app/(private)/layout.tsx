import { AuthProvider } from "@/components/auth-provider";
import React, { Children } from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default layout;
