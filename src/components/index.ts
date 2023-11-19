import * as Phaser from 'phaser';

const Index = () => {
  const loadGame = async () => {
    class MyScene extends Phaser.Scene {
      constructor() {
        super('myscene');
      }

      preload() {
        // アセット読み込み
        this.load.image('street', '/assets/street.png');
        this.load.image('robot', '/assets/robot.png');
      }

      create() {
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
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-app', // #game-app内にcanvasを生成
      scene: [MyScene],
    };

    new Phaser.Game(config);
  };
  loadGame();

  return null;
};

export default Index;
