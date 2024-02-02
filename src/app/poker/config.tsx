import * as Phaser from 'phaser';
import PokerScene from '@/scenes/poker/gameScene';
import LoadScene from '@/scenes/poker/LoadingScene';
//import PokerScene from '@/scenes/poker/refactoring/gameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  //backgroundColor: '#000000',
  parent: 'pokerGame',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'pokerGame',
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [LoadScene, PokerScene],
};

export default config;
