// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <button
        onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
        className="bg-green-500 px-4 py-2 rounded text-white"
      >
        Se connecter avec Spotify
      </button>
    </div>
  );
}
