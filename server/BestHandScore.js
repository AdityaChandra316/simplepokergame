// 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack (J), Queen (Q), King (K), Ace (A)
function ScoreStraight(rank_occurences) {
  if (rank_occurences[12] && rank_occurences[0] && rank_occurences[1] && rank_occurences[2] && rank_occurences[3]) {
    return 3;
  }
  let ranks_found = 0;
  for (let rank_offset = 0; rank_offset < 5; rank_offset++) {
    const rank = rank_offset;
    if (rank_occurences[rank]) {
      ranks_found++;
    }
  }
  if (ranks_found == 5) {
    return 4;
  }
  for (let starting_rank = 1; starting_rank < 9; starting_rank++) {
    const ending_rank = starting_rank + 4;
    if (rank_occurences[starting_rank - 1]) {
      ranks_found--;
    }
    if (rank_occurences[ending_rank]) {
      ranks_found++;
    }
    if (ranks_found == 5) {
      return ending_rank;
    }
  }
  return -1;
}

function ScoreHand(hand) {
  const rank_occurences = {};
  const ranks = [];
  const suits = new Set()
  for (const card of hand) {
    const suit = card % 4;
    const rank = (card - suit) / 4;
    if (rank_occurences[rank]) {
      rank_occurences[rank]++;
    } else {
      rank_occurences[rank] = 1;
    }
    ranks.push(rank);
    suits.add(suit);
  }
  ranks.sort((a, b) => a - b);
  const rank_occurences_keys = Object.keys(rank_occurences).map(Number);
  const rank_occurences_values = Object.values(rank_occurences);
  // Straight and Royal Flush
  if (suits.size == 1) {
    const straight_score = ScoreStraight(rank_occurences);
    if (straight_score != -1) {
      return 2 * (13 ** 5) + (13 ** 4) + 2 * (13 ** 3) + 2 * (13 ** 2) + 13 + straight_score; // Max tie breaker is 13.
    }
  }
  // Four of a Kind
  const quad_index = rank_occurences_values.indexOf(4);
  const kicker_index = rank_occurences_values.indexOf(1);
  if (quad_index != -1) {
    return 2 * (13 ** 5) + (13 ** 4) + 2 * (13 ** 3) + (13 ** 2) + 13 + 13 * rank_occurences_keys[quad_index] + rank_occurences_keys[kicker_index]; // Max tie breaker is 13 ** 2.
  }
  // Full House
  const bi_index = rank_occurences_values.indexOf(2);
  const tri_index = rank_occurences_values.indexOf(3);
  if (bi_index != -1 && tri_index != -1) {
    return 2 * (13 ** 5) + (13 ** 4) + 2 * (13 ** 3) + 13 + 13 * rank_occurences_keys[tri_index] + rank_occurences_keys[bi_index]; // Max tie breaker is 13 ** 2.
  }
  // Flush
  if (suits.size == 1) {
    return (13 ** 5) + (13 ** 4) + 2 * (13 ** 3) + 13 + (13 ** 4) * ranks[4] + (13 ** 3) * ranks[3] + (13 ** 2) * ranks[2] + (13 ** 1) * ranks[1] + ranks[0]; // Max tie breaker is 13 ** 5
  }
  // Straight
  const straight_score = ScoreStraight(rank_occurences);
  if (straight_score != -1) {
    return (13 ** 5) + (13 ** 4) + 2 * (13 ** 3) + straight_score; // Max tie breaker is 13
  }
  // Three of a Kind
  const second_kicker_index = rank_occurences_values.indexOf(1, kicker_index + 1);
  if (tri_index != -1) {
    const kicker_ranks = [rank_occurences_keys[kicker_index], rank_occurences_keys[second_kicker_index]].sort((a, b) => a - b);
    return (13 ** 5) + (13 ** 4) + (13 ** 3) + (13 ** 2) * rank_occurences_keys[tri_index] + 13 * kicker_ranks[1] + kicker_ranks[0]; // Max tie breaker is 13 ** 3
  }
  // Two Pair
  const second_bi_index = rank_occurences_values.indexOf(2, bi_index + 1);
  if (bi_index != -1 && second_bi_index != -1) {
    const pair_ranks = [rank_occurences_keys[bi_index], rank_occurences_keys[second_bi_index]].sort((a, b) => a - b);
    return (13 ** 5) + (13 ** 4) + (13 ** 2) * pair_ranks[1] + 13 * pair_ranks[0] + rank_occurences_keys[kicker_index]; // Max tie breaker is 13 ** 3
  }
  // One Pair
  const third_kicker_index = rank_occurences_values.indexOf(1, second_kicker_index + 1);
  if (bi_index != -1) {
    const kicker_ranks = [rank_occurences_keys[kicker_index], rank_occurences_keys[second_kicker_index], rank_occurences_keys[third_kicker_index]].sort((a, b) => a - b);
    return (13 ** 5) + (13 ** 3) * rank_occurences_keys[bi_index] + (13 ** 2) * kicker_ranks[2] + 13 * kicker_ranks[1] + kicker_ranks[0];  // Max tie breaker is 13 ** 4
  }
  // High Card
  return (13 ** 4) * ranks[4] + (13 ** 3) * ranks[3] + (13 ** 2) * ranks[2] + (13 ** 1) * ranks[1] + ranks[0]; // Max tie breaker is 13 ** 5
}

function BestHandScore(c, h) {
  const hands = [  
    [c[0], c[1], c[2], c[3], c[4]],
    [c[0], c[1], c[2], c[3], h[0]], 
    [c[0], c[1], c[2], c[3], h[1]], 
    [c[0], c[1], c[2], c[4], h[0]], 
    [c[0], c[1], c[2], c[4], h[1]], 
    [c[0], c[1], c[2], h[0], h[1]], 
    [c[0], c[1], c[3], c[4], h[0]], 
    [c[0], c[1], c[3], c[4], h[1]], 
    [c[0], c[1], c[3], h[0], h[1]], 
    [c[0], c[1], c[4], h[0], h[1]], 
    [c[0], c[2], c[3], c[4], h[0]], 
    [c[0], c[2], c[3], c[4], h[1]], 
    [c[0], c[2], c[3], h[0], h[1]], 
    [c[0], c[2], c[4], h[0], h[1]], 
    [c[0], c[3], c[4], h[0], h[1]], 
    [c[1], c[2], c[3], c[4], h[0]], 
    [c[1], c[2], c[3], c[4], h[1]], 
    [c[1], c[2], c[3], h[0], h[1]], 
    [c[1], c[2], c[4], h[0], h[1]], 
    [c[1], c[3], c[4], h[0], h[1]], 
    [c[2], c[3], c[4], h[0], h[1]]
  ];  
  let best_hand_score = -Infinity;
  for (const hand of hands) {
    const hand_score = ScoreHand(hand);
    if (hand_score > best_hand_score) {
      best_hand_score = hand_score;
    }
  }
  return best_hand_score;
}

module.exports = BestHandScore;
