import { SOCKET_EV } from '@/lib/constants';
import { io, type Socket } from 'socket.io-client';

function connect() {
    return io(process.env.NEXT_PUBLIC_WEBSOCKET_API_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
    });
}

let socket: Socket;
let connected = false;

type SocketInterface = {
    on: Socket['on'];
    emit: Socket['emit'];
    disconnect: () => void;
};

let socketInterface: SocketInterface;

export function getClientSocket(): SocketInterface {
    if (!socket) {
        socketInterface = {
            on: (event, callback) => {
                if (connected) {
                    console.log('[SOCKET] On:', event);
                    socket.on(event, callback);
                }
            },
            emit: (event, args) => {
                if (!connected) {
                    console.log('[SOCKET] Emit:', event);
                    socket = connect();
                    connected = true;
                }
                socket.emit(event, args);
            },
            disconnect: () => {
                socket.disconnect();
                console.log('%c[SOCKET] Disconnecting', 'color: #f00');
                connected = false;
            },
        } as SocketInterface;
    }

    if (socket && !socket.connected) {
        socket = connect();

        socket.on(SOCKET_EV.CONNECT, () => {
            console.log('%c[SOCKET] Connection established', 'color: #0f0');
        });

        socket.on(SOCKET_EV.CONNECT_ERROR, err => {
            console.error('[SOCKET]', err.message);
        });
    }

    return socketInterface;
}
