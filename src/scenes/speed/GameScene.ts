import { cardAssets, imageAssets, soundAssets } from './assets';
import { ReplayPositionConfig } from './interfaces';
import Deck from '@/models/common/deck';
import Card from '@/models/common/card';

export class GameScene extends Phaser.Scene {
    public funds: number = 0;

    private redCardCounter: number = 5;
    private blackCardCounter: number = 5;
    private houseStockPile: Card[] = [];
    private playerStockPile: Card[] = [];
    private playerHandSet: Card[] = [];
    private houseHandSet: Card[] = [];

    private tableCard1: Card | null = null;
    private tableCard2: Card | null = null;
    private tableCardPositions?: { x: number; y: number }[];
    private stockPilePositions?: { x: number; y: number }[];

    private playerStockPileImage: Phaser.GameObjects.Image | null = null;
    private houseStockPileImage: Phaser.GameObjects.Image | null = null;

    private resultContainer: Phaser.GameObjects.Container | null = null;
    private resultText: Phaser.GameObjects.Text | null = null;
    private gameResult: string | null = null;

    private lastTableCardUpdateTime: number = 0;
    private isUpdatingTableCards: boolean = false;

    // AI行動関連の変数
    private lastActionTime: number = 0;
    private aiActionInterval: number = 3000; // AIが行動する間隔（ミリ秒）

    // ハウスがゲーム開始直後に行動しないように制御する
    // 勝敗確定後にハウスが自動操作しないように制御する
    private canHouseAct: boolean = false;

    // AIとプレイヤーが近いタイミングで置く時の問題を解決しにいく
    // AIを優先させる。フラグで管理できそう
    private isAiMovingCard: boolean = false;

    private isGameEnded = false;


    constructor() {
        super('game');
    }

    init() {
        // 2回目以降のために初期化する。
        this.redCardCounter = 5;
        this.blackCardCounter = 5;
        this.lastActionTime = 0;
        this.lastTableCardUpdateTime = 0;
        this.isAiMovingCard = false;
        // this.isPlayerMovingCard = false;
        this.canHouseAct = false;
        this.isGameEnded = false;
    }

    preload() {
        // assetsで定義したカードをロードする
        cardAssets.forEach(asset => {
            this.load.image(asset.key, asset.path);
        });

        imageAssets.forEach(asset => {
            this.load.image(asset.key, asset.path);
        });

        soundAssets.forEach(asset => {
            this.load.audio(asset.key, asset.path);
        });
    }

    create() {
        // ハウスの最初の行動遅延
        // ゲーム開始から7秒後にハウスの行動を開始する
        this.time.delayedCall(7000, () => {
            this.canHouseAct = true;
        });

        const { width, height } = this.game.canvas;
        setBackground(this, width, height, 'table', { x: 1.7, y: 1 });

        const deck = new Deck(this.sys.scene);
        deck.shuffle();
        const separatedCards = deck.separateAndShuffleByColor();
        this.houseStockPile = separatedCards.blackCards;
        this.playerStockPile = separatedCards.redCards;

        this.tableCardPositions = [
            { x: width * 0.6, y: height * 0.45 },
            { x: width * 0.4, y: height * 0.45 }
        ];

        // [0]はプレイヤー側、[1]はAI側
        this.stockPilePositions = [
            { x: width * 0.15 * 1, y: height * 0.7 },
            { x: width * 0.15 * 5, y: height * 0.2 }
        ];

        // tableCard
        this.tableCard1 = this.houseStockPile[0]
            .setDisplaySize(width * 0.08, width * 0.11)
            .setPosition(this.tableCardPositions[0].x, this.tableCardPositions[0].y)
            .setDepth(0);
        this.tableCard2 = this.playerStockPile[0]
            .setDisplaySize(width * 0.08, width * 0.11)
            .setPosition(this.tableCardPositions[1].x, this.tableCardPositions[1].y)
            .setDepth(0);

        this.add.existing(this.tableCard1);
        this.add.existing(this.tableCard2);

        // houseHandCardのカードの初期設定
        for (let i = 1; i <= 4; i++) {
            const card = this.houseStockPile[i]
                .setDisplaySize(width * 0.08, width * 0.11)
                .setPosition(width * 0.15 * i, height * 0.2)
                .setInteractive({ useHandCursor: true, draggable: true });
            card.setData('originalPosition', { x: card.x, y: card.y });
            card.setDepth(1);
            this.add.existing(card);
        }

        // houseのstockPileの表示
        this.playerStockPileImage = this.add.image(this.stockPilePositions[0].x, this.stockPilePositions[0].y, 'backcard')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width * 0.08, width * 0.11);

