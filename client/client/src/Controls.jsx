import { useEffect, useState } from "react"; 

function Controls({ public_state, socket }) { 
  const [raise_to, set_raise_to] = useState(0); 
  const player = public_state.players[public_state.my_player_index]; 
  const is_input_disabled = public_state.game_winner_index != -1 || public_state.round_ended || public_state.hand_ended || public_state.my_player_index != public_state.player_index; 

  const amount_owed = public_state.minimum_call_amount_this_round - player.bet_amount_this_round; 

  let minimum_raise_to = public_state.minimum_call_amount_this_round + public_state.minimum_raise_amount_this_round; 
  const maximum_raise_to = player.bet_amount_this_round + player.chips; 
  if (maximum_raise_to < minimum_raise_to) { 
    minimum_raise_to = maximum_raise_to;
  } 

  const is_fold_disabled = is_input_disabled || !amount_owed; 
  const is_check_disabled = is_input_disabled || amount_owed;
  const is_call_disabled = is_input_disabled || !amount_owed; 
  const is_raise_to_disabled = ( 
    is_input_disabled || 
    maximum_raise_to <= public_state.minimum_call_amount_this_round ||
    raise_to < minimum_raise_to || 
    raise_to > maximum_raise_to || 
    (player.last_action_this_round && public_state.minimum_call_amount_this_round - player.minimum_call_amount_following_last_act < public_state.minimum_raise_amount_this_round) 
  ); 

  useEffect(() => { 
    set_raise_to(minimum_raise_to);
  }, [minimum_raise_to]);

  return ( 
    <div> 
      <button onClick={() => socket.current.emit("fold")} disabled={is_fold_disabled}>Fold</button> 
      <button onClick={() => socket.current.emit("check")} disabled={is_check_disabled}>Check</button> 
      <button onClick={() => socket.current.emit("call")} disabled={is_call_disabled}>Call ${Math.min(amount_owed, player.chips)}</button> 
      <div> 
        <div> 
          <div> 
            <input type="text" onChange={e => { 
              const casted_number = Number(e.target.value); 
              if (Number.isInteger(casted_number)) { 
                set_raise_to(casted_number); 
              } 
            }} value={raise_to}/> 
          </div> 
          <div> 
            <input type="range" onChange={e => { 
              set_raise_to(Number(e.target.value)); 
            }} value={raise_to} min={minimum_raise_to} max={maximum_raise_to} step="1"/>
          </div> 
        </div> 
        <button disabled={is_raise_to_disabled} onClick={() => socket.current.emit("raise_to", raise_to)}>Raise To</button> 
      </div> 
    </div> 
  ); 
} 

export default Controls;
