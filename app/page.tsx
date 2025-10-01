"use client";

import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/hook/useSocket";
import generateParagraph from "@/lib/markov";
import { useEffect, useState, useRef, use } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const { messages, sendMessage, isConnected } = useSocket(null);
  const [paragraph, setParagraph] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [roomId, setRoomId] = useState("");
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [startType, setStartType] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    generateParagraph(50).then((generated) => {
      setParagraph(generated);
    });
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [paragraph]);

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      setIsDeleting(true);
    } else {
      setIsDeleting(false);
    }
  };

  const renderText = () => {
    if (!paragraph) return "Generating...";

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

  const handleJoinGame = (id = "someid") => {
    try {
      setRoomId(id);
      console.log("Joining game with ID:", id);
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-900">
      <Header onJoinGame={() => alert("Join Game clicked!")} />
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">Typing Test</h1>
      </div>
      <div className="mb-4">
        <p className="text-white">
          WPM: {wpm} | Accuracy: {accuracy}%
        </p>
      </div>
      <div className="mb-4">
        <p className="text-white">Time Elapsed: {timeElapsed} seconds</p>
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