        // playerのstockPileの表示
        this.houseStockPileImage = this.add.image(this.stockPilePositions[1].x, this.stockPilePositions[1].y, 'backcard')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width * 0.08, width * 0.11);

        // playerHandCardのカードの初期設定
        for (let i = 1; i <= 4; i++) {
            const card = this.playerStockPile[i]
                .setDisplaySize(width * 0.08, width * 0.11)
                .setPosition(width * 0.15 * (i + 1), height * 0.7)
                .setInteractive({ useHandCursor: true, draggable: true });
            card.setData('originalPosition', { x: card.x, y: card.y });
            card.setDepth(1);
            this.add.existing(card);
        }

        // HandCardセットの初期設定
        this.playerHandSet = this.playerStockPile.slice(1, 5);
        this.houseHandSet = this.houseStockPile.slice(1, 5);

        // (初期設定おわり)

        // ドラッグ開始時に呼ばれるイベント
        this.input.on('dragstart', (
            pointer: Phaser.Input.Pointer,
            gameObject: Phaser.GameObjects.Sprite
        ) => {
            gameObject.setDepth(1); // ドラッグされたカードの深度を上げる
        });

        // ドラッグ
        this.input.on('drag', (
            pointer: Phaser.Input.Pointer,
            gameObject: Phaser.GameObjects.Sprite,
            dragX: number,
            dragY: number
        ) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (
            pointer: Phaser.Input.Pointer,
            gameObject: Phaser.GameObjects.Sprite
        ) => {
            gameObject.setDepth(0);
            // 許容範囲を定義
            const bufferWidth = width * 0.1;
            const bufferHeight = height * 0.1;

            // 最も近いtableCardPositionを見つける
            let closestPos = null;
            let closestDistance = Number.MAX_VALUE;

            for (const pos of this.tableCardPositions!) {
                const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, pos.x, pos.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPos = pos;
                }
            }

            if (closestPos && closestDistance <= Math.max(bufferWidth, bufferHeight)) {
                // 近い位置にカードを移動
                gameObject.setPosition(closestPos.x, closestPos.y);
                gameObject.disableInteractive();
            } else {
                // 範囲外の場合、元の位置に戻す
                const originalPos = gameObject.getData('originalPosition');
                gameObject.setPosition(originalPos.x, originalPos.y);
            }

            const originalPos = gameObject.getData('originalPosition');
            const isDroppedOnTableCard = this.tableCardPositions!.some(pos =>
                gameObject.x > pos.x - bufferWidth && gameObject.x < pos.x + bufferWidth &&
                gameObject.y > pos.y - bufferHeight && gameObject.y < pos.y + bufferHeight
            );

            // プレイヤーのカードドロップ
            if (isDroppedOnTableCard && gameObject instanceof Card) {
                const isDroppedOnTableCard1 = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, this.tableCardPositions![0].x, this.tableCardPositions![0].y) < closestDistance;
                const isDroppedOnTableCard2 = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, this.tableCardPositions![1].x, this.tableCardPositions![1].y) < closestDistance;

                if ((isDroppedOnTableCard1 && this.canPlaceCardOnTable(gameObject, 1)) || (isDroppedOnTableCard2 && this.canPlaceCardOnTable(gameObject, 2)) && this.isAiMovingCard == false) {
                    this.handleCardDrop(gameObject, originalPos);
                    this.playPutCardSound();

                    if (isDroppedOnTableCard1) {
                        this.tableCard1!.destroy();
                        this.tableCard1 = gameObject;
                    }
                    if (isDroppedOnTableCard2) {
                        this.tableCard2!.destroy();
                        this.tableCard2 = gameObject;
                    }
                } else {
                    gameObject.setPosition(originalPos.x, originalPos.y);
                    gameObject.setInteractive();
                    this.sound.play('wrong_sound');
                }
            }
        });
    }

    private handleCardDrop(card: Card, originalPos: { x: number; y: number }) {
        card.disableInteractive();

        if (card.suit === 'heart' || card.suit === 'diamond') {
            this.playerHandSet = this.playerHandSet.filter(c => c !== card); // HandCardSetから削除
            if (this.redCardCounter < this.playerStockPile.length) {
                const nextCard = this.playerStockPile[this.redCardCounter];
                this.playerHandSet.push(nextCard); // HandCardSetに追加
                this.redCardCounter++;
                this.refillHandCardAnimation(nextCard, this.stockPilePositions![0].x, this.stockPilePositions![0].y, originalPos.x, originalPos.y);
                //this.displayCard(nextCard, originalPos.x, originalPos.y); // handCardはdepth1のまま
            }
        } else if (card.suit === 'spade' || card.suit === 'club') {
            this.houseHandSet = this.houseHandSet.filter(c => c !== card); // HandCardSetから削除
            if (this.blackCardCounter < this.houseStockPile.length) {
                const nextCard = this.houseStockPile[this.blackCardCounter];
                this.houseHandSet.push(nextCard); // HandCardSetに追加
                this.blackCardCounter++;
                this.refillHandCardAnimation(nextCard, this.stockPilePositions![1].x, this.stockPilePositions![1].y, originalPos.x, originalPos.y);
                //this.displayCard(nextCard, originalPos.x, originalPos.y); // handCardはdepth1のまま
            }
        }
        this.determineWinner();
    }

    private isNextRank(cardRank: number, tableCardRank: number): boolean {
        if (cardRank === 1 && tableCardRank === 13) return true; // A -> K
        if (cardRank === 13 && tableCardRank === 1) return true; // K -> A
        return Math.abs(cardRank - tableCardRank) === 1;
    }

    private canPlaceCardOnTable(card: Card, tableCardNumber: number): boolean {
        const draggedCardRank = card.getRankNumberOfSpeed();
        const tableCardRank = tableCardNumber === 1 ? this.tableCard1!.getRankNumberOfSpeed() : this.tableCard2!.getRankNumberOfSpeed();

        return this.isNextRank(draggedCardRank, tableCardRank);
    }

    // 削除予定
    private displayCard(card: Card, x: number, y: number) {
        const { width, height } = this.game.canvas;
        card.setDisplaySize(width * 0.08, width * 0.11)
        card.setPosition(x, y);
        card.setVisible(true);
        card.setInteractive({ useHandCursor: true, draggable: true });
        card.setData('originalPosition', { x: card.x, y: card.y });
        card.setDepth(1); // tableCardは深度0、handCardは深度1。
        this.add.existing(card);
    }

    // ストックが空かどうかをチェックし、空の場合はテキストを表示するメソッド
    private determineWinner() {
        if (this.isGameEnded) return;

        if (this.redCardCounter === this.playerStockPile.length && this.playerHandSet.length === 0 && this.blackCardCounter === this.houseStockPile.length && this.houseHandSet.length === 0) {
            this.gameResult = 'draw';
            const { container, resultText } = createBand(this);
            this.resultContainer = container;
            this.resultText = resultText;
            showBandAnimation(this, this.resultContainer, this.resultText, this.gameResult, 'You Win!', 'You lose..', 'Draw!');
            this.canHouseAct = false;// ゲームを終わらせること
            this.isGameEnded = true;
            this.askForGameReplay();
        } else if (this.redCardCounter === this.playerStockPile.length && this.playerHandSet.length === 0) {
            this.gameResult = 'win';
            const { container, resultText } = createBand(this);
            this.resultContainer = container;
            this.resultText = resultText;
            showBandAnimation(this, this.resultContainer, this.resultText, this.gameResult, 'You Win!', 'You lose..', 'Draw!');
            this.canHouseAct = false;// ゲームを終わらせること
            this.isGameEnded = true;
            this.askForGameReplay();
        } else if (this.blackCardCounter === this.houseStockPile.length && this.houseHandSet.length === 0) {
            this.gameResult = 'lose';
            const { container, resultText } = createBand(this);
            this.resultContainer = container;
            this.resultText = resultText;
            showBandAnimation(this, this.resultContainer, this.resultText, this.gameResult, 'You Win!', 'You lose..', 'Draw!');
            this.canHouseAct = false;// ゲームを終わらせること
            this.isGameEnded = true;
            this.askForGameReplay();
        }
    }

    private updateTableCardsIfNeeded(currentTime: number) {
        // ハンドセットが空の場合はtrueにする
        if (currentTime - this.lastTableCardUpdateTime > 5000) {
            // 両者がテーブルカードにおけないことを判定。全てがtrueである必要あり。
            const allPlayerCardsCannotBePlacedOnTableCard1 = this.playerHandSet.every(card => !this.canPlaceCardOnTable(card, 1));
            const allPlayerCardsCannotBePlacedOnTableCard2 = this.playerHandSet.every(card => !this.canPlaceCardOnTable(card, 2));
            const allHouseCardsCannotBePlacedOnTableCard1 = this.houseHandSet.every(card => !this.canPlaceCardOnTable(card, 1));
            const allHouseCardsCannotBePlacedOnTableCard2 = this.houseHandSet.every(card => !this.canPlaceCardOnTable(card, 2));

            // デッキが空かどうかを判定
            const isPlayerStockPileEmpty = this.redCardCounter >= this.playerStockPile.length;
            const isHouseStockPileEmpty = this.blackCardCounter >= this.houseStockPile.length;

            // もし両者がこれ以上ハンドカードを置けないならば＝前提。
            if ((allPlayerCardsCannotBePlacedOnTableCard1 && allHouseCardsCannotBePlacedOnTableCard1) &&
                (allPlayerCardsCannotBePlacedOnTableCard2 && allHouseCardsCannotBePlacedOnTableCard2)
            ) {
                // プレイヤーについてだけ
                if (isPlayerStockPileEmpty) {
                    this.isUpdatingTableCards = true;
                    this.placeCardFromHand(this.playerHandSet, 2);
                    this.isUpdatingTableCards = false;
                } else {
                    this.isUpdatingTableCards = true;
                    if (this.redCardCounter < this.playerStockPile.length) {
                        const newTableCardForPlayer = this.playerStockPile[this.redCardCounter];
                        this.showTableCardMovementAnimation(newTableCardForPlayer, this.playerStockPileImage!.x, this.playerStockPileImage!.y, this.tableCardPositions![1].x, this.tableCardPositions![1].y);
                        this.redCardCounter++;
                        setTimeout(() => {
                            this.tableCard2!.destroy();
                            this.tableCard2 = newTableCardForPlayer;
                        }, 1500);
                    }
                    this.isUpdatingTableCards = false;
                }

                // ハウスについてだけ
                if (isHouseStockPileEmpty) {
                    this.isUpdatingTableCards = true;
                    this.placeCardFromHand(this.houseHandSet, 1);
                    this.isUpdatingTableCards = false;
                } else {
                    this.isUpdatingTableCards = true;
                    if (this.blackCardCounter < this.houseStockPile.length) {
                        const newTableCardForHouse = this.houseStockPile[this.blackCardCounter];
                        this.showTableCardMovementAnimation(newTableCardForHouse, this.houseStockPileImage!.x, this.houseStockPileImage!.y, this.tableCardPositions![0].x, this.tableCardPositions![0].y);
                        this.blackCardCounter++;
                        setTimeout(() => {
                            this.tableCard1!.destroy();
                            this.tableCard1 = newTableCardForHouse;
                        }, 1500);
                    }
                    this.isUpdatingTableCards = false;
                }
            }
            this.lastTableCardUpdateTime = currentTime;
        }
        // this.lastPlayerActionTime = currentTime;
    }

    // tableCard更新時のアニメーション
    private showTableCardMovementAnimation(
        card: Card,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
    ) {
        const { width, height } = this.game.canvas;
        // カードの開始位置を設定
        card.setDisplaySize(width * 0.08, width * 0.11)
        card.setPosition(fromX, fromY);
        card.setVisible(true);
        this.add.existing(card);

        // 光のパルスエフェクトを追加
        this.tweens.add({
            targets: card,
            alpha: { start: 1, to: 0.5 },
            duration: 200,
            yoyo: true,
            repeat: 3
        });

        // カードを移動するためのtweenアニメーションを作成
        this.tweens.add({
            targets: card,
            x: toX,
            y: toY,
            duration: 1000, // アニメーションの持続時間（ミリ秒）
            ease: 'Linear', // イージングのタイプ（必要に応じて調整可能）
            onComplete: () => {
                card.setDepth(0); // アニメーション完了後にカードの深度を設定
            }
        });
    }

    // cardDisplayを消すことになる);
    private refillHandCardAnimation(
        card: Card,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
    ) {
        const { width, height } = this.game.canvas;
        // カードの移動前のサイズと位置を設定
        card.setDisplaySize(width * 0.08, width * 0.11)
        card.setPosition(fromX, fromY);
        card.setVisible(true);
        card.setDepth(1);
        this.add.existing(card);

        // カードの移動アニメーション
        this.tweens.add({
            targets: card,
            x: toX,
            y: toY,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                // アニメーション完了後のカードの設定
                card.setInteractive({ useHandCursor: true, draggable: true });
                card.setData('originalPosition', { x: card.x, y: card.y });
            }
        });
    }

    private placeCardFromHand(handSet: Card[], tableCardNumber: number) {
        if (handSet.length > 0) {
            const card = handSet[0]; // ハンドセットの最初のカードを取得
            card.disableInteractive(); // カードのインタラクティブ機能を無効化

            // テーブルカードの位置にカードを移動し、テーブルカードを更新
            const cardPosition = tableCardNumber === 1 ? this.tableCardPositions![0] : this.tableCardPositions![1];
            card.setPosition(cardPosition.x, cardPosition.y);
            card.setDepth(0); // テーブルカードの深度に設定

            if (tableCardNumber === 1) {
                if (this.tableCard1) this.tableCard1.destroy(); // 古いテーブルカードを破棄
                this.tableCard1 = card;
            } else if ((tableCardNumber === 2)) {
                if (this.tableCard2) this.tableCard2.destroy(); // 古いテーブルカードを破棄
                this.tableCard2 = card;
            }

            handSet.splice(0, 1); // ハンドセットからカードを削除
            this.determineWinner();
        }
    }

    // AI独自の行動ロジック
    private performAiAction(currentTime: number) {
        //置けるカードを発見。なければupdateTableCardsIfNeeded関数に任せるから何もしない！
        const playableCards = this.houseHandSet.filter(card =>
            this.canPlaceCardOnTable(card, 1) || this.canPlaceCardOnTable(card, 2));
        if (playableCards.length > 0) {
            // 置けるカードがあれば、その中から一枚を選んでプレイする
            const selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];
            const tableCardNumber = this.determineTableCardNumber(selectedCard);

            // カードをテーブルに置く
            if (tableCardNumber !== 0) {
                // カードをテーブルに置く
                this.placeCardOnTableForHouse(selectedCard, tableCardNumber);
                this.handleCardDrop(selectedCard, selectedCard.getData('originalPosition'));
                this.lastTableCardUpdateTime = currentTime;
            }
        }

    }

    private determineTableCardNumber(card: Card): number {
        // カードのランクを取得
        const cardRank = card.getRankNumberOfSpeed();

        // テーブルのカードのランクを取得
        const tableCard1Rank = this.tableCard1 ? this.tableCard1.getRankNumberOfSpeed() : null;
        const tableCard2Rank = this.tableCard2 ? this.tableCard2.getRankNumberOfSpeed() : null;

        // それぞれのテーブルカードにカードを置けるかどうかを確認
        const canPlaceOnTableCard1 = tableCard1Rank !== null && this.isNextRank(cardRank, tableCard1Rank);
        const canPlaceOnTableCard2 = tableCard2Rank !== null && this.isNextRank(cardRank, tableCard2Rank);

        if (canPlaceOnTableCard1) {
            return 1;
        } else if (canPlaceOnTableCard2) {
            return 2;
        }

        // どちらにも置けない場合は何もしない
        return 0;
    }


    // ハンドカードを所定のテーブルカードの上に置く
    private placeCardOnTable(card: Card, tableCardNumber: number) {
        const position = this.tableCardPositions![tableCardNumber - 1];
        card.setPosition(position.x, position.y);
        card.setDepth(0); // テーブルカードの深度

        if (tableCardNumber === 1) {
            if (this.tableCard1) this.tableCard1.destroy();
            this.tableCard1 = card;
        } else {
            if (this.tableCard2) this.tableCard2.destroy();
            this.tableCard2 = card;
        }
    }

    // ハウスのアニメーションのために別途作成
    private placeCardOnTableForHouse(card: Card, tableCardNumber: number) {
        // カードの最終的な位置を決定
        this.isAiMovingCard = true;
        const finalPosition = this.tableCardPositions![tableCardNumber - 1];

        // カードをアニメーションで移動
        this.tweens.add({
            targets: card,
            x: finalPosition.x,
            y: finalPosition.y,
            duration: 300, // アニメーションの持続時間（ミリ秒）
            ease: 'Power2', // イージングのタイプ
            onComplete: () => {
                // アニメーション完了後の処理
                card.setDepth(0); // テーブルカードの深度に設定
                // カードの更新
                if (tableCardNumber === 1) {
                    if (this.tableCard1) this.tableCard1.destroy();
                    this.tableCard1 = card;
                } else {
                    if (this.tableCard2) this.tableCard2.destroy();
                    this.tableCard2 = card;
                }
                this.isAiMovingCard = false;
            }
        });
    }

    private startHouseActions() {
        this.lastActionTime = this.game.getTime();
    }

    update(time: number) {
        // AI用に作る
        if (this.canHouseAct && time - this.lastActionTime > this.aiActionInterval) {
            this.performAiAction(time);
            this.lastActionTime = time;
            if (!this.isUpdatingTableCards) {
                this.updateTableCardsIfNeeded(time);
            }
        }

        if (this.redCardCounter === this.playerStockPile.length && this.playerStockPileImage) {
            this.playerStockPileImage.setVisible(false);
        }

        if (this.blackCardCounter === this.houseStockPile.length && this.houseStockPileImage) {
            this.houseStockPileImage.setVisible(false);
        }
    }

    // プレイヤーがハンドカードをテーブルカードに置く時の効果音
    playPutCardSound() {
        this.sound.play('putCard_sound');
    }

    // リプレイの決定。ローディングシーンに飛ばすか
    // 賭け金＝固定。所持金の設定？
    // リプレイの決定
    private askForGameReplay() {
        const { width, height } = this.game.canvas;
        // 実行を遅延
        this.time.delayedCall(2500, () => {
            this.add.text(width * 0.85, height * 0.75, "Play again?", { fontSize: '32px' }).setOrigin(0.5);

            const yesButtonConfig: ReplayPositionConfig = {
                offsetX: 0.79,
                offsetY: 0.83,
                text: 'YES',
                color: '#00FF00',
                onClick: () => { }
            };
            const zone_yes = createYNButton(this, yesButtonConfig);
            // Yesをクリック→リスタート
            zone_yes.on('pointerdown', () => {
                this.sound.play('tap_sound'); // クリック時の効果音
                this.scene.start('game', { timelineID: 'start' });
            });

            // Noボタン
            const noButtonConfig: ReplayPositionConfig = {
                offsetX: 0.91,
                offsetY: 0.83,
                text: 'NO',
                color: '#FF0000',
                onClick: () => { }
            };
            const zone_no = createYNButton(this, noButtonConfig);
            // Noをクリックしたら初期画面に遷移
            zone_no.on('pointerdown', () => {
                this.sound.play('tap_sound');
                window.location.href = '/';
            });
        });
    }
}

