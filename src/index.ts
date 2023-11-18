'use client';
import * as Phaser from 'phaser';
export class MyScene extends Phaser.Scene {
  constructor() {
    // Phaser.Sceneのコンストラクタにはstringかオブジェクト（Phaser.Types.Scenes.SettingsConfig）を渡す
    // 以下は { key: 'myscene' } を渡したのと同義になる
    super('myscene');
  }

  preload() {
    // アセット読み込み
    // this.load.image('street', '../assets/street.png');
    // this.load.image('robot', 'assets/robot.png');
  }

  create() {
    // 画面中央に画像とテキストを配置
    // this.add.image(400, 300, 'street');
    // this.add.image(400, 300, 'robot');
    // this.add.image(400, 300, 'blackjack');
    this.add
      .text(400, 300, 'Hello World', {
        fontFamily: 'arial',
        fontSize: '60px',
      })
      .setOrigin(0.5);
  }
}

// const config: Phaser.Types.Core.GameConfig = {
//   width: 800,
//   height: 600,
//   parent: 'game-app', // #game-app内にcanvasを生成
//   scene: MyScene,
// };

// new Phaser.Game(config);
