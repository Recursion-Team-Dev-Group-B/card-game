import Deck from './deck';
import Player from './player';

export default class Table {
  // ゲームに参加するプレイヤーの配列
  players: Player[];
  deck: Deck;
  house: Player;

  constructor(players: Player[], deck: Deck, house: Player) {
    this.players = players;
    this.deck = deck;
    this.house = house;
  }

  evaluateRoundWinners() {
    console.log('return winners');
  }

  // カードのUI実装。
  // 裏向きでなければ、そのsuit-rankに紐づくカードの画像を返す
  getAtlasFrame(): string {
    return !this.#faceDown ? `card-${this.#suit}-${this.#rank}.png` : '';
  }

  // rankに対応する数値を取得。
  getRankNumber(): number {
    const rankToNum: { [key: string]: number } = {
      A: 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      J: 11,
      Q: 12,
      K: 13,
    };
    return rankToNum[this.#rank] ?? 0; // if rankToNum[this.rank] is undefined, this function returns 0
  }
}
