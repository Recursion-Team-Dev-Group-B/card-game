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
  chips: Text | undefined;
  players: BlackjackPlayer[] = [];
  tableImage: Image | undefined;
  betText: Text | undefined;
  deck: Deck | undefined;
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  storage: Storage;

  constructor(sceneKey: string) {
    super(sceneKey);
    this.storage = new Storage();
  }

  preload() {
    // テーブル画像をロード
    this.load.image('blackjackTable', '/game/blackjack/blackjackTable.jpeg');
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

  create(gameTitle: string) {
    this.initGame(gameTitle);
    this.placeTableImage();

    // デッキ作成
    this.deck = new Deck(this.sys.scene);
    // シャッフル
    this.deck.shuffle();
    this.createGameZone();

    this.displayChipsText();
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

  protected displayChipsText(): void {
    this.chips = this.add.text(0, 0, '', STYLE.CHIPS);

    this.setChipsText();
  }

  protected setChipsText(): void {
    const chips: number = this.storage.get('chips');
    this.chips?.setText(String(chips));
    Phaser.Display.Align.In.BottomCenter(
      this.chips as Text,
      this.gameZone as Zone,
      0,
      0,
    );
  }
}

export default BaseGameScene;
