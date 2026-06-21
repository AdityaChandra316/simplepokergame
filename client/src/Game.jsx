import { useEffect, useRef, useState } from "react";
import { useParams, Navigate } from "react-router";
import { io } from "socket.io-client";
import Lobby from "./Lobby.jsx";
import Table from "./Table.jsx";

function Game() {
  const { room } = useParams();
  const socket = useRef(null);
  const [public_state, set_public_state] = useState(null);
  const [is_disconnected, set_is_disconnected] = useState(false);

  useEffect(() => {
    set_public_state(null);
    set_is_disconnected(false);
    
    const name = localStorage.getItem("name");

    socket.current = io("/", {
      autoConnect: false
    });

    let player_id = localStorage.getItem("player_id");

    if (!player_id) {
      player_id = crypto.randomUUID();
      localStorage.setItem("player_id", player_id);
    }

    socket.current.auth = { room, player_id, name };
    socket.current.connect();
    socket.current.on("state_update", new_public_state => set_public_state(new_public_state));
    socket.current.on("disconnect", () => set_is_disconnected(true));

    return () => {
      socket.current.removeAllListeners();
      socket.current.disconnect();
    }
  }, [room]);

  if (is_disconnected) {
    return <Navigate to="/join" replace/>;
  }

  if (!public_state) {
    return <></>;
  }

  if (public_state.game_started) {
    return <Table public_state={public_state} room={room} socket={socket}/>;
  }

  return <Lobby public_state={public_state} room={room} socket={socket}/>;
}

export default Game;
