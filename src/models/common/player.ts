import Card from './card';

import Storage from '@/utils/storage';

export abstract class Player {
  public storage: Storage;
  public name: string;
  public readonly playerType: string;
  private gameType: string;
  private chips: number;
  private bet: number | undefined;
  hand: Array<Card> = [];

  /*
        name: プレイヤーの名前
        playerType: プレイヤーのタイプ　[player, house, cpu]のいずれか
        gameType: プレイヤーが遊ぶゲーム [blackJack, poker, war, speed]
        chips:　プレイヤーのチップの数, 初期値: 1000
        winAmount: プレイヤーが買った場合に支払われる賞金
        bet: プレイヤーの掛け金
        action: 各ゲームにおいてプレイヤーが選択した行動
                blackJackの場合: [hit, bust, stand, blackjack, surrender ]
    */

  constructor(name: string, playerType: string, gameType: string) {
    this.storage = new Storage();

    this.name = name;
    this.playerType = playerType;
    this.gameType = gameType;
    this.chips = this.setChips();
  }

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

  // プレイヤーがベットした金額を取得する
  get getBet(): number {
    if (!this.bet) return 0;
    return this.bet;
  }
  // プレイヤーがベットした金額を設定する
  set setBet(bet: number) {
    this.bet = bet;
  }

  // プレイヤーが獲得した賞金を取得
  get getWinAmount(): number {
    return this.winAmount;
  }

  // プレイヤーが獲得した賞金を設定する
  set setWinAmount(winAmount: number) {
    this.winAmount = winAmount;
  }

  // プレイヤーが選択したアクションを取得
  // get getAction(): string {
  //   return this.action;
  // }

  // プレイヤーが選択したアクションを設定
  set setAction(action: string) {
    this.action = action;
  }

  // 手札を空にする
  clearHand() {
    this.hand = [];
  }

  // プレイヤーのチップを設定する
  // localStorageにチップがある場合はそのチップをセット
  setChips() {
    let chips = this.storage.get('chips');
    if (!chips) {
      chips = 1000;
    }
    return chips;
  }

  // 手札にカードを加える
  addCardToHand(card: Card) {
    this.hand.push(card);
  }
}
