export class EndGameScene extends Phaser.Scene {

  public funds: any;

  constructor() {
    super('endGame');
  }

  init(data: any) {
    this.funds = data.funds;
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');
    this.add.text(width / 2, height / 2 - 50, "もう一度遊びますか？", { fontSize: '60px' }).setOrigin(0.5);


    // Yesボタン
    const zone_yes = this.add.zone(width / 2 - 150, height / 2 + 200, 200, 80);
    const text_yes = this.add.text(0, 0, 'YES', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定します。
    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(text_yes, zone_yes);
    // Zoneをクリックできるように設定
    zone_yes.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });
    // YesをクリックしたらWar開始画面に遷移
    zone_yes.on('pointerdown', () => {
      this.scene.start('betting', { timelineID: 'start', 'funds': this.funds });
    });

    // Noボタン
    const zone_no = this.add.zone(width / 2 + 150, height / 2 + 200, 200, 80);
    const text_no = this.add.text(0, 0, 'NO', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定します。
    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(text_no, zone_no);
    // Zoneをクリックできるように設定
    zone_no.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });
    // Noをクリックしたら最初の画面に遷移
    zone_no.on('pointerdown', () => {
      window.location.href = 'http://localhost:3001/';
    });

    this.load.start();
  }
}
