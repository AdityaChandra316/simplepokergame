# Simple Poker Game

A real-time multiplayer poker game built with React, Vite, Express, and Socket.IO. Players can create a room, share a six-digit room code, join a lobby, mark themselves ready, and play a Texas Hold'em-style poker game directly in the browser.

## Features

- Create and join private poker rooms with six-digit room codes
- Real-time multiplayer state updates using Socket.IO
- Lobby with player connection and ready status
- Up to 10 players per game
- Starting stack of 10,000 chips per player
- Automatic blinds with blind schedules based on player count
- Fold, check, call, and raise-to actions
- 20-second turn timer with automatic fold/check behavior
- Community cards, hole cards, betting rounds, showdown handling, and pot distribution
- Side-pot support for all-in situations
- Player reconnection support using a locally stored player ID
- React UI with poker table, player positions, cards, chips, and action controls

## Tech Stack

### Client

- React
- Vite
- React Router
- Socket.IO Client
- ESLint

### Server

- Node.js
- Express
- Socket.IO
- CORS

## Project Structure

```text
simplepokergame-main/
├── client/
│   ├── public/              # Card images, chips, favicon, and font assets
│   ├── src/
│   │   ├── Create.jsx       # Create-game screen
│   │   ├── Join.jsx         # Join-game screen
│   │   ├── Game.jsx         # Socket connection and game/lobby routing
│   │   ├── Lobby.jsx        # Pre-game lobby
│   │   ├── Table.jsx        # Poker table UI
│   │   ├── Player.jsx       # Player card/chip/action display
│   │   ├── Controls.jsx     # Fold/check/call/raise controls
│   │   ├── Turn.jsx         # Turn timer display
│   │   └── CardToUrl.js     # Card ID to image URL helper
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── server.js            # Express and Socket.IO server
│   ├── PokerGame.js         # Core poker game state and rules
│   ├── Deck.js              # Deck generation and card drawing
│   ├── BestHandScore.js     # Poker hand scoring logic
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install Node.js and npm before running the project.

### 1. Install client dependencies

```bash
cd client
npm install
```

### 2. Build the client

```bash
npm run build
```

The server is configured to serve the production client build from `client/dist`.

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Start the server

```bash
node server.js
```

The app runs on:

```text
http://localhost:3000
```

## How to Play

1. Open the app in a browser.
2. Choose **Create a Game** and enter your name.
3. Share the generated six-digit room code with other players.
4. Other players choose **Join a Game**, enter their name and the room code, then submit.
5. Once everyone is in the lobby, each player clicks **Request Start**.
6. After all players are ready, the game starts automatically.
7. On your turn, choose one of the available actions: fold, check, call, or raise.
8. The game continues through betting rounds, showdowns, eliminations, and blind increases until one player has all remaining chips.

## Available Scripts

### Client

Run these from the `client` directory.

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the production client
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

### Server

Run this from the `server` directory.

```bash
node server.js
```

The server package currently does not define a `start` script. If desired, add this to `server/package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Then start the server with:

```bash
npm start
```

## Configuration Notes

The server currently uses these constants in `server/server.js`:

```js
const PORT = 3000;
const origin = "https://simplepokergame.com";
```

For local production-style testing, build the client and serve it from the Express server at `http://localhost:3000`.

For a custom deployment domain, update the `origin` value to match the deployed client origin. For a more flexible setup, consider reading the port and allowed origin from environment variables.

Example:

```js
const PORT = process.env.PORT || 3000;
const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
```

## Development Notes

The Vite dev server is available with `npm run dev`, but the current client makes relative API and Socket.IO requests such as `/api/create_game` and `/`. For a smooth Vite development setup, add a Vite proxy to forward API and Socket.IO traffic to the Express server, or update the client/server configuration to support a separate development origin.

## Game Logic Overview

The server owns the authoritative game state. Clients send player actions through Socket.IO events, and the server responds with public state updates tailored to each player.

Key server responsibilities include:

- Creating and deleting rooms
- Tracking connected players
- Starting games after all players are ready
- Dealing cards
- Managing blinds and turn order
- Validating fold/check/call/raise actions
- Handling turn timeouts
- Calculating side pots
- Evaluating hands at showdown
- Eliminating players and detecting the winner

## Current Limitations

- No automated tests are included yet.
- Game state is stored in memory, so active rooms are lost when the server restarts.
- The server uses fixed configuration values rather than environment variables.
- The server package has no `start` script by default.
- The app does not currently include authentication or persistent player accounts.

## Possible Improvements

- Add unit tests for `BestHandScore`, `Deck`, and `PokerGame`
- Add a root-level script or workspace setup to install/build/run both apps more easily
- Move configuration to environment variables
- Add deployment documentation
- Add a Vite development proxy
- Persist game history or player statistics
- Improve mobile responsiveness and accessibility

## License

This project currently uses the ISC license in the server package. Add a root-level `LICENSE` file if you want the full project license to be explicit.
