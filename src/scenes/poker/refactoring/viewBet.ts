import chip from '@/models/common/chip';

import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import Button from '@/scenes/poker/refactoring/button';
import Chip from '@/scenes/poker/refactoring/chip';

import pokerPlayer from '@/scenes/poker/common/pokerPlayer';

import config from '@/scenes/poker/common/config';
// Style
import STYLE from '@/constants/style';
// Phaser関連の型
import Zone = Phaser.GameObjects.Zone;
import Image = Phaser.GameObjects.Image;
import Text = Phaser.GameObjects.Text;
import PokerPlayer from '@/scenes/poker/common/pokerPlayer';
import PokerAI from '../common/pokerAI';

export default class ViewBet {

    tableImage: Image | undefined;
    gameZone: Zone | undefined;
    handZones: Zone[] = [];
    playerNames: Text[] = [];
    width: number = 0;
    height: number = 0;
    playerScoreTexts: Text[] = [];

    // Todo 別ファイルに記載
    CARD_WIDTH = 100;
    CARD_HEIGHT = 120;

    // ActionButton
    dealButton!: Button;
    resetButton!: Button;

    // Chip
    Chip10!: Chip;
    Chip20!: Chip;
    Chip50!: Chip;
    Chip100!: Chip;
    Chip200!: Chip;
    Chips: Chip[] = [];

    // scene
    scene: Phaser.Scene;

    // player
    player: PokerPlayer;

    chips!: Text;
    bet!: Text;

