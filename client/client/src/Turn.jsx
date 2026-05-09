import { useEffect, useState } from "react";

function Turn({ public_state, index }) {
  const [remaining_time, set_remaining_time] = useState(20000);
  const is_turn = public_state.game_winner_index == -1 && !public_state.round_ended && !public_state.hand_ended && public_state.player_index == index;

  useEffect(() => {
    if (!is_turn) {
      return;
    }
    
    setTimeout(() => {
      set_remaining_time(20000 + public_state.turn_start_time - Date.now());
    }, 100);

  }, [is_turn, remaining_time]);

  if (is_turn) {
    return <p>Turn ({(remaining_time / 1000).toFixed(1)}s)</p>;
  }
  return <></>;
}

export default Turn;
