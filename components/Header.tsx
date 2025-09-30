import { Button } from "./ui/button";

export default function Header({ onJoinGame }: { onJoinGame: () => void }) {
  return (
    <div className="absolute top-0 w-full p-4 bg-gray-800 text-white flex justify-center">
      <Button variant="default" onClick={onJoinGame}>
        Join Game
      </Button>
    </div>
  );
}
