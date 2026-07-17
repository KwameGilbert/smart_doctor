import { io, Socket } from "socket.io-client";
import { tokenStorage } from "./storage";

// Strip any trailing slash from the base URL
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "https://smartdoctor-98s4.onrender.com").replace(/\/$/, "");

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    if (this.socket?.connected) return;

    const token = await tokenStorage.getToken();
    if (!token) {
      console.warn("[Socket Service] No auth token found. Cannot connect socket.");
      return;
    }

    this.socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("[Socket Service] Connected successfully with ID:", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket Service] Connection error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket Service] Disconnected. Reason:", reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("[Socket Service] Socket disconnected manually.");
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn(`[Socket Service] Cannot listen to "${event}". Socket not initialized.`);
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn(`[Socket Service] Cannot emit "${event}". Socket not connected.`);
      return;
    }
    this.socket.emit(event, data);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
