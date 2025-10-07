"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hook/useSocket";
import generateParagraph from "@/lib/markov";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function Multiplayer() {
  const [roomId, setRoomId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [username, setUsername] = useState("");
  const {
    sendKeystroke,
    isConnected,
    players,
    setCurrentPlayer,
    paragraph,
    setParagraphForRoom,
  } = useSocket(roomId);
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [startType, setStartType] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [finishPosition, setFinishPosition] = useState<number | null>(null);

  useEffect(() => {
    if (textareaRef.current && gameStarted) {
      textareaRef.current.focus();
    }
  }, [gameStarted]);

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
    if (timeElapsed > 0) {
      const wordsTyped = userInput.length / 5;
      const minutes = timeElapsed / 60;
      setWpm(Math.round(wordsTyped / minutes));
    }
  }, [userInput, timeElapsed]);

  useEffect(() => {
    if (
      userInput.length === paragraph.length &&
      paragraph.length > 0 &&
      userInput === paragraph &&
      !isComplete
    ) {
      setIsComplete(true);

      const finishedPlayers = players.filter(
        (p) => p.progress === paragraph.length
      );
      const currentUsername =
        players.find((p) => p.progress === userInput.length)?.username || "You";

      if (finishedPlayers.length === 0) {
        setWinner(currentUsername);
        setFinishPosition(1);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 400);
      } else {
        const currentPostion = players.sort((a, b) => b.progress - a.progress);
        const position = currentPostion.findIndex(
          (p) => p.progress === userInput.length
        );
        if (position !== -1) {
          setFinishPosition(position + 1);
        } else {
          setFinishPosition(finishedPlayers.length + 1);
        }
      }
    }
  }, [userInput, paragraph, players, isComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length > paragraph.length) return;

    const firstIncorrectIndex = value
      .split("")
      .findIndex((char, idx) => char !== paragraph[idx]);
    if (firstIncorrectIndex !== -1) {
      if (value.length > firstIncorrectIndex + 10) {
        return;
      }
    }

    if (
      !isDeleting &&
      value.length > userInput.length &&
      value[value.length - 1] !== paragraph[value.length - 1]
    ) {
      setIncorrectChars((prev) => prev + 1);
    }

    setStartType(true);
    setUserInput(value);
    setCurrentIndex(value.length);

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
          className = "text-green-400";
        } else {
          className = "text-red-400 bg-red-400/20";
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

  const renderPlayerProgress = (
    player: { id: string; progress: number; username?: string },
    playerIndex: number
  ) => {
    if (!paragraph) return null;

    const colors = [
      "border-blue-500 bg-blue-500/10",
      "border-green-500 bg-green-500/10",
      "border-purple-500 bg-purple-500/10",
      "border-yellow-500 bg-yellow-500/10",
      "border-red-500 bg-red-500/10",
      "border-cyan-500 bg-cyan-500/10",
    ];

    const colorClass = colors[playerIndex % colors.length];

    return (
      <div
        key={player.id}
        className={`border-l-4 ${colorClass} p-4 rounded-lg mb-2`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white">
            {player.username || `Player ${player.id.substring(0, 8)}...`}
          </span>
          <span className="text-sm text-gray-400">
            {player.progress}/{paragraph.length} (
            {Math.round((player.progress / paragraph.length) * 100)}%)
          </span>
        </div>
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {paragraph.split("").map((char, index) => {
            let className = "text-gray-500";

            if (index < player.progress) {
              className = "text-gray-300";
            } else if (index === player.progress) {
              className = "text-white bg-white/20";
            }

            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const createRoom = () => {
    if (username.trim()) {
      const newRoomId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      setRoomId(newRoomId);
      setCurrentPlayer({ id: "", progress: 0, username: username.trim() });
    }
  };

  const joinRoom = () => {
    if (roomInput.trim() && username.trim()) {
      setRoomId(roomInput.trim().toUpperCase());
      setCurrentPlayer({ id: "", progress: 0, username: username.trim() });
    }
  };

  const startGame = () => {
    generateParagraph(50).then((generated) => {
      setParagraphForRoom(generated);
    });
    setGameStarted(true);
  };

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-keyflow-dark-blue">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Multiplayer Typerace
          </h1>
          <p className="text-keyflow-beige text-lg">
            Challenge friends in real-time typing races
          </p>
        </div>

        <div className="bg-keyflow-medium-blue/50 backdrop-blur-sm p-8 rounded-lg max-w-md w-full mx-4 border-2 border-keyflow-light-blue shadow-xl">
          <div className="mb-8">
            <label className="block text-keyflow-beige font-semibold mb-2 text-sm uppercase tracking-wide">
              Your Username <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-keyflow-light-blue/50 border-2 border-keyflow-beige/30 text-white placeholder:text-keyflow-beige/50 focus:ring-2 focus:ring-keyflow-beige focus:border-keyflow-beige h-12 text-lg"
            />
          </div>

          <div className="mb-6 p-4 bg-keyflow-dark-blue/30 rounded-lg border border-keyflow-beige/20">
            <h3 className="text-keyflow-beige font-semibold mb-3 text-sm uppercase tracking-wide">
              Start New Race
            </h3>
            <Button
              onClick={createRoom}
              disabled={!username.trim()}
              className="w-full bg-keyflow-light-blue hover:bg-keyflow-beige hover:text-keyflow-dark-blue disabled:bg-keyflow-dark-blue/50 disabled:text-keyflow-beige/40 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Create New Room
            </Button>
          </div>

          <div className="text-center text-keyflow-beige/60 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-keyflow-beige/30"></div>
            </div>
            <div className="relative bg-keyflow-medium-blue/50 px-4 font-semibold">
              OR
            </div>
          </div>

          <div className="p-4 bg-keyflow-dark-blue/30 rounded-lg border border-keyflow-beige/20">
            <h3 className="text-keyflow-beige font-semibold mb-3 text-sm uppercase tracking-wide">
              Join Existing Race
            </h3>
            <Input
              type="text"
              placeholder="Enter Room ID (e.g., ABC123)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              className="bg-keyflow-light-blue/50 border-2 border-keyflow-beige/30 text-white placeholder:text-keyflow-beige/50 focus:ring-2 focus:ring-keyflow-beige focus:border-keyflow-beige mb-3 h-12 text-lg font-mono"
              maxLength={6}
            />
            <Button
              onClick={joinRoom}
              disabled={!roomInput.trim() || !username.trim()}
              className="w-full bg-keyflow-light-blue hover:bg-keyflow-beige hover:text-keyflow-dark-blue disabled:bg-keyflow-dark-blue/50 disabled:text-keyflow-beige/40 text-white font-semibold py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Join Room
            </Button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-keyflow-beige hover:text-white underline text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (roomId && !gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-keyflow-dark-blue">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-keyflow-beige mb-4">
            Room: <span className="text-white">{roomId}</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p className="text-keyflow-beige/80">
              {isConnected ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg max-w-lg w-full mx-4 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Players in Room
            </h2>
            <div className="space-y-3">
              {players.length > 0 ? (
                players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                            ? "bg-green-500"
                            : index === 2
                            ? "bg-purple-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-white font-medium">
                        {player.username ||
                          `Player ${player.id?.substring(0, 8)}...`}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">Ready</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">⏳</div>
                  <div>Waiting for players to join...</div>
                  <div className="text-sm mt-2">
                    Share room ID:{" "}
                    <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                      {roomId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 font-semibold py-3 text-lg"
          >
            Start Game
          </Button>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-keyflow-beige hover:text-white underline text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-keyflow-dark-blue py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Room: <span className="text-purple-400">{roomId}</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p className="text-keyflow-beige/80">
              {isConnected ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-xl font-bold text-purple-400">{wpm}</div>
            <div className="text-xs text-gray-400">WPM</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-xl font-bold text-blue-400">
              {timeElapsed}s
            </div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Race Progress
          </h2>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-4">
            {players.length > 0 ? (
              <div className="space-y-3">
                {players.map((player, index) =>
                  renderPlayerProgress(player, index)
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">👥</div>
                <div>No other players yet</div>
                <div className="text-sm mt-2">
                  Share room ID:{" "}
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                    {roomId}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Type Here
          </h2>
          <div className="relative">
            <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-words p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              {renderText()}
            </div>
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 opacity-0 resize-none"
              style={{ caretColor: "transparent" }}
              disabled={isComplete}
            />
          </div>
        </div>

        {isComplete && (
          <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center max-w-md mx-auto">
            {finishPosition === 1 ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  WINNER!
                </h2>
                <p className="text-white text-lg mb-6">
                  You finished first! Congratulations!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">
                  {finishPosition === 2
                    ? "🥈"
                    : finishPosition === 3
                    ? "🥉"
                    : "🏁"}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Race Complete!
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  You finished in position #{finishPosition}
                </p>
              </>
            )}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-purple-400">{wpm}</div>
                <div className="text-gray-400 text-sm">WPM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {timeElapsed}s
                </div>
                <div className="text-gray-400 text-sm">Time</div>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Play Again
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
