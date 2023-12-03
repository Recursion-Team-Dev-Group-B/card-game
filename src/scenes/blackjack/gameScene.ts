'use client';
import { useState, useEffect } from 'react';
import * as Phaser from 'phaser';
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';
import BaseGameScene from '@/scenes/BaseGameScene';

import STYLE from '@/constants/style';
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;

const GameScene = () => {
  const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
  const loadGame = async () => {
    class BlackjackScene extends BaseGameScene {
      tableImage: Image | undefined;
      players: BlackjackPlayer[] = [];
      gameZone: Zone | undefined;
      handZones: Zone[] = [];
      playerNames: Text[] = [];
      width: number = 0;
      height: number = 0;
      playerScoreTexts: Text[] = [];

      constructor() {
        super('blackjackGame');
      }

      preload() {
        super.preload();
      }

      create() {
        super.create('blackjackGame');
        this.createPlayerNameTexts();
        this.createHandZones();
        this.createPlayerScoreTexts();
        this.dealTwoCards();
        // this.displayPlayerScores();

        // 画面中央に画像とテキストを配置
        // this.load.start();
      }

      // ゲームが始まってから行う処理
      // Todo BaseGameSceneなどに持たせる

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
              -30,
            );
          } else if (player.playerType === 'house') {
            Phaser.Display.Align.In.TopCenter(
              playerNameText as Text,
              this.gameZone as Zone,
              0,
              -30,
            );
          } else if (player.playerType === 'cpu') {
            Phaser.Display.Align.In.TopCenter(
              playerNameText as Text,
              this.gameZone as Zone,
              0,
              -30,
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

        this.time.delayedCall(300, () => {
          this.dealCard(player, playerHandZone.x - 10, playerHandZone.y);
        });

        this.time.delayedCall(600, () => {
          this.dealCard(house, houseHandZone.x - 10, houseHandZone.y);
        });

        this.time.delayedCall(900, () => {
          this.dealCard(player, playerHandZone.x + 10, playerHandZone.y);
        });

        this.time.delayedCall(1200, () => {
          this.dealCard(house, houseHandZone.x + 10, houseHandZone.y, true);
        });
        this.displayCardsScore(true);
      }

      dealCard(
        player: BlackjackPlayer,
        x: number,
        y: number,
        isFaceDown = false,
      ) {
        const card: Card | undefined = this.deck?.drawOne();
        if (!card) return;

        card.setDisplaySize(100, 120).setX(x).setY(y);
        this.add.existing(card);
      }

      private createPlayerScoreTexts(): void {
        // NOTE: 前回のゲームで作成したものが残っている可能性があるので、初期化する
        this.playerScoreTexts = [];
        this.players.forEach((player, index) => {
          const playerScoreText = this.add.text(0, 200, '', STYLE.TEXT);

          if (player.playerType === 'player') {
            Phaser.Display.Align.To.TopCenter(
              playerScoreText as Text,
              this.handZones[index] as Zone,
              0,
              0,
            );
          } else if (player.playerType === 'house') {
            Phaser.Display.Align.To.BottomCenter(
              playerScoreText as Text,
              this.handZones[index] as Zone,
              0,
              0,
            );
          }

          this.playerScoreTexts.push(playerScoreText);
        });
      }

      private displayCardsScore(hideHouseScore: boolean): void {
        this.players.forEach((player, index) => {
          const playerScoreText = this.playerScoreTexts[index];

          if (player.playerType === 'player') {
            playerScoreText.setText(player.getHandScore().toString());
            Phaser.Display.Align.To.TopCenter(
              playerScoreText as Text,
              this.handZones[index] as Zone,
              0,
              0,
            );
          }

          if (player.playerType === 'house') {
            if (!hideHouseScore) {
              playerScoreText.setText(player.getHandScore().toString());
              Phaser.Display.Align.To.BottomCenter(
                playerScoreText as Text,
                this.handZones[index] as Zone,
                0,
                0,
              );
            }
          }
        });
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
