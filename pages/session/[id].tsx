import React, { useEffect, useState, useRef } from "react";
import { NextPage } from "next";
import { useJoinSession, useJoinNewUser } from "../../utils/hook";
import { socket } from "../../utils/context";
import {
  IN_SESSION_USER,
  NEW_MESSAGE,
  SEND_MESSAGE
} from "../../server/handler/SessionSocketHandler";
import uuid from "uuid/v4";
import "../index.module.scss"


const useNewMessage = () => {
  const [message, setMessage] = useState<{
    message: string;
    senderId: string;
    chatId: string;
  }>();

  useEffect(() => {
    socket.on(
      NEW_MESSAGE,
      (ack: { message: string; senderId: string; chatId: string }) => {
        setMessage(ack);
        console.log(ack);
      }
    );

    return () => {
      socket.off(NEW_MESSAGE);
    };
  }, []);

  return [message];
};

type Props = {
  id: any;
};

const SessionIn: NextPage<Props> = props => {
  const [chats, setChats] = useState<any>([]);
  const [message, setMessage] = useState("");
  useJoinSession(socket, `/session/${props.id}`);
  const [newMessage] = useNewMessage();
  const { id } = useJoinNewUser(socket);
  const chatContainerRef = useRef<any>();

  const sessionInEventEmitter = () => {
    socket.emit(IN_SESSION_USER);
  };

  const newUserJoinHandler = () => {
    setChats(chats.concat({ type: "new", userId: id, chatId: uuid() }));
  };

  const sendMessage = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 && message.length > 0) {
      socket.emit(SEND_MESSAGE, {
        sessionId: props.id,
        message
      });
      setMessage("");
    }
  };

  useEffect(() => {
    if (newMessage) {
      setChats(
        chats.concat({
          type: "message",
          message: newMessage.message,
          senderId: newMessage.senderId,
          chatId: newMessage.chatId
        })
      );

      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [newMessage]);

  useEffect(sessionInEventEmitter, []);

  useEffect(() => {
    id && newUserJoinHandler();
  }, [id]);

  return (
    <div className="container">
      <h1 className="title">Session {props.id}</h1>
      <h2 className="invite-link"><span className="invite">Invite link:</span> http://localhost:3000/session/{props.id}</h2>
      <div className="text-container">
        <ul className="text-container">
          {chats.map((chat: any) => {
            if (chat.type === "new") {
              return (
                <li className="li-text user-join" key={chat.chatId}>{chat.userId} has entered!</li>
              );
            } else if (chat.type === "message") {
              return <li className="li-text" key={chat.chatId}>{chat.message}</li>;
            } else {
              <li className="li-text user-join" key={chat.chatId}>{chat.userId} has left!</li>
            }
          })}
          <li className="chat-container" ref={chatContainerRef}></li>
        </ul>
        <input className="msg-input" type="text" onChange={e => setMessage(e.target.value)} value={message} onKeyDown={sendMessage}/>
      </div>
    </div>
  );
};

SessionIn.getInitialProps = async ({ query }) => {
  return {
    id: query.id
  };
};

export default SessionIn;
