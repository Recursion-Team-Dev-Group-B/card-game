'use client';
import * as Phaser from 'phaser';
import { useState } from 'react';
type Image = Phaser.GameObjects.Image;
import { Scenes } from './index';

const StartScene = () => {
  const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
  const loadGame = async () => {
    class LoadingScene extends Phaser.Scene {
      tableImage: Image | undefined;

      constructor() {
        super('loading');
      }

      create() {
        // 描画領域のサイズを取得
        this.scene.start('mainbet', { timelineID: 'start' });
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'warGame', // #warGame内にcanvasを生成
      scene: Scenes // index.tsでシーンを管理
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
