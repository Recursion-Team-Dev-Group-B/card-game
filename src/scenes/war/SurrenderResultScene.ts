export class SurrenderResultScene extends Phaser.Scene {
  public funds: any;
  public bet_choice: any;

  constructor() {
    super('surrender_result');
  }

  init(data: any) {
    this.funds = data.funds;
    this.bet_choice = data.bet_choice;
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');

    this.funds -= this.bet_choice / 2;

    this.add.text(width / 2, height / 2 - 150, "サレンダーしました", { fontSize: '80px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 100, "資金は$" + this.funds + "となりました", { fontSize: '60px' }).setOrigin(0.5);

    // 次の画面（War終了を決める）に遷移するための仕込み
    // zoneの範囲を決める。
    const betResult_zone = this.add.zone(width / 2, height / 2 + 300, 200, 80);

    // テキストオブジェクトを作成
    const betResult_zone__text = this.add.text(0, 0, '次へ', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定。

    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(betResult_zone__text, betResult_zone);

    // Zoneをクリックできるように設定
    betResult_zone.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });

    // Zoneをクリックしたらもう一度遊ぶかを選択する画面に遷移
    betResult_zone.on('pointerdown', () => {
      this.scene.start('endGame', { timelineID: 'start', "funds": this.funds });
    });

    this.load.start();

  }


}
