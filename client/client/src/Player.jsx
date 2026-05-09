import CardToUrl from "./CardToUrl.js";
import Turn from "./Turn.jsx";

const FACE_DOWN_CARD_URL = "/cards/row-5-column-3.png";

const CHECK = 2;
const CALL = 3;
const RAISE_TO = 4;

function Player({ public_state, index }) {
  const player = public_state.players[index];
  const relative_index = (index - public_state.my_player_index + public_state.players.length) % public_state.players.length;
  const angle = 2 * Math.PI * relative_index / public_state.players.length;
  const player_style = {
    top: `${50 + 50 * Math.cos(angle)}%`,
    left: `${50 - 50 * Math.sin(angle)}%`,
    opacity: player.eliminated || player.folded_this_hand ? 0.5 : 1
  };
  const bet_position = {
    top: `${50 + 30 * Math.cos(angle)}%`,
    left: `${50 - 30 * Math.sin(angle)}%`
  };

  let player_hole_cards = <div></div>;

  if (player.hole_cards.length) {
    player_hole_cards = (
      <div>
        <img src={CardToUrl(player.hole_cards[0])}></img>
        <img src={CardToUrl(player.hole_cards[1])}></img>
      </div>
    );
  } else if (!player.eliminated) {
    player_hole_cards = (
      <div>
        <img src={FACE_DOWN_CARD_URL}></img>
        <img src={FACE_DOWN_CARD_URL}></img>
      </div>
    );
  }

  let player_action = "Waiting";
  let action_style = {};

  if (index == public_state.game_winner_index) {
    player_action = "Game Winner";
    action_style = { color: "yellow" };
  } else if (player.eliminated) {
    player_action = "Eliminated";
  } else if (player.folded_this_hand) {
    player_action = "Folded";
  } else if (player.last_action_this_round == CHECK) {
    player_action = "Checked";
  } else if (player.last_action_this_round == CALL) {
    player_action = `Called $${player.last_action_amount_this_round}`;
  } else if (player.last_action_this_round == RAISE_TO) {
    player_action = `Raised to $${player.last_action_amount_this_round}`;
  }

  return (
    <>
      <div className="player" style={player_style}>
        <div>
          {player_hole_cards}
          <div>
            <p><strong>{player.name}</strong></p>
            <hr/>
            <p>{`$${player.chips}${player.amount_won_this_hand ? ` (+$${player.amount_won_this_hand})` : ""}`}</p>
            <p>{player.connected ? "Connected" : "Disconnected"}</p>
            <p style={action_style}>{player_action}</p>
            <Turn public_state={public_state} index={index} />
          </div>
        </div>
      </div>
      <div className="player_bet" style={bet_position}>
        <img src="/bet_chips.png"></img>
        <p>${player.bet_amount_this_round}</p>
      </div>
    </>
  );
}

export default Player;
