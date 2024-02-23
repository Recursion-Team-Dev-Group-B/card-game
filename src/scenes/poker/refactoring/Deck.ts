/* eslint no-underscore-dangle: 0 */
import * as Phaser from 'phaser';
import GAME from '@/constants/game';
import Card from '@/scenes/poker/refactoring/Card';

class Deck {
  cardList: Array<Card> = [];


  constructor(scene: Phaser.Scene) {
    // suitListを作り、GAME.CARD.SUIT_LISTの中身をコピー
    const suitList: Array<string> = [...GAME.CARD.SUIT_LIST];
    // rankListを作り、GAME.CARD.RANK_LISTの中身をコピー
    const rankList: Array<string> = [...GAME.CARD.RANK_LIST];


    // suitとrankの組み合わせを全て作り、cardListに格納。
    for (let s = 0; s < suitList.length; s += 1) {
      for (let r = 0; r < rankList.length; r += 1) {
        this.cardList.push(
          new Card(
            scene,
            suitList[s],
            rankList[r],
            `${suitList[s]}_${rankList[r]}`,
          ),
        );
      }
    }
  }

  // デッキ全体を一度にランダムに並び替える。
  shuffle(): void {
    for (let i = 0; i < this.cardList.length; i += 1) {
      // 乱数を生成。
      const randomIndex: number = Math.floor(
        Math.random() * this.cardList.length,
      );
      // 現在のカードをその乱数の位置に移す。
      const temp: Card = this.cardList[i];
      this.cardList[i] = this.cardList[randomIndex];
      this.cardList[randomIndex] = temp;
    }
  }

  // カードを一枚引く。 引いたらpop。
  drawOne(): Card | undefined {
    if (this.isEmpty()) {
      console.log('no more cards left. refresh to start new game.');
      return undefined;
    }
    return this.cardList.pop();
  }

  isEmpty(): boolean {
    return this.cardList.length === 0;
  }

  getDeckSize(): number {
    return this.cardList.length;
  }

  ///
  clearDeck(): void {
    this.cardList = [];
  }

  addCard(card: Card) {
    this.cardList.push(card);
  }

}

export default Deck;
