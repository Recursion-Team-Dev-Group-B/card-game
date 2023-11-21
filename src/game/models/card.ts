export default class Card {

  // カードはsuit（スペード、ハート、ダイヤモンド、クラブ）、rank（A、2-10、JQK）、裏表のプロパティを持つものとする。
  readonly #suit: string;
  readonly #rank: string;
  #faceDown = false;

  constructor(suit: string, rank: string) {
    this.#suit = suit;
    this.#rank = rank;
  }

  // suitのgetter
  get suit(): string {
    return this.#suit;
  }

  // rankのgetter
  get rank(): string {
    return this.#rank;
  }

  // faceDownのsetter
  set faceDown(faceDown: boolean) {
    this.#faceDown = faceDown;
  }

  // faceDownのgetter
  get faceDown(): boolean {
    return this.#faceDown;
  }

  // カードのUI実装。
  // 裏向きでなければ、そのsuit-rankに紐づくカードの画像を返す
  getAtlasFrame(): string {
    return !this.#faceDown
      ? `card-${this.#suit}-${this.#rank}.png`
      : '';
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
      K: 13
    };
    return rankToNum[this.#rank] ?? 0; // if rankToNum[this.rank] is undefined, this function returns 0
  }
}
