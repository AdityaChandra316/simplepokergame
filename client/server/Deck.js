const NUMBER_OF_CARDS = 52;

class Deck {
  constructor() {
    this.Reshuffle();
  }  
  Reshuffle() {
    this.deck = [];
    for (let i = 0; i < NUMBER_OF_CARDS; i++) {
      this.deck.push(i);
    }
    for (let i = NUMBER_OF_CARDS - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements array[i] and array[j]
      const temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  }
  GetRandomCard() {
    return this.deck.pop();
  }
}

module.exports = Deck;
