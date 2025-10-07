"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hook/useSocket";
import generateParagraph from "@/lib/markov";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function TypingTest() {
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
  const [isComplete, setIsComplete] = useState(false);

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
    if (startType && !isComplete) {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => {
          return (prev += 1);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startType, isComplete]);

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
      setAccuracy(newAccuracy > 0 ? newAccuracy : 0);
    }
  }, [userInput, paragraph]);

  useEffect(() => {
    if (timeElapsed > 0) {
      if (accuracy < 30) {
        setWpm(-1);
        return;
      }
      const wordsTyped = userInput.split(" ").length;
      const minutes = timeElapsed / 60;
      setWpm(Math.round(wordsTyped / minutes));
    }
  }, [userInput, timeElapsed, accuracy]);

  useEffect(() => {
    if (
      userInput.length === paragraph.length &&
      paragraph.length > 0 &&
      userInput === paragraph
    ) {
      setIsComplete(true);
    }
  }, [userInput, paragraph]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length > paragraph.length) return;

    let wrongCharsCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== paragraph[i]) {
        wrongCharsCount++;
      }
    }

    if (wrongCharsCount > 10) return;

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

  const resetTest = () => {
    setUserInput("");
    setCurrentIndex(0);
    setIncorrectChars(0);
    setAccuracy(100);
    setTimeElapsed(0);
    setStartType(false);
    setIsComplete(false);
    setWpm(0);
    generateParagraph(50).then((generated) => {
      setParagraph(generated);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-keyflow-dark-blue">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-keyflow-beige mb-2">
          Solo Typing Test
        </h1>
        <p className="text-keyflow-beige mb-4">
          Test your typing speed and accuracy
        </p>
        <Button
          onClick={resetTest}
          className="bg-keyflow-light-blue hover:bg-keyflow-medium-blue text-keyflow-beige"
        >
          Restart Test
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="bg-keyflow-medium-blue/50 rounded-lg p-4 text-center border border-keyflow-light-blue">
          <div className="text-2xl font-bold text-keyflow-beige">{wpm}</div>
          <div className="text-sm text-keyflow-beige">WPM</div>
        </div>
        <div className="bg-keyflow-medium-blue/50 rounded-lg p-4 text-center border border-keyflow-light-blue">
          <div className="text-2xl font-bold text-keyflow-beige">
            {accuracy}%
          </div>
          <div className="text-sm text-keyflow-beige">Accuracy</div>
        </div>
        <div className="bg-keyflow-medium-blue/50 rounded-lg p-4 text-center border border-keyflow-light-blue">
          <div className="text-2xl font-bold text-keyflow-beige">
            {timeElapsed}s
          </div>
          <div className="text-sm text-keyflow-beige">Time</div>
        </div>
      </div>

      <div className="relative max-w-4xl w-full mx-auto px-4">
        <div className="font-mono text-2xl leading-relaxed whitespace-pre-wrap break-words p-6 bg-keyflow-medium-blue/50 rounded-lg border border-keyflow-light-blue mb-4">
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

      {isComplete && (
        <div className="mt-8 bg-keyflow-medium-blue/50 rounded-lg p-6 border border-keyflow-light-blue text-center">
          <h2 className="text-2xl font-bold text-keyflow-beige mb-4">
            Test Complete!
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-3xl font-bold text-keyflow-beige">{wpm}</div>
              <div className="text-keyflow-beige/60">Words per minute</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-keyflow-beige">
                {accuracy}%
              </div>
              <div className="text-keyflow-beige/60">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-keyflow-beige">
                {timeElapsed}s
              </div>
              <div className="text-keyflow-beige/60">Total time</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={resetTest}
              className="bg-keyflow-light-blue hover:bg-keyflow-medium-blue text-keyflow-beige"
            >
              Try Again
            </Button>
            <Link href="/multiplayer">
              <Button className="bg-keyflow-light-blue hover:bg-keyflow-medium-blue text-keyflow-beige">
                Try Multiplayer
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-keyflow-beige hover:text-white underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
