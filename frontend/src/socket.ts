import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://virtual-cosmos-l0ax.onrender.com";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});