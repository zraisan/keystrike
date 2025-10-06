"use client";

import Header from "@/components/Header";
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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-keyflow-dark-blue">
      <div className="max-w-4xl w-full mx-auto px-4 text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-white via-keyflow-beige to-white bg-clip-text text-transparent">
            KeyFlow
          </h1>

          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex justify-center items-center">
            <div
              className="absolute opacity-40 blur-[0.5px]"
              style={{ transform: "translate(-400px, -220px) rotate(-20deg)" }}
            >
              <Keyboard letter="K" cameraPosition={7} size={2.8} />
            </div>
            <div
              className="absolute opacity-50 blur-[0.5px]"
              style={{ transform: "translate(480px, -180px) rotate(18deg)" }}
            >
              <Keyboard letter="E" cameraPosition={6} size={2.0} />
            </div>
            <div
              className="absolute opacity-35 blur-[0.5px]"
              style={{ transform: "translate(-280px, 320px) rotate(-12deg)" }}
            >
              <Keyboard letter="Y" cameraPosition={8} size={3.0} />
            </div>
            <div
              className="absolute opacity-45 blur-[0.5px]"
              style={{ transform: "translate(550px, 200px) rotate(15deg)" }}
            >
              <Keyboard letter="F" cameraPosition={5} size={2.2} />
            </div>
            <div
              className="absolute opacity-30 blur-[0.5px]"
              style={{ transform: "translate(-520px, 100px) rotate(25deg)" }}
            >
              <Keyboard letter="L" cameraPosition={6.5} size={1.8} />
            </div>
            <div
              className="absolute opacity-40 blur-[0.5px]"
              style={{ transform: "translate(380px, 380px) rotate(-18deg)" }}
            >
              <Keyboard letter="O" cameraPosition={7.5} size={2.5} />
            </div>
          </div>

          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Master your typing skills with our advanced typing test platform.
            Practice solo or compete with friends in real-time multiplayer
            races.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-keyflow-medium-blue/50 border-keyflow-light-blue hover:bg-keyflow-medium-blue/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Solo Practice
              </CardTitle>
              <CardDescription className="text-white/80">
                Improve your typing speed and accuracy with personalized tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Real-time WPM tracking</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Accuracy measurements</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Generated text content</span>
                </div>
                <Link href="/type">
                  <Button className="w-full bg-keyflow-light-blue hover:bg-keyflow-medium-blue text-white font-semibold py-3">
                    Start Typing Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-keyflow-medium-blue/50 border-keyflow-light-blue hover:bg-keyflow-medium-blue/70 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Multiplayer Race
              </CardTitle>
              <CardDescription className="text-white/80">
                Challenge friends and compete in real-time typing races
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Real-time competition</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Live progress tracking</span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>• Room-based matches</span>
                </div>
                <Link href="/multiplayer">
                  <Button className="w-full bg-keyflow-light-blue hover:bg-keyflow-medium-blue text-white font-semibold py-3">
                    Join Multiplayer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-keyflow-medium-blue/30 rounded-lg p-8 border border-keyflow-light-blue">
          <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 text-white/80">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm">
                See your progress update instantly as you type
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Accuracy Tracking</h3>
              <p className="text-sm">
                Monitor your typing accuracy in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">Multiplayer Support</h3>
              <p className="text-sm">
                Compete with friends in synchronized typing tests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
