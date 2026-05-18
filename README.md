# Simple Poker Game

A real-time multiplayer Texas Hold'em poker game built with React, Vite, Express, and Socket.IO. Players can create a room, share a six-digit room code, join a lobby, ready up, and play poker together in the browser.

## Features

- Create and join poker rooms with six-digit room codes
- Real-time gameplay powered by Socket.IO
- Lobby with player connection and ready status
- Texas Hold'em flow: pre-flop, flop, turn, river, and showdown
- Player actions: fold, check, call, and raise
- Automatic turn timer with forced fold/check after 20 seconds
- Side-pot handling for all-in situations
- Hand evaluation for standard poker rankings
- Tournament-style chip system with player elimination
- Increasing blinds over time
- Reconnect support using a saved local player ID

## Tech Stack

### Client

- React
- Vite
- React Router
- Socket.IO Client

### Server

- Node.js
- Express
- Socket.IO
- CORS

## Project Structure

```text
simplepokergame-main/
├── client/                 # React/Vite frontend
│   ├── public/             # Card images, chip images, favicon, font
│   └── src/
│       ├── Create.jsx      # Create-game screen
│       ├── Join.jsx        # Join-game screen
│       ├── Game.jsx        # Socket connection and game routing
│       ├── Lobby.jsx       # Pre-game lobby
│       ├── Table.jsx       # Poker table UI
│       ├── Player.jsx      # Player display and status
│       ├── Controls.jsx    # Fold/check/call/raise controls
│       └── Turn.jsx        # Turn timer display
└── server/                 # Express + Socket.IO backend
    ├── server.js           # API, socket events, static client hosting
    ├── PokerGame.js        # Main poker game engine
    ├── Deck.js             # Deck shuffling and card drawing
    └── BestHandScore.js    # Poker hand scoring
```

## Prerequisites

Install the following before running the project:

- Node.js
- npm

## Installation

Clone the repository, then install dependencies for both the client and server.

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## Running Locally

This project is currently set up so the Express server serves the production build of the React client. The easiest way to run it locally is to build the client first, then start the server.

```bash
# From the client folder
npm run build

# From the server folder
cd ../server
node server.js
```

Then open:

```text
http://localhost:3000
```

The app will redirect to the join screen. To start a new game, go to:

```text
http://localhost:3000/create
```

## Development Notes

The client uses relative API and Socket.IO paths:

```js
fetch("/api/create_game")
io("/")
```

Because of that, the current setup works best when the built client is served by the Express server on port `3000`.

If you want to run the Vite dev server separately with `npm run dev`, you will need to add a Vite proxy or update the client/server configuration so API and Socket.IO requests are routed to the backend.

## Gameplay Overview

1. A player creates a game and receives a six-digit room code.
2. Other players join using the room code and their name.
3. Every player in the lobby clicks **Request Start**.
4. Once all players are ready, the game starts after a short delay.
5. Players take turns folding, checking, calling, or raising.
6. The server manages betting rounds, pots, side pots, showdowns, chip counts, and eliminations.
7. The game ends when only one player has chips remaining.

## Game Rules and Defaults

- Starting chips: `1500`
- Maximum players per room: `10`
- Initial big blind: `20`
- Blind increase interval: `5 minutes`
- Turn timeout: `20 seconds`
- Empty games are deleted after `10 minutes`

Blind levels are defined in `server/PokerGame.js`:

```js
const BIG_BLINDS = [20, 30, 50, 100, 150, 200, 300, 400, 600, 1000, 1500, 2000];
```

## API and Socket Events

### HTTP API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/create_game` | Creates a new poker room and returns a room code |

### Socket.IO Events

Client-to-server events:

| Event | Description |
| --- | --- |
| `request_start_game` | Marks the player as ready in the lobby |
| `fold` | Folds the current hand |
| `check` | Checks when no chips are owed |
| `call` | Calls the current bet |
| `raise_to` | Raises to a specified total bet amount |

Server-to-client events:

| Event | Description |
| --- | --- |
| `state_update` | Sends the latest public game state to a player |
| `connect_player_failure` | Notifies the client that joining failed |

## Configuration

The server listens on port `3000`:

```js
const PORT = 3000;
```

The allowed production origin is currently set in `server/server.js`:

```js
const origin = "https://simplepokergame.com";
```

Update this value if deploying to a different domain or if enabling a separate local development frontend.

## Available Client Scripts

From the `client` directory:

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the production client
npm run lint     # Run ESLint
npm run preview  # Preview the production build with Vite
```

## Server Scripts

The server currently does not define a production start script. Start it directly with:

```bash
node server.js
```

You may optionally add this to `server/package.json`:

```json
"scripts": {
  "start": "node server.js"
}
```

Then run:

```bash
npm start
```

## Testing

No automated tests are currently configured. The server package includes the default placeholder test script.

## Deployment

A typical deployment flow is:

1. Install dependencies in both `client` and `server`.
2. Build the client with `npm run build` from the `client` directory.
3. Start the server from the `server` directory.
4. Make sure your hosting environment exposes port `3000`, or update the server to use `process.env.PORT`.
5. Update the Socket.IO/CORS origin in `server/server.js` to match your production domain.

## Possible Improvements

- Add a server `start` script
- Use `process.env.PORT` and environment-based CORS settings
- Add a Vite dev proxy for smoother local development
- Add automated tests for hand scoring, side pots, and betting rules
- Add server logs for startup and room lifecycle events
- Add clearer user feedback for failed joins or disconnected players

## License

This project currently uses the `ISC` license in the server package metadata.
