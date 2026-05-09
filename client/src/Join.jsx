import "./JoinOrCreate.css"
import { Link, Navigate } from "react-router";
import { useState } from "react";

function Join() {
  const [room, set_room] = useState("");
  const [name, set_name] = useState("");
  const [joined, set_joined] = useState(false);
  if (joined) {
    return <Navigate to={`/game/${room}`} replace/>;
  }
  return (
    <div id="join_or_create">
      <h1>P♤ker</h1>
      <div>
        <p><strong>Join a Game</strong></p>
        <p>or <Link to="/create">create one</Link></p>
        <input type="text" placeholder="Name" onChange={e => set_name(e.target.value)}/>
        <input type="text" placeholder="Room" value={room} onChange={e => {
          if (e.target.value.length > 6) {
            return;
          }
          for (const character of e.target.value) {
            if (character < '0' || character > '9') {
              return;
            }
          }       
          set_room(e.target.value);   
        }}/>
        <button onClick={() => {
          localStorage.setItem("name", name);
          set_joined(true);
        }} disabled={room.length < 6 || !name.length}>Submit</button>
      </div>
    </div>
  );
}

export default Join;
