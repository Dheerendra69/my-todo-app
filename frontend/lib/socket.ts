import { io, Socket } from "socket.io-client";

export const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  autoConnect: false, // We don't want the socket connecting as soon as the application loads.
});

export function connectSocket() {
  const token = localStorage.getItem("accessToken");

  socket.auth = {
    token,
  };

  socket.connect();
}
