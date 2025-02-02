import { sign } from 'jsonwebtoken';
import { io, type Socket } from 'socket.io-client';

export function getServerSocket(): Socket {
    if (!process.env.NEXTAUTH_SECRET) return globalThis.serverSocket;

    if (!globalThis.serverSocket) {
        const token = sign(
            { sub: process.env.SOCKET_NEXTJS_ID },
            process.env.NEXTAUTH_SECRET ?? ''
        );

        const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_API_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            query: {
                token,
            },
        });

        socket.on('connect', () => {
            console.log('websocket connected');
        });

        socket.on('error', () => {
            console.log('connect error');
        });

        globalThis.serverSocket = socket;
    }

    return globalThis.serverSocket;
}
