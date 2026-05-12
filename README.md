# P♤ker — Simple Poker Game

A real-time multiplayer poker game built with React, Express, and Socket.IO. Players can create a room, share a six-digit room code, join a lobby, ready up, and play a Texas Hold’em-style game in the browser.

## Features

- Create and join private poker rooms with six-digit room codes
- Real-time multiplayer state updates with Socket.IO
- Lobby with player connection and ready status
- Texas Hold’em-style gameplay with hole cards, community cards, blinds, betting rounds, and showdown scoring
- Player actions: fold, check, call, and raise
- Automatic turn timer that folds or checks for inactive players after 20 seconds
- Tournament-style chip play with eliminations and a final winner
- Increasing blinds over time
- Responsive poker table UI with card and chip assets

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
├── client/
│   ├── public/              # Card images, chip images, font, favicon
│   ├── src/                 # React components and styles
│   │   ├── Create.jsx       # Create-room screen
│   │   ├── Join.jsx         # Join-room screen
│   │   ├── Game.jsx         # Socket connection and game routing
│   │   ├── Lobby.jsx        # Pre-game lobby
│   │   ├── Table.jsx        # Poker table UI
│   │   ├── Player.jsx       # Player display
│   │   ├── Controls.jsx     # Fold/check/call/raise controls
│   │   └── Turn.jsx         # Turn timer display
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js            # Express and Socket.IO server
│   ├── PokerGame.js         # Core game state and poker flow
│   ├── Deck.js              # Deck generation and shuffling
│   ├── BestHandScore.js     # Poker hand scoring logic
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js
- npm

## Getting Started

Clone the repository and install dependencies for both the client and server.

```bash
git clone <your-repository-url>
cd simplepokergame-main

cd client
npm install

cd ../server
npm install
```

## Running Locally

The server is currently configured for the production origin:

```js
const origin = "https://simplepokergame.com";
```

For local development, update `server/server.js` to allow your local URL. For example, if you are serving the built client through the Express server on port `3000`, use:

```js
const origin = "http://localhost:3000";
```

### Production-style local run

Build the client, then start the server. The Express server serves the compiled React app from `client/dist`.

```bash
cd client
npm run build

cd ../server
node server.js
```

Open the app at:

```text
http://localhost:3000
```

## Gameplay

1. Go to `/create` and enter your name to create a new game room.
2. Share the six-digit room code with other players.
3. Other players go to `/join`, enter their name and the room code, and join the lobby.
4. Every player clicks **Request Start**.
5. Once all players are ready, the game starts after a short countdown.
6. Players take turns choosing to fold, check, call, or raise.
7. A player is eliminated when they run out of chips.
8. The final remaining player wins the game.

## Game Rules and Settings

- Maximum players: 10
- Starting chips: 1,500
- Initial big blind: 20
- Blind levels: 20, 30, 50, 100, 150, 200, 300, 400, 600, 1,000
- Blind interval: 5 minutes
- Turn timer: 20 seconds
- Empty rooms are deleted after 10 minutes with no connected players

## Available Client Scripts

Run these from the `client` directory.

```bash
npm run dev      # Start the Vite development server
npm run build    # Build the production client
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Server Commands

Run these from the `server` directory.

```bash
node server.js   # Start the Express and Socket.IO server on port 3000
```

You may also add a start script to `server/package.json`:

```json
"scripts": {
  "start": "node server.js"
}
```

Then run:

```bash
npm start
```

## API Overview

### Create Game

```http
POST /api/create_game
```

Creates a new poker room and returns a six-digit room code.

Example response:

```json
{
  "room": "123456"
}
```

## Socket Events

The client connects with Socket.IO authentication data:

```js
{
  room,
  player_id,
  name
}
```

### Client-to-server events

- `request_start_game`
- `fold`
- `check`
- `call`
- `raise_to`

### Server-to-client events

- `state_update`
- `connect_player_failure`

## Deployment Notes

1. Build the client with `npm run build` inside `client`.
2. Start the server from `server/server.js`.
3. Make sure the `origin` value in `server/server.js` matches your deployed domain.
4. Serve the app over HTTPS in production if using a public domain.

## Future Improvements

- Move configuration such as `PORT` and `origin` into environment variables
- Add a server `start` script
- Add automated tests for hand scoring and game flow
- Add a Vite dev proxy for smoother local development
- Add spectator mode or reconnect handling improvements
- Add persistent game history or match summaries

## License

This project is currently licensed under the ISC license as configured in the server package.
