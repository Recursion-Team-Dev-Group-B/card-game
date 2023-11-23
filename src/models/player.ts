export default class Player {
  // プレイヤーが持っているカードを表す配列
  #hand: any; // Todo Card[] タイプ作成
  // プレイヤーが賭けているチップ数
  #bet: number;
  // プレイヤーがどのタイプに属するか
  readonly #playerType: 'player' | 'house' | 'cpu';

  constructor(playerType: 'player' | 'house' | 'cpu', hand: any, bet: number) {
    this.#playerType = playerType;
    this.#hand = hand;
    this.#bet = bet;
  }

  // handのgetter
  get hand(): string {
    return this.#hand;
  }

  // betのgetter
  get bet(): number {
    return this.#bet;
  }

  // playerTypeのgetter
  get playerType(): 'player' | 'house' | 'cpu' {
    return this.#playerType;
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
