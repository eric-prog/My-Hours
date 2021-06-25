import { RoomsRepository } from "../repository/rooms";
import uuid from "uuid/v4";

export const CONNECT_EVENT = "session/connect";
export const CREATE_ROOM_REQUEST = "session/create";
export const LIST_ROOM_DATA_REQUEST = "session/list-room-data-request";
export const JOIN_ROOM = "session/join";
export const LEAVE_ROOM = "session/reave";
export const UPDATE_ROOM_LIST = "session/update-room-list";
export const IN_ROOM_USER = "session/in-room-user";
export const NEW_MESSAGE = "session/new-message";
export const SEND_MESSAEGE = "session/send-message";

class RoomSocketHandler {
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
      socket.emit(CONNECT_EVENT, RoomsRepository.getRooms);

      this.creatRoomRequestListener(socket);
      this.joinRoomRequestListener(socket);
      this.leaveRoomRequestListener(socket);
      this.listRoomDataRequestListener(socket);

      socket.on("disconnect", socket.removeAllListeners);
    });
  }

  public static listRoomDataRequestListener(socket: SocketIO.Socket) {
    socket.on(LIST_ROOM_DATA_REQUEST, (ack: Function) => {
      const rooms = RoomsRepository.getRooms;
      ack(rooms);
    });
  }

  public static creatRoomRequestListener(socket: SocketIO.Socket) {
    socket.on(CREATE_ROOM_REQUEST, (roomNm: string) => {
      const rooms = RoomsRepository.addRoom(roomNm);
      this.io.to("wating-room").emit(UPDATE_ROOM_LIST, rooms);
    });
  }

  public static joinRoomRequestListener(socket: SocketIO.Socket) {
    socket.on(JOIN_ROOM, roomId => {
      socket.join(roomId);
      if (roomId !== "wating-room") {
        this.inRoomUserListener(socket);
      }
    });
  }

  public static leaveRoomRequestListener(socket: SocketIO.Socket) {
    socket.on(LEAVE_ROOM, roomId => {
      socket.leave(roomId);
      alert("User left")
    });
  }

  public static inRoomUserListener(socket: SocketIO.Socket) {
    socket.on(IN_ROOM_USER, () => {
      socket.broadcast.emit(IN_ROOM_USER, { id: socket.id });
    });

    socket.on(SEND_MESSAEGE, (message: { roomId: string; message: string }) => {
      console.log(`[SERVER] send: ${message.message} to ${message.roomId}`);
      this.io.emit(NEW_MESSAGE, {
        message: message.message,
        senderId: socket.id,
        chatId: uuid()
      });
    });
  }
}

export default RoomSocketHandler;
