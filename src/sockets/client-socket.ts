import { io, type Socket } from 'socket.io-client';

let socket: Socket;
let connected = false;

type SocketInterface = {
    on: Socket['on'];
    emit: Socket['emit'];
    disconnect: () => void;
};

let socketInterface: SocketInterface;

export function getClientSocket(): SocketInterface {
    socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_API_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,

        reconnectionDelayMax: 50000,
        reconnectionAttempts: 3,
        reconnectionDelay: 10000,
        autoConnect: false,
    });

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
                socket.connect();
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

    return socketInterface;
}
