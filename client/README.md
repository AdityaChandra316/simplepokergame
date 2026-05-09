<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# Poker

A real-time multiplayer poker web app built with React, Vite, Express, and Socket.IO. Players can create or join private 6-digit rooms, ready up in a lobby, and play a Texas Hold'em-style game with shared community cards, turn timers, betting controls, side-pot handling, and automatic showdown scoring.

## Features

- Create private poker rooms with 6-digit room codes
- Join games by room code and player name
- Real-time gameplay powered by Socket.IO
- Lobby with player connection and ready status
- 2-10 player support
- Texas Hold'em-style flow:
  - hole cards
  - flop, turn, and river
  - fold, check, call, and raise-to actions
  - showdown hand scoring
- Tournament-style chip system
  - 1,500 starting chips
  - increasing blinds over time
  - player elimination
  - winner detection
- Side-pot calculation for all-in situations
- 20-second automatic turn action
  - folds when a call is required
  - checks when no call is required
- Reconnect support using browser storage
- Production build served by the Express server

## Tech Stack

### Client

- React
- Vite
- React Router
- Socket.IO Client
- CSS

### Server

- Node.js
- Express
- Socket.IO
- CORS

## Project Structure

```text
.
├── client/
│   ├── public/
│   │   ├── cards/
│   │   ├── bet_chips.png
│   │   ├── pot_chips.png
│   │   └── poker.otf
│   ├── src/
│   │   ├── CardToUrl.js
│   │   ├── Controls.jsx
│   │   ├── Create.jsx
│   │   ├── Game.jsx
│   │   ├── Join.jsx
│   │   ├── Lobby.jsx
│   │   ├── Player.jsx
│   │   ├── Table.jsx
│   │   ├── Turn.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── BestHandScore.js
    ├── Deck.js
    ├── PokerGame.js
    ├── server.js
    └── package.json
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js
- npm

## Installation

Install dependencies for both the client and server.

```bash
cd client
npm install

cd ../server
npm install
```

## Running the App

The server is configured to serve the built React app from `client/dist`, so the simplest way to run the full app is to build the client first and then start the server.

### 1. Build the client

```bash
cd client
npm run build
```

### 2. Start the server

```bash
cd ../server
node server.js
```

### 3. Open the app

Visit:

```text
http://localhost:3000
```

## How to Play

1. Open the app in a browser.
2. Choose **Create a Game** and enter your name.
3. Share the generated 6-digit room code with other players.
4. Other players choose **Join a Game**, enter their name, and enter the room code.
5. Each player clicks **Request Start** in the lobby.
6. Once all players are ready, the game begins after a short countdown.
7. On your turn, choose one of the available actions:
   - Fold
   - Check
   - Call
   - Raise To
8. The game continues through betting rounds until a hand winner is decided by folds or showdown.
9. Players with no chips are eliminated.
10. The final remaining player wins the game.

## Game Rules Implemented

- Each player starts with 1,500 chips.
- Games require at least 2 players.
- Rooms allow up to 10 players.
- Players receive 2 hole cards.
- Up to 5 community cards are dealt across flop, turn, and river.
- The server determines the best 5-card poker hand at showdown.
- Pots are distributed to eligible winners.
- Split pots are supported.
- Side pots are supported for all-in situations.
- Blinds increase over time using this big blind schedule:

```text
20, 30, 50, 100, 150, 200, 300, 400, 600, 1000
```

## Socket Events

The client communicates with the server using Socket.IO.

### Client to Server

| Event | Description |
| --- | --- |
| `request_start_game` | Marks the player as ready to start |
| `fold` | Folds the current hand |
| `check` | Checks when no chips are owed |
| `call` | Calls the current bet |
| `raise_to` | Raises to a specific total bet amount |

### Server to Client

| Event | Description |
| --- | --- |
| `state_update` | Sends the latest public game state to a player |
| `connect_player_failure` | Notifies the client that joining the room failed |

## API Endpoints

### `POST /api/create_game`

Creates a new poker room.

#### Response

```json
{
  "room": "123456"
}
```

## Development Notes

The current server is configured to run on port `3000` and serve the production client build from `client/dist`.

For local development with the Vite dev server, you may need to add a proxy in `client/vite.config.js` or adjust the Socket.IO/CORS origin settings so that the Vite client and Express server can communicate across ports.

Example Vite proxy setup:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
```

Then you can run the client and server separately:

```bash
# Terminal 1
cd server
node server.js

# Terminal 2
cd client
npm run dev
```

## Useful Scripts

### Client

```bash
npm run dev      # start Vite development server
npm run build    # build production client
npm run preview  # preview production build
npm run lint     # run ESLint
```

### Server

```bash
node server.js   # start Express and Socket.IO server
```

## Key Files

- `client/src/main.jsx` - client routing setup
- `client/src/Create.jsx` - create game screen
- `client/src/Join.jsx` - join game screen
- `client/src/Game.jsx` - Socket.IO connection and game/lobby routing
- `client/src/Lobby.jsx` - pre-game lobby UI
- `client/src/Table.jsx` - poker table UI
- `client/src/Controls.jsx` - player betting controls
- `server/server.js` - Express server, API routes, and Socket.IO event wiring
- `server/PokerGame.js` - core game state and poker flow logic
- `server/Deck.js` - deck creation and shuffling
- `server/BestHandScore.js` - poker hand scoring

## Future Improvements

- Add automated tests for hand scoring and side-pot logic
- Add a server `start` script in `server/package.json`
- Add configurable port and CORS settings through environment variables
- Add a Vite development proxy by default
- Improve mobile responsiveness for small screens
- Add player avatars or table seat selection
- Add persistent game storage
- Add a game history or hand recap view

## License

This project does not currently include a root license file. The server package is configured with the ISC license in `server/package.json`.
>>>>>>> origin/poker
