const Deck = require("./Deck.js");
const BestHandScore = require("./BestHandScore.js");
const EventEmitter = require("events");

const PRE_FLOP_ROUND = 0;
const FLOP_ROUND = 1;
const TURN_ROUND = 2;
const RIVER_ROUND = 3;

const STARTING_CHIPS = 10000;

const FOLD = 1;
const CHECK = 2;
const CALL = 3;
const RAISE_TO = 4;

class PokerGame extends EventEmitter {
  constructor() {
    super();
    // Core game objects.
    this.players = [];
    this.deck = new Deck();

    this.number_of_players_who_requested_start_game = 0;
    this.number_of_connected_players = 0;

    // Game lifecycle.
    this.game_started = false;
    this.game_winner_index = -1; // Use this to check if game has ended.
    this.round_ended = false;
    this.hand_ended = false;

    // Player/table state.
    this.dealer_button_index = 0;
    this.player_index;
    this.number_of_uneliminated_players = 0;
    this.player_id_to_index = {};

    // Hand/round state.
    this.round = PRE_FLOP_ROUND;
    this.community_cards = [];
    this.is_showing_down = false;

    // Betting state.
    this.big_blinds;
    this.big_blind_interval;
    this.big_blind;
    this.minimum_call_amount_this_round = this.big_blind;
    this.minimum_raise_amount_this_round = this.big_blind;
    this.total_pot = 0;

    // Timing.
    this.start_time;
    this.forced_action_timeout;
    this.turn_start_time;
    this.delete_poker_game_timeout = setTimeout(() => this.emit("delete_poker_game"), 600000);
    this.start_game_timeout;
  }
  ConnectPlayer(player_id, name) {
    if (player_id in this.player_id_to_index) {
      const player_index = this.player_id_to_index[player_id];
      const player_at_index = this.players[player_index];
      const old_player_number_of_connections = player_at_index.number_of_connections;
      player_at_index.number_of_connections++;
      if (!old_player_number_of_connections && player_at_index.number_of_connections) {
        this.number_of_connected_players++;
        this.emit("state_update");
      } else {
        this.emit("individual_state_update", player_id);
      }
      clearTimeout(this.delete_poker_game_timeout);
      return;
    }
    if (this.game_started || this.players.length >= 10 || !name || !name.length) {
      this.emit("connect_player_failure", player_id);
      return;
    }
    const player_index = this.players.length;
    this.players.push({
      // Identity.
      player_id,
      name,

      number_of_connections: 1,
      requested_start_game: false,

      // Tournament/player status.
      chips: STARTING_CHIPS,
      eliminated: false,

      // Cards.
      hole_cards: [
        this.deck.GetRandomCard(),
        this.deck.GetRandomCard()
      ],

      // Current hand state.
      folded_this_hand: false,
      bet_amount_this_hand: 0,
      amount_won_this_hand: 0,

      // Current betting-round state.
      bet_amount_this_round: 0,
      last_action_this_round: 0,
      last_action_amount_this_round: 0, // Amount displayed after action (only for call and raise)
      minimum_call_amount_following_last_act: 0,
    });
    this.number_of_connected_players++;
    this.number_of_uneliminated_players++;
    this.player_id_to_index[player_id] = player_index;
    clearTimeout(this.delete_poker_game_timeout);
    clearTimeout(this.start_game_timeout);
    this.emit("state_update");
  }
  DisconnectPlayer(player_id) {
    if (!(player_id in this.player_id_to_index)) {
      return;
    }
    const player_index = this.player_id_to_index[player_id];
    const player_at_index = this.players[player_index];
    const old_player_number_of_connections = player_at_index.number_of_connections;
    player_at_index.number_of_connections = Math.max(0, old_player_number_of_connections - 1);
    if (old_player_number_of_connections && !player_at_index.number_of_connections) {
      this.number_of_connected_players--;
      if (!this.number_of_connected_players) {
        this.delete_poker_game_timeout = setTimeout(() => this.emit("delete_poker_game"), 10 * 60 * 1000);
      }  
      this.emit("state_update");
    }
  }
  RequestStartGame(player_id) {
    if (this.game_started || !(player_id in this.player_id_to_index)) {
      return;
    }
    
    const player_index = this.player_id_to_index[player_id];
    const player = this.players[player_index];
    
    if (player.requested_start_game) {
      return;
    }

    player.requested_start_game = true;
    this.number_of_players_who_requested_start_game++;
    this.emit("state_update");

    if (this.players.length < 2 || this.number_of_players_who_requested_start_game < this.players.length) {
      return;
    }

    // Everyone has requested to start the game and so we can begin.

    this.start_game_timeout = setTimeout(() => {
      if (this.players.length == 2) {
        this.big_blinds = [100, 150, 250, 400, 600, 1000, 1500, 2500, 4000, 6000];
        this.big_blind_interval = 180000;
      } else if (this.players.length <= 4) {
        this.big_blinds = [100, 150, 200, 300, 400, 600, 1000, 1500, 2500, 4000, 6000];
        this.big_blind_interval = 240000;
      } else if (this.players.length <= 6) {
        this.big_blinds = [100, 150, 200, 300, 400, 600, 800, 1200, 1600, 2400, 3200, 5000, 8000];
        this.big_blind_interval = 300000;
      } else {
        this.big_blinds = [50, 100, 150, 200, 300, 400, 600, 800, 1200, 1600, 2400, 3200, 5000, 8000, 12000];
        this.big_blind_interval = 360000;
      }
      this.big_blind = this.big_blinds[0];
      
      let small_blind_index;
      if (this.number_of_uneliminated_players == 2) {
        small_blind_index = 0;
      } else {
        small_blind_index = 1;
      }

      this.game_started = true;

      this.player_index = (small_blind_index + 1) % this.players.length;

      this.start_time = Date.now();

      this.#CommitChips(small_blind_index, this.big_blind / 2);
      this.#CommitChips(this.player_index, this.big_blind);

      this.#GoToNextState();  
    }, 5000);
  }
  Fold(player_id) {
    if (!this.game_started || this.game_winner_index != -1 || this.round_ended || this.hand_ended) {
      return;
    }
    const player = this.players[this.player_index];
    const amount_owed = this.minimum_call_amount_this_round - player.bet_amount_this_round;
    if (player_id != player.player_id || !amount_owed) {
      return;
    }
    player.folded_this_hand = true;
    player.last_action_this_round = FOLD;
    player.minimum_call_amount_following_last_act = this.minimum_call_amount_this_round;
    this.#GoToNextState();
  }
  Check(player_id) {
    if (!this.game_started || this.game_winner_index != -1 || this.round_ended || this.hand_ended) {
      return;
    }
    const player = this.players[this.player_index];
    const amount_owed = this.minimum_call_amount_this_round - player.bet_amount_this_round;
    if (player_id != player.player_id || amount_owed) {
      return;
    }
    player.last_action_this_round = CHECK;
    player.minimum_call_amount_following_last_act = this.minimum_call_amount_this_round;
    this.#GoToNextState();
  }
  Call(player_id) {
    if (!this.game_started || this.game_winner_index != -1 || this.round_ended || this.hand_ended) {
      return;
    }
    const player = this.players[this.player_index];
    const amount_owed = this.minimum_call_amount_this_round - player.bet_amount_this_round;
    if (player_id != player.player_id || !amount_owed) {
      return;
    }
    player.last_action_this_round = CALL;
    player.last_action_amount_this_round = Math.min(player.chips, amount_owed);
    player.minimum_call_amount_following_last_act = this.minimum_call_amount_this_round;
    this.#CommitChips(this.player_index, amount_owed);
    this.#GoToNextState();
  }
  RaiseTo(player_id, new_bet_amount) {
    if (!this.game_started || this.game_winner_index != -1 || this.round_ended || this.hand_ended) {
      return false;
    }
    const player = this.players[this.player_index];
    const maximum_raise_amount = player.bet_amount_this_round + player.chips - this.minimum_call_amount_this_round;
    if (
      !Number.isInteger(new_bet_amount) ||
      player_id != player.player_id ||
      maximum_raise_amount <= 0 || // If even with all my chips I am not able to produce a bet higher than the maximum, don't execute RaiseTo, because I might as well call.
      (player.last_action_this_round && this.minimum_call_amount_this_round - player.minimum_call_amount_following_last_act < this.minimum_raise_amount_this_round)
    ) {
      return;
    }
    const desired_raise_amount = new_bet_amount - this.minimum_call_amount_this_round;
    // Don't raise to a bet that is more than the amount of chips I have.
    if (desired_raise_amount > maximum_raise_amount) {
      return;
    }
    if (maximum_raise_amount < this.minimum_raise_amount_this_round) {
      // If I can't meet the minimum raise amount, I have to go all-in. If I still am choosing not to go all-in, that isn't allowed.
      if (desired_raise_amount < maximum_raise_amount) {
        return; 
      } // If I can meet the minimum raise amount, but I am still choosing not to, that isn't allowed.
    } else if (desired_raise_amount < this.minimum_raise_amount_this_round) {
      return;
    }
    player.minimum_call_amount_following_last_act = new_bet_amount;
    const amount_owed = new_bet_amount - player.bet_amount_this_round;
    this.#CommitChips(this.player_index, amount_owed);
    player.last_action_this_round = RAISE_TO;
    player.last_action_amount_this_round = player.bet_amount_this_round;
    this.#GoToNextState();
  }
  PublicState(player_id) {
    const players = [];

    for (const player of this.players) {
      const public_player = {
        name: player.name,

        connected: player.number_of_connections > 0,
        requested_start_game: player.requested_start_game,

        chips: player.chips,
        eliminated: player.eliminated,

        hole_cards: [],

        folded_this_hand: player.folded_this_hand,
        amount_won_this_hand: player.amount_won_this_hand,

        bet_amount_this_round: player.bet_amount_this_round,
        last_action_this_round: player.last_action_this_round,
        last_action_amount_this_round: player.last_action_amount_this_round,
        minimum_call_amount_following_last_act: player.minimum_call_amount_following_last_act
      };
      if (player.player_id == player_id || (this.is_showing_down && !player.folded_this_hand)) {
        for (const hole_card of player.hole_cards) {
          public_player.hole_cards.push(hole_card);
        }
      }
      players.push(public_player);
    }

    const community_cards = [];
    for (const community_card of this.community_cards) {
      community_cards.push(community_card);
    }

    return {
      players,

      my_player_index: this.player_id_to_index[player_id],

      game_started: this.game_started,
      game_winner_index: this.game_winner_index,
      round_ended: this.round_ended,
      hand_ended: this.hand_ended,

      player_index: this.player_index,

      community_cards,

      minimum_call_amount_this_round: this.minimum_call_amount_this_round,
      minimum_raise_amount_this_round: this.minimum_raise_amount_this_round,
      
      total_pot: this.total_pot,

      turn_start_time: this.turn_start_time,
    }
  }
  #GetValidPlayerIndex(starting_index) {
    starting_index %= this.players.length;
    let player = this.players[starting_index];
    while (!player.chips || player.eliminated || player.folded_this_hand) {
      starting_index = (starting_index + 1) % this.players.length;
      player = this.players[starting_index];
    }
    return starting_index;
  }
  #CommitChips(player_index, chips_to_commit) {
    const player_at_index = this.players[player_index];

    chips_to_commit = Math.min(chips_to_commit, player_at_index.chips);

    player_at_index.chips -= chips_to_commit;
    player_at_index.bet_amount_this_round += chips_to_commit;
    player_at_index.bet_amount_this_hand += chips_to_commit;

    const new_minimum_call_amount_this_round = Math.max(this.minimum_call_amount_this_round, player_at_index.bet_amount_this_round);

    this.minimum_raise_amount_this_round = Math.max(this.minimum_raise_amount_this_round, new_minimum_call_amount_this_round - this.minimum_call_amount_this_round);
    this.minimum_call_amount_this_round = new_minimum_call_amount_this_round;
    this.total_pot += chips_to_commit;
  }
  #HasRoundEnded() {
    for (const player of this.players) {
      if (!player.chips || player.eliminated || player.folded_this_hand) {
        continue;
      }
      if (!player.last_action_this_round || player.bet_amount_this_round != this.minimum_call_amount_this_round) {
        return false;
      }
    }
    return true;
  }
  #HandWinnerIndex() {
    let not_folded_player_index;
    let not_folded_players_count = 0;
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (!player.eliminated && !player.folded_this_hand) {
        not_folded_players_count++;
        if (not_folded_players_count > 1) {
          return -1;
        }
        not_folded_player_index = i;
      }
    }
    return not_folded_player_index;
  }
  #AwardHandWinnerPot(hand_winner_index, pots) {
    const hand_winner = this.players[hand_winner_index];
    for (const pot of pots) {
      if (pot.eligible_player_indices.has(hand_winner_index)) {
        hand_winner.chips += pot.chips;
        hand_winner.amount_won_this_hand += pot.chips;
      }
    }
  }
  #NoValidPlayersExist() {
    for (const player of this.players) {
      if (player.chips && !player.eliminated && !player.folded_this_hand) {
        return false;
      }
    }
    return true;
  }
  #CalculatePots() {
    // Calculate pots.
    const pots = [];
    const players_copy = [];
    for (const player of this.players) {
      players_copy.push({
        folded_this_hand: player.folded_this_hand,
        bet_amount_this_hand: player.bet_amount_this_hand
      });
    }
    while (true) {
      let minimum_bet_amount_this_hand = Infinity;
      const eligible_player_indices = new Set();
      for (let i = 0; i < players_copy.length; i++) {
        const player_copy = players_copy[i];
        if (!player_copy.bet_amount_this_hand) {
          continue;
        }
        if (player_copy.bet_amount_this_hand < minimum_bet_amount_this_hand) {
          minimum_bet_amount_this_hand = player_copy.bet_amount_this_hand;
        }
        if (!player_copy.folded_this_hand) {
          // The player is eligible for this pot as they haven't folded, and they aren't eliminated (since they passed the check that they must have bet something this hand).
          eligible_player_indices.add(i);
        }        
      }
      if (!eligible_player_indices.size) {
        break;
      }
      let number_of_nonzero_bet_amounts = 0;
      for (const player_copy of players_copy) {
        if (player_copy.bet_amount_this_hand) {
          player_copy.bet_amount_this_hand -= minimum_bet_amount_this_hand;
          number_of_nonzero_bet_amounts++;
        }
      }
      pots.push({
        eligible_player_indices,
        chips: minimum_bet_amount_this_hand * number_of_nonzero_bet_amounts
      });
    }
    return pots;
  }
  #AwardShowDownPots(pots) {
    const best_hand_scores = {}
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (!player.eliminated && !player.folded_this_hand) {
        best_hand_scores[i] = BestHandScore(this.community_cards, player.hole_cards);
      }
    }
    for (const pot of pots) {
      let best_player_score = -Infinity;
      for (const index of pot.eligible_player_indices) {
        if (best_hand_scores[index] > best_player_score) {
          best_player_score = best_hand_scores[index];
        }
      }
      const winning_player_indices = new Set();
      for (const index of pot.eligible_player_indices) {
        if (best_hand_scores[index] == best_player_score) {
          winning_player_indices.add(index);
        }
      }
      let pot_remainder = pot.chips % winning_player_indices.size;
      const amount_to_distribute_per_player = (pot.chips - pot_remainder) / winning_player_indices.size;
      for (const index of winning_player_indices) {
        const player = this.players[index];
        player.chips += amount_to_distribute_per_player;
        player.amount_won_this_hand += amount_to_distribute_per_player;
      }
      let current_player_index = (this.dealer_button_index + 1) % this.players.length;
      while (pot_remainder) {
        if (winning_player_indices.has(current_player_index)) {
          const current_player = this.players[current_player_index];
          current_player.chips++;
          current_player.amount_won_this_hand++;
          pot_remainder--;
        }
        current_player_index = (current_player_index + 1) % this.players.length;
      }
    } 
  }
  // Run right before a new player's turn (if there is one).
  #CreateCallOrFoldTimeOut() {
    const player = this.players[this.player_index];
    const amount_owed = this.minimum_call_amount_this_round - player.bet_amount_this_round;

    if (amount_owed) {
      this.forced_action_timeout = setTimeout(() => this.Fold(player.player_id), 20000);
    } else {
      this.forced_action_timeout = setTimeout(() => this.Check(player.player_id), 20000);
    }

    this.turn_start_time = Date.now();
  }
  #GoToNextRound() {
    for (const player of this.players) {
      player.bet_amount_this_round = 0;
      player.last_action_this_round = 0;
      player.minimum_call_amount_following_last_act = 0;
    }

    const next_round = ++this.round;
    if (next_round == FLOP_ROUND) {
      this.community_cards.push(this.deck.GetRandomCard());
      this.community_cards.push(this.deck.GetRandomCard());
      this.community_cards.push(this.deck.GetRandomCard());
    } else if (next_round == TURN_ROUND) {
      this.community_cards.push(this.deck.GetRandomCard());
    } else if (next_round == RIVER_ROUND) {
      this.community_cards.push(this.deck.GetRandomCard());
    }

    this.round_ended = false;

    this.player_index = this.#GetValidPlayerIndex(this.dealer_button_index + 1);
    this.minimum_call_amount_this_round = 0;
    this.minimum_raise_amount_this_round = this.big_blind;

    this.#CreateCallOrFoldTimeOut();

    this.emit("state_update");
  }
  #GoToNextHand() {
    // Core game objects.
    this.deck.Reshuffle();

    for (const player of this.players) {
      if (player.eliminated) {
        player.hole_cards = [];
      } else {
        player.hole_cards = [this.deck.GetRandomCard(), this.deck.GetRandomCard()];
      }

      // Current hand state.
      player.folded_this_hand = false;
      player.bet_amount_this_hand = 0;
      player.amount_won_this_hand = 0;

      // Current betting-round state.
      player.bet_amount_this_round = 0;
      player.last_action_this_round = 0;
      player.minimum_call_amount_following_last_act = 0;
    }

    const dealer_button_index = this.#GetValidPlayerIndex(this.dealer_button_index + 1);
    let small_blind_index;
    if (this.number_of_uneliminated_players == 2) {
      small_blind_index = dealer_button_index;
    } else {
      small_blind_index = this.#GetValidPlayerIndex(dealer_button_index + 1);
    }

    // Game lifecycle.
    this.round_ended = false;
    this.hand_ended = false;

    // Player/table state.
    this.dealer_button_index = dealer_button_index;
    this.player_index = this.#GetValidPlayerIndex(small_blind_index + 1);

    // Hand/round state.
    this.round = PRE_FLOP_ROUND;
    this.community_cards = [];
    this.is_showing_down = false;

    // Betting state.
    this.big_blind = this.big_blinds[Math.min(Math.floor((Date.now() - this.start_time) / this.big_blind_interval), this.big_blinds.length - 1)];
    this.minimum_call_amount_this_round = this.big_blind;
    this.minimum_raise_amount_this_round = this.big_blind;
    this.total_pot = 0;

    this.#CommitChips(small_blind_index, this.big_blind / 2);
    this.#CommitChips(this.player_index, this.big_blind);

    this.#GoToNextState();
  }
  #EliminatePlayers() {
    let uneliminated_player_index;
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (!player.chips && !player.eliminated) {
        player.eliminated = true;
        this.number_of_uneliminated_players--;
      }
      if (!player.eliminated) {
        uneliminated_player_index = i;
      }
    }
    if (this.number_of_uneliminated_players == 1) {
      this.game_winner_index = uneliminated_player_index;
      return;
    } 
    this.game_winner_index = -1;
  }
  #GoToNextState() {
    // Clear previous timeout at the end of a player's turn. That way they don't have a call or fold timeout if they have already made a move.
    clearTimeout(this.forced_action_timeout);
    // If a singular player wins the hand.
    const hand_winner_index = this.#HandWinnerIndex();
    if (hand_winner_index != -1) {
      this.hand_ended = true;
      const pots = this.#CalculatePots();
      this.#AwardHandWinnerPot(hand_winner_index, pots);
      this.#EliminatePlayers();
      this.emit("state_update");
      // If everyone is eliminated except a singular player, we have found a winner and can end the game.
      if (this.game_winner_index != -1) {
        return;
      }
      setTimeout(() => this.#GoToNextHand(), 3000);
      return;
    }
    this.round_ended = this.#HasRoundEnded();
    // If there is a showdown between multiple players.
    let next_player_index;
    const no_valid_players_exist = this.#NoValidPlayersExist();
    if (!no_valid_players_exist) {
      next_player_index = this.#GetValidPlayerIndex(this.player_index + 1);
    }
    if ((this.round == RIVER_ROUND && this.round_ended) || next_player_index == this.player_index || no_valid_players_exist) {
      this.hand_ended = true;
      this.is_showing_down = true;
      while (this.community_cards.length < 5) {
        this.community_cards.push(this.deck.GetRandomCard());
      }
      const pots = this.#CalculatePots();
      this.#AwardShowDownPots(pots);
      this.#EliminatePlayers();
      this.emit("state_update");
      // If everyone is eliminated except a singular player, we have found a winner and can end the game.
      if (this.game_winner_index != -1) {
        return;
      }
      let delay_to_go_to_next_hand = 3000;
      for (const player of this.players) {
        if (!player.eliminated && !player.folded_this_hand) {
          delay_to_go_to_next_hand += 1000;
        }
      }
      setTimeout(() => this.#GoToNextHand(), delay_to_go_to_next_hand);
      return;
    }
    if (this.round_ended) {
      // If the round has ended without the hand ending.
      setTimeout(() => this.#GoToNextRound(), 1500);
      this.emit("state_update");
      return;
    } 
    // Go to the next player index if we aren't moving between rounds or ending a hand.
    this.player_index = next_player_index;
    this.#CreateCallOrFoldTimeOut();
    this.emit("state_update");
  }
}

module.exports = PokerGame;