    container: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, player: PokerPlayer, container: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.player = player;
        this.container = container;
        this.createBetTextObj();
        this.dealButton = this.displayDealButton();
    }

    create() {
        // 前のゲームのボタンが残っているため初期化
        this.Chips = [];
        this.displayBetChips();
        this.displayDealButton();
        this.displayResetButton();
    }
    update(): void { }

    private displayBetChips(): void {
        this.createChips();

        for (let i = 0; i < this.Chips.length; i++) {
            this.Chips[i].setX((config.phaserConfig.width / 3) * (1 + i));
        }
    }

    private createChips() {
        /*
        //this.Chip10 = new Chip(this.scene, 0, this.height / 2, 'chipGray', '10');
        this.Chip10 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipGray', '10');
        this.Chips.push(this.Chip10);
        this.Chip10.clickHandler(() => {
            this.clickBetChip(this.Chip10);
        });
        this.container.add(this.Chip10);

        //this.Chip20 = new Chip(this.scene, 0, this.height / 2, 'chipBlue', '20');
        this.Chip20 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipBlue', '20');
        this.Chips.push(this.Chip20);
        this.Chip20.clickHandler(() => {
            this.clickBetChip(this.Chip20);
        });
        this.container.add(this.Chip20);

        //this.Chip50 = new Chip(this.scene, 0, this.height / 2, 'chipRed', '50');
        this.Chip50 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipRed', '50');
        this.Chips.push(this.Chip50);
        this.Chip50.clickHandler(() => {
            this.clickBetChip(this.Chip50);
        });
        this.container.add(this.Chip50);

        //this.Chip100 = new Chip(this.scene, 0, this.height / 2, 'chipGreen', '100');
        this.Chip100 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipGreen', '100');
        this.Chips.push(this.Chip100);
        this.Chip100.clickHandler(() => {
            this.clickBetChip(this.Chip100);
        });
        this.container.add(this.Chip100);

        //this.Chip200 = new Chip(this.scene, 0, this.height / 2, 'chipOrange', '200');
        this.Chip200 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipOrange', '200');
        this.Chips.push(this.Chip200);
        this.Chip200.clickHandler(() => {
            this.clickBetChip(this.Chip200);
        });
        this.container.add(this.Chip200);
        */

        this.Chip50 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipRed', '50');
        this.Chips.push(this.Chip50);
        this.Chip50.clickHandler(() => {
            this.clickBetChip(this.Chip50);
        });
        this.container.add(this.Chip50);

        this.Chip100 = new Chip(this.scene, 0, config.phaserConfig.height / 2, 'chipGreen', '100');
        this.Chips.push(this.Chip100);
        this.Chip100.clickHandler(() => {
            this.clickBetChip(this.Chip100);
        });
        this.container.add(this.Chip100);
    }

    private clickBetChip(button: Chip) {
        //let totalBet = Number(this.storage.get('bet'));
        const clickedBet = Number(button.text);
        //const chips = Number(this.storage.get('chips'));
        const chips = this.player.chips;
        //if (totalBet + clickedBet <= chips) {
        if (this.player.bet + clickedBet <= chips) {
            //totalBet = this.addBet(clickedBet);
            this.player.bet += clickedBet;
            this.addBet(this.player.bet);
            const animationChip = new Button(this.scene, button.x, button.y, button.texture.key, "")

            // Tweenを作成する
            this.scene.tweens.add({
                targets: animationChip,
                x: config.phaserConfig.width / 2,       // 最終的なX座標
                y: -100,       // 最終的なY座標
                ease: 'Power1',  // イージング（アニメーションの速度変化）
                duration: 600,  // アニメーションの期間（ミリ秒）
                repeat: 0,       // 繰り返し回数
                yoyo: false      // Yoyo効果（アニメーションを逆再生するかどうか）
            });

            // 現在のベット金額とクリックしたチップの合計が所持金を上回る場合は、チップを非表示
            this.Chips.forEach((button: Chip) => {
                //if (totalBet + Number(button.text) > chips) {
                if (this.player.bet + Number(button.text) > chips) {
                    button.hide();
                }
            });
        }
        //if (totalBet) {
        if (this.player.bet > 0) {
            this.dealButton.show();
            this.resetButton.show();
        }
    }

    //private addBet(extraBet: number): number {
    private addBet(extraBet: number): void {
        /*
        let bet: number = Number(this.storage.get('bet'));
        this.storage.set('bet', bet);
        */

        let bet: number = extraBet;
        // 掛け金の表示更新
        this.bet.setText(`bet: ${String(bet)}`);


        //return bet;
    }

    private displayDealButton(): Button {
        //private displayDealButton(): Button {
        this.dealButton = new Button(this.scene, config.phaserConfig.width / 2 + 150, config.phaserConfig.height / 2 + 250, 'button', 'Deal');

        /*
        this.dealButton.clickHandler(() => {
            if (this.bet) {
                this.hide();
            }
        });
        */

        Phaser.Display.Align.In.Center(this.dealButton.GOText, this.dealButton);

        this.dealButton.hide();
        return this.dealButton;
    }

    private displayResetButton(): void {
        this.resetButton = new Button(this.scene, config.phaserConfig.width / 2 - 150, config.phaserConfig.height / 2 + 250, 'button', 'Reset');

        this.resetButton.clickHandler(() => {
            if (this.bet) {
                this.resetBet();
                this.dealButton.hide();
            }
        });
        Phaser.Display.Align.In.Center(this.resetButton.GOText, this.resetButton);
        this.resetButton.hide();
    }

    private resetBet() {
        /*
        this.Chip10.show();
        this.Chip20.show();
        this.Chip200.show();
        //this.storage.set('bet', 0);
        */
        this.Chip50.show();
        this.Chip100.show();
        this.bet.setText('bet: 0');
    }

    private setBetText(): void {
        //const betValue: number = this.storage.get('bet') || 0;
        const betValue = this.player.bet;
        this.bet.setText(`bet: ${String(betValue)}`);

        /*
        Phaser.Display.Align.To.BottomLeft(
            this.bet as Text,
            this.chips as Text,
            0,
            5,
        );
        */
    }

    private createBetTextObj() {
        this.bet = this.scene.add.text(0, 0, '', STYLE.CHIPS).setOrigin(0.5);
        this.bet.setX(config.phaserConfig.width / 2);
        this.bet.setY((config.phaserConfig.height / 4) * 3.5);
    }

    hide() {
        this.hideChips();
        this.container.setVisible(false);
        this.dealButton.hide();
        this.resetButton.hide();
        this.bet.setVisible(false);
    }

    show() {
        this.resetBet();
        this.setBetText();
        this.container.setVisible(true);
        this.bet.setVisible(true);
    }

    private hideChips() {
        this.Chip50.hide();
        this.Chip100.hide();
    }

}

