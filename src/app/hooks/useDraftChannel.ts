"use client";
import { useContext, useEffect, useRef } from "react";
import type { PublicEvent } from "@/models/eventTypes";
import { PusherCtx } from "@/components/providers/RealtimeProvider";

export function useDraftChannel(
    channelName: string,
    onEvent: (e: PublicEvent) => void
) {
    const pusher = useContext(PusherCtx);
    const handlerRef = useRef(onEvent);
    handlerRef.current = onEvent;

    useEffect(() => {
        if (!pusher) return;
        const channel = pusher.subscribe(channelName);
        const handle = (data: PublicEvent) => handlerRef.current(data);
        channel.bind("event", handle);

        return () => {
            channel.unbind("event", handle);
            pusher.unsubscribe(channelName);
        };
    }, [pusher, channelName]);
}
