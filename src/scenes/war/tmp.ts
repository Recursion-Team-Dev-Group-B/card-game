'use client';
import { useState, useEffect } from 'react';
import * as Phaser from 'phaser';
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';

import Storage from '@/utils/storage';

import STYLE from '@/constants/style';
import Zone = Phaser.GameObjects.Zone;
import Text = Phaser.GameObjects.Text;
import Image = Phaser.GameObjects.Image;

class BaseGameScene extends Phaser.Scene {
  // Phaser.GameObjects.Text
  chips!: Text;
  bet!: Text;

  players: BlackjackPlayer[] = [];
  tableImage: Image | undefined;
  deck: Deck | undefined;
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  storage: Storage;

  //Zone
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  chipBetZone: Zone | undefined;

  constructor(sceneKey: string) {
    super(sceneKey);
    this.storage = new Storage();
  }

  preload() {}

  create(gameTitle: string) {
    this.initGame(gameTitle);
    this.placeTableImage();
    this.createTextObj();

    // デッキ作成
    this.deck = new Deck(this.sys.scene);
    // シャッフル
    this.deck.shuffle();
    this.createGameZone();

    this.createChipsAndBetZone();
    this.displayChipsText();
    this.displayBetText();
  }

  private setChips() {
    const chips: number = this.storage.get('chips') || 1000;
    const bet: number = this.storage.get('bet') || 0;

    this.storage.set('chips', chips);
    this.storage.set('bet', bet);
  }

  initGame(gameTitle: string): void {
    this.width = Number(this.game.canvas.width);
    this.height = Number(this.game.canvas.height);

    // Blackjackプレイヤー作成
    if (gameTitle == 'blackjackGame') {
      this.players = [
        new BlackjackPlayer('player1', 'player', 'blackjack'),
        new BlackjackPlayer('house1', 'house', 'blackjack'),
      ];
    }
  }

  // Blackjackのテーブル画像を配置
  placeTableImage(): void {
    // スケールを計算（目的の横幅 / 元の画像の横幅）
    this.tableImage = this.add.image(0, 0, 'blackjackTable').setOrigin(0);
    // スケールを計算（目的の横幅 / 元の画像の横幅）
    const scale = this.width / this.tableImage.width;
    // 計算したスケールを適用
    this.tableImage.setScale(scale);
  }



  // GameZoneを作成
  createGameZone(): void {
    this.gameZone = this.add.zone(0, 0, this.width, this.height).setOrigin(0);
  }

  // Chip(持っているお金)とBet(賭けたお金)を表示するZoneを作成
  createChipsAndBetZone(): void {
    this.chipBetZone = this.add.zone(0, 0, 400, 70).setOrigin(0);

    Phaser.Display.Align.In.BottomCenter(
      this.chipBetZone as Zone,
      this.gameZone as Zone,
      300,
      0,
    );

    // のちのち returnの手前まで削除。
    // Zoneがどの範囲か分かるように記載
    // Graphics オブジェクトの作成
    // const graphics = this.add.graphics();
    // // 枠線のスタイルを設定
    // graphics.lineStyle(5, 0x00ff00, 1);
    // // Zone の位置とサイズに合わせて枠線を描画
    // graphics.strokeRect(
    //   this.chipBetZone.x,
    //   this.chipBetZone.y,
    //   this.chipBetZone.width,
    //   this.chipBetZone.height,
    // );
  }

  protected displayChipsText(): void {
    // this.chips = this.add.text(0, 0, '', STYLE.CHIPS);

    this.setChipsText();
  }

  protected setChipsText(): void {
    const chips: number = this.storage.get('chips') || 0;
    this.chips?.setText(`chips: ${String(chips)}`);
    Phaser.Display.Align.In.TopLeft(
      this.chips as Text,
      this.chipBetZone as Zone,
      0,
      0,
    );
  }

  protected displayBetText(): void {
    // this.bet = this.add.text(0, 0, '', STYLE.CHIPS);

    this.setBetText();
  }

  protected setBetText(): void {
    const bet: number = this.storage.get('bet') || 0;
    this.bet?.setText(`bet: ${String(bet)}`);

    Phaser.Display.Align.To.BottomLeft(
      this.bet as Text,
      this.chips as Text,
      0,
      0,
    );
  }
}

export default BaseGameScene;
