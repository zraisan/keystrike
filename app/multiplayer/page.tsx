"use client";

import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hook/useSocket";
import generateParagraph from "@/lib/markov";
import { useEffect, useState, useRef } from "react";

export default function Multiplayer() {
  const [roomId, setRoomId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const { sendKeystroke, isConnected, players } = useSocket(roomId);
  const [paragraph, setParagraph] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [startType, setStartType] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      generateParagraph(50).then((generated) => {
        setParagraph(generated);
      });
    }
  }, [gameStarted]);

  useEffect(() => {
    if (textareaRef.current && gameStarted) {
      textareaRef.current.focus();
    }
  }, [paragraph, gameStarted]);

  useEffect(() => {
    if (startType) {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => {
          return (prev += 1);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startType]);

  useEffect(() => {
    if (userInput.length > 0 && !isDeleting) {
      setIncorrectChars((prev) =>
        userInput[userInput.length - 1] !== paragraph[userInput.length - 1]
          ? prev + 1
          : prev
      );
      const newAccuracy = Math.round(
        ((userInput.length - incorrectChars) / userInput.length) * 100
      );
      setAccuracy(newAccuracy);
    }
  }, [userInput, paragraph]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setStartType(true);
    setUserInput(value);
    setCurrentIndex(value.length);
    
    // Send keystroke to other players
    sendKeystroke(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setIsDeleting(true);
    } else {
      setIsDeleting(false);
    }
  };

  const renderText = () => {
    if (!paragraph) return "Waiting for game to start...";

    return paragraph.split("").map((char, index) => {
      let className = "text-gray-400";

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className = "text-green-500";
        } else {
          className = "text-red-500 bg-red-500/20";
        }
      } else if (index === currentIndex) {
        className = "text-gray-400 bg-yellow-400/50";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
  };

  const joinRoom = () => {
    if (roomInput.trim()) {
      setRoomId(roomInput.trim().toUpperCase());
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-900">
        <Header onJoinGame={() => alert("Join Game clicked!")} />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-8">Multiplayer Typerace</h1>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
          <div className="mb-6">
            <Button 
              onClick={createRoom}
              className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
            >
              Create New Room
            </Button>
          </div>
          
          <div className="text-center text-gray-400 mb-4">OR</div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button 
              onClick={joinRoom}
              disabled={!roomInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            >
              Join Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (roomId && !gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-900">
        <Header onJoinGame={() => alert("Join Game clicked!")} />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Room: {roomId}</h1>
          <p className="text-gray-400">
            Connection Status: {isConnected ? "Connected" : "Disconnected"}
          </p>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Players in Room:</h2>
            <div className="space-y-2">
              {players.length > 0 ? (
                players.map((player) => (
                  <div key={player.id} className="text-gray-300">
                    Player {player.id.substring(0, 8)}... - Progress: {player.progress}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Waiting for players...</div>
              )}
            </div>
          </div>
          
          <Button 
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-900">
      <Header onJoinGame={() => alert("Join Game clicked!")} />
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">Room: {roomId}</h1>
      </div>
      <div className="mb-4">
        <p className="text-white">
          Accuracy: {accuracy}%
        </p>
      </div>
      <div className="mb-4">
        <p className="text-white">Time Elapsed: {timeElapsed} seconds</p>
      </div>
      
      {/* Players Progress */}
      <div className="mb-4 max-w-4xl w-full mx-auto px-4">
        <h3 className="text-white font-bold mb-2">Players:</h3>
        <div className="grid grid-cols-2 gap-2">
          {players.map((player) => (
            <div key={player.id} className="bg-gray-800 p-2 rounded text-white text-sm">
              Player {player.id.substring(0, 8)}... - Progress: {player.progress}
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-4xl w-full mx-auto px-4">
        <div className="font-mono text-2xl leading-relaxed whitespace-pre-wrap break-words p-6 bg-gray-800 rounded-lg">
          {renderText()}
        </div>
        <Textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 resize-none"
          style={{ caretColor: "transparent" }}
        />
      </div>
    </div>
  );
}