import Deck from '@/models/deck';

export class CardDistScene extends Phaser.Scene {

  public game_result: String = "";
  public bet_choice: any;
  public funds: any;

  constructor() {
    super('cardDist');
  }

  init(data: any) {
    this.bet_choice = data.bet_choice;
    this.funds = data.funds;
  }

  preload() {
    this.load.image('club_A', '/game/common/images/cards/club_A.png');
    this.load.image('club_2', '/game/common/images/cards/club_2.png');
    this.load.image('club_3', '/game/common/images/cards/club_3.png');
    this.load.image('club_4', '/game/common/images/cards/club_4.png');
    this.load.image('club_5', '/game/common/images/cards/club_5.png');
    this.load.image('club_6', '/game/common/images/cards/club_6.png');
    this.load.image('club_7', '/game/common/images/cards/club_7.png');
    this.load.image('club_8', '/game/common/images/cards/club_8.png');
    this.load.image('club_9', '/game/common/images/cards/club_9.png');
    this.load.image('club_J', '/game/common/images/cards/club_J.png');
    this.load.image('club_Q', '/game/common/images/cards/club_Q.png');
    this.load.image('club_K', '/game/common/images/cards/club_K.png');
    this.load.image('diamond_A', '/game/common/images/cards/diamond_A.png');
    this.load.image('diamond_2', '/game/common/images/cards/diamond_2.png');
    this.load.image('diamond_3', '/game/common/images/cards/diamond_3.png');
    this.load.image('diamond_4', '/game/common/images/cards/diamond_4.png');
    this.load.image('diamond_5', '/game/common/images/cards/diamond_5.png');
    this.load.image('diamond_6', '/game/common/images/cards/diamond_6.png');
    this.load.image('diamond_7', '/game/common/images/cards/diamond_7.png');
    this.load.image('diamond_8', '/game/common/images/cards/diamond_8.png');
    this.load.image('diamond_9', '/game/common/images/cards/diamond_9.png');
    this.load.image('diamond_J', '/game/common/images/cards/diamond_J.png');
    this.load.image('diamond_Q', '/game/common/images/cards/diamond_Q.png');
    this.load.image('diamond_K', '/game/common/images/cards/diamond_K.png');
    this.load.image('heart_A', '/game/common/images/cards/heart_A.png');
    this.load.image('heart_2', '/game/common/images/cards/heart_2.png');
    this.load.image('heart_3', '/game/common/images/cards/heart_3.png');
    this.load.image('heart_4', '/game/common/images/cards/heart_4.png');
    this.load.image('heart_5', '/game/common/images/cards/heart_5.png');
    this.load.image('heart_6', '/game/common/images/cards/heart_6.png');
    this.load.image('heart_7', '/game/common/images/cards/heart_7.png');
    this.load.image('heart_8', '/game/common/images/cards/heart_8.png');
    this.load.image('heart_9', '/game/common/images/cards/heart_9.png');
    this.load.image('heart_J', '/game/common/images/cards/heart_J.png');
    this.load.image('heart_Q', '/game/common/images/cards/heart_Q.png');
    this.load.image('heart_K', '/game/common/images/cards/heart_K.png');
    this.load.image('spade_A', '/game/common/images/cards/spade_A.png');
    this.load.image('spade_2', '/game/common/images/cards/spade_2.png');
    this.load.image('spade_3', '/game/common/images/cards/spade_3.png');
    this.load.image('spade_4', '/game/common/images/cards/spade_4.png');
    this.load.image('spade_5', '/game/common/images/cards/spade_5.png');
    this.load.image('spade_6', '/game/common/images/cards/spade_6.png');
    this.load.image('spade_7', '/game/common/images/cards/spade_7.png');
    this.load.image('spade_8', '/game/common/images/cards/spade_8.png');
    this.load.image('spade_9', '/game/common/images/cards/spade_9.png');
    this.load.image('spade_J', '/game/common/images/cards/spade_J.png');
    this.load.image('spade_Q', '/game/common/images/cards/spade_Q.png');
    this.load.image('spade_K', '/game/common/images/cards/spade_K.png');
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');
    this.add.text(width / 2 - 200, height / 2 - 200, 'あなたのカード', { fontSize: '40px' }).setOrigin(0.5);
    this.add.text(width / 2 + 200, height / 2 - 200, '相手のカード', { fontSize: '40px' }).setOrigin(0.5);

    // デッキから２つカードを出す
    const deck = new Deck(this.sys.scene);

    deck.shuffle();
    const firstCard = deck.cardList[0]
      .setDisplaySize(200, 300)
      .setX(width / 2 - 200)
      .setY(height / 2 + 60);
    const secondCard = deck.cardList[1]
      .setDisplaySize(200, 300)
      .setX(width / 2 + 200)
      .setY(height / 2 + 60);

    this.add.existing(firstCard);
    this.add.existing(secondCard);

    // 結果を判断し、次に遷移する画面を決めていく。
    // （注意）結果の表示だが、後で消す。後で次のシーンに持っていく。

    // let my_score = firstCard.rank;
    // let house_score = secondCard.rank;
    let my_score = firstCard.rank === 'A' ? 14 : firstCard.getRankNumber();
    let house_score = secondCard.rank === 'A' ? 14 : secondCard.getRankNumber();

    if (my_score > house_score) {
      this.game_result = "win";
      // this.add.text(width / 2, height / 2 - 300, 'あなたの勝ちです！', { fontSize: '40px' }).setOrigin(0.5);
    } else if (my_score < house_score) {
      this.game_result = "lose"
      // this.add.text(width / 2, height / 2 - 300, 'あなたの負けです。。', { fontSize: '40px' }).setOrigin(0.5);
    } else {
      this.game_result = "draw";
      // this.add.text(width / 2, height / 2 - 300, '引き分けです', { fontSize: '40px' }).setOrigin(0.5);
    }

    // 表示してみる！
    // this.add.text(width / 2, height / 2, this.bet_choice.toString(), { fontSize: '60' }).setOrigin(0.5);

    // 次の画面（勝敗の結果表示）に遷移するための仕込み
    // zoneの範囲を決める。
    const result_zone = this.add.zone(width / 2, height / 2 + 300, 200, 80);

    // zoneは賭け金の確定ボタンとする。
    // テキストオブジェクトを作成します。
    const result_zone__text = this.add.text(0, 0, 'バトル！', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定します。

    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(result_zone__text, result_zone);

    // Zoneをクリックできるように設定
    result_zone.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });

    // ZoneをクリックしたらWarResultSceneに遷移
    result_zone.on('pointerdown', () => {
      if (this.game_result == "draw") {
        this.scene.start('cardResult_D', { timelineID: 'start', 'game_result': this.game_result, 'bet_choice': this.bet_choice, 'funds': this.funds });
      } else {
        this.scene.start('cardResult_WL', { timelineID: 'start', 'game_result': this.game_result, 'bet_choice': this.bet_choice, 'funds': this.funds });
        // drawの動作確認のために全てDrawのケースとする
        //this.scene.start('cardResult_D', { timelineID: 'start', 'game_result': this.game_result, 'bet_choice': this.bet_choice, 'funds': this.funds });
      }

    });
    this.load.start();
  }
}
