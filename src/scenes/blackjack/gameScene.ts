import * as Phaser from 'phaser';
import Zone = Phaser.GameObjects.Zone;

const GameScene = () => {
  const loadGame = async () => {
    class BlackjackScene extends Phaser.Scene {
      protected gameZone: Zone | undefined;

      constructor() {
        super('blackjackGame');
      }

      preload() {
        // アセット読み込み
        this.load.image('street', '/assets/street.png');
        this.load.image('robot', '/assets/robot.png');
      }

      create() {
        this.createGameZone();
        this.add.image(0, 0, this.bgKey).setOrigin(0);

        // 画面中央に画像とテキストを配置
        this.add.image(400, 300, 'street');
        this.add.image(400, 300, 'robot');
        this.add
          .text(400, 300, 'Hello World', {
            fontFamily: 'arial',
            fontSize: '60px',
          })
          .setOrigin(0.5);
        this.load.start();
      }

      createGameZone(): void {
        this.gameZone = this.add.zone(800, 800, 800, 800);
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'blackjackGame', // #blackjackGame内にcanvasを生成
      scene: [BlackjackScene],
    };

    new Phaser.Game(config);
  };

  loadGame();

  return null;
};

export default GameScene;
