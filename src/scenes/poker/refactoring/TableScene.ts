import Card from '@/scenes/poker/refactoring/Card';
import Deck from '@/scenes/poker/refactoring/Deck';
import Player from '@/scenes/poker/refactoring/Player';
import { string } from 'prop-types';
import BaseScene  from '@/scenes/poker/refactoring/BaseScene';



class TableScene extends BaseScene {

    protected deck: Deck;
    protected sounds: { [key: string]: Phaser.Sound.BaseSound };
    protected animations: Record<string, Function>;
    protected usedCards: Deck;

    // どうするか
    protected isPouse: boolean;

    constructor(sceneKey: string) {
        super(sceneKey);
        this.deck = this.createDeck();
        this.sounds = this.createSounds();
        this.animations = this.createAnimations();
        this.usedCards = this.createUsedCards();


        this.isPouse = false;
    }

    // アニメーション 
    protected createAnimations(): Record<string, Function> {
        return {
            // １枚配る
            'dealingCard': this.animateDealingCard.bind(this),
        };
    }

    // カードを1配るアニメーション
    protected animateDealingCard(
        card: Card,
        startX: number,
        y: number,
        spacing: number,
        index: number = 0
    ) {
        const width = card.displayWidth;
        const x = startX + index * (width + spacing);
        this.tweens.add({
            targets: card,
            x: x,
            y: y,
            ease: 'Linear',
            duration: 200,
        });
    }

    // sec単位で対応 使用時にawaitを使用
    protected delay(time: number) {
        time = time * 1000;
        return new Promise(resolve => setTimeout(resolve, time));
    }


    // 効果音, configにPathを設定 
    protected createSounds(): { [key: string]: Phaser.Sound.BaseSound } {
        return {
            'cardFlip': this.sound.add('sound_card_flip').setVolume(0.5),
            'cardDeal': this.sound.add('sound_card_deal').setVolume(0.5),
            'win': this.sound.add('sound_win').setVolume(0.5),
            'lose': this.sound.add('sound_lose').setVolume(0.5),
            'draw': this.sound.add('sound_draw').setVolume(0.6),
            'click': this.sound.add('sound_click').setVolume(0.6),
        }
    }


    // デッキの生成
    protected createDeck(): Deck {
        const deck = new Deck(this);
        deck.shuffle();
        return deck;
    }

    // カードの生成 <- デッキがあるからいらない？
    protected createCard() {

    }

    // ゲームの中断 <- 実装がややこしい
    protected pause() {

    }

    // ゲームのリプレイ // phaserのrestart機能で済む
    protected replay() {

    }

    // 所持金判定 <- ゲームのロジックよるのでここではいらない？
    protected checkAmount() {

    }

    // 使用したカードを入れる
    protected createUsedCards(): Deck {
        const usedCards = new Deck(this);
        usedCards.clearDeck();
        return usedCards;
    }

    // 所持金の表示位置
    protected displayPositonAmount(
        positonX: number,
        positonY: number,
        originX: number = 0.5,
        originY: number = 0.5,
    ): Phaser.GameObjects.Text {
        const amountText = this.add.text(0, 0, '');
        amountText.setOrigin(originX, originY);
        amountText.setX(positonX);
        amountText.setY(positonY);

        return amountText;
    }

    // 掛け金の表示位置
    protected displayPositonBet(
        positonX: number,
        positonY: number,
        originX: number = 0.5,
        originY: number = 0.5,
    ) {
        const betText = this.add.text(0, 0, '');
        betText.setOrigin(originX, originY);
        betText.setX(positonX);
        betText.setY(positonY);

        return betText;

    }

    // プレイヤーの表示位置 <- 名前？
    protected displayPotisonPlayer(
        positonX: number,
        positonY: number,
        originX: number = 0.5,
        originY: number = 0.5,
    ) {
        const playerText = this.add.text(0, 0, '');
        playerText.setOrigin(originX, originY);
        playerText.setX(positonX);
        playerText.setY(positonY);

        return playerText;
    }



}

export default TableScene;
