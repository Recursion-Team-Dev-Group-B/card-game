'use client';
import { useState } from 'react';
import * as Phaser from 'phaser';
//import Deck from '@/models/common/deck';
import Deck from '@/scenes/poker/common/deck';
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import { thisTypeAnnotation } from '@babel/types';



import PokerTable from '@/scenes/poker/common/pokerTable';
import Pot from '@/scenes/poker/common/pot';
import Player from '@/scenes/poker/common/pokerPlayer';
import ContainerHelper from '@/scenes/poker/helpers/ContainerHelper';
import PokerPlayer from '@/scenes/poker/common/pokerPlayer';
import PokerAI from '@/scenes/poker/common/pokerAI';

//const GameScene = () => {
//const [config, setConfig] = useState<Phaser.Types.Core.GameConfig>();
//const loadGame = async () => {
class PokerScene extends Phaser.Scene {
  tableImage: Image | undefined;



  constructor() {
    super('pokerScene');
  }


  preload() {
  }

  create() {

    const { width, height } = this.sys.game.canvas;
    const image = this.add.image(width / 2, 0, 'table').setOrigin(0.5, 0);
    this.add.existing(image);

    // potの作成
    const pot = new Pot();
    // playerとhouseの作成
    const player = new PokerPlayer(
      'you',
      'player',
      'poker',
      1500,
      0,
      0,
      '',
    );
    const ai = new PokerAI(
      'ai1',
      'ai',
      'poker',
      1500,
      0,
      0,
      '',
    );

    // プレイヤーをまとめる
    const players: Array<Player> = [player, ai];

    //  各エリアを生成
    const containerHelper = new ContainerHelper(this, pot);
    //this.add.existing(containerHelper.gameZone);

    // tableの作成
    const pokerTable = new PokerTable(this, players, pot, containerHelper)
    pokerTable.loading();



    this.load.start();
  }

  update() {
  }



}


export default PokerScene //GameScene;