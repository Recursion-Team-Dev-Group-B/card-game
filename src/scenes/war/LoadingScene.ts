'use client';
import * as Phaser from 'phaser';
import { useState } from 'react';
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import { BettingScene } from './BettingScene';
import { CardDistScene } from './CardDistScene';
import { WinLoseResultScene } from './WinLoseResultScene';
import { DrawDecisionScene } from './DrawDecisionScene';
import { EndGameScene } from './EndGameScene';
import { SurrenderResultScene } from './SurrenderResultScene';
import { ReWarBettingScene } from './ReWarBettingScene';
import { ReWarCardDistScene } from './ReWarCardDistScene';
import { ReWarResultScene } from './ReWarResultScene';


const StartScene = () => {
  const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
  const loadGame = async () => {
    class LoadingScene extends Phaser.Scene {
      tableImage: Image | undefined;

      constructor() {
        super('loading');
      }

      preload() {
        this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
      }

      create() {
        // 描画領域のサイズを取得
        const { width, height } = this.game.canvas;
        this.cameras.main.setBackgroundColor('#242424');
        // ロゴ画像を中央に表示
        this.add.image(width / 2, height / 2, 'logo');
        // アセットのロードが完了したらBettingSceneに遷移
        // this.load.on('complete', () => {
        //     this.scene.start('betting');
        // });
        const zone = this.add.zone(width / 2, height / 2, width, height);
        zone.setInteractive({
          useHandCursor: true  // マウスオーバーでカーソルが指マークになる
        });

        zone.on('pointerdown', () => {
          this.scene.start('betting', { timelineID: 'start' });
        });
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'warGame', // #warGame内にcanvasを生成
      scene: [LoadingScene, BettingScene, CardDistScene, WinLoseResultScene, DrawDecisionScene, EndGameScene, SurrenderResultScene, ReWarBettingScene, ReWarCardDistScene, ReWarResultScene]
    };
    setConfig(config);
    const game = new Phaser.Game(config);

  }
  if (!config) {
    loadGame();
  }

  return null;
}

export default StartScene;
