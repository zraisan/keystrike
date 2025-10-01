import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:4000";

let socket = null;
if (typeof window !== "undefined") {
  socket = io(SOCKET_SERVER_URL, {
    autoConnect: false,
  });
}

export const useSocket = (roomName: string | null) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<{id: string, progress: number}[]>([]);

  useEffect(() => {
    if (!socket || !roomName) return;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server.");
      socket.emit("join_room", roomName);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server.");
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("receive_keystroke", (data) => {
      const { message, sender } = data;
      setPlayers(prev => {
        const existingPlayer = prev.find(p => p.id === sender);
        if (existingPlayer) {
          return prev.map(p => 
            p.id === sender ? { ...p, progress: message.length } : p
          );
        } else {
          return [...prev, { id: sender, progress: message.length }];
        }
      });
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("receive_keystroke");
      socket.disconnect();
    };
  }, [roomName]);

  const sendMessage = (message: string, sender: string) => {
    if (socket && isConnected) {
      socket.emit("chatMessage", { roomName, message, sender });
    }
  };

  const sendKeystroke = (userInput: string) => {
    if (socket && isConnected && roomName) {
      socket.emit("send_keystroke", { 
        room: roomName, 
        message: userInput, 
        sender: socket.id 
      });
    }
  };

  return { messages, sendMessage, sendKeystroke, isConnected, players };
};
