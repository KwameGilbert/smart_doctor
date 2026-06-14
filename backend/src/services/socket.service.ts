import { Server, Socket } from "socket.io";
import http from "http";
import { verifyToken } from "../helpers/jwt.helper";

let io: Server | null = null;
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

/**
 * Initialize the Socket.io server and attach it to the HTTP server instance.
 * Also configures the JWT auth middleware.
 */
export const initSocketServer = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production to matching origins
      methods: ["GET", "POST"]
    }
  });

  // JWT Handshake Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== "string") {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = verifyToken(token);
      socket.data = { user: decoded };
      next();
    } catch (err) {
      console.warn(`[Socket Server] Connection rejected. Invalid token: ${err instanceof Error ? err.message : String(err)}`);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    const userId = user.id;

    console.log(`🔌 Socket connected: ${socket.id} (User: ${userId}, Role: ${user.role})`);

    // Map user to socket ID
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join target user room (for mapping messages directly to a specific user)
    socket.join(`user:${userId}`);

    // Join target role room
    socket.join(`role:${user.role}`);

    // Real-time typing indicators
    socket.on("typing", (data: { consultationId: string; recipientId: string; isTyping: boolean }) => {
      if (data && data.consultationId && data.recipientId) {
        emitToUser(data.recipientId, "user_typing", {
          consultationId: data.consultationId,
          senderId: userId,
          isTyping: !!data.isTyping
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

/**
 * Get the initialized Socket.io Server instance.
 */
export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

/**
 * Emits an event to all active sockets of a specific user.
 */
export const emitToUser = (userId: string, event: string, data: any): boolean => {
  if (io && userSockets.has(userId)) {
    io.to(`user:${userId}`).emit(event, data);
    console.log(`📡 WebSocket emit [${event}] to user ${userId}`);
    return true;
  }
  return false;
};

/**
 * Emits an event to all users belonging to a specific role.
 */
export const emitToRole = (role: string, event: string, data: any): boolean => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    console.log(`📡 WebSocket emit [${event}] to role ${role}`);
    return true;
  }
  return false;
};

/**
 * Broadcasts an event to all connected WebSocket clients.
 */
export const broadcast = (event: string, data: any): boolean => {
  if (io) {
    io.emit(event, data);
    console.log(`📡 WebSocket broadcast [${event}] to all connections`);
    return true;
  }
  return false;
};
