import "./JoinOrCreate.css"
import { Link, Navigate } from "react-router";
import { useState } from "react";

function Create() {
  const [room, set_room] = useState("");
  const [name, set_name] = useState("");
  const [created, set_created] = useState(false);
  if (created) {
    return <Navigate to={`/game/${room}`} replace/>;
  }
  return (
    <div id="join_or_create">
      <h1>P♤ker</h1>
      <div>
        <p><strong>Create a Game</strong></p>
        <p>or <Link to="/join">join one</Link></p>
        <input type="text" placeholder="Name" onChange={e => set_name(e.target.value)}/>
        <button onClick={async () => {
          const response = await fetch("/api/create_game", {
            method: "POST",
          });
          const data = await response.json();
          set_created(true);
          set_room(data.room);
          localStorage.setItem("name", name);
        }} disabled={!name.length}>Submit</button>
      </div>
    </div>
  );
}

export default Create;
