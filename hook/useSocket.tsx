import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000");

let socket = null;
if (typeof window !== "undefined") {
  socket = io(SOCKET_SERVER_URL, {
    autoConnect: false,
  });
}

export const useSocket = (roomName: string | null) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [paragraph, setParagraph] = useState("");
  const [players, setPlayers] = useState<
    { id: string; progress: number; username?: string }[]
  >([]);
  const [currentPlayer, setCurrentPlayer] = useState<{
    id: string;
    progress: number;
    username?: string;
  }>({ id: "", progress: 0 });

  useEffect(() => {
    if (!socket || !roomName) return;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server.");
      socket.emit("join_room", roomName);
      socket.emit("player_joined", roomName, currentPlayer.username);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server.");
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("receive_keystroke", (data) => {
      const { message, sender, username } = data;
      setPlayers((prev) => {
        const existingPlayer = prev.find((p) => p.id === sender);
        if (existingPlayer) {
          return prev.map((p) =>
            p.id === sender
              ? {
                  ...p,
                  progress: message.length,
                  username: username || p.username,
                }
              : p
          );
        } else {
          return [...prev, { id: sender, progress: message.length, username }];
        }
      });
    });

    socket.on("new_player", (player) => {
      setPlayers((prev) => [...prev, player]);
    });

    socket.on("room_players", (existingPlayers) => {
      setPlayers(existingPlayers);
    });

    socket.on("player_left", (playerId) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });

    socket.on("room_paragraph", (roomParagraph) => {
      console.log("Received paragraph for room:", roomParagraph);
      setParagraph(roomParagraph);
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("receive_keystroke");
      socket.off("new_player");
      socket.off("room_players");
      socket.off("player_left");
      socket.off("room_paragraph");
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
        sender: socket.id,
        username: currentPlayer.username,
      });
    }
  };

  const setParagraphForRoom = (para: string) => {
    console.log("Required values to set paragraph:", {
      socket,
      isConnected,
      roomName,
    });
    if (socket && isConnected && roomName && !paragraph) {
      socket.emit("paragraph_set", roomName, para);
    }
  };

  return {
    messages,
    sendMessage,
    sendKeystroke,
    isConnected,
    players,
    currentPlayer,
    setCurrentPlayer,
    paragraph,
    setParagraph,
    setParagraphForRoom,
  };
};
