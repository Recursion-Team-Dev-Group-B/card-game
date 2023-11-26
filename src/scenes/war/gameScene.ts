'use client';
import { useState } from 'react';
import * as Phaser from 'phaser';
import Deck from '@/models/common/deck';
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
        this.load.image('club_A', '/game/common/images/cards/club_A.png');
        this.load.image('club_2', '/game/common/images/cards/club_2.png');
        this.load.image('club_3', '/game/common/images/cards/club_3.png');
        this.load.image('club_4', '/game/common/images/cards/club_4.png');
        this.load.image('club_5', '/game/common/images/cards/club_5.png');
        this.load.image('club_6', '/game/common/images/cards/club_6.png');
        this.load.image('club_7', '/game/common/images/cards/club_7.png');
        this.load.image('club_8', '/game/common/images/cards/club_8.png');
        this.load.image('club_9', '/game/common/images/cards/club_9.png');
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
        this.load.image('spade_J', '/game/common/images/cards/spade_J.png');
        this.load.image('spade_Q', '/game/common/images/cards/spade_Q.png');
        this.load.image('spade_K', '/game/common/images/cards/spade_K.png');
      }

      create() {
        const deck = new Deck(this.sys.scene);

        // const gameZone = this.createGameZone();
        // Zoneをクリックできるように設定
        // gameZone.setInteractive({
        //   useHandCursor: true, // マウスオーバーでカーソルが指マークになる
        // });
        // // ZoneをクリックしたらMainSceneに遷移
        // gameZone.on('pointerdown', () => {
        //   console.log('aa');
        // });

        // テーブルをシーンに追加
        this.tableImage = this.add.image(0, 0, 'table').setOrigin(0);
        // トランプカードを仮で配置
        deck.shuffle();
        const firstCard = deck.cardList[0]
          .setDisplaySize(200, 200)
          .setX(100)
          .setY(100);
        const secondCard = deck.cardList[1]
          .setDisplaySize(200, 200)
          .setX(300)
          .setY(100);
        console.log(deck.cardList);
        // console.log(firstCard);
        console.log(secondCard);
        this.add.existing(firstCard);
        this.add.existing(secondCard);
        // Phaser.Display.Align.In.Center(
        //   firstCard as Phaser.GameObjects.GameObject,
        //   this.add.zone(0, 0, 50, 50),
        // );
        // const clubImage = this.add.image(0, 0, 'club_A').setOrigin(0);
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
