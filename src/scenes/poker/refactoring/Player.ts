import Card from '@/scenes/poker/refactoring/Card';

export default abstract class Player {
  /*
  private name: string;
  private playerType: string;
  private gameType: string;
  private chips: number;
  private winAmount: number;
  private bet: number;
  private action: string;
  private hand: Array<Card> = [];
  */


  public name: string;
  public playerType: string;
  public gameType: string;
  public chips: number;
  public winAmount: number;
  public bet: number;
  public action: string;
  public hand: Array<Card | undefined>;
  /*
        name: プレイヤーの名前
        playerType: プレイヤーのタイプ　[player, house, cpu]のいずれか
        gameType: プレイヤーが遊ぶゲーム [blackJack, poker, war, speed]
        chips:　プレイヤーのチップの数, 初期値: 1000
        winAmount: プレイヤーが買った場合に支払われる賞金
        bet: プレイヤーの掛け金
        aciton: 各ゲームにおいてプレイヤーが選択した行動
                blackJackの場合: [hit, bust, stand, blackjack, surrender ]
    */

  constructor(
    name: string,
    playerType: string,
    gameType: string,
    chips: number = 1000,
    winAmount: number,
    bet: number,
    aciton: string,
  ) {
    this.name = name;
    this.playerType = playerType;
    this.gameType = gameType;
    this.chips = chips;
    this.winAmount = winAmount;
    this.bet = bet;
    this.action = aciton;
    this.hand = [];
  }

  /*
  // プレイヤーの名前を取得
  get getName(): string {
    return this.getName;
  }

  // プレイヤーのタイプを取得
  get getPlayerType(): string {
    return this.playerType;
  }

  // プレイヤーが選択したゲームを取得
  get getGameType(): string {
    return this.gameType;
  }

  //　プレイヤーが持っているチップを取得
  get getChips(): number {
    return this.chips;
  }
  // プレイヤーのチップを設定する
  set setChips(chips: number) {
    this.chips = chips;
  }

  // プレイヤーがベットした金額を取得する
  /*
  get getBet(): number {
    return this.bet;
  }
  // プレイヤーがベットした金額を設定する
  set setBet(bet: number) {
    this.bet = bet;
  }
  */

  /*
  // プレイヤーが獲得した賞金を取得
  get getWinAmount(): number {
    return this.winAmount;
  }

  // プレイヤーが獲得した賞金を設定する
  set setWinAmount(winAmount: number) {
    this.winAmount = winAmount;
  }

  // プレイヤーが選択したアクションを取得
  get getAction(): string {
    return this.action;
  }

  // プレイヤーが選択したアクションを設定
  set setAction(aciton: string) {
    this.action = aciton;
  }
  */

  // 手札を空にする
  clearHand() {
    this.hand = [];
  }

  // 手札にカードを加える
  addCardToHand(card: Card) {
    this.hand.push(card);
  }

  /*
        promptPlayer() {} 

        getHandScore() {}
    */
}
