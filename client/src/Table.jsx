import "./Table.css";
import CardToUrl from "./CardToUrl.js";
import Player from "./Player.jsx";
import Controls from "./Controls.jsx";

function Table({ public_state, socket }) {
  return (
    <div id="table_container">
      <div id="table">
        <div id="table_central_info_container">
          <div id="table_pot_info_container">
            <img src="/pot_chips.png"></img>
            <p><span>Pot:</span> ${public_state.total_pot}</p>
          </div>
          <div id="table_community_cards_container">
            {public_state.community_cards.map((card, i) => <img key={i} src={CardToUrl(card)}></img>)}
          </div>
        </div>
        {public_state.players.map((_, i) => <Player key={i} public_state={public_state} index={i} /> )}
      </div>
      <Controls public_state={public_state} socket={socket} />
    </div>
  );
}

export default Table;
