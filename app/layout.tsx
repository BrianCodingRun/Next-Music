'use client';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import "./globals.css";
import Head from './head';
import { useEffect, useState } from 'react';
import Banniere from '@/components/Banniere';

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  const [token, setToken] = useState('');

  // Fetch the session token and set it for the SDK
  useEffect(() => {
    const getToken = async () => {
      const response = await fetch(`/api/auth/session`);
      const data = await response.json();
      if (data?.accessToken) {
        setToken(data.accessToken);
      }
    };
    getToken();
  }, []);

  return (
    <html lang="fr">
      <Head />
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans overflow-hidden`}>
        <Banniere />
        <SessionProvider session={session}>
          <main className="h-screen">
              {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}