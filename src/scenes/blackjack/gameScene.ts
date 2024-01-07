'use client';
import { useState, useEffect } from 'react';
import * as Phaser from 'phaser';

// model, class
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import Button from '@/models/common/button';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';
// Scene
import BaseGameScene from '@/scenes/BaseGameScene';
import StackScene from '@/scenes/blackjack/stackScene';
import LoadingScene from '@/scenes/LoadingScene';
// Blackjackで使用する定数
import GameResult from '@/constants/blackjack/GameResult';
import GameStatus from '@/constants/blackjack/GameStatus';
import STYLE from '@/constants/style';
// Phaser関連の型
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;
import TimeEvent = Phaser.Time.TimerEvent;

interface Amount {
  [key: string]: number;
  WIN: number;
  LOSS: number;
  PUSH: number;
  BLACKJACK: number;
  BUST: number;
}

class BlackjackScene extends BaseGameScene {
  tableImage: Image | undefined;
  players: BlackjackPlayer[] = [];
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  playerScoreTexts: Text[] = [];

  gameStatus: GameStatus = GameStatus.START_OF_GAME;

  timeEvent: TimeEvent | undefined;

  // ボタン
  standButton: Button | undefined;
  hitButton: Button | undefined;
  doubleButton: Button | undefined;
  // Todo 別ファイルに記載
  CARD_WIDTH = 100;
  CARD_HEIGHT = 120;

  // カード
  backCard: any

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

    this.time.delayedCall(1500, () => {
      this.displayButtons();
    });
  }

  update(): void {
    let result: GameResult | undefined;

    if (this.gameStatus === GameStatus.ROUND_OVER) {
      result = this.judgeGameResult();
    }

    if (this.gameStatus === GameStatus.END_OF_GAME && result) {
      this.time.delayedCall(1000, () => {
        this.endGame(result as GameResult);
      });
    }
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
          10,
        );
      } else if (player.playerType === 'house') {
        Phaser.Display.Align.To.BottomCenter(
          playerHandZone as Zone,
          this.playerNames[index],
          0,
          10,
        );
      } else if (player.playerType === 'cpu') {
        Phaser.Display.Align.To.BottomCenter(
          playerHandZone as Zone,
          this.playerNames[index],
          0,
          10,
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
      this.dealCard(house, houseHandZone.x + 10, houseHandZone.y, false);
      this.displayCardsScore(true);
    });
  }

  dealCard(
    player: BlackjackPlayer,
    x: number,
    y: number,
    isCardFaceUp = true,
  ) {
    const card: Card | undefined = this.deck?.drawOne();
    if (!card) return;

    player.addCardToHand(card);
    if (isCardFaceUp) {
      card
        .setDisplaySize(this.CARD_WIDTH, this.CARD_HEIGHT)
        .setX(x)
        .setY(y);
      this.add.existing(card);
    } else {
      this.backCard = this.add.image(0, 0, 'back_card');
      this.backCard
        .setDisplaySize(this.CARD_WIDTH, this.CARD_HEIGHT)
        .setX(x)
        .setY(y);
      this.add.existing(this.backCard);
    }
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
          10,
        );
      }

      if (player.playerType === 'house') {
        if (!hideHouseScore) {
          playerScoreText.setText(player.getHandScore().toString());
          Phaser.Display.Align.To.BottomCenter(
            playerScoreText as Text,
            this.handZones[index] as Zone,
            0,
            10,
          );
        }
      }
    });
  }

  private displayButtons(): void {
    this.standButton = this.createStandButton();
    this.hitButton = this.createHitButton();
    this.doubleButton = this.createDoubleButton();

    const buttons: Button[] = [];
    buttons.push(this.standButton);
    buttons.push(this.hitButton);
    buttons.push(this.doubleButton);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].setX(300 * (1 + i));
    }
  }

  private createHitButton(): Button {
    const hitButton = new Button(this, 0, 350, 'button', 'Hit');
    hitButton.setClickHandler(() => this.handleHit());
    return hitButton;
  }

  private createStandButton(): Button {
    const standButton = new Button(this, 0, 350, 'button', 'Stand');
    standButton.setClickHandler(() => this.handleStand());
    return standButton;
  }

  private createDoubleButton(): Button {
    const doubleButton = new Button(this, 0, 350, 'button', 'Double');
    doubleButton.setClickHandler(() => this.handleDouble());
    return doubleButton;
  }

  private handleHit(): void {
    const player = this.players[0];
    const playerHandZone = this.handZones[0];

    this.doubleButton?.hide();

    this.dealCard(
      player,
      playerHandZone.x +
      this.CARD_WIDTH * (player.getCardsNum() * 0.3 - 0.15),
      playerHandZone.y,
    );
    this.displayCardsScore(true);

    if (player.getHandScore() > 21) {
      this.hideButtons();
      this.turnOverCard();
      this.displayCardsScore(false);
      player.gameStatus = 'bust';
      this.gameStatus = GameStatus.ROUND_OVER;
    }
  }

  private handleStand(): void {
    const player = this.players[0];

    this.turnOverCard();
    this.displayCardsScore(false);
    this.hideButtons();

    if (this.isBlackjack(player)) {
      player.gameStatus = 'blackjack';
    } else {
      player.gameStatus = 'stand';
    }

    this.time.delayedCall(1000, () => this.drawCardsUntil17());
  }

  private isBlackjack(player: BlackjackPlayer): boolean {
    return player.getCardsNum() === 2 && player.getHandScore() === 21;
  }

  private drawCardsUntil17(): void {
    const house = this.players[1];
    const houseHandZone = this.handZones[1];

    this.timeEvent = this.time.addEvent({
      delay: 800,
      callback: () => {
        const houseScore = house.getHandScore();

        if (houseScore >= 17) {
          this.timeEvent?.remove();
          this.gameStatus = GameStatus.ROUND_OVER;

          if (house.getHandScore() > 21) {
            house.gameStatus = 'bust';
            return;
          }
          if (this.isBlackjack(house)) {
            house.gameStatus = 'blackjack';
            return;
          }
          house.gameStatus = 'stand';
          return;
        }

        house.gameStatus = 'hit';
        this.dealCard(
          house,
          houseHandZone.x +
          this.CARD_WIDTH * (house.getCardsNum() * 0.3 - 0.15),
          houseHandZone.y,
        );
        this.displayCardsScore(false);
      },
      callbackScope: this,
      loop: true,
    });
  }

  private handleDouble(): void {
    const player = this.players[0];
    const playerHandZone = this.handZones[0];

    let bet: number = Number(this.storage.get('bet'));
    this.addBet(bet);

    this.dealCard(
      player,
      playerHandZone.x +
      this.CARD_WIDTH * (player.getCardsNum() * 0.3 - 0.15),
      playerHandZone.y,
    );

    this.handleStand();

    if (this.isBust(player)) {
      player.gameStatus = 'bust';
    }
  }

  private isBust(player: BlackjackPlayer): boolean {
    return player.getHandScore() > 21;
  }

  private addBet(extraBet: number): number {
    let bet: number = Number(this.storage.get('bet'));
    bet += extraBet;
    this.storage.set('bet', bet);
    // 掛け金の表示更新
    this.bet.setText(`bet: ${String(bet)}`);

    return bet;
  }

  // HIT, STAND, DOUBLEの全ボタンを非表示にする
  private hideButtons(): void {
    this.hitButton?.hide();
    this.standButton?.hide();
    this.doubleButton?.hide();
  }

  // Houseの裏になっているカードをひっくり返す
  private turnOverCard(): void {
    const house = this.players[1];
    const houseHandZone = this.handZones[1];
    const Card = house.hand[1];
    this.backCard
      .setDisplaySize(this.CARD_WIDTH, this.CARD_HEIGHT)
      .setX(houseHandZone.x + 10)
      .setY(houseHandZone.y);
    console.log(this.backCard)
    console.log(typeof this.backCard)
    this.backCard.playFlipOverTween()

    // house.hand.forEach((card) => {
    //   if (card.isFaceDown) {
    //     card.playFlipOverTween();
    //   }
    // });
  }

  private judgeGameResult(): GameResult {
    const player = this.players[0];
    const playerHandScore = player.getHandScore();
    const house = this.players[1];
    const houseHandScore = house.getHandScore();

    this.gameStatus = GameStatus.END_OF_GAME;

    if (player.gameStatus === 'bust') {
      return GameResult.BUST;
    }

    if (player.gameStatus === 'blackjack') {
      if (house.gameStatus !== 'blackjack') {
        return GameResult.BLACKJACK;
      }
      return GameResult.PUSH;
    }

    if (player.gameStatus === 'stand') {
      if (house.gameStatus === 'bust' || playerHandScore > houseHandScore) {
        return GameResult.WIN;
      }

      if (
        house.gameStatus === 'blackjack' ||
        houseHandScore > playerHandScore
      ) {
        return GameResult.LOSS;
      }

      if (houseHandScore === playerHandScore) {
        return GameResult.PUSH;
      }
    }

    return GameResult.SURRENDER;
  }

  private endGame(result: any) {
    console.log('END GAME');
    console.log(result);
    this.displayResult(result);
    this.settleChips(result);
    this.input.once(
      'pointerdown',
      () => {
        this.scene.start('blackjackStackScene');
        this.scene.stop('blackjackGame');
      },
      this,
    );
  }

  private displayResult(result: string) {
    const resultText = this.add.text(0, 0, result, STYLE.TEXT);

    Phaser.Display.Align.In.BottomCenter(
      resultText,
      this.gameZone as Zone,
      0,
      0,
    );
  }

  private settleChips(result: string): void {
    const bet = Number(this.storage.get('bet'));
    let chips = Number(this.storage.get('chips'));

    const Amount: Amount = {
      [GameResult.WIN]: bet,
      [GameResult.LOSS]: -bet,
      [GameResult.PUSH]: 0,
      [GameResult.BLACKJACK]: bet * 1.5,
      [GameResult.BUST]: -bet,
    };

    chips += Amount[result];
    this.updateStorageChips(chips);
    this.updateStorageBet();
    this.setChipsText();
    this.setBetText();
  }
}

export default BlackjackScene;
