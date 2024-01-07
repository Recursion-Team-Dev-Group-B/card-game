import Phaser from 'phaser';

// model, class
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import Button from '@/models/common/button';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';
// Scene
import BaseGameScene from '@/scenes/BaseGameScene';
// Phaser関連の型
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;

class LoadingScene extends Phaser.Scene {
  tableImage: Image | undefined;
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  playerScoreTexts: Text[] = [];

  // ボタン
  standButton: Button | undefined;
  hitButton: Button | undefined;
  doubleButton: Button | undefined;
  // Todo 別ファイルに記載
  CARD_WIDTH = 100;
  CARD_HEIGHT = 120;

  constructor() {
    super('Loading');
  }

  preload() {
    // テーブル画像をロード
    this.load.image('blackjackTable', '/game/blackjack/blackjackTable.jpeg');
    // トランプカードをロード
    this.load.image('club_A', '/game/common/images/cards/club_A.png');
    this.load.image('club_2', '/game/common/images/cards/club_2.png');
    this.load.image('club_3', '/game/common/images/cards/club_3.png');
    this.load.image('club_4', '/game/common/images/cards/club_4.png');
    this.load.image('club_5', '/game/common/images/cards/club_5.png');
    this.load.image('club_6', '/game/common/images/cards/club_6.png');
    this.load.image('club_7', '/game/common/images/cards/club_7.png');
    this.load.image('club_8', '/game/common/images/cards/club_8.png');
    this.load.image('club_9', '/game/common/images/cards/club_9.png');
    this.load.image('club_10', '/game/common/images/cards/club_10.png');
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
    this.load.image('diamond_10', '/game/common/images/cards/diamond_10.png');
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
    this.load.image('heart_10', '/game/common/images/cards/heart_10.png');
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
    this.load.image('spade_10', '/game/common/images/cards/spade_10.png');
    this.load.image('spade_J', '/game/common/images/cards/spade_J.png');
    this.load.image('spade_Q', '/game/common/images/cards/spade_Q.png');
    this.load.image('spade_K', '/game/common/images/cards/spade_K.png');
    this.load.image('back_card', '/game/common/images/cards/back_card.png');
    this.load.image('button', '/game/common/button/button.png');
    this.load.image('chipBlack', '/game/common/chip/chipBlack.png');
    this.load.image('chipBlue', '/game/common/chip/chipBlue.png');
    this.load.image('chipBrown', '/game/common/chip/chipBrown.png');
    this.load.image('chipGreen', '/game/common/chip/chipGreen.png');
    this.load.image('chipGray', '/game/common/chip/chipGray.png');
    this.load.image('chipGreen', '/game/common/chip/chipGreen.png');
    this.load.image('chipOrange', '/game/common/chip/chipOrange.png');
    this.load.image('chipPink', '/game/common/chip/chipPink.png');
    this.load.image('chipPurple', '/game/common/chip/chipPurple.png');
    this.load.image('chipRed', '/game/common/chip/chipRed.png');
    this.load.image('chipYellow', '/game/common/chip/chipYellow.png');

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;
    let loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    let percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff',
      },
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value: any) {
      percentText.setText(parseInt((value * 100) as any) + '%');
    });

    this.load.on('complete', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0, () => { });
    });
  }

  create() {
    this.width = Number(this.game.canvas.width);
    this.height = Number(this.game.canvas.height);

    // // Loading完了時
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start('blackjackStackScene');
      },
    );
  }

  update() { }
}

export default LoadingScene;
