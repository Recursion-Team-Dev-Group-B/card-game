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

  // ActionButton
  dealButton!: Button;
  resetButton!: Button;

  // button
  betButton10!: Button;
  betButton20!: Button;
  betButton50!: Button;
  betButton100!: Button;
  betButton200!: Button;
  betButtons: Button[] = [];

  constructor() {
    super('blackjackStackScene');
  }

  preload() {
    super.preload();
  }

  create() {
    super.create('blackjackGame');
    // 前のゲームのボタンが残っているため初期化
    this.betButtons = [];
    this.displayBetButtons();
    this.displayDealButton();
    this.displayResetButton();
  }

  update(): void {}

  private displayBetButtons(): void {
    this.createBetButtons();

    for (let i = 0; i < this.betButtons.length; i++) {
      this.betButtons[i].setX(200 * (1 + i));
    }
  }

  private createBetButtons() {
    this.betButton10 = new Button(this, 0, 350, 'button', '10');
    this.betButtons.push(this.betButton10);
    this.betButton10.setClickHandler(() => {
      this.clickBetButton(this.betButton10);
    });
    this.betButton20 = new Button(this, 0, 350, 'button', '20');
    this.betButtons.push(this.betButton20);
    this.betButton20.setClickHandler(() => {
      this.clickBetButton(this.betButton20);
    });
    this.betButton50 = new Button(this, 0, 350, 'button', '50');
    this.betButtons.push(this.betButton50);
    this.betButton50.setClickHandler(() => {
      this.clickBetButton(this.betButton50);
    });
    this.betButton100 = new Button(this, 0, 350, 'button', '100');
    this.betButtons.push(this.betButton100);
    this.betButton100.setClickHandler(() => {
      this.clickBetButton(this.betButton100);
    });
    this.betButton200 = new Button(this, 0, 350, 'button', '200');
    this.betButtons.push(this.betButton200);
    this.betButton200.setClickHandler(() => {
      this.clickBetButton(this.betButton200);
    });
  }

  private clickBetButton(button: Button) {
    let totalBet = Number(this.storage.get('bet'));
    const clickedBet = Number(button.text);
    const chips = Number(this.storage.get('chips'));

    if (totalBet + clickedBet <= chips) {
      totalBet = this.addBet(clickedBet);
      // 現在のベット金額とクリックしたチップの合計が所持金を上回る場合は、チップを非表示
      this.betButtons.forEach((button: Button) => {
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
        this.dealButton.hide();
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
    this.betButton10.show();
    this.betButton20.show();
    this.betButton50.show();
    this.betButton100.show();
    this.betButton200.show();
    this.storage.set('bet', 0);
    this.bet.setText('bet: 0');
  }
}

export default StackScene;
