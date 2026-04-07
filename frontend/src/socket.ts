import { io } from "socket.io-client";

export const socket = io("https://virtual-cosmos-l0ax.onrender.com", {
  autoConnect: false,
});