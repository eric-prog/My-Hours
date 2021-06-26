import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useJoinSession, useWaitingSession } from "../utils/hook";
import { CREATE_SESSION_REQUEST } from "../server/handler/SessionSocketHandler";
import { ISession } from "../server/repository/sessions";
import { socket } from "../utils/context";
import "./index.module.scss"

type Props = {};
 
const Join: NextPage<Props> = () => {
  useJoinSession(socket, "waiting-session");
  const { sessions: sessions } = useWaitingSession(socket);
  const [newSession, setNewSession] = useState("");

  const createSessionEnterHandler = () => {
    if (newSession.length > 0) {
      if (sessions.filter(session => newSession === session.sessionNm).length > 0) {
        alert("Session already exists!");
        return;
      }
      socket.emit(CREATE_SESSION_REQUEST, newSession);
      setNewSession("");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Start Session</h1>
      <div className="inner-container">
        <div className="join-input">
          <label className="text-label">Name: </label>
          <input
            type="text"
            className="text-input"
          />
        </div>
        <div className="join-input">
          <label className="text-label">Session Name: </label>
          <input
            type="text"
            className="text-input"
            onChange={e => setNewSession(e.target.value)}
            value={newSession}
          />
        </div>
        <button className="start-btn" onClick={createSessionEnterHandler}>Start Session</button>
      </div>
      <div className="container">
        <h1 className="title">All Sessions</h1>
        <ul className="inner-container">
          {sessions.map((session: ISession) => (
            <li className="li-link" key={session.id}>
              <Link href={`/session/[id]`} as={`/session/${session.id}`}>
                <a className="session-label">{session.sessionNm}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Join;
