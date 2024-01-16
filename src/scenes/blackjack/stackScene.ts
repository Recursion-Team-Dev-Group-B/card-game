// model, class
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import Button from '@/models/common/button';
import Chip from '@/models/common/chip';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';
// Scene
import BaseGameScene from '@/scenes/BaseGameScene';
// Style
import STYLE from '@/constants/style';
// Phaser関連の型
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;

class StackScene extends BaseGameScene {
  tableImage: Image | undefined;
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  playerScoreTexts: Text[] = [];

  // Todo 別ファイルに記載
  CARD_WIDTH = 100;
  CARD_HEIGHT = 120;

  // ActionButton
  dealButton!: Button;
  resetButton!: Button;

  // Chip
  Chip10!: Chip;
  Chip20!: Chip;
  Chip50!: Chip;
  Chip100!: Chip;
  Chip200!: Chip;
  Chips: Chip[] = [];

  constructor() {
    super('blackjackStackScene');
  }

  create() {
    super.create('blackjackGame');
    // 前のゲームのボタンが残っているため初期化
    this.Chips = [];
    this.displayBetChips();
    this.displayDealButton();
    this.displayResetButton();
  }

  update(): void { }

  private displayBetChips(): void {
    this.createChips();

    for (let i = 0; i < this.Chips.length; i++) {
      this.Chips[i].setX((this.width / 6) * (1 + i));
    }
  }

  private createChips() {
    this.Chip10 = new Chip(this, 0, this.height / 2, 'chipGray', '10');
    this.Chips.push(this.Chip10);
    this.Chip10.clickHandler(() => {
      this.clickBetChip(this.Chip10);
    });
    this.Chip20 = new Chip(this, 0, this.height / 2, 'chipBlue', '20');
    this.Chips.push(this.Chip20);
    this.Chip20.clickHandler(() => {
      this.clickBetChip(this.Chip20);
    });
    this.Chip50 = new Chip(this, 0, this.height / 2, 'chipRed', '50');
    this.Chips.push(this.Chip50);
    this.Chip50.clickHandler(() => {
      this.clickBetChip(this.Chip50);
    });
    this.Chip100 = new Chip(this, 0, this.height / 2, 'chipGreen', '100');
    this.Chips.push(this.Chip100);
    this.Chip100.clickHandler(() => {
      this.clickBetChip(this.Chip100);
    });
    this.Chip200 = new Chip(this, 0, this.height / 2, 'chipOrange', '200');
    this.Chips.push(this.Chip200);
    this.Chip200.clickHandler(() => {
      this.clickBetChip(this.Chip200);
    });
  }

  private clickBetChip(button: Chip) {
    let totalBet = Number(this.storage.get('bet'));
    const clickedBet = Number(button.text);
    const chips = Number(this.storage.get('chips'));

    if (totalBet + clickedBet <= chips) {
      totalBet = this.addBet(clickedBet);
      const animationChip = new Button(this, button.x, button.y, button.texture.key, "")

      // Tweenを作成する
      this.tweens.add({
        targets: animationChip,
        x: this.width / 2,       // 最終的なX座標
        y: -100,       // 最終的なY座標
        ease: 'Power1',  // イージング（アニメーションの速度変化）
        duration: 600,  // アニメーションの期間（ミリ秒）
        repeat: 0,       // 繰り返し回数
        yoyo: false      // Yoyo効果（アニメーションを逆再生するかどうか）
      });

      // 現在のベット金額とクリックしたチップの合計が所持金を上回る場合は、チップを非表示
      this.Chips.forEach((button: Chip) => {
        if (totalBet + Number(button.text) > chips) {
          button.hide();
        }
      });
    }
    if (totalBet) {
      this.dealButton.show();
      this.resetButton.show();
    }
  }

  private addBet(extraBet: number): number {
    let bet: number = Number(this.storage.get('bet'));
    bet += extraBet;
    this.storage.set('bet', bet);
    // 掛け金の表示更新
    this.bet.setText(`bet: ${String(bet)}`);

    return bet;
  }

  private displayDealButton(): void {
    this.dealButton = new Button(this, this.width / 2 + 150, this.height / 2 + 150, 'button', 'Deal');
    this.dealButton.hide();
    this.dealButton.clickHandler(() => {
      if (this.bet) {
        this.scene.start('blackjackGame');
      }
    });
    Phaser.Display.Align.In.Center(this.dealButton.GOText, this.dealButton);
  }

  private displayResetButton(): void {
    this.resetButton = new Button(this, this.width / 2 - 150, this.height / 2 + 150, 'button', 'Reset');
    this.resetButton.hide();

    this.resetButton.clickHandler(() => {
      if (this.bet) {
        this.resetBet();
        this.dealButton.hide();
      }
    });
    Phaser.Display.Align.In.Center(this.resetButton.GOText, this.resetButton);
  }

  private resetBet() {
    this.Chip10.show();
    this.Chip20.show();
    this.Chip50.show();
    this.Chip100.show();
    this.Chip200.show();
    this.storage.set('bet', 0);
    this.bet.setText('bet: 0');
  }
}

export default StackScene;