export const setBackground = (
    scene: Phaser.Scene, // Phaser.Scene のインスタンスを受け取る
    width: number,
    height: number,
    imageKey: string,
    scale: { x: number; y: number }
) => {
    scene.cameras.main.setBackgroundColor('#242424');
    const backgroundImage = scene.add.image(width / 2, height / 2, imageKey).setOrigin(0.5, 0.5);
    backgroundImage.setScale(scale.x, scale.y);
};

// 結果の帯を作成
export const createBand = (
    scene: Phaser.Scene
): { container: Phaser.GameObjects.Container, resultText: Phaser.GameObjects.Text } => {

    const { width } = scene.scale;
    const bandHeight = 100;
    const resultContainer = scene.add.container(0, -bandHeight); // コンテナ作成。画面の上から開始
    const band = scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
    band.fillRect(0, 0, width, bandHeight);
    band.setDepth(3);

    // 勝ち負けの結果を表示するテキストオブジェクト
    const resultText = scene.add.text(width / 2, bandHeight / 2, '', {
        fontSize: '60px',
        color: '#ffffff'
    }).setOrigin(0.5);
    resultText.setDepth(3);

    // 帯とテキストをコンテナに追加
    resultContainer.add(band);
    resultContainer.add(resultText);

    return { container: resultContainer, resultText };
};

