'use client';
import * as Phaser from 'phaser';
import Config from '@/app/poker/config';
class BaseScene extends Phaser.Scene {

    protected config: Phaser.Types.Core.GameConfig;
    protected gameZone: Phaser.GameObjects.Zone;
    protected width: number;
    protected height: number;


    constructor(sceneKey: string) {
        super(sceneKey);
        this.config = Config;
        this.width = Number(this.config.width);
        this.height = Number(this.config.height);
        this.gameZone = this.createGameZone();
    }

    create() {

    }

    update() {

    }

    // Zoneを作成
    protected createGameZone(): Phaser.GameObjects.Zone {
        return this.add.zone(
            0.5,
            0.5,
            this.width,
            this.height,
        );
    };

    // ?ホームボタンの名前どうするか
    protected createHomeButton(): void {
        const homeButton = this.add.image(0, 0, 'button_home').setOrigin(0, 0);
        homeButton.setX(10);
        homeButton.setY(10);
        homeButton.setDisplaySize(50, 50);
        homeButton.setInteractive({ cursor: 'pointer' });
        homeButton.on('pointerdown', () => {
            window.location.href = '/';
        })
        this.add.existing(homeButton);
    }

    // 背景画像を作成　
    protected createBackGroundImage(backGroundImageKey: string): void {
        const backGrondImage = this.add.image(0, 0, backGroundImageKey).setOrigin(0.5, 0);
        this.add.existing(backGrondImage);
    }

}



export default BaseScene;