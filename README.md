# Simple Poker Game

A real-time multiplayer Texas Hold'em poker game built with React, Vite, Express, and Socket.IO. Players can create a room, share the six-digit room code, join from different browsers/devices, and play a tournament-style poker game with live table updates.

## Features

- Create and join poker rooms with six-digit room codes
- Real-time multiplayer gameplay using Socket.IO
- Lobby screen with player connection and ready status
- Texas Hold'em flow: pre-flop, flop, turn, river, and showdown
- Player actions: fold, check, call, and raise
- Automatic turn timer with forced fold/check after 20 seconds
- Community cards, hole cards, chip counts, pot, and player action display
- Side-pot handling for all-in situations
- Hand evaluation for high card through straight flush
- Tournament-style elimination and final winner detection
- Automatic cleanup for inactive rooms

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
- Node `crypto` module for room codes and deck shuffling

## Project Structure

```text
simplepokergame-main/
├── client/
│   ├── public/
│   │   ├── cards/              # Playing card images
│   │   ├── bet_chips.png
│   │   ├── pot_chips.png
│   │   └── poker.otf
│   ├── src/
│   │   ├── Controls.jsx        # Fold/check/call/raise controls
│   │   ├── Create.jsx          # Create-room page
│   │   ├── Game.jsx            # Socket connection and game state routing
│   │   ├── Join.jsx            # Join-room page
│   │   ├── Lobby.jsx           # Pre-game lobby
│   │   ├── Player.jsx          # Player seat display
│   │   ├── Table.jsx           # Poker table UI
│   │   ├── Turn.jsx            # Turn countdown display
│   │   ├── CardToUrl.js        # Card ID to image URL helper
│   │   └── main.jsx            # React app entry point
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── BestHandScore.js        # Poker hand scoring logic
│   ├── Deck.js                 # Deck creation and shuffling
│   ├── PokerGame.js            # Core poker game state machine
│   ├── server.js               # Express and Socket.IO server
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install Node.js and npm. A recent LTS version of Node.js is recommended.

### 1. Install dependencies

From the project root, install dependencies for both the client and server:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the allowed origin

The server currently uses a hardcoded production origin in `server/server.js`:

```js
const origin = "https://simplepokergame.com";
```

For local development, change it to the origin you are using. For example, if you serve the production build through the Express server locally:

```js
const origin = "http://localhost:3000";
```

For a more flexible setup, you can replace the hardcoded value with an environment variable:

```js
const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
```

## Running the App

### Option A: Run the production build locally

This is the simplest way to run the project because the Express server is already configured to serve the built React app from `client/dist`.

Build the client:

```bash
cd client
npm run build
```

Start the server:

```bash
cd ../server
node server.js
```

Open the app in your browser:

```text
http://localhost:3000
```

### Option B: Development mode

The client can be started with Vite:

```bash
cd client
npm run dev
```

The backend can be started separately:

```bash
cd server
node server.js
```

By default, the client uses relative API and Socket.IO paths such as `/api/create_game` and `/`, so when running Vite on a separate port you may need to add a Vite proxy or update the client/server configuration so requests reach the backend.

Example Vite proxy setup in `client/vite.config.js`:

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

## Gameplay Overview

1. A player creates a game from `/create`.
2. The server generates a unique six-digit room code.
3. Other players join from `/join` using the room code.
4. Players mark themselves ready by selecting **Request Start** in the lobby.
5. Once every player is ready and there are at least two players, the game starts after a short delay.
6. Players take turns folding, checking, calling, or raising.
7. The game automatically advances through betting rounds and deals community cards.
8. At showdown, the server evaluates hands, distributes pots, and eliminates players with no chips.
9. The last remaining player is declared the game winner.

## API Endpoints

### `POST /api/create_game`

Creates a new poker room.

Response:

```json
{
  "room": "123456"
}
```

## Socket.IO Events

### Client to server

| Event | Payload | Description |
| --- | --- | --- |
| `request_start_game` | None | Marks the current player as ready in the lobby |
| `fold` | None | Folds the current player's hand |
| `check` | None | Checks when no call amount is owed |
| `call` | None | Calls the current bet |
| `raise_to` | `number` | Raises the player's bet to the provided chip amount |

### Server to client

| Event | Payload | Description |
| --- | --- | --- |
| `state_update` | Public game state object | Sends the latest game state to a specific player |
| `connect_player_failure` | None | Sent when a player cannot join the requested room |

## Game Rules and Server Logic

The main game logic lives in `server/PokerGame.js`.

Important behavior includes:

- Each player starts with 3,000 chips.
- Rooms support up to 10 players.
- Big blinds scale over time based on the number of players.
- Players have 20 seconds to act on each turn.
- If a player times out while owing chips, they fold automatically.
- If a player times out while not owing chips, they check automatically.
- The server only sends a player's own hole cards unless showdown is active.
- Inactive poker games are deleted after 10 minutes without connected players.

## Scripts

### Client

```bash
npm run dev      # Start Vite development server
npm run build    # Build production client into dist/
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

### Server

The server package currently does not define a start script. Start it directly with:

```bash
node server.js
```

You can optionally add this to `server/package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Then run:

```bash
npm start
```

## Deployment Notes

1. Build the client with `npm run build` inside `client/`.
2. Ensure `client/dist` exists before starting the server.
3. Start `server/server.js` with Node.js.
4. Update the allowed origin in `server/server.js` to match your deployed domain.
5. Make sure your hosting provider supports WebSocket connections for Socket.IO.

## Possible Improvements

- Move configuration such as `PORT` and `CLIENT_ORIGIN` into environment variables
- Add a server `start` script
- Add automated tests for hand scoring and betting logic
- Add Vite proxy configuration for local development
- Add persistent game history or replay support
- Add better error messages for invalid rooms and disconnected players
- Add mobile layout polish for small screens

## License

This project currently uses the ISC license in the server package metadata. Add a root-level `LICENSE` file if you want to publish or distribute the project formally.
