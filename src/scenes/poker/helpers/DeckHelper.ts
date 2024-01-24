import Deck from '../common/deck';

export default class DeckHandler {
  deck: Deck;

  constructor(scene: Phaser.Scene) {
    this.deck = new Deck(scene);
  }

}

