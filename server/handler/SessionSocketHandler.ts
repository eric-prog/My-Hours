import { SessionsRepository } from "../repository/sessions";
import uuid from "uuid/v4";

export const CONNECT_EVENT = "session/connect";
export const CREATE_SESSION_REQUEST = "session/create";
export const LIST_SESSION_DATA_REQUEST = "session/list-session-data-request";
export const JOIN_SESSION = "session/join";
export const LEAVE_SESSION = "session/reave";
export const UPDATE_SESSION_LIST = "session/update-session-list";
export const IN_SESSION_USER = "session/in-session-user";
export const NEW_MESSAGE = "session/new-message";
export const SEND_MESSAGE = "session/send-message";

class SessionSocketHandler {
  private static io: SocketIO.Server;

  public static listen(io: SocketIO.Server) {
    this.io = io;

    this.connect();
  }

  /*
   * When connecting for the first time
   */
  public static connect() {
    this.io.on("connection", socket => {
      const message = "User has left the chat."
      socket.emit(CONNECT_EVENT, SessionsRepository.getSessions);

      this.createSessionRequestListener(socket);
      this.joinSessionRequestListener(socket);
      this.leaveSessionRequestListener(socket);
      this.listSessionDataRequestListener(socket);

      socket.on("disconnect", () => {
        console.log("IN DISCONNECT");
        this.io.emit(NEW_MESSAGE, {
          message: message,
          senderId: socket.id,
          chatId: uuid()
        });
      });
    });
  }

  public static listSessionDataRequestListener(socket: SocketIO.Socket) {
    socket.on(LIST_SESSION_DATA_REQUEST, (ack: Function) => {
      const sessions = SessionsRepository.getSessions;
      ack(sessions);
    });
  }

  public static createSessionRequestListener(socket: SocketIO.Socket) {
    socket.on(CREATE_SESSION_REQUEST, (sessionNm: string) => {
      const sessions = SessionsRepository.addSession(sessionNm);
      this.io.to("waiting-session").emit(UPDATE_SESSION_LIST, sessions);
    });
  }

  public static joinSessionRequestListener(socket: SocketIO.Socket) {
    socket.on(JOIN_SESSION, sessionId => {
      socket.join(sessionId);
      if (sessionId !== "waiting-session") {
        this.inSessionUserListener(socket);
      }
    });
  }

  public static leaveSessionRequestListener(socket: SocketIO.Socket) {
    socket.on(LEAVE_SESSION, sessionId => {
      socket.leave(sessionId);
    });
  }

  public static inSessionUserListener(socket: SocketIO.Socket) {
    socket.on(IN_SESSION_USER, () => {
      socket.broadcast.emit(IN_SESSION_USER, { id: socket.id });
    });

    socket.on(SEND_MESSAGE, (message: { sessionId: string; message: string }) => {
      console.log(`[SERVER] send: ${message.message} to ${message.sessionId}`);
      this.io.emit(NEW_MESSAGE, {
        message: message.message,
        senderId: socket.id,
        chatId: uuid()
      });
    });
  }
}

export default SessionSocketHandler;
