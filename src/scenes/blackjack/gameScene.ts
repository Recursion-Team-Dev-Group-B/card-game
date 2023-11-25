'use client';
import { useState } from 'react';
import * as Phaser from 'phaser';
import Deck from '@/models/deck';
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;

const GameScene = () => {
  const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
  const loadGame = async () => {
    class BlackjackScene extends Phaser.Scene {
      tableImage: Image | undefined;

      constructor() {
        super('blackjackGame');
      }

      preload() {
        // テーブル画像をロード
        this.load.image('table', '/game/blackjack/table.png');
      }

      create() {
        const deck = new Deck(this.sys.scene);

        const gameZone = this.createGameZone();
        // Zoneをクリックできるように設定
        gameZone.setInteractive({
          useHandCursor: true, // マウスオーバーでカーソルが指マークになる
        });
        // ZoneをクリックしたらMainSceneに遷移
        gameZone.on('pointerdown', () => {
          console.log('aa');
        });

        // トランプカードを仮で配置
        // 画像をシーンに追加
        deck.shuffle();
        const firstCard = deck.cardList[0];
        const secondCard = deck.cardList[1];
        console.log(firstCard);
        console.log(secondCard);
        Phaser.Display.Align.In.Center(
          firstCard as Phaser.GameObjects.GameObject,
          this.add.zone(400, 400, 100, 100),
        );

        // this.tableImage = this.add.image(0, 0, 'table').setOrigin(0);
        // console.log('tableimage', this.tableImage);
        // this.resizeImage();

        // 画面中央に画像とテキストを配置
        this.load.start();
      }

      // GameZoneを作成
      createGameZone(): Zone {
        const width = Number(this.sys.game.config.width);
        const height = Number(this.sys.game.config.height);

        const gameZone = this.add.zone(
          width * 0.5,
          height * 0.5,
          width,
          height,
        );
        return gameZone;
      }

      // 画像のサイズを調整
      // Todo 画面の大きさに合わせて画像を表示する
      resizeImage() {
        const width: number = Number(this.sys.game.config.width);
        const height: number = Number(this.sys.game.config.height);

        // 画像のスケーリング方法をここで定義
        // 例: 画面幅に合わせてスケールを調整
        if (this.tableImage) {
          const scale: number = width / this.tableImage.width;
          this.tableImage.setScale(scale);
          this.scale.resize(width, height);
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'blackjackGame', // #blackjackGame内にcanvasを生成
      scene: [BlackjackScene],
    };
    setConfig(config);
    const game = new Phaser.Game(config);
  };

  if (!config) {
    loadGame();
  }

  return null;
};

export default GameScene;
