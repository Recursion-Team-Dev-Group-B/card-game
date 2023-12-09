// model, class
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import Button from '@/models/common/button';
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

  // Button
  dealButton!: Button;
  resetButton!: Button;

  constructor() {
    super('blackjackStackScene');
  }

  preload() {
    super.preload();
  }

  create() {
    super.create('blackjackGame');
    this.displayBetButtons();
    this.displayDealButton();
    this.displayResetButton();
  }

  update(): void {}

  private displayBetButtons(): void {
    const buttons = this.createBetButtons();

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].setX(200 * (1 + i));
    }
  }

  private createBetButtons(): Button[] {
    const buttons: Button[] = [];
    const numberList = [10, 50, 100, 200];
    numberList.forEach((bet) => {
      const betButton = new Button(this, 0, 350, 'button', String(bet));
      betButton.setClickHandler(() => {
        let totalBet = Number(this.storage.get('bet'));
        const clickedBet = Number(betButton.text);
        const chips = Number(this.storage.get('chips'));

        if (totalBet + clickedBet <= chips) {
          totalBet = this.addBet(clickedBet);
          this.dealButton.show();
          // 現在のベット金額とクリックしたチップの合計が所持金を上回る場合は、チップを非表示
          buttons.forEach((button: Button) => {
            if (totalBet + Number(button.text) > chips) {
              button.hide();
            }
          });
        }
        if (totalBet) {
          this.resetButton.show();
        }
      });
      buttons.push(betButton);
    });
    return buttons;
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
    this.dealButton = new Button(this, 0, 350, 'button', 'Deal');
    this.dealButton.hide();
    this.dealButton.setClickHandler(() => {
      if (this.bet) {
        this.scene.start('blackjackGame');
      }
    });
    Phaser.Display.Align.In.Center(
      this.dealButton,
      this.gameZone as Zone,
      0,
      200,
    );
    Phaser.Display.Align.In.Center(this.dealButton.GOText, this.dealButton);
  }

  private displayResetButton(): void {
    this.resetButton = new Button(this, 0, 350, 'button', 'Reset');
    this.resetButton.hide();

    this.resetButton.setClickHandler(() => {
      if (this.bet) {
        this.resetBet();
      }
    });
    Phaser.Display.Align.In.Center(
      this.resetButton,
      this.gameZone as Zone,
      -200,
      200,
    );
    Phaser.Display.Align.In.Center(this.resetButton.GOText, this.resetButton);
  }

  private resetBet() {
    this.storage.set('bet', 0);
    this.bet.setText('bet: 0');
  }
}

export default StackScene;
