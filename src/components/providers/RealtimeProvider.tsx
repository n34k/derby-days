// src/components/providers/RealtimeProvider.tsx
"use client";
import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";

export const PusherCtx = React.createContext<Pusher | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(
        () =>
            new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            })
    );

    useEffect(() => () => client.disconnect(), [client]);

    return <PusherCtx.Provider value={client}>{children}</PusherCtx.Provider>;
}
