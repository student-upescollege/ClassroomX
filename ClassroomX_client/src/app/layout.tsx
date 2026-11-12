import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassroomX - AiCodeLab",
  description: "Interactive live coding platform for educators and students",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
