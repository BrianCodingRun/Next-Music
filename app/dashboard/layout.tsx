'use client';

import Sidebar from "@/components/Sidebar";
import "../globals.css";
import Player from '@/components/Player';
import { useEffect, useState } from 'react';
import { usePlaybackSDKManager } from '@/utils/playback-sdk-manager';
import useStore from '@/store/store';
import { SessionProvider, useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
    session,
}: {
    children: React.ReactNode;
    session?: any;
}) {
    const { data: sessionData } : any = useSession();
    const [token, setToken] = useState('');
    const { isReady, deviceId } = usePlaybackSDKManager({ token });
    const setDeviceId = useStore((state) => state.setDeviceId);
    const router = useRouter(); // Mettez useRouter ici

    useEffect(() => {
        if (sessionData?.accessToken) {
            setToken(sessionData.accessToken);
        }
    }, [sessionData]);

    useEffect(() => {
        if (deviceId) {
            setDeviceId(deviceId);
        }
    }, [deviceId, setDeviceId]);

    // Déplacez la redirection ici
    useEffect(() => {
        if (!sessionData) {
            return;
        }
    }, [sessionData, router]);

    return (
        <SessionProvider session={session}>
            <Header />
            <main className="h-screen">
                <div className="flex gap-2 h-full w-full px-2">
                    <div className='h-full hidden lg:block'>
                        <Sidebar />
                    </div>
                    {children}
                </div>
                <div className='sticky z-20 bottom-0 w-full'>
                    <Player />
                </div>
            </main>
        </SessionProvider>
    );
}