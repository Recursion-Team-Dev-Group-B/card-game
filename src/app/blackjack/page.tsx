'use client';
import { useEffect, useState } from 'react';
import * as Phaser from 'phaser';
import { MyScene } from '../../index';

const Page = () => {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      width: 800,
      height: 600,
      parent: 'game-app', // #game-app内にcanvasを生成
      scene: MyScene,
    };
    const blackjackGame = new Phaser.Game(config);
  }, []);
  return <div id="game-app">Blackjack</div>;
};

export default Page;
