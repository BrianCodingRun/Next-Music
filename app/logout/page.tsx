"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button";

export default function page() {
    return (
        <div className="h-screen flex items-center justify-center">
            <Button onClick={() => signOut({callbackUrl: '/'})} className="font-mono">Deconnexion</Button>
        </div>
    )
}