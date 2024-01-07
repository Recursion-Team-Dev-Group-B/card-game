import Phaser from 'phaser'
import BaseGameScene from '@/scenes/BaseGameScene';
import StackScene from '@/scenes/blackjack/stackScene';
import BlackjackScene from '@/scenes/blackjack/gameScene';
import LoadingScene from '@/scenes/LoadingScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    parent: 'blackjackGame',
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'blackjackGame',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 720,
            height: 345,
        },
        max: {
            width: 1920,
            height: 1220,
        },
    },
    scene: [LoadingScene, StackScene, BlackjackScene],
}

export default config