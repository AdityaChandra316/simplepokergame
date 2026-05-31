# Simple Poker Game

A real-time multiplayer poker game built with React, Vite, Express, and Socket.IO. Players can create a room, share the room code, join a lobby, ready up, and play a browser-based Texas Hold'em-style poker game with live table updates.

## Features

- Create a new game room with a generated 6-digit room code
- Join an existing room by entering a name and room code
- Real-time multiplayer updates using Socket.IO
- Lobby with player connection status and ready/start requests
- 2–10 player games
- Starting chip stack of `$10,000` per player
- Poker actions: fold, check, call, and raise to a chosen amount
- Community cards, hole cards, betting rounds, pots, side pots, and showdown handling
- Automatic turn timer that folds or checks after 20 seconds
- Increasing blind levels based on game size
- Reconnection support using `localStorage` player IDs
- Custom card, chip, and poker font assets

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
- Node `crypto`
- Node `EventEmitter`

## Project Structure

```text
simplepokergame-main/
├── client/
│   ├── public/
│   │   ├── cards/              # Card image assets
│   │   ├── bet_chips.png
│   │   ├── pot_chips.png
│   │   └── poker.otf
│   ├── src/
│   │   ├── CardToUrl.js        # Converts card IDs to image paths
│   │   ├── Controls.jsx        # Fold/check/call/raise controls
│   │   ├── Create.jsx          # Create game page
│   │   ├── Game.jsx            # Socket connection and game routing
│   │   ├── Join.jsx            # Join game page
│   │   ├── Lobby.jsx           # Pre-game lobby
│   │   ├── Player.jsx          # Player display around the table
│   │   ├── Table.jsx           # Main poker table UI
│   │   ├── Turn.jsx            # Turn timer display
│   │   └── main.jsx            # React entry point and routes
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── BestHandScore.js        # Poker hand scoring
│   ├── Deck.js                 # Deck creation and shuffling
│   ├── PokerGame.js            # Main poker game state machine
│   ├── server.js               # Express and Socket.IO server
│   └── package.json
│
└── .gitignore
```

## Prerequisites

Install Node.js and npm before running the project.

## Installation

Install the client dependencies:

```bash
cd client
npm install
```

Install the server dependencies:

```bash
cd ../server
npm install
```

## Running Locally

The server is currently set up to serve the built React app from `client/dist`, so the simplest local workflow is to build the client first and then start the server.

From the `client` directory:

```bash
npm run build
```

Then start the server from the `server` directory:

```bash
node server.js
```

Open the app in your browser:

```text
http://localhost:3000
```

## Client Scripts

From the `client` directory:

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the client for production
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Server Scripts

The server does not currently define a `start` script. Run it directly with:

```bash
node server.js
```

You can optionally add this script to `server/package.json`:

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

## Development Notes

The client uses relative paths for API and Socket.IO requests:

- `POST /api/create_game`
- `io("/")`

Because of this, the production-style setup works well: build the client, run the server, and access the app through the Express server on port `3000`.

If you want to use the Vite dev server, you may need to add a Vite proxy for `/api` and `/socket.io`, and update the server CORS origin. The server currently uses this hardcoded origin:

```js
const origin = "https://simplepokergame.com";
```

For local Vite development, change it to your dev origin, such as:

```js
const origin = "http://localhost:5173";
```

Or configure it from an environment variable before deploying.

## How to Play

1. Open the app.
2. Choose **Create a Game** to generate a room code.
3. Share the 6-digit room code with other players.
4. Other players choose **Join a Game**, enter their name and the room code, and submit.
5. In the lobby, each player clicks **Request Start**.
6. Once every player has requested to start, the game begins after a short delay.
7. On your turn, choose one of the available actions:
   - **Fold**
   - **Check**
   - **Call**
   - **Raise To**
8. The game continues through betting rounds, showdowns, eliminations, and increasing blinds until one player remains.

## Game Rules and Behavior

- Each player starts with `$10,000` in chips.
- A game requires at least 2 players.
- A room can contain up to 10 players before the game starts.
- Players cannot join after a game has started.
- If a player disconnects, their seat remains in the game.
- If all players disconnect from a room, the game is deleted after 10 minutes.
- Players have 20 seconds to act on their turn.
- If a player owes chips and times out, they automatically fold.
- If a player can check and times out, they automatically check.
- Hole cards are private unless it is showdown.
- The server calculates winning hands and distributes pots, including split pots and side pots.

## Deployment Notes

Before deploying, build the client:

```bash
cd client
npm run build
```

Then run the server from the `server` directory:

```bash
node server.js
```

The server serves static files from:

```text
client/dist
```

The server currently listens on port `3000`:

```js
const PORT = 3000;
```

For production deployments, consider moving the port and CORS origin into environment variables:

```js
const PORT = process.env.PORT || 3000;
const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
```

## Troubleshooting

### The app loads, but creating or joining a game does not work

Make sure the Express/Socket.IO server is running and that the client was built before starting the server.

### The app redirects back to the join page

This can happen if the room does not exist, the game has already started, the room is full, or the player name is missing.

### I see CORS or Socket.IO connection errors during development

Update the server CORS origin or add a Vite proxy so browser requests reach the backend correctly.

### Card or chip images are missing

Make sure the client was built from the `client` directory and that the files in `client/public` are included in the build output.

## Possible Improvements

- Add a server `start` script
- Move `PORT` and CORS origin into environment variables
- Add a Vite dev proxy for easier local development
- Add automated tests for hand scoring and game state transitions
- Add a README screenshot or demo GIF
- Add spectator mode
- Add persistent game storage
- Add better mobile table layout
- Add a deployment guide for your hosting provider

## License

No project-level license file is currently included. Add a license before publishing or distributing the project.
