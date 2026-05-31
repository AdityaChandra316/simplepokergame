# Simple Poker Game

A real-time multiplayer Texas Hold'em-style poker game built with React, Vite, Express, and Socket.IO. Players can create a room, share a six-digit room code, join from another browser or device, ready up in the lobby, and play through hands until one player has all the chips.

## Features

- Create and join poker rooms with six-digit room codes
- Real-time multiplayer state updates with Socket.IO
- Lobby with connected/disconnected player status and ready/start tracking
- Supports 2 to 10 players per game
- Starting chip stack of `$10,000` per player
- Automatic blinds based on player count, with blinds increasing over time
- Poker actions: fold, check, call, and raise to a specific amount
- 20-second turn timer with automatic fold/check behavior
- Community cards, pot tracking, side-pot handling, showdowns, and split pots
- Hand scoring for standard poker hands
- Player elimination and game-winner detection
- Reconnection support through `localStorage` player IDs
- Production server serves the built React app from `client/dist`

## Tech Stack

### Client

- React 19
- Vite
- React Router
- Socket.IO Client
- CSS modules/files for custom table, lobby, and join/create screens

### Server

- Node.js
- Express
- Socket.IO
- CORS
- Node `crypto` module for room IDs and deck shuffling

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
│   │   ├── CardToUrl.js        # Maps card IDs to image paths
│   │   ├── Controls.jsx        # Fold/check/call/raise controls
│   │   ├── Create.jsx          # Create-game screen
│   │   ├── Game.jsx            # Socket connection and game routing
│   │   ├── Join.jsx            # Join-game screen
│   │   ├── Lobby.jsx           # Waiting room UI
│   │   ├── Player.jsx          # Player display around table
│   │   ├── Table.jsx           # Main poker table UI
│   │   ├── Turn.jsx            # Turn timer display
│   │   └── main.jsx            # React app routes
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── BestHandScore.js        # Poker hand evaluator
│   ├── Deck.js                 # Shuffled deck implementation
│   ├── PokerGame.js            # Core game engine and rules
│   ├── server.js               # Express and Socket.IO server
│   └── package.json
└── README.md
```

## Prerequisites

Install Node.js before running the project.

The client uses Vite 8, which requires one of the following Node versions:

- Node `^20.19.0`
- Node `>=22.12.0`

You will also need npm, which is included with Node.js.

## Getting Started

Clone the repository and install dependencies for both the client and server.

```bash
git clone <your-repository-url>
cd simplepokergame-main
```

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

The current server is designed to serve the built React app from `client/dist`. Build the client first:

```bash
cd client
npm run build
```

Then start the server:

```bash
cd ../server
node server.js
```

Open the app in your browser:

```text
http://localhost:3000
```

The app will redirect to `/join`. To start a game, go to `/create`, enter a name, create a room, and share the generated six-digit room code with other players.

## Local Development Notes

The server currently uses a hardcoded production origin:

```js
const origin = "https://simplepokergame.com";
```

For local development, you may want to change this to your local frontend/server origin, such as:

```js
const origin = "http://localhost:3000";
```

If you want to run the Vite dev server with `npm run dev`, the current project does not include a Vite proxy for `/api` or `/socket.io`. The simplest workflow is the production-like flow above: build the client and serve it from the Express server.

## Available Scripts

### Client

Run from the `client/` directory.

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the production frontend into `client/dist`.

```bash
npm run preview
```

Previews the production frontend build through Vite.

```bash
npm run lint
```

Runs ESLint on the client source.

### Server

Run from the `server/` directory.

```bash
node server.js
```

Starts the Express and Socket.IO server on port `3000`.

> Note: `server/package.json` does not currently define a `start` script. You can add one if desired:
>
> ```json
> "scripts": {
>   "start": "node server.js"
> }
> ```

## How the Game Works

1. A player creates a room from the create screen.
2. The server generates a unique six-digit room code.
3. Other players join using the room code and a display name.
4. All players must request the game to start from the lobby.
5. Once everyone is ready, the game starts after a short countdown.
6. Players take turns folding, checking, calling, or raising.
7. The server manages legal actions, chip commitments, blinds, pots, side pots, community cards, showdowns, and eliminations.
8. A player wins the game when all other players are eliminated.

## Server API

### `POST /api/create_game`

Creates a new poker game and returns a room code.

Example response:

```json
{
  "room": "123456"
}
```

## Socket.IO Events

### Client to Server

| Event | Payload | Description |
| --- | --- | --- |
| `request_start_game` | none | Marks the player as ready in the lobby |
| `fold` | none | Folds the current hand |
| `check` | none | Checks when no call is owed |
| `call` | none | Calls the current bet |
| `raise_to` | number | Raises total bet amount to the provided value |

The socket connection sends this auth payload:

```js
{
  room,
  player_id,
  name
}
```

### Server to Client

| Event | Payload | Description |
| --- | --- | --- |
| `state_update` | public game state | Sends the current player's view of the game state |
| `connect_player_failure` | none | Redirects the client back to the join screen |

## Game Rules and Behavior

- Each player starts with `$10,000` in chips.
- Games require at least 2 players and allow up to 10 players.
- New players cannot join after the game has started.
- Blinds depend on player count and increase on a timer.
- A player has 20 seconds to act on their turn.
- If a player owes chips and times out, they automatically fold.
- If a player can check and times out, they automatically check.
- When all but one player folds, the remaining player wins the hand.
- At showdown, the server evaluates the best five-card hand from the community cards and each player's two hole cards.
- Side pots and split pots are handled by the server.
- Rooms are stored in memory and are deleted after all players disconnect for 10 minutes.

## Deployment Notes

The server serves the production frontend build from:

```text
client/dist
```

A typical deployment flow is:

```bash
cd client
npm install
npm run build

cd ../server
npm install
node server.js
```

Before deploying, review these values in `server/server.js`:

```js
const PORT = 3000;
const origin = "https://simplepokergame.com";
```

Update them to match your deployment environment if needed.

## Current Limitations

- Game state is stored in memory, so active games are lost when the server restarts.
- There is no user authentication.
- There is no database or long-term game history.
- The backend has a hardcoded production origin.
- The server does not currently include a `start` script in `package.json`.
- Automated tests are not currently implemented.

## Future Improvements

- Add environment variables for `PORT` and allowed CORS origin
- Add a server `start` script
- Add Vite proxy configuration for smoother local development
- Add automated tests for hand scoring, side pots, turn flow, and socket events
- Add persistent storage for rooms, players, or game history
- Add spectator support
- Add clearer end-of-hand summaries
- Add mobile layout refinements

## License

This project currently uses the `ISC` license as specified in `server/package.json`.
