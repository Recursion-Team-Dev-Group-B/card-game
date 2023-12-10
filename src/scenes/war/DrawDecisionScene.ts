export class DrawDecisionScene extends Phaser.Scene {

  public funds: any;
  public bet_choice: any;

  constructor() {
    super('cardResult_D');
  }

  init(data: any) {
    this.funds = data.funds;
    this.bet_choice = data.bet_choice;
  }

  preload() {
  }
  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');
    this.add.text(width / 2, height / 2 - 150, '引き分けです', { fontSize: '80px' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 70, '再戦しますか？', { fontSize: '48px' }).setOrigin(0.5);


    // サレンダーボタン
    const zone_surrender = this.add.zone(width / 2 - 150, height / 2 + 200, 200, 80);
    const text_surrender = this.add.text(0, 0, 'サレンダーする', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定します。
    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(text_surrender, zone_surrender);
    // Zoneをクリックできるように設定
    zone_surrender.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });
    // サレンダーをクリックしたら結果の画面に遷移
    zone_surrender.on('pointerdown', () => {
      this.scene.start('surrender_result', { timelineID: 'start', 'funds': this.funds, 'bet_choice': this.bet_choice });
    });

    // 再戦ボタン
    const zone_rewar = this.add.zone(width / 2 + 150, height / 2 + 200, 200, 80);
    const text_rewar = this.add.text(0, 0, '再戦する', {
      font: '32px Arial',
      color: '#FFFF00'
    }).setOrigin(0.5, 0.5); // テキストのオリジンを中央に設定します。
    // 実際に配置してもらう
    Phaser.Display.Align.In.Center(text_rewar, zone_rewar);
    // Zoneをクリックできるように設定
    zone_rewar.setInteractive({
      useHandCursor: true  // マウスオーバーでカーソルが指マークになる
    });
    // 再戦をクリックしたら再戦用のベッティング画面に遷移
    zone_rewar.on('pointerdown', () => {
      this.scene.start('rewar_betting', { timelineID: 'start', 'funds': this.funds, 'bet_choice': this.bet_choice });
    });

    this.load.start();
  }


}
