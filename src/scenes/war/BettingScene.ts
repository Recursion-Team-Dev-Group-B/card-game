export class BettingScene extends Phaser.Scene {

  private amountText: Phaser.GameObjects.Text;
  private choices: number[] = [100, 200, 300, 400, 500];
  private bet_choice: number = 0;
  public funds: any;

  constructor() {
    super('betting');
    this.amountText = null as any;
  }

  init(data: any) {
    this.funds = data.funds;
  }

  preload() {
    this.load.image('ante', '/game/war/ante.png');
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');

    // 初期化
    if (this.funds === undefined) {
      this.funds = 2000;
    }
    if (this.bet_choice != 0) {
      this.bet_choice = 0;
    }

    this.add.text(width / 2, height / 2 - 250, '賭け金を決定してください', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 200, 'あなたの所持金は$' + this.funds + 'です', { fontSize: '24px' }).setOrigin(0.5);

    // Anteの画像
    this.add.image(width / 2 - 250, height / 2, 'ante').setScale(0.25, 0.25);

    // 賭け金の選択
    this.amountText = this.add.text(width / 2, height / 2, this.bet_choice.toString(), {
      font: '60px Arial',
      color: '#FFF000'
    }).setInteractive().setOrigin(0.5, 0.5);

    // 選択肢を表示し、クリックイベントを設定する関数
    this.showChoices();

    // 次の画面（双方のトランプ表示）に遷移するための仕込み
    // zoneの範囲を決める。
    const bet_decision_zone = this.add.zone(width / 2, height / 2 + 300, 200, 80);

    // zoneは賭け金の確定ボタンとする。
    // テキストオブジェクトを作成
    const bet_decision_text = this.add.text(0, 0, '確定ボタン', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定

    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(bet_decision_text, bet_decision_zone);

    // Zoneをクリックできるように設定
    bet_decision_zone.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });

    // ZoneをクリックしたらCardDistSceneに遷移
    bet_decision_zone.on('pointerdown', () => {
      this.scene.start('cardDist', { timelineID: 'start', 'bet_choice': this.bet_choice, 'funds': this.funds });
    });



  }

  private showChoices() {
    const { width, height } = this.game.canvas;

    this.choices.forEach((choice, index) => {
      let choiceText = this.add.text(width / 2 + 200, height / 2 - 100 + index * 50, choice.toString(), {
        font: '32px Arial',
        color: '#FFFFFF'
      }).setInteractive().setOrigin(0.5, 0.5);

      choiceText.on('pointerdown', () => {
        this.bet_choice = choice; // ここで選択肢を更新
        this.amountText.setText(choice.toString()); // テキストを更新
      });
    });
  }



}
