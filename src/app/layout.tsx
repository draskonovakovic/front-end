'use client';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotificationBell from './notification-bell/page';
import Navbar from "./navbar/page";
import { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


function NotificationBellWrapper() {
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    return null; 
  }

  return <NotificationBell />;
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <NotificationBellWrapper /> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
