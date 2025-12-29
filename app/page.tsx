"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Keyboard from "@/components/Keyboard";

export default function HomePage() {
  const keyWord = ["K", "E", "Y"];
  const strikeWord = ["S", "T", "R", "I", "K", "E"];
  const fullWord = [...keyWord, ...strikeWord];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-keystrike-dark-blue">
      <div className="max-w-6xl w-full mx-auto px-4 text-center">
        <div className="mb-8 md:mb-12">
          <div className="md:hidden flex flex-col items-center -space-y-10">
            <div className="flex justify-center items-center">
              {keyWord.map((letter, index) => (
                <Keyboard
                  key={index}
                  letter={letter}
                  cameraPosition={5}
                  size={1.4}
                  animate={false}
                  interactive={true}
                />
              ))}
            </div>
            <div className="flex justify-center items-center">
              {strikeWord.map((letter, index) => (
                <Keyboard
                  key={index}
                  letter={letter}
                  cameraPosition={5}
                  size={1.4}
                  animate={false}
                  interactive={true}
                  containerWidth={60}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex justify-center items-center m-4">
              {fullWord.map((letter, index) => (
                <Keyboard
                  key={index}
                  letter={letter}
                  cameraPosition={5}
                  size={1.8}
                  animate={false}
                  interactive={true}
                />
              ))}
            </div>
          </div>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto px-4">
            Get faster at typing. Practice alone or race your friends.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-keystrike-medium-blue/50 border-keystrike-light-blue hover:bg-keystrike-medium-blue/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Solo Practice
              </CardTitle>
              <CardDescription className="text-white/80">
                Practice at your own pace and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Live WPM counter</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Accuracy tracking</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Random text prompts</span>
                </div>
                <Link href="/type">
                  <Button className="w-full bg-keystrike-light-blue hover:bg-keystrike-medium-blue text-white font-semibold py-3 hover:cursor-pointer">
                    Start Typing Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-keystrike-medium-blue/50 border-keystrike-light-blue hover:bg-keystrike-medium-blue/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Multiplayer Race
              </CardTitle>
              <CardDescription className="text-white/80">
                Race against friends and see who types faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Race in real-time</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• See everyone's progress</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Create or join rooms</span>
                </div>
                <Link href="/multiplayer">
                  <Button className="w-full bg-keystrike-light-blue hover:bg-keystrike-medium-blue text-white font-semibold py-3 hover:cursor-pointer">
                    Join Multiplayer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-keystrike-medium-blue/30 rounded-lg p-8 border border-keystrike-light-blue">
          <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-white/80">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Instant Feedback</h3>
              <p className="text-sm">Watch your stats update as you type</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Accuracy Tracking</h3>
              <p className="text-sm">See how accurate you are while typing</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">Multiplayer</h3>
              <p className="text-sm">Compete with friends on the same text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
