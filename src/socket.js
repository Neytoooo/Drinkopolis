import { io } from "socket.io-client";

const SOCKET_URL = "https://saving-slightly-enabled-enjoyed.trycloudflare.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],

});
