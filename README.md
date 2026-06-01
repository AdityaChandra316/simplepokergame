# Simple Poker Game

A real-time multiplayer Texas Hold'em-style poker game built with React, Express, and Socket.IO. Players can create a room, share the 6-digit room code, join from their own browser, ready up in a lobby, and play through timed betting rounds until one player wins the game.

## Features

- Create and join poker rooms with 6-digit room codes
- Real-time multiplayer state updates with Socket.IO
- Lobby with player connection status and ready/start requests
- Texas Hold'em-style gameplay with:
  - Hole cards and community cards
  - Small blind and big blind posting
  - Fold, check, call, and raise actions
  - Automatic turn timer with forced fold/check after 15 seconds
  - Side-pot calculation for all-in scenarios
  - Hand evaluation and showdown resolution
  - Player elimination and final game winner detection
- Progressive blind structure based on number of players and elapsed game time
- React table UI with card/chip assets

## Tech Stack

### Client

- React
- Vite
- React Router
- Socket.IO Client
- CSS modules/files for page and table styling

### Server

- Node.js
- Express
- Socket.IO
- CORS
- Native Node.js `crypto` module for room generation and deck shuffling

## Project Structure

```text
simplepokergame-main/
├── client/
│   ├── public/
│   │   ├── cards/              # Playing card image assets
│   │   ├── bet_chips.png
│   │   ├── pot_chips.png
│   │   └── poker.otf
│   ├── src/
│   │   ├── Create.jsx          # Create-game screen
│   │   ├── Join.jsx            # Join-game screen
│   │   ├── Game.jsx            # Socket connection and game/lobby routing
│   │   ├── Lobby.jsx           # Pre-game lobby
│   │   ├── Table.jsx           # Main poker table
│   │   ├── Player.jsx          # Player display around the table
│   │   ├── Controls.jsx        # Fold/check/call/raise controls
│   │   ├── Turn.jsx            # Turn countdown display
│   │   ├── CardToUrl.js        # Maps card IDs to card image URLs
│   │   └── *.css               # UI styling
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js               # Express app, room API, Socket.IO events
│   ├── PokerGame.js            # Core poker game engine/state machine
│   ├── Deck.js                 # Deck creation and shuffling
│   ├── BestHandScore.js        # Poker hand scoring logic
│   └── package.json
│
└── .gitignore
```

## Prerequisites

Install Node.js and npm before running the project.

## Installation

Install dependencies for both the client and server:

```bash
cd client
npm install

cd ../server
npm install
```

## Running the App Locally

The server is set up to serve the production build from `client/dist`, so the simplest local run is production-style.

From the project root:

```bash
cd client
npm run build

cd ../server
node server.js
```

Then open:

```text
http://localhost:3000
```

## Development Notes

The client currently calls backend routes and sockets using relative paths such as `/api/create_game` and `io("/")`. This works when the built React app is served by the Express server.

If you want to run Vite's development server separately with `npm run dev`, add a Vite proxy for the API and Socket.IO traffic, or update the client to point directly at the backend server.

Example Vite proxy configuration:

```js
// client/vite.config.js
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

With that proxy in place, you can run the client and server in separate terminals:

```bash
# Terminal 1
cd server
node server.js
```

```bash
# Terminal 2
cd client
npm run dev
```

## How to Play

1. Go to `/create` and enter your name to create a new game.
2. Share the generated 6-digit room code with other players.
3. Other players go to `/join`, enter their name and room code, and join the lobby.
4. Each player clicks **Request Start**.
5. Once all players are ready and there are at least 2 players, the game starts after a short countdown.
6. On your turn, choose one of the available actions:
   - **Fold**
   - **Check**
   - **Call**
   - **Raise To**
7. The game continues through betting rounds, showdowns, eliminations, and new hands until only one player remains.

## Gameplay Rules Implemented

- Players start with 3,000 chips.
- Rooms support up to 10 players.
- A game requires at least 2 players to start.
- Each player has 15 seconds to act.
- If a player owes chips and times out, they automatically fold.
- If a player can check and times out, they automatically check.
- Community cards are dealt across flop, turn, and river rounds.
- Showdowns evaluate the best 5-card hand from each player's hole cards and the community cards.
- Split pots and side pots are handled for all-in situations.
- Blinds increase over time according to the configured blind schedule.

## API and Socket Events

### HTTP API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/create_game` | Creates a new poker room and returns a 6-digit room code. |

### Client-to-Server Socket Events

| Event | Description |
| --- | --- |
| `request_start_game` | Marks the player as ready to start the game. |
| `fold` | Folds the current player's hand. |
| `check` | Checks when no call amount is owed. |
| `call` | Calls the current required amount. |
| `raise_to` | Raises the player's total round bet to the provided amount. |

### Server-to-Client Socket Events

| Event | Description |
| --- | --- |
| `state_update` | Sends the current public game state for the connected player. |
| `connect_player_failure` | Notifies the client that joining the room failed. |

## Important Configuration

The server listens on port `3000`:

```js
const PORT = 3000;
```

The server currently uses this CORS origin:

```js
const origin = "https://simplepokergame.com";
```

For local development with a separate frontend dev server, update the CORS origin or use a same-origin/proxy setup.

## Scripts

### Client

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the production client
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

### Server

The server package does not currently define a start script. Run it directly with:

```bash
node server.js
```

You can optionally add this to `server/package.json`:

```json
"scripts": {
  "start": "node server.js"
}
```

Then run:

```bash
npm start
```

## Future Improvements

- Add automated tests for hand scoring, side-pot distribution, and game-state transitions
- Add a server `start` script
- Move port and CORS origin into environment variables
- Add a local-development proxy to `vite.config.js`
- Improve validation and error messages when joining rooms
- Add persistent game storage or reconnection recovery beyond in-memory room state
- Add deployment instructions for the target hosting platform

## License

This project currently uses the `ISC` license in the server package metadata. Add a root-level `LICENSE` file if you want the license to apply clearly to the whole repository.
