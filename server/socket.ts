import http from "http";
import socketIo from "socket.io";
import SessionSocketHandler from "./handler/SessionSocketHandler";

let io: SocketIO.Server;

const socket = (server: http.Server) => {
  io = socketIo(server);

  SessionSocketHandler.listen(io);
};

export default socket;
