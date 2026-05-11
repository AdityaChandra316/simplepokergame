import "./Lobby.css";

function Lobby({ public_state, room, socket }) {  
  return (
    <div id="lobby">
      <h1>Lobby</h1>
      <div id="lobby_body">
        <div id="lobby_header">
          <strong>Name</strong>
          <strong>Connection</strong>
          <strong>Start Status</strong>
        </div>
        <div id="lobby_table_container">
          <table>
            {
              public_state.players.map((player, i) => (
                <tr key={i}>
                  <td>{player.name + (i == public_state.my_player_index ? " (You)" : "")}</td>
                  <td>{player.connected ? "Connected" : "Disconnected"}</td>
                  <td>{player.requested_start_game ? "Ready" : "Waiting"}</td>
                </tr>
              ))
            }
          </table>
        </div>
        <div id="lobby_footer">
          <p>Room: {room}</p>
          <button onClick={() => {
            socket.current.emit("request_start_game");
          }} disabled={public_state.players[public_state.my_player_index].requested_start_game}>Request Start</button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
