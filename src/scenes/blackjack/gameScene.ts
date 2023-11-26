'use client';
import { useState, useEffect } from 'react';
import * as Phaser from 'phaser';
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';

import STYLE from '@/constants/style';
import Zone = Phaser.GameObjects.Zone;
import Text = Phaser.GameObjects.Text;
import Image = Phaser.GameObjects.Image;

const GameScene = () => {
  const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
  const loadGame = async () => {
    class BlackjackScene extends Phaser.Scene {
      tableImage: Image | undefined;
      players: BlackjackPlayer[] = [];
      deck: Deck | undefined;
      gameZone: Zone | undefined;
      handZones: Zone[] = [];
      playerNames: Text[] = [];
      width: number = 0;
      height: number = 0;

      constructor() {
        super('blackjackGame');
      }

      preload() {
        // テーブル画像をロード
        this.load.image('table', '/game/blackjack/table.png');
        this.load.image('table1', '/game/blackjack/table1.png');
        this.load.image('blackTable', '/game/blackjack/blackjackTable.jpg');
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
        this.load.image('back_card', '/game/common/images/cards/back_card.png');
      }

      create() {
        this.initGame();
        this.placeTableImage();
        this.createGameZone();
        this.createPlayerNameTexts();
        this.createHandZones();
        this.dealTwoCards();

        // 画面中央に画像とテキストを配置
        this.load.start();
      }

      // ゲームが始まってから行う処理
      // Todo BaseGameSceneなどに持たせる
      initGame(): void {
        this.width = Number(this.game.canvas.width);
        this.height = Number(this.game.canvas.height);

        // Blackjackプレイヤー作成
        this.players = [
          new BlackjackPlayer('player1', 'player', 'blackjack', 1000, 0, 100),
          new BlackjackPlayer('house1', 'house', 'blackjack', 1000, 0, 100),
        ];

        // デッキ作成
        this.deck = new Deck(this.sys.scene);
        // シャッフル
        this.deck.shuffle();
      }

      // Blackjackのテーブル画像を配置
      placeTableImage(): void {
        // スケールを計算（目的の横幅 / 元の画像の横幅）
        this.tableImage = this.add.image(0, 0, 'table').setOrigin(0);
        // スケールを計算（目的の横幅 / 元の画像の横幅）
        const scale = this.width / this.tableImage.width;
        // 計算したスケールを適用
        this.tableImage.setScale(scale);
      }

      // GameZoneを作成
      createGameZone(): void {
        this.gameZone = this.add
          .zone(0, 0, this.width, this.height)
          .setOrigin(0);
        // this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height);
        // .setOrigin(0);

        // のちのち returnの手前まで削除。
        // Zoneがどの範囲か分かるように記載
        // Graphics オブジェクトの作成
        const graphics = this.add.graphics();
        // 枠線のスタイルを設定
        graphics.lineStyle(5, 0x00ff00, 1);
        // Zone の位置とサイズに合わせて枠線を描画
        graphics.strokeRect(
          this.gameZone.x,
          this.gameZone.y,
          this.gameZone.width,
          this.gameZone.height,
        );
      }

      // プレイヤーの名前を作成
      protected createPlayerNameTexts(): void {
        this.playerNames = []; // 前回のゲームで作成したものが残っている可能性があるので、初期化する
        this.players.forEach((player) => {
          const playerNameText = this.add.text(
            0,
            300,
            player.name,
            STYLE.PLAYER_NAME,
          );

          if (player.playerType === 'player') {
            Phaser.Display.Align.In.BottomCenter(
              playerNameText as Text,
              this.gameZone as Zone,
              0,
              -20,
            );
          } else if (player.playerType === 'house') {
            Phaser.Display.Align.In.TopCenter(
              playerNameText as Text,
              this.gameZone as Zone,
              0,
              -20,
            );
          } else if (player.playerType === 'cpu') {
            Phaser.Display.Align.In.TopCenter(
              playerNameText as Text,
              this.gameZone as Zone,
              0,
              -20,
            );
          }
          this.playerNames.push(playerNameText);
        });
      }

      protected createHandZones(): void {
        this.handZones = []; // 前回のゲームで作成したものが残っている可能性があるので、初期化する
        const cardWidth = 50;
        const cardHeight = 100;
        this.players.forEach((player, index) => {
          const playerHandZone = this.add.zone(0, 0, cardWidth, cardHeight);

          if (player.playerType === 'player') {
            Phaser.Display.Align.To.TopCenter(
              playerHandZone as Zone,
              this.playerNames[index],
              0,
              STYLE.GUTTER_SIZE,
            );
          } else if (player.playerType === 'house') {
            Phaser.Display.Align.To.BottomCenter(
              playerHandZone as Zone,
              this.playerNames[index],
              0,
              STYLE.GUTTER_SIZE,
            );
          } else if (player.playerType === 'cpu') {
            Phaser.Display.Align.To.BottomCenter(
              playerHandZone as Zone,
              this.playerNames[index],
              0,
              STYLE.GUTTER_SIZE,
            );
          }
          // aiが存在する場合は、個別に位置の設定が必要。
          this.handZones.push(playerHandZone);
        });
      }

      dealTwoCards(): void {
        const player = this.players[0];
        const playerHandZone = this.handZones[0];
        const house = this.players[1];
        const houseHandZone = this.handZones[1];

        const firstCard = this.deck!.cardList[0].setDisplaySize(100, 120)
          .setX(100)
          .setY(100);
        const secondCard = this.deck!.cardList[1].setDisplaySize(100, 120)
          .setX(300)
          .setY(100);

        // // タイマーイベントを作成
        // this.time.addEvent({
        //   delay: dealInterval,
        //   callback: dealCard,
        //   // loop: true,  // 繰り返し実行する場合はこの行を有効にする
        //   repeat: 5, // 繰り返し回数（-1で無限に繰り返し）
        // });

        console.log(this.deck!.cardList);
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
      }
    }

    const MAX_SIZE_WIDTH_SCREEN = 1920;
    const MAX_SIZE_HEIGHT_SCREEN = 1080;
    const MIN_SIZE_WIDTH_SCREEN = 270;
    const MIN_SIZE_HEIGHT_SCREEN = 480;
    const SIZE_WIDTH_SCREEN = 540;
    const SIZE_HEIGHT_SCREEN = 960;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.FIT,
      // scale: {
      //   parent: 'blackjackGame',
      //   width: SIZE_WIDTH_SCREEN,
      //   height: SIZE_HEIGHT_SCREEN,
      //   min: {
      //     width: MIN_SIZE_WIDTH_SCREEN,
      //     height: MIN_SIZE_HEIGHT_SCREEN,
      //   },
      //   max: {
      //     width: MAX_SIZE_WIDTH_SCREEN,
      //     height: MAX_SIZE_HEIGHT_SCREEN,
      //   },
      // },
      // width: window.innerWidth * window.devicePixelRatio,
      // height: window.innerHeight * window.devicePixelRatio,
      width: 1200,
      height: 780,
      parent: 'blackjackGame',
      scene: [BlackjackScene],
    };
    setConfig(config);
    const game = new Phaser.Game(config);
  };

  if (!config) {
    loadGame();
  }
  // useEffect(() => {
  //   loadGame();
  // }, []);

  return null;
};

export default GameScene;