export const showBandAnimation = (
    scene: Phaser.Scene,
    resultContainer: Phaser.GameObjects.Container,
    resultText: Phaser.GameObjects.Text,
    gameResult: string,
    winText: string,
    loseText: string,
    drawText: string
): void => {
    const bandHeight = 100;
    const { height } = scene.scale;

    // 結果テキストを設定
    let displayText = '';
    switch (gameResult) {
        case 'win':
            displayText = winText;
            break;
        case 'lose':
            displayText = loseText;
            break;
        case 'draw':
            displayText = drawText;
    }
    resultText.setText(displayText);

    // コンテナのアニメーション
    scene.tweens.add({
        targets: resultContainer,
        y: height * 0.4 - bandHeight / 2,
        duration: 1000,
        ease: 'Power2'
    });

    // 効果音を再生
    const soundKey = gameResult + '_sound';
    scene.sound.play(soundKey);
};

// YES/NO ボタン
export const createYNButton = (
    scene: Phaser.Scene,
    config: ReplayPositionConfig
) => {

    const { width, height } = scene.scale;

    const bg = scene.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(config.color).color, 0.5);
    bg.fillRect(width * config.offsetX - 50, height * config.offsetY - 25, 100, 50);

    const textArea = scene.add.text(width * config.offsetX, height * config.offsetY, config.text, {
        font: '28px Arial',
        color: '#FFFFFF'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    // クリックイベントを設定
    textArea.on('pointerdown', config.onClick);

    return textArea;
};