import Phaser from 'phaser';
class Card extends Phaser.GameObjects.Image {
  // カードはsuit（スペード、ハート、ダイヤモンド、クラブ）、rank（A、2-10、JQK）、裏表のプロパティを持つものとする。
  readonly #suit: string;
  readonly #rank: string;
  #texture: string;
  #faceDown = false;

  constructor(
    scene: Phaser.Scene,
    suit: string,
    rank: string,
    texture: string,
  ) {
    super(scene, 10, 10, texture);
    // scene.add.existing(this);
    this.scene = scene;
    this.#suit = suit;
    this.#rank = rank;
    this.#texture = texture;
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
    return !this.#faceDown ? `card-${this.#suit}-${this.#rank}.png` : '';
  }

  // rankに対応する数値を取得。
  getRankNumber(): number {
    const rankToNum: { [key: string]: number } = {
      A: 11,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      J: 10,
      Q: 10,
      K: 10,
    };
    return rankToNum[this.#rank] ?? 0; // if rankToNum[this.rank] is undefined, this function returns 0
  }
}

export default Card;
