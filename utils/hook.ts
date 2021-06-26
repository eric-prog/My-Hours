import { useEffect, useState, useMemo } from "react";
import {
  JOIN_SESSION,
  LEAVE_SESSION,
  UPDATE_SESSION_LIST,
  CONNECT_EVENT,
  LIST_SESSION_DATA_REQUEST,
  IN_SESSION_USER
} from "../server/handler/SessionSocketHandler";
import { ISession } from "../server/repository/sessions";

export const useJoinSession = (socket: SocketIOClient.Socket, sessionId: string) => {
  const requestJoin = () => {
    console.log(`Join Session: ${sessionId}`);
    socket.emit(JOIN_SESSION, sessionId);

    return () => {
      console.log(`Leave Session: ${sessionId}`);
      socket.emit(LEAVE_SESSION, sessionId);
    };
  };

  useEffect(requestJoin, []);
};

export const useSessionsIo = (socket: SocketIOClient.Socket) => {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const sessionData = () => {
    console.log("userSessionIo Mount");
    socket.on(CONNECT_EVENT, (sessions: ISession[]) => {
      setSessions(sessions);
    });
    socket.on(UPDATE_SESSION_LIST, (sessions: ISession[]) => {
      setSessions(sessions);
    });

    return () => {
      console.log("use session leave");
      socket.off(CONNECT_EVENT).off(UPDATE_SESSION_LIST);
    };
  };

  useEffect(sessionData, []);
  return [sessions];
};

export const useWaitingSession = (socket: SocketIOClient.Socket) => {
  const ms = useMemo(() => socket, [socket]);
  const [sessions, setSessions] = useState<ISession[]>([]);
  const sessionData = () => {
    ms.emit(LIST_SESSION_DATA_REQUEST, (sessions: ISession[]) => {
      setSessions(sessions);
    });

    ms.on(UPDATE_SESSION_LIST, (sessions: ISession[]) => {
      setSessions(sessions);
    });
    return () => {
      ms.off(UPDATE_SESSION_LIST);
    };
  };

  useEffect(sessionData, []);

  return { sessions: sessions };
};

export const useJoinNewUser = (socket: SocketIOClient.Socket) => {
  const ms = useMemo(() => socket, [socket]);
  const [id, setId] = useState("");

  const newUserJoinListener = () => {
    ms.on(IN_SESSION_USER, ({ id }: any) => {
      setId(id);
      console.log(`newUserJoinListener: `, id);
    });

    return () => {
      ms.off(IN_SESSION_USER);
    };
  };

  useEffect(newUserJoinListener, []);

  return { id };
};
