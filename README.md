<div align="center">
  <h1>KeyStrike</h1>
  <p>A modern, real-time typing speed test application with multiplayer racing capabilities.<br/>Practice your typing skills solo or compete against friends in live races.</p>

  <a href="#getting-started"><img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript"></a>
  <br/>
  <a href="#socket-events"><img src="https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io" alt="Socket.io"></a>
  <a href="#features"><img src="https://img.shields.io/badge/Three.js-3D-000000?logo=three.js" alt="Three.js"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="License"></a>
</div>

## Features

### Solo Typing Test
- Real-time WPM (Words Per Minute) calculation
- Accuracy percentage tracking
- Dynamic text generation using Markov chains

### Multiplayer Racing
- Create or join rooms with unique 6-character codes
- Real-time progress synchronization across players
- Live WPM tracking during races
- Finish position indicators

### Interactive 3D Visuals
- Three.js powered 3D keyboard key animations
- Interactive orbit controls

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Shadcn UI |
| **3D Graphics** | Three.js |
| **Real-time** | Socket.io |
| **Backend** | Express.js 5 |
| **Tooling** | Bun, Turbopack, Biome |

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[React Components]
        Socket[Socket.io Client]
        Three[Three.js 3D Renderer]
    end

    subgraph Server["Server (Node.js/Bun)"]
        Express[Express.js]
        SocketServer[Socket.io Server]
        NextHandler[Next.js SSR Handler]
        RoomManager[Room Manager]
    end

    UI --> Socket
    UI --> Three
    Socket <-->|WebSocket| SocketServer
    Express --> NextHandler
    SocketServer --> RoomManager

    style Client fill:#234C6A,color:#fff
    style Server fill:#1B3C53,color:#fff
```

### Multiplayer Flow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant S as Server
    participant P2 as Player 2

    P1->>S: join_room (roomId, username)
    S->>P1: room_players (existing players)

    P2->>S: join_room (roomId, username)
    S->>P1: new_player (P2 info)
    S->>P2: room_players (existing players)

    P1->>S: paragraph_set (text)
    S->>P1: room_paragraph (text)
    S->>P2: room_paragraph (text)

    loop Typing Race
        P1->>S: send_keystroke (progress)
        S->>P2: receive_keystroke (P1 progress)
        P2->>S: send_keystroke (progress)
        S->>P1: receive_keystroke (P2 progress)
    end

    P1->>S: Race Complete
    Note over P1: Confetti if 1st place
```

### Component Architecture

```mermaid
graph LR
    subgraph Pages
        Home["/"]
        Type["/type"]
        Multi["/multiplayer"]
    end

    subgraph Components
        Keyboard[Keyboard.tsx<br/>3D Key]
        Header[Header.tsx]
        UI[UI Components]
    end

    subgraph Hooks
        UseSocket[useSocket.tsx]
    end

    subgraph Utilities
        Markov[markov.ts<br/>Text Generation]
        Utils[utils.ts]
    end

    Home --> Keyboard
    Type --> Markov
    Multi --> UseSocket
    Multi --> Markov
    UseSocket -->|Socket.io| Server[(Server)]

    style Pages fill:#456882,color:#fff
    style Components fill:#234C6A,color:#fff
    style Hooks fill:#1B3C53,color:#fff
```

### Room State Management

```mermaid
stateDiagram-v2
    [*] --> Lobby: User opens /multiplayer
    Lobby --> WaitingRoom: Creates/Joins room
    WaitingRoom --> Racing: Host starts game
    Racing --> Finished: User completes text
    Finished --> WaitingRoom: Play Again
    Finished --> Lobby: Leave Room
    WaitingRoom --> Lobby: Leave Room
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/keyflow.git
cd keyflow

# Install dependencies
bun install
```

### Development

```bash
# Start the development server (includes Socket.io server)
bun run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

### Production

```bash
# Build the application
bun run build

# Start production server
bun start
```

## Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_room` | Client → Server | `roomId` | Join a specific room |
| `player_joined` | Client → Server | `{ room, username }` | Announce player with username |
| `send_keystroke` | Client → Server | `{ room, message, sender, username }` | Broadcast typing progress |
| `receive_keystroke` | Server → Client | `{ message, sender, username }` | Receive others' progress |
| `new_player` | Server → Client | `{ id, username }` | New player joined notification |
| `room_players` | Server → Client | `Player[]` | List of current players |
| `player_left` | Server → Client | `playerId` | Player disconnection |
| `paragraph_set` | Client → Server | `{ room, paragraph }` | Set race text |
| `room_paragraph` | Server → Client | `paragraph` | Receive race text |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `CORS_ORIGIN` | `localhost:3000,localhost:4000` | Allowed CORS origins (comma-separated) |
| `NODE_ENV` | `development` | Environment mode |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with [Next.js](https://nextjs.org/) and [Socket.io](https://socket.io/)
