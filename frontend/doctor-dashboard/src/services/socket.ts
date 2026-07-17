import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://smartdoctor-98s4.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    // Disconnect existing if any
    this.disconnect();

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket connection closed');
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      // Queue or retry logic could be added, but standard is checking initialization
      console.warn('⚠️ WebSocket not initialized. Cannot listen for event:', event);
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  emit(event: string, data: any) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not initialized. Cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
