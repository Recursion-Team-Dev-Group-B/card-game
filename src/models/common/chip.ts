import Phaser from 'phaser';
import STYLE from '@/constants/style';

import Text = Phaser.GameObjects.Text;

const MOVE_TIME = 200;
const FADE_TIME = 200;

/**
 * GO = GameObjects
 */
class Chip extends Phaser.GameObjects.Image {
    #initScale: number;

    #value: string = '';
    GOText: Text; //Textオブジェクト
    #text: string; //ボタン上に表示するテキスト

    clickSound: Phaser.Sound.BaseSound;

    /**
     *
     * @param scene
     * @param x
     * @param y
     * @param texture GameObjectを表すキー
     * @param text Textオブジェクトが表示する文字列
     * @param textStyle
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        text: string,
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.#initScale = 0.2;
        this.#text = text;
        this.GOText = this.scene.add.text(0, 0, text, STYLE.TEXT);
        scene.add.existing(this.GOText);

        Phaser.Display.Align.In.Center(this.GOText, this);
        this.setDisplaySize(120, 100);

        this.clickSound = this.scene.sound.add("clickChip", {
            volume: 1
        });

        this.setInteractive();
        this.setDataEnabled();
        // this.setHoverHandler();
    }

    get text(): string {
        return this.#text;
    }

    get value(): string {
        return this.#value;
    }

    private setHoverHandler(): void {
        this.on(
            'pointerover',
            () => {
                this.setScale(1.2 * this.#initScale);
            },
            this,
        );
        this.on(
            'pointerout',
            () => {
                this.setScale(this.#initScale);
            },
            this,
        );
    }

    clickHandler(handler: () => void): void {
        this.on(
            'pointerdown',
            () => {
                this.clickSound.play();
                handler();
            },
            this,
        );
    }

    destroy(): void {
        this.GOText.destroy();
        super.destroy();
    }

    setX(x: number): any {
        super.setX(x);
        Phaser.Display.Align.In.Center(this.GOText, this);
        return this;
    }

    setY(y: number): any {
        super.setY(y);
        Phaser.Display.Align.In.Center(this.GOText, this);
        return this;
    }

    playMoveTween(toX: number, toY: number): void {
        this.scene.tweens.add({
            targets: this,
            x: toX,
            y: toY,
            duration: MOVE_TIME,
            ease: 'Linear',
        });
    }

    playMoveAndDestroy(toX: number, toY: number): void {
        this.scene.tweens.add({
            targets: this,
            x: toX,
            y: toY,
            duration: MOVE_TIME,
            ease: 'Linear',
            onComplete: () => {
                this.destroy();
            },
        });
    }

    // 非表示にする
    hide(): void {
        this.setVisible(false);
        this.GOText.setVisible(false);
    }
    // 表示にする
    show(): void {
        this.setVisible(true);
        this.GOText.setVisible(true);
    }

    playFadeIn(): void {
        this.scene.tweens.add({
            targets: [this, this.#text],
            alpha: 1,
            duration: FADE_TIME,
            ease: 'Linear',
        });
    }

    setAlpha(alpha: number): any {
        super.setAlpha(alpha);
        this.GOText.setAlpha(alpha);
    }

    resizeChip(scale: number): void {
        if (scale < 0) {
            throw new Error('Scale value cannot be negative.');
        }
        this.setScale(this.#initScale * scale);
    }
}

export default Chip;
