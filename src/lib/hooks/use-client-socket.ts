import { getClientSocket } from '@/sockets/client-socket';
import { useEffect } from 'react';
import { SocketEvent } from '../constants';

type Props = {
    onSubscribe?: () => void;
    onUnsubscribe?: () => void;
    onConnectionError?: () => void;
    onNotification?: () => void;
};

export function useClientSocket({
    onSubscribe,
    onUnsubscribe,
    onConnectionError,
    onNotification,
}: Props) {
    useEffect(() => {
        const clientSocket = getClientSocket();

        function close() {
            clientSocket.emit(SocketEvent.UNSUBSCRIBE);
            onUnsubscribe?.();
            clientSocket.disconnect();
        }

        clientSocket.emit(SocketEvent.SUBSCRIBE);
        onSubscribe?.();

        clientSocket.on(SocketEvent.CONNECT_ERROR, () => {
            onConnectionError?.();
        });

        clientSocket.on(SocketEvent.SUBSCRIBED, () => {
            onSubscribe?.();
        });

        clientSocket.on(SocketEvent.NOTIFICATION, () => {
            onNotification?.();
        });

        window.addEventListener('unload', close);

        return () => {
            window.removeEventListener('unload', close);
            close();
        };
    }, []);
}
