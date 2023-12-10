export class ReWarBettingScene extends Phaser.Scene {

  private amountText: Phaser.GameObjects.Text;
  public funds: any;
  public bet_choice: any;

  constructor() {
    super('rewar_betting');
    this.amountText = null as any;
  }

  init(data: any) {
    this.funds = data.funds;
    this.bet_choice = data.bet_choice;
  }

  preload() {
    this.load.image('ante', '/game/war/ante.png');
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');

    this.add.text(width / 2, height / 2 - 250, '再戦時の賭け金は最初の賭け金と同額になります', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 200, 'あなたの所持金は$' + this.funds + 'です', { fontSize: '24px' }).setOrigin(0.5);

    // Anteの画像
    this.add.image(width / 2 - 150, height / 2, 'ante').setScale(0.25, 0.25);

    // 賭け金の表示
    this.amountText = this.add.text(width / 2 + 100, height / 2, this.bet_choice.toString(), {
      font: '60px Arial',
      color: '#FFF000'
    }).setInteractive().setOrigin(0.5, 0.5);


    // 次の画面（再戦のカードを出す）に遷移するための仕込み
    // zoneの範囲を決める。
    const next_zone = this.add.zone(width / 2, height / 2 + 300, 200, 80);

    // テキストオブジェクトを作成
    const next_zone__text = this.add.text(0, 0, '再戦へ', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定。

    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(next_zone__text, next_zone);

    // Zoneをクリックできるように設定
    next_zone.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });

    // Zoneをクリックしたらもう一度遊ぶかを選択する画面に遷移
    next_zone.on('pointerdown', () => {
      this.scene.start('rewar_card_dist', { timelineID: 'start', 'funds': this.funds, 'bet_choice': this.bet_choice });
    });

    this.load.start();
  }

}
