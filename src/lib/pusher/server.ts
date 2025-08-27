import Pusher from "pusher";

export const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

export async function publish(channel: string, payload: unknown) {
    await pusher.trigger(channel, "event", payload);
}
