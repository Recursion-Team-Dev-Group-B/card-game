import * as Phaser from 'phaser';
import PokerPlayer from '@/scenes/poker/common/pokerPlayer';
import PokerAI from '@/scenes/poker/common/pokerAI';
import Pot from '@/scenes/poker/common/pot';
import ContaierHelper from '../helpers/ContainerHelper';
import Card from '@/scenes/poker/refactoring/Card';
//import Card from '@/scenes/poker/common/Card';
import Deck from '@/scenes/poker/common/deck';
import commonConfig from '@/scenes/poker/common/config';

import { thisTypeAnnotation, tupleExpression, tsImportEqualsDeclaration } from '@babel/types';
import { Gothic_A1 } from 'next/font/google';
import { resolve } from 'styled-jsx/css';
import { start } from 'repl';
import StackScene from '@/scenes/blackjack/stackScene';
import ViewBet from '../refactoring/viewBet';

export default class PokerTable {

    public scene: Phaser.Scene;

    // playersではない方法の方がいいかも
    public players: Array<PokerPlayer | PokerAI>;
    public curretPlayerIndex: number;
    public deck: Deck;
    public pot: Pot;
    public actions: Array<string>;
    public rounds: Array<string>;
    public currentRound: string;
    public roundCounter: number;
    public currentRoundIndex: number;
    public turnCounter: number;
    public dealerCounter: number;
    public currentDealerIndex: number | undefined;
    public checkPlayerTurnEnd: Map<string, boolean>;
    public isNoContest: boolean;
    public actionHistroy: Array<string>;

    // ラウンドで変化する掛け金
    public roundBet: number;

    // 参加料
    public ante: number;

    // 場に出ているカードを持つ、捨て札の作成に使用
    public communityCardList: Array<Card>;

    // 変数名が微妙 後で検討
    public containerHelper: ContaierHelper;

    public handRanking: { [key: string]: number };

    public sounds: { [key: string]: Phaser.Sound.BaseSound };
    public isGameOver: boolean;

    // betModal
    public modalContainer: Phaser.GameObjects.Container;
    public modalBackground: Phaser.GameObjects.Rectangle;
    public viewBet: ViewBet | undefined;
    public isShowModalBet: boolean;
    /*  
    */


    constructor(
        scene: Phaser.Scene,
        players: Array<PokerPlayer | PokerAI>,
        pot: Pot,
        containerHelpler: ContaierHelper
    ) {
        this.scene = scene;
        this.players = players;
        this.curretPlayerIndex = 0;
        this.deck = new Deck(this.scene);
        this.pot = pot;
        this.containerHelper = containerHelpler;
        this.actions = ['bet', 'call', 'fold', 'raise', 'check', 'allin'];
        this.rounds = ['preflop', 'flop', 'turn', 'river'];
        this.currentRound = this.rounds[0];
        this.roundCounter = 0;
        this.currentRoundIndex = 0;
        this.turnCounter = 0;
        this.dealerCounter = 0;
        this.communityCardList = [];

        this.roundBet = 100;
        this.ante = 100;
        this.checkPlayerTurnEnd = this.createaCheckPlayerTurnEnd(this.players);
        this.isNoContest = false;
        this.currentDealerIndex = 0;
        this.actionHistroy = [];
        this.handRanking = {
            // ロイヤルフラッシュ  
            'royalFlash': 9,
            // ストレートフラッシュ 
            'straightFlash': 8,
            // フォーカード 
            'forOfaKind': 7,
            // フルハウス 
            'fullHouse': 6,
            // フラッシュ 
            'flash': 5,
            // ストレート　 
            'straight': 4,
            // スリーカード 
            'threeOfaKind': 3,
            // ツーペア 
            'twoPair': 2,
            // ワンペア
            'onePair': 1,
        }
        this.sounds = this.createSounds();
        this.isGameOver = false;
        this.modalContainer = this.containerHelper.createModal();
        this.modalBackground = this.modalContainer.getData('background');
        this.viewBet = this.createViewBet();
        this.isShowModalBet = false;

    }


    // プレイヤーがそのターンを終了したか記録する連想配列を生成する
    // 例 {playerName: true, playerName: false}
    createaCheckPlayerTurnEnd(players: Array<any>): Map<string, boolean> {
        const map: Map<string, boolean> = new Map();

        for (let i in players) {
            map.set(players[i].name, false);
        }

        return map;
    }

    createSounds(): { [key: string]: Phaser.Sound.BaseSound } {
        return {
            'cardFlip': this.scene.sound.add('sound_card_flip').setVolume(0.5),
            'cardDeal': this.scene.sound.add('sound_card_deal').setVolume(0.5),
            'win': this.scene.sound.add('sound_win').setVolume(0.5),
            'lose': this.scene.sound.add('sound_lose').setVolume(0.5),
            'draw': this.scene.sound.add('sound_draw').setVolume(0.6),
            'click': this.scene.sound.add('sound_click').setVolume(0.6),
        }

    }

    createViewBet(): ViewBet | undefined {
        const pokerPlayer = this.players.find(player => player instanceof PokerPlayer)

        if (!pokerPlayer) {
            return undefined;
        }

        return this.createModalBet(pokerPlayer, this.modalContainer);
    }

    // ゲームを始める前にロードを行う
    loading() {
        const startText = this.scene.add.text(0, 0, 'Click To Start').setOrigin(0.5);
        startText.setFontSize(30);
        startText.setX(commonConfig.phaserConfig.width / 2);
        startText.setY(commonConfig.phaserConfig.height / 2);

        const fillZone = this.scene.add.zone(0, 0, commonConfig.phaserConfig.width, commonConfig.phaserConfig.height);
        this.createHomeButton();
        fillZone.setOrigin(0, 0);
        fillZone.setInteractive();
        fillZone.on('pointerdown', () => {
            startText.destroy();
            fillZone.destroy();
            this.gameStart();
        })
    }

    // ゲームを始める
    // 初期化のメソッドと分けた方が良いかも
    gameStart() {
        this.deck.shuffle();
        // プレイヤーの所持金を取得
        for (let i in this.players) {
            let playerType = this.players[i].playerType
            if (playerType === 'player') {
                //this.updatePlayerAmountText(this.containerHelper.playerContainer, this.players[i].chips);
                this.updateDisplayPlayerAmount(this.players[i]);

            } else if (playerType === 'ai') {
                // this.updatePlayerAmountText(this.containerHelper.houseContainer, this.players[i].chips);
                this.updateDisplayPlayerAmount(this.players[i]);

            }
        }

        // ディーラーをランダムで決める
        this.selectRandamDealer();

        // 現在のディーラーを取得する
        this.currentDealerIndex = this.getDealerIndex();

        // なぜかpointerdownが２回登録されてしまうのでoffを設定する
        this.containerHelper.gameZone.off('pointerdown');

        this.handleRound();
    }


    async handleRound() {

        // 最終ラウンドでゲームゾーンがオンになるのでゲームゾンをオフにする
        this.containerHelper.gameZone.off('pointerdown');

        // ユーザープレイヤーの所持金が０の場合,ゲームを終了する
        for (let player of this.players) {
            await this.checkHasNoMoney(player);
        }

        if (!this.isGameOver) {
            /*
                毎ラウンド始まる前の処理
            */
            // riverが終わったら場のカードを捨て札に加え、コンテナに追加されたcardImageを削除
            if (this.communityCardList.length === 5 || this.currentRound === 'preflop') {
                this.resetTurn();
                // 山札が足りるか確認する、足りなければ作る
                this.dealCards();
            }

            // プリフロップターン
            if (this.currentRound === 'preflop') {
                this.resetRound();

                // ラウンド毎の掛け金を０にする
                this.roundBet = 0;

                // 参加料の処理 potの処理
                this.payAnte(this.ante, this.players);

                await this.delay(1);

                // プレイヤーに手札を配る
                for (let player of this.players) {
                    if (player.playerType === 'player') {
                        if (player.hand != undefined) {
                            await this.animateDealingTypeArray(
                                player.hand,
                                (commonConfig.phaserConfig.width / 12) * 5,
                                commonConfig.container.player.height / 2,
                                commonConfig.card.playerSpace,
                            );
                        };

                        this.animatePlayerHandOpen(player);
                    } else if (player.playerType === 'ai') {
                        await this.animateDealingTypeArray(
                            player.hand,
                            (commonConfig.container.house.width / 12) * 5,
                            commonConfig.container.house.height / 2,
                            commonConfig.card.playerSpace,
                        );
                    };
                };

                // 現在のプレイヤーを取得する アクション処理をする
                await this.handleRoundActions();


                // ノーコンテストの判定
                if (this.isNoContest) {

                    const winners = this.determineWinner();
                    this.deleteCommunityCard();
                    this.winnerAmountProcess(winners);

                    this.containerHelper.gameZone.on('pointerdown', () => {

                        // アクションをリセット
                        this.resetallPlayerAction();
                        // ラウンドを初期化
                        this.resetCurrentRoundIndex();
                        // ノーコンテストを初期化
                        this.nextDealer();
                        this.handleRound();
                    })
                } else {
                    //　ラウンドを進める
                    if (this.allPlayerDane()) {
                        this.nextRound();
                        this.handleRound();
                    }
                }

            } else if (this.currentRound === 'flop') {
                this.resetRound();
                // ラウンド毎の掛け金を０にする
                this.roundBet = 0;


                await this.delay(1);
                //  テーブルの場のカードに１枚追加する
                for (let i = 0; i < 3; i++) {
                    this.addCommunityOneCard();
                }
                this.animateDealingTypeArray(
                    this.communityCardList,
                    (commonConfig.container.community.width / 12) * 3.5,
                    commonConfig.container.community.height / 2,
                    commonConfig.card.communitySpace,
                )

                for (let card of this.communityCardList) {
                    await this.delay(0.6);
                    this.animateCardOpen(card);
                };

                // アニメーションのために少し遅延
                await this.delay(1);
                // 現在のプレイヤーを取得する アクション処理をする
                await this.handleRoundActions();

                // ノーコンテストの判定
                if (this.isNoContest) {
                    const winners = this.determineWinner();
                    this.deleteCommunityCard();
                    this.winnerAmountProcess(winners);
                    this.containerHelper.gameZone.on('pointerdown', () => {
                        // ラウンドを初期化
                        this.resetCurrentRoundIndex();
                        this.nextDealer();
                        this.handleRound();
                    })
                } else {
                    //　ラウンドを進める
                    if (this.allPlayerDane()) {
                        this.nextRound();
                        this.handleRound();
                    }
                }

            } else if (this.currentRound === 'turn') {
                this.resetRound();

                // ラウンド毎の掛け金を０にする
                this.roundBet = 0;

                await this.delay(1);
                //場にカードを１枚追加する
                this.addCommunityOneCard();
                const card = this.communityCardList[this.communityCardList.length - 1];
                await this.animateDealing(
                    card,
                    this.communityCardList[0].x,
                    this.communityCardList[0].y,
                    commonConfig.card.communitySpace,
                    this.communityCardList.length - 1,
                );
                await this.delay(0.5);
                await this.animateCardOpen(card);


                await this.handleRoundActions();

                if (this.isNoContest) {
                    const winners = this.determineWinner();
                    this.deleteCommunityCard();
                    this.winnerAmountProcess(winners);

                    this.containerHelper.gameZone.on('pointerdown', () => {
                        // ラウンドを初期化
                        this.resetCurrentRoundIndex();
                        // アクションをリセット
                        this.resetallPlayerAction();
                        this.nextDealer();
                        this.handleRound();
                    })
                } else {
                    if (this.allPlayerDane()) {
                        this.nextRound();
                        this.handleRound();
                    }
                }

            } else if (this.currentRound === 'river') {

                this.resetRound();

                // ラウンド毎の掛け金を０にする
                this.roundBet = 0;

                await this.delay(1);
                //場にカードを１枚追加する
                this.addCommunityOneCard();
                const card = this.communityCardList[this.communityCardList.length - 1];
                await this.animateDealing(
                    card,
                    this.communityCardList[0].x,
                    this.communityCardList[0].y,
                    commonConfig.card.communitySpace,
                    this.communityCardList.length - 1,
                );
                await this.delay(0.3);
                await this.animateCardOpen(card);

                await this.delay(0.5);
                await this.handleRoundActions();

                // ノーコンテストの判定
                if (this.isNoContest) {
                    const winners = this.determineWinner();
                    this.deleteCommunityCard();
                    this.winnerAmountProcess(winners);
                    this.containerHelper.gameZone.on('pointerdown', () => {
                        // ラウンドを初期化
                        this.resetCurrentRoundIndex();
                        // アクションをリセット
                        this.resetallPlayerAction();
                        this.nextDealer();
                        this.handleRound();
                    })
                } else {

                    // showdawn
                    //　手役の判定を行い、勝敗をつけ、お金の移動を行う
                    await this.flipCardToAI();
                    await this.delay(2);
                    const winners = this.determineWinner();
                    this.deleteCommunityCard();
                    this.displayHandRankText();
                    this.winnerAmountProcess(winners);

                    // riverが最終ラウンドなので、最初に戻る
                    if (this.allPlayerDane()) {
                        this.containerHelper.gameZone.on('pointerdown', () => {
                            this.nextDealer();
                            this.nextRound();
                            // アクションをリセット
                            this.resetallPlayerAction();
                            this.handleRound();
                        });
                    }

                }

            }
        }
    }

    // ラウンド処理のリファクタリング
    async roundProcess() {

        // ターン毎の初期化
        this.resetTurn();

        // ラウンド毎の掛け金を０にする
        this.roundBet = 0;

        // 参加料の処理 potの処理
        this.payAnte(this.ante, this.players);

        if (this.currentRound === 'preflop') {
            // 最終ラウンドでゲームゾーンがオンになるのでゲームゾンをオフにする

            // 現在のプレイヤーを取得する アクション処理をする
            await this.handleRoundActions();

        } else if (this.currentRound === 'river') {
            // 現在のプレイヤーを取得する アクション処理をする
            await this.handleRoundActions();

        } else {

            // 現在のプレイヤーを取得する アクション処理をする
            await this.handleRoundActions();
        }
    }

    resetRound() {
        this.updateRoundText(
            this.containerHelper.communityContainer,
            this.currentRound,
        );
        /* controller */

        // プレイヤーのターンチェックをリセット
        this.resetPlayersTurn();

        // アクション履歴をリセット
        this.clearActionHistory();

        //　プレイヤーの掛け金をリセット
        this.resetPlayersBetText(this.players);

        // currentPlayerを設定する
        this.setCurrentPlayer();

        // アクションをリセット
        this.resetallPlayerAction();

        // ラウンド毎の掛け金を０にする
        this.roundBet = 0;


        /* view */

        // 現在表示されているアクションボタンを削除
        this.deleteActionButton();


    }

    resetTurn() {

        /* controller */
        // このターン使用した場のカードを捨て札に加え,場のカードの情報を初期化する
        this.deck.discardList.push(...this.communityCardList);
        for (let i in this.players) {
            const currentPlayer = this.players[i]
            this.deck.discardList.push(...currentPlayer.hand);
            currentPlayer.clearHand();
        }
        this.communityCardList = [];



        // view 
        // コミュニティコンテナからphaserのカードイメージを削除する
        let deleteCards = this.containerHelper.communityContainer.getAll('type', 'Image');
        this.deleteCardsArrayFromContainer(this.containerHelper.communityContainer, deleteCards);
        this.containerHelper.communityContainer.setData('cards', '');

        // プレイヤーコンテナからphaserのカードイメージを削除する
        deleteCards = this.containerHelper.playerContainer.getAll('type', 'Image');
        this.deleteCardsArrayFromContainer(this.containerHelper.playerContainer, deleteCards);

        // ハウスコンテナからphaserのカードイメージを削除する
        deleteCards = this.containerHelper.houseContainer.getAll('type', 'Image');
        this.deleteCardsArrayFromContainer(this.containerHelper.houseContainer, deleteCards);

        // 手役の表示を消す
        this.clearHandRankText(this.containerHelper.playerContainer);
        this.clearHandRankText(this.containerHelper.houseContainer);

        // プレイヤーの初期化
        this.clearPlayersStatusForTurn();


        // ラウンド終了時のアナウンスを削除
        this.clearInfomationToGameEnd();

        // ディーラーテキストを表示する
        this.displayDealerText();


        // ディーラーが１周していたら参加料を増やす
        this.checkRaiseAnte();

        // ノーコンテストを初期化
        this.isNoContest = false;

        // プレイヤーの表示情報を更新
        this.players.forEach(player => {
            if (player.playerType === 'player') {
                this.updateDisplayPlayerAmount(player);
                this.updatePlayerBetText(player, this.containerHelper.playerContainer);
                this.updatePlayerActionText(player.action, this.containerHelper.playerContainer);
            } else {
                this.updateDisplayPlayerAmount(player);
                this.updatePlayerBetText(player, this.containerHelper.houseContainer);
                this.updatePlayerActionText(player.action, this.containerHelper.houseContainer);
            }
        })

        // テーブルの初期化
        this.resetCurrentRoundIndex();
        this.roundCounter = 0;
        this.turnCounter = 0;
    }


    // コンテナに追加されているカードオブジェクトを削除する, 引数が配列
    deleteCardsArrayFromContainer(
        container: Phaser.GameObjects.Container,
        deleteCards: Phaser.GameObjects.GameObject[]
    ) {
        for (let i in deleteCards) {
            const card = deleteCards[i];
            container.remove(card);
            card.destroy();
        }
    }

    // コンテナにカードオブジェクトを入れる
    addCardToContainer(
        container: Phaser.GameObjects.Container,
        card: Card,
        positionX: number,
        positionY: number,
        scaleX: number,
        scaleY: number
    ) {
        const cardObject = this.containerHelper.imageHelper.createCardObject(
            card,
            positionX,
            positionY,
            scaleX,
            scaleY
        )
        container.add(cardObject);
    }

    // コンテナにカードオブジェクトを入れる. 引数がカードの配列
    addCardsArrayToContainer(
        container: Phaser.GameObjects.Container,
        cards: Array<Card | undefined>,
        positionX: number,
        positionY: number,
        scaleX: number,
        scaleY: number
    ) {
        let cardObject = null;
        for (let i = 0; i < cards.length; i++) {
            if (i === 0) {
                cardObject = this.containerHelper.imageHelper.createCardObject(
                    cards[i],
                    positionX,
                    positionY,
                    scaleX,
                    scaleY
                )
                container.add(cardObject);
            } else {
                cardObject = this.containerHelper.imageHelper.createCardObject(
                    cards[i],
                    cardObject.x * 1.3,
                    positionY,
                    scaleX,
                    scaleY
                )
                container.add(cardObject);
            }
        }
    }

    //  プレイヤーに手札を配る
    dealCards() {
        for (let i in this.players) {
            const currentPlayer = this.players[i];
            if (currentPlayer.playerType === 'player') {

                for (let i = 0; i < 2; i++) {
                    const drawCard = this.deck.drawOne();
                    if (drawCard != undefined) {
                        currentPlayer.hand.push(drawCard);
                        drawCard.back();
                    }
                }
                const drawCards: Array<Card | undefined> = [...currentPlayer.hand];
                this.addCardsArrayToContainer(
                    this.containerHelper.playerContainer,
                    drawCards,
                    //(commonConfig.phaserConfig.width / 12) * 5,
                    //commonConfig.container.player.height / 2,
                    commonConfig.animation.dealCard.startX,
                    commonConfig.animation.dealCard.startY,
                    commonConfig.card.backScaleX,
                    commonConfig.card.backScaleY,
                );

            } else if (currentPlayer.playerType === 'ai') {
                // ハウス
                for (let i = 0; i < 2; i++) {
                    const drawCard = this.deck.drawOne();
                    if (drawCard != undefined) {
                        currentPlayer.hand.push(drawCard);
                        drawCard.back();
                    }
                }
                const drawCards: Array<Card | undefined> = [...currentPlayer.hand];
                this.addCardsArrayToContainer(
                    this.containerHelper.houseContainer,
                    drawCards,
                    commonConfig.animation.dealCard.startX,
                    commonConfig.animation.dealCard.startY,
                    commonConfig.card.backScaleX,
                    commonConfig.card.backScaleY,
                );
            }
        }
    };

    // aiのアクション処理
    aiChooseAction(action: string, bet: number, player: PokerAI) {
        switch (action) {
            case 'bet':
                this.actionBet(player, bet);
                break;

            case 'call':
                this.actionCall(player, bet);
                break;

            case 'raise':
                this.actionRaise(player, bet);
                break;

            case 'fold':
                this.actionFold(player);
                break;

            case 'check':
                this.actionCheck(player);
                break;

            case 'allin':
                this.actionAllin(player);
                break;
        }
    }

    // 
    // プレイヤーのアクションボタンがクリックされたら各アクションを実行
    async handleButtonClick(btn: Phaser.GameObjects.Text | string, player: PokerPlayer | PokerAI, bet: number): Promise<any> {

        const btnText = typeof btn === 'string' ? btn : btn.getData('action');
        switch (btnText) {
            case 'bet':
                if (player.chips >= bet && this.roundBet < bet) {
                    this.deleteInsufficientBetText();
                    await this.actionBet(player, bet);
                    return true;
                } else {
                    if (player.playerType === 'player') {
                        this.showInsufficientBetAlert();
                    }
                    return false;
                }

            case 'call':
                if (player.chips >= bet) {
                    this.deleteInsufficientBetText();
                    this.actionCall(player, bet);
                    return true;
                } else {
                    if (player.playerType === 'player') {
                        this.showInsufficientBetAlert();
                    }
                    return false;
                }

            case 'raise':
                bet = this.actionRaiseHelper(bet);
                // ベッドが掛け金の２倍以上
                if (player.chips >= bet && this.roundBet * 2 <= bet) {
                    this.deleteInsufficientBetText();
                    await this.actionRaise(player, bet);
                    return true;
                } else {
                    if (player.playerType === 'player') {
                        this.showInsufficientBetAlert();
                    }
                    return false;
                }

            case 'fold':
                this.deleteInsufficientBetText();
                this.actionFold(player);
                return true;

            case 'check':
                this.deleteInsufficientBetText();
                this.actionCheck(player);
                return true;

            case 'allin':
                this.deleteInsufficientBetText();
                this.actionAllin(player);
                return true;
        }
    };



    //　各アクションの処理 ['bet', 'call',  'fold', 'raise', 'check', 'allin']
    // betはプレイヤーが掛けた金額だが、金額を入力する
    async actionBet(player: PokerPlayer | PokerAI, bet: number) {
        if (player instanceof PokerPlayer) {
            await this.showBetModal();
        } else {
            player.bet = bet;
        }
        player.chips -= player.bet;
        this.pot.addAmount(player.bet);
        this.roundBet = player.bet;
        this.updateCommunityBetText();
        player.action = this.actions[0];
        this.actionHistroy.push(player.action);
    }

    actionCall(player: PokerPlayer | PokerAI, bet: number) {
        player.bet = bet;
        player.chips -= player.bet;
        this.pot.addAmount(player.bet);
        this.roundBet = player.bet;
        this.updateCommunityBetText();
        player.action = this.actions[1];
        this.actionHistroy.push(player.action);
    }

    actionFold(player: PokerPlayer | PokerAI) {
        player.action = this.actions[2];
        this.actionHistroy.push(player.action);
        player.isActive = false;
    }

    async actionRaise(player: PokerPlayer | PokerAI, bet: number) {
        if (player instanceof PokerPlayer) {
            player.bet = this.roundBet;
            await this.showBetModal();
        } else {
            player.bet = bet;
        }
        player.chips -= player.bet;
        this.pot.addAmount(player.bet);
        this.roundBet = player.bet;
        this.updateCommunityBetText();
        player.action = this.actions[3];
        this.actionHistroy.push(player.action);
        // 他プレイヤーのターンエンドをfalseにする
        this.updateTurnsForNewRaise();
    }

    actionRaiseHelper(bet: number): number {
        // 場の掛け金とプレイヤーの掛け金が同じであれば自動的に掛け金を倍にする
        if (this.roundBet === 0) {
            bet = bet * 2;
        } else {
            bet = this.roundBet * 2;
        }
        return bet;
    }

    actionCheck(player: PokerPlayer | PokerAI) {
        player.bet = 0;
        player.action = this.actions[4];
        this.actionHistroy.push(player.action);
    }

    actionAllin(player: PokerPlayer | PokerAI) {
        player.bet = player.chips;
        player.chips = 0;
        this.pot.addAmount(player.bet);
        this.roundBet = player.bet;
        this.updateCommunityBetText();
        player.action = this.actions[5];
        this.actionHistroy.push(player.action);
    }


    // アクションを初期化にする
    resetallPlayerAction() {
        this.players.forEach(player => {
            if (this.currentRound === 'preflop' || player.action != 'allin') {
                player.action = '';
            }
        })
    }

    // クリックされたボタンを取得し返す
    excuteActionOnButtonClick(btns: Array<any>) {

        if (btns != undefined) {
            return new Promise(resolve => {

                btns.forEach(btn => {
                    btn.setInteractive();
                    btn.off('pointerdown');
                    btn.on('pointerdown', () => {

                        return resolve(btn);
                    });
                });
            })
        }
    }

    // 参加料（アンティ）を支払う
    payAnte(ante: number, players: Array<any>) {
        this.ante = ante;
        players.forEach(player => {

            // プレイヤーの所持金の計算、ポットの更新
            if (player.chips > ante) {
                player.chips -= ante;
                this.pot.addAmount(ante);
            };
            this.updatePotAmountText();

            // 金額の表示を更新する
            if (player.playerType === 'player') {
                //this.updatePlayerAmountText(this.containerHelper.playerContainer, player.chips);
                this.updateDisplayPlayerAmount(player);
            } else if (player.playerType === 'ai') {
                //this.updatePlayerAmountText(this.containerHelper.houseContainer, player.chips);
                this.updateDisplayPlayerAmount(player);
            };

        });
    }

    // set: bet, check, callの３つ。bet, check, 両方でもなければcallSetのアクションボタンを生成する
    createActionButton(container: Phaser.GameObjects.Container, set: string) {

        const btns: Array<Phaser.GameObjects.Text> = [];
        if (set === 'bet' || set === 'check') {
            // bet fold check allin
            const betBtn = this.scene.add.text(0, 0, 'Bet').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            betBtn.setData('action', 'bet');
            const foldBtn = this.scene.add.text(0, 0, 'Fold').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            foldBtn.setData('action', 'fold');
            const checkBtn = this.scene.add.text(0, 0, 'Check').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            checkBtn.setData('action', 'check');
            const allInBtn = this.scene.add.text(0, 0, 'ALL IN').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            allInBtn.setData('action', 'allin');
            const pushBtns = [betBtn, foldBtn, checkBtn, allInBtn];
            btns.push(...pushBtns);


        } else if (set === 'call') {
            // call raise fold allin 
            const callBtn = this.scene.add.text(0, 0, 'Call').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            callBtn.setData('action', 'call');
            const raiseBtn = this.scene.add.text(0, 0, 'Raise').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            raiseBtn.setData('action', 'raise');
            const foldBtn = this.scene.add.text(0, 0, 'Fold').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            foldBtn.setData('action', 'fold');
            const allInBtn = this.scene.add.text(0, 0, 'ALL IN').setOrigin(0, 0.5).setFontSize(commonConfig.text.fontSize.chooseAction);
            allInBtn.setData('action', 'allin');
            const pushBtns = [callBtn, raiseBtn, foldBtn, allInBtn];
            btns.push(...pushBtns);

        }

        this.createActionButtonHelper(btns);

        container.setData('btns', btns);

        container.add(this.containerHelper.actionButtonContainer);
    }

    // アクションボタンをコンテナーに入れる
    createActionButtonHelper(btns: Array<Phaser.GameObjects.Text>) {
        const spacing = 90;
        let width = btns[0].width;
        for (let i in btns) {
            btns[i].x = Number(i) * (width + spacing);
            btns[i].setInteractive({
                cursor: 'pointer',
            });
            this.containerHelper.actionButtonContainer.add(btns[i]);
        }

    }

    deleteActionButton() {
        if (this.containerHelper.actionContainer.getData('btns')) {
            const currentBtns = this.containerHelper.actionContainer.getData('btns');
            for (let i in currentBtns) {
                currentBtns[i].destroy();
            }
            this.containerHelper.actionContainer.remove(currentBtns);
        }
    }

    // あとで綺麗にする
    // 表示するアクションボタンを決める
    displayActionButtons() {
        // 現在表示されているアクションボタンを消す
        this.deleteActionButton();

        const lastAction = this.getLastAction();

        if (
            lastAction === 'bet' || lastAction === 'raise'
        ) {
            this.createActionButton(this.containerHelper.actionContainer, 'call');

        } else if (
            lastAction === 'check'
        ) {
            // アクションの表示
            this.createActionButton(this.containerHelper.actionContainer, 'check');

        } else {

            this.createActionButton(this.containerHelper.actionContainer, 'bet');
        }
    }


    // ユーザーの掛け金をインプットから取得する
    getBetInputValue(betInputObject: any) {
        const input = betInputObject.node.querySelector('input');
        return input.value;
    }

    // ユーザーの掛け金をインプットに設定する
    setBetInputValue(betInputObject: any, value: number) {
        const input = betInputObject.node.querySelector('input');
        input.value = value;
    }

    // 現在のプレイヤーを取得する
    getCurrentPlayer() {
        return this.players[this.curretPlayerIndex];
    }

    // 次のプレイヤーに移動する
    moveToNextPlayerIndex() {
        this.curretPlayerIndex = (this.curretPlayerIndex + 1) % this.players.length;
    }

    // ディーラーのインデックスを取得する 
    getDealerIndex(): number | undefined {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.dealer === true) {
                return i;
            }
        }
    }

    // ディーラーを次のプレイヤーに移動する
    nextDealer() {
        if (this.currentDealerIndex === undefined) {
            this.currentDealerIndex = 0;
        }

        const currentDealerPlayer = this.players[this.currentDealerIndex];
        currentDealerPlayer.dealer = false;

        this.currentDealerIndex = (this.currentDealerIndex + 1) % this.players.length;
        const nextDealerPlayer = this.players[this.currentDealerIndex];
        nextDealerPlayer.dealer = true;

    }

    // 掛け金が足りない場合はその旨を表示する
    showInsufficientBetAlert() {
        const object = this.containerHelper.actionContainer.getData('insufficientBetText');

        // すでに表示されている場合は消す
        if (object) {
            this.deleteInsufficientBetText();
        }

        const insufficientBetText = this.scene.add.text(0, 0, '掛け金が足りません').setOrigin(0, 0);
        insufficientBetText.setX((commonConfig.container.action.width / 12) * 1);
        insufficientBetText.setY(commonConfig.container.action.height / 2);
        insufficientBetText.setFontSize(23);
        this.containerHelper.actionContainer.setData('insufficientBetText', insufficientBetText);

        this.containerHelper.actionContainer.add(insufficientBetText);
    }


    // 表示されたinsufficientBetAlertを削除する
    deleteInsufficientBetText() {
        const text = this.containerHelper.actionContainer.getData('insufficientBetText');
        if (text) {
            this.containerHelper.actionContainer.remove(text);
            text.destroy();
        }
    }


    // 現在のプレイヤーが選択したアクションを取得し処理を非同期で実行する。実行先はawaitされている
    async waitForActionProcess(currentPlayer: PokerPlayer | PokerAI) {
        if (currentPlayer.isActive === true &&
            currentPlayer.action != 'allin') {

            if (currentPlayer.playerType === 'ai' && currentPlayer instanceof PokerAI) {

                const lastAction = this.getLastAction();
                const action = currentPlayer.chooseAction(this.roundBet, lastAction);

                //　仮でベットを設定　
                const bet = this.roundBet > 0 ? this.roundBet : 100;

                this.handleButtonClick(action, currentPlayer, bet);

                // 遅延させる
                await this.delay(1.5);
                this.sounds.click.play();
                this.updateDisplayPlayerAmount(currentPlayer);
                this.updatePlayerBetText(currentPlayer, this.containerHelper.houseContainer);
                this.updatePlayerActionText(currentPlayer.action, this.containerHelper.houseContainer);
                await this.delay(0.5);
                this.updatePotAmountText();
            } else {
                let result = false;

                // ボタンがクリックされるのを待ち、クリックされたボタンに応じて処理
                this.displayActionButtons();

                // 選択ボタンをonにする
                const btns = this.containerHelper.actionContainer.getData('btns');

                while (!result) {
                    const button: any = await this.excuteActionOnButtonClick(btns);
                    // ボタンがクリックされた後にプレイヤーの掛け金を取得
                    const playerBet = 100;
                    result = await this.handleButtonClick(button, currentPlayer, playerBet);
                };
                await this.delay(1.5);
                this.sounds.click.play();
                this.deleteInsufficientBetText();
                this.updateDisplayPlayerAmount(currentPlayer);
                this.updatePlayerBetText(currentPlayer, this.containerHelper.playerContainer);
                this.updatePlayerActionText(currentPlayer.action, this.containerHelper.playerContainer);
                this.updatePotAmountText();
                await this.delay(0.5);
            }
        }

    }


    // そのターンをプレイヤーが終了した場合、checkPlayerTurnEndをtrueにする
    setPlayerTurnEnd(currentPlayer: PokerPlayer | PokerAI) {
        //　ベットの金額がラウンドの掛け金と等しい、もしくはアクティブではない（降りた）

        if (currentPlayer.bet === this.roundBet ||
            !currentPlayer.isActive ||
            currentPlayer.action === 'allin'
        ) {
            if (this.checkPlayerTurnEnd.has(currentPlayer.name)) {
                this.checkPlayerTurnEnd.set(currentPlayer.name, true);
            }

        }
    }

    // 全てのプレイヤーが現在のターンを終了したか確認する
    allPlayerDane(): boolean {
        const allPlayerDone = Array.from(this.checkPlayerTurnEnd.values()).every(value => value === true);
        if (!allPlayerDone) {
            return false;
        }
        return true;
    }

    //　ラウンドを進める
    nextRound() {
        this.currentRoundIndex = (this.currentRoundIndex + 1) % this.rounds.length;
        this.currentRound = this.rounds[this.currentRoundIndex];
    }

    // ラウンドをリセット
    resetCurrentRoundIndex() {
        this.currentRoundIndex = 0;
        this.currentRound = this.rounds[this.currentRoundIndex];
    }


    // ラウンドの処理
    async handleRoundActions() {
        while (!this.allPlayerDane()) {
            const currentPlayer = this.getCurrentPlayer();

            //await this.waitForActionProcess(btns, currentPlayer);
            await this.waitForActionProcess(currentPlayer);
            this.setPlayerTurnEnd(currentPlayer);

            // コミュニティの情報を更新する
            this.updateCommunityBetText();

            // ノーコンテストかどうか調べる
            if (this.isCheckForNoContest()) {
                const winPlayers = [];
                winPlayers.push(this.players[this.getIndexNonFoldedPlayer()]);
                this.winnerAmountProcess(winPlayers);
                this.isNoContest = true;


                // 次のプレイヤーに移動する
                this.moveToNextPlayerIndex();
                break;
            }

            // プレイヤーのターンが終了したかどうか確認する
            if (this.checkPlayerTurnEnd.get(currentPlayer.name)) {
                this.moveToNextPlayerIndex();
            }

        }
    }

    updateTurnsForNewRaise() {
        this.resetPlayersTurn();

    }

    // 毎ラウンドの掛け金の金額を設定する
    setRoundBet(value: number) {
        if (this.roundBet > 100) {
            this.roundBet = value * this.roundBet;
        } else {
            this.roundBet = value;
        }
    }

    // ディーラーを設定する。一周したら掛け金をあげる
    setDealer(player: any) {
        this.players[this.dealerCounter % this.players.length].dealer = false;
        player.dealer = true;
        this.dealerCounter++;
    }


    // プレイヤーのターン終了をリセットする
    resetPlayersTurn() {
        this.checkPlayerTurnEnd.forEach((_, key) => {
            this.checkPlayerTurnEnd.set(key, false);
        });
    }

    // フォールドをしていないプレイヤーを取得する
    getIndexNonFoldedPlayer(): number {
        let counter: number = 0;
        let falsePlayerIndex: number = 0;

        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.action === 'fold') {
                counter++;
            } else {
                falsePlayerIndex = i;
            }

        }

        // １人を残して、全員foldだった場合、残ったプレイヤーのインデックスを返す
        if ((this.players.length - counter) === 1) {
            return falsePlayerIndex;
        };
        return 0;
    }

    //  プレイヤーのターンのアクションを終了する
    setNoActive(player: PokerPlayer) {
        if (player.action === 'fold') {
            player.isActive = false;
        }
    }

    // ノーコンテキストがチェックする
    isCheckForNoContest(): boolean {
        const winPlayerIndex = this.getIndexNonFoldedPlayer();
        if (winPlayerIndex > 0) {
            return true;
        }

        return false;
    }


    // 手役の強さを判定し、強さを返す
    handRankChecker(communityCard: Array<Card>, playerHand: Array<Card | undefined>): number {
        const cards = [...communityCard, ...playerHand.filter(card => card != undefined)];

        // ロイヤルフラッシュ  
        const isRoyalFlash = (cards: Array<Card | undefined>) => {
            const flash = isFlash(cards);
            const royalRank = ['A', 'K', 'Q', 'J', '10'];
            const hasRoyalRank = royalRank.every(rank =>
                cards.some(card => card?.rank === rank)
            );

            return flash && hasRoyalRank;
        }

        // ストレートフラッシュ 
        const isStraightFlash = (cards: Array<Card | undefined>) => {
            const flash = isFlash(cards);
            const rank = isStraight(cards);
            return (flash && rank);
        }

        // フォーカード 
        const isForOfaKind = (cards: Array<Card | undefined>) => {
            const rankCounts = new Map();

            cards.forEach(card => {
                //ランクの集計
                rankCounts.set(card?.rank, (rankCounts.get(card?.rank) || 0) + 1);
            });

            const forCard = Array.from(rankCounts.values()).some(count => count === 4);

            return forCard;

        }

        // フルハウス 
        const isFullHouse = (cards: Array<Card | undefined>) => {
            const rankCounts = new Map();

            cards.forEach(card => {
                rankCounts.set(card?.rank, (rankCounts.get(card?.rank) || 0) + 1);
            })

            const counts = Array.from(rankCounts.values());
            return counts.includes(3) && counts.includes(2);
        }

        // フラッシュ 
        const isFlash = (cards: Array<Card | undefined>) => {
            const suits = cards.map(card => card?.getsuit);
            const uniqueSuits = new Set(suits);
            return uniqueSuits.size === 1;

        }

        // ストレート　 
        const isStraight = (cards: Array<Card | undefined>) => {
            const rank = cards.map(card => {
                return card?.getRankNumber() === 1 ? 14 : card?.getRankNumber();
            });

            for (let i = 0; i < rank.length - 1; i++) {
                if (rank[i + 1]! - rank[i]! != 1) {
                    return false;
                }

            }
            return true;
        }

        // スリーカード 
        const isThreeOfaKind = (cards: Array<Card | undefined>) => {
            const rankCounts = new Map();

            cards.forEach(card => {
                //ランクの集計
                rankCounts.set(card?.rank, (rankCounts.get(card?.rank) || 0) + 1);
            });

            const threeCard = Array.from(rankCounts.values()).some(count => count === 3);

            return threeCard;

        }
        // ツーペア 
        const isTwoPair = (cards: Array<Card | undefined>) => {

            const rankCounts = new Map();
            cards.forEach(card => {
                rankCounts.set(card?.rank, (rankCounts.get(card?.rank) || 0) + 1);
            });

            const onePair = Array.from(rankCounts.values()).filter(count => count === 2);
            return onePair.length === 2;
        }

        // ワンペア
        const isOnePair = (cards: Array<Card | undefined>) => {
            const rankCounts = new Map();
            cards.forEach(card => {
                rankCounts.set(card?.rank, (rankCounts.get(card?.rank) || 0) + 1);
            });

            // 同じ数は２だけのものを取得し、ペアが１つだけ（ワンペア）かどうか判定する
            const onePair = Array.from(rankCounts.values()).filter(count => count === 2);
            return onePair.length === 1;
        }

        // 手役の判定
        if (isRoyalFlash(cards)) {
            return this.handRanking['royalFlash'];

        } else if (isStraightFlash(cards)) {
            return this.handRanking['straightFlash'];

        } else if (isForOfaKind(cards)) {
            return this.handRanking['forOfaKind'];

        } else if (isFullHouse(cards)) {
            return this.handRanking['fullHouse'];

        } else if (isFlash(cards)) {
            return this.handRanking['flash'];

        } else if (isStraight(cards)) {
            return this.handRanking['straight'];

        } else if (isThreeOfaKind(cards)) {
            return this.handRanking['threeOfaKind'];

        } else if (isTwoPair(cards)) {
            return this.handRanking['twoPair'];

        } else if (isOnePair(cards)) {
            return this.handRanking['onePair'];
        }

        return 0;
    }

    // 勝利判定
    determineWinner(): Array<PokerPlayer | PokerAI> {

        const activePlayer: Array<PokerPlayer | PokerAI> = [];

        // ハンドのランクを取得
        this.players.forEach(player => {
            if (player.isActive) {
                player.handRank = this.handRankChecker(this.communityCardList, player.hand);
                activePlayer.push(player);
            }
        });

        // ハンドのランクを比較
        let winners: Array<PokerPlayer | PokerAI> = [];
        let bestHandRank = 0;
        activePlayer.forEach(player => {
            if (player.handRank > bestHandRank) {
                bestHandRank = player.handRank;
                winners = [player];
            } else if (player.handRank === bestHandRank) {
                winners.push(player);
            }
        })

        return winners;

    }

    // プレイヤーのチップが0か確認し、0ならばそのプレイヤーは終了
    checkHasNoMoney(player: PokerPlayer | PokerAI) {
        if (
            (player.chips === 0 && (player.action != 'allin' || this.communityCardList.length === 5))
        ) {
            this.gameOver();
        }
    }

    // 勝者に賞金を与える
    winnerAmountProcess(winners: Array<PokerPlayer | PokerAI>) {
        //  potの計算
        if (winners.length != 0) {
            const prizeMoney = Math.floor(this.pot.getTotalAmount() / winners.length);
            for (let winner of winners) {
                winner.chips += prizeMoney;
            }
        }

        // ポットの０にする
        this.pot.resetAmount();

        // ユーザープレイヤーの勝敗演出
        this.displayWinOrLoseText(winners);
    }


    // ante(参加料)を上げる
    raiseAnte() {
        if (this.dealerCounter % this.players.length === 0) this.ante += this.ante;
    }

    // 全員ディーラーを行ったか確認
    checkDealerRotationComplate() {
        if (this.roundCounter === 0) this.dealerCounter++;
    }

    // ディーラーをランダムで決める
    selectRandamDealer() {
        const index = Math.floor(Math.random() * this.players.length);
        const player = this.players[index];
        player.dealer = true;
    }

    // 現在のプレイヤーを設定する
    setCurrentPlayer() {
        if (this.currentDealerIndex === undefined) {
            this.currentDealerIndex = 0;
        }
        this.curretPlayerIndex = this.currentDealerIndex;
    }

    // アクション履歴から一番最新を取得する
    getLastAction(): string {
        let action = '';
        if (this.actionHistroy[this.actionHistroy.length - 1] === undefined) {
            return action;
        } else {
            action = this.actionHistroy[this.actionHistroy.length - 1];
        }
        return action;
    }

    // アクション履歴をリセットする
    clearActionHistory() {
        this.actionHistroy = [];
    }


    // ディレイ
    delay(time: number) {
        time = time * 1000;
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // ゲームオーバーの判定
    gameOver() {

        this.players.forEach(player => {
            if (player.chips === 0 && player.bet === 0 && (player.action != 'allin' || this.communityCardList.length === 5)) {
                this.isGameOver = true;
                this.displayGameOverModal();
            }
        });
    }

    // ゲーム終了のモーダルを表示にする
    displayGameOverModal() {
        const [backGroundModal, modalTextGameOver, modalTextLinkHome] = this.containerHelper.arrayModal;
        backGroundModal.visible = true;
        modalTextGameOver.visible = true;
        modalTextLinkHome.visible = true;
        backGroundModal.setInteractive();
        modalTextLinkHome.setInteractive({ cursor: 'pointer', });

        modalTextLinkHome.on('pointerdown', () => {
            window.location.href = '/';
        })
    }

    // ゲーム終了のモーダルを非表示にする
    displayCloseGameOverModal(
        backGroundModal: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text,
        modalText: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text,
        modalTextLinkHome: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text
    ) {
        backGroundModal.visible = false;
        modalText.visible = false;
        modalTextLinkHome.visible = false;
        backGroundModal.off('pointerdown');
        modalTextLinkHome.off('pointerdown');
    }

    // AIの手札を表にする
    flipCardToAI() {
        for (let player of this.players) {
            if (player.playerType === 'ai') {
                for (let card of player.hand) {
                    this.animateCardOpen(card!);
                }
            }
        };
    }

    // 手役の名前を取得する
    getHandRank(value: number) {
        return Object.keys(this.handRanking).find(key => this.handRanking[key] === value);
    }



    // View

    // プレイヤーの所持金を更新し表示
    // 後でview関係に移動
    updatePotAmountText() {
        const container = this.containerHelper.communityContainer;
        container.setData('potAmount', this.pot.getTotalAmount());
        const objectPlayerAmoutText = container.getData('objectPotText');

        objectPlayerAmoutText.setText(
            `${container.getData('templateAmountText')} ${this.pot.getTotalAmount()}`
        );
    }

    // プレイヤーの所持金を更新
    updateDisplayPlayerAmount(player: any) {
        if (player.playerType === 'ai') {
            const templateAmountText = this.containerHelper.houseContainer.getData('templateAmountText');
            const amountText = this.containerHelper.houseContainer.getData('objectPlayerAmountText');
            amountText.setText(`${templateAmountText} ${player.chips}`);
        } else if (player.playerType === 'player') {
            const templateAmountText = this.containerHelper.playerContainer.getData('templateAmountText');
            const amountText = this.containerHelper.playerContainer.getData('objectPlayerAmountText');
            amountText.setText(`${templateAmountText} ${player.chips}`);

        }
    }


    // 
    updateRoundText(
        container: Phaser.GameObjects.Container,
        currentRound: string,
    ) {
        const objectRoundText = container.getData('objectRoundText');
        container.setData('currentRoundText', currentRound);
        objectRoundText.setText(
            `${container.getData('currentRoundText')}`
        );
    }


    // 場にカードを一枚追加する
    addCommunityOneCard() {
        const drawCard = this.deck.drawOne();
        if (drawCard != undefined) {
            this.communityCardList.push(drawCard);
            drawCard.back();
        }

        let cards = this.containerHelper.communityContainer.getData('cards');

        if (cards === undefined || cards === '') {
            const addCard = this.containerHelper.imageHelper.createCardObject(
                drawCard,
                commonConfig.animation.dealCard.startX,
                commonConfig.animation.dealCard.startY,
                commonConfig.card.backScaleX + 0.01,
                commonConfig.card.backScaleY + 0.01,
            );
            cards = [];
            cards.push(addCard);
        } else {
            const addCard = this.containerHelper.imageHelper.createCardObject(
                drawCard,
                commonConfig.animation.dealCard.startX,
                commonConfig.animation.dealCard.startY,
                commonConfig.card.backScaleX + 0.01,
                commonConfig.card.backScaleY + 0.01,
            );
            cards.push(addCard);
        }

        // コンテナにカードの情報を保存
        this.containerHelper.communityContainer.setData('cards', cards);
        // コンテナにカードのを追加
        this.containerHelper.communityContainer.add(cards[cards.length - 1]);
    }


    // コミュニティの掛け金の情報を更新する
    updateCommunityBetText() {
        const templateText = this.containerHelper.communityContainer.getData('templateBetText')
        const oldObjectBetText = this.containerHelper.communityContainer.getData('objectBetText');
        const betAmount = this.ante;

        oldObjectBetText.setText(`${templateText} ${betAmount}`);
    }

    // 一旦2Pで考える
    updatePlayerBetText(player: PokerPlayer | PokerAI, container: Phaser.GameObjects.Container) {
        ;
        const templateText = container.getData('templateBetText');
        const objectBetText = container.getData('objectBetText');
        objectBetText.setText(`${templateText} ${player.bet}`);
    }

    // とりあえず２Pで考える
    resetPlayersBetText(players: Array<PokerPlayer | PokerAI>) {
        const containers = [this.containerHelper.playerContainer, this.containerHelper.houseContainer];

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            player.bet = 0;

            if (player.playerType === 'player') {
                this.updatePlayerBetText(player, containers[0]);
            } else {
                this.updatePlayerBetText(player, containers[1]);
            }
        }
    }

    // アクションの表示を更新する
    updatePlayerActionText(action: string, container: Phaser.GameObjects.Container) {

        const objectActionText = container.getData('objectActionText');
        const templateActionText = container.getData('templateActionText');
        objectActionText.setText(`${templateActionText} ${action}`);
    }

    //  結果がでた後にクリックしてもらう案内を表示する
    createInfomationToGameEnd() {
        const text = 'Click for Next Round';
        const objectRoundEndText = this.containerHelper.communityContainer.getData('objectRoundEndText');

        objectRoundEndText.setVisible(true);
        objectRoundEndText.setText(`${text}`);
    }

    // クリックの案内を消す
    clearInfomationToGameEnd() {
        const objectRoundEndText = this.containerHelper.communityContainer.getData('objectRoundEndText');
        objectRoundEndText.setVisible(false);
    }

    // ユーザープレイヤーの勝敗演出
    displayWinOrLoseText(winners: Array<PokerPlayer | PokerAI>) {
        const objectRoundEndText = this.containerHelper.communityContainer.getData('objectRoundEndText');
        let text = '';
        if (this.isNoContest) {
            text = this.displayNoContestResult(winners);
        } else {
            text = this.displayShowDownResult(winners);
        }

        objectRoundEndText.setVisible(true);
        objectRoundEndText.setText(`${text}`);
        objectRoundEndText.setLineSpacing(40);
    }

    // ノーコンテスト時のテキストを作成する
    displayNoContestResult(winners: Array<PokerPlayer | PokerAI>): string {
        let text = '';
        if (this.isNoContest && winners[0].playerType === 'player') {
            this.sounds.win.play();
            return text = 'No Contest!\nYOU WIN!!';
        } else {
            this.sounds.lose.play();
            return text = 'No Contest!\nYOU LOSE!!';
        }

    }

    // ショーダウン時のテキストを生成する
    displayShowDownResult(winners: Array<PokerPlayer | PokerAI>): string {
        let text = '';
        if (winners.length === 1 && winners[0].playerType === 'player') {
            this.sounds.win.play();
            return text = 'YOU WIN!\nNext Round Click!!';
        } else if (winners.length > 1) {
            // 引き分け  
            this.sounds.draw.play();
            return text = 'DRAW!\nNext Round Click!!';
        } else {
            this.sounds.lose.play();
            return text = 'YOU LOSE!\nNext Round Click!!';
        }
    }

    // コミュニティコンテナからphaserのカードイメージを削除する
    deleteCommunityCard() {
        let deleteCards = this.containerHelper.communityContainer.getAll('type', 'Image');
        this.deleteCardsArrayFromContainer(this.containerHelper.communityContainer, deleteCards);
        this.containerHelper.communityContainer.setData('cards', '');
    }

    // プレイヤーの手役を表示
    displayHandRankText() {
        for (let player of this.players) {
            if (player.isActive) {
                if (player.playerType === 'player') {
                    const handRankText = this.getHandRank(player.handRank);
                    const objectHandRankText = this.containerHelper.playerContainer.getData('objectHandRankText');
                    if (handRankText != undefined) {
                        objectHandRankText.setText(`${handRankText}`);
                        objectHandRankText.setVisible(true);
                    }

                } else if (player.playerType === 'ai') {
                    const handRankText = this.getHandRank(player.handRank);
                    const objectHandRankText = this.containerHelper.houseContainer.getData('objectHandRankText');
                    if (handRankText != undefined) {
                        objectHandRankText.setText(`${handRankText}`);
                        objectHandRankText.setVisible(true);
                    }
                }
            }
        }
    }

    // プレイヤーに表示する手役を見えなくする
    clearHandRankText(container: Phaser.GameObjects.Container) {
        const objectHandRankText = container.getData('objectHandRankText');
        if (objectHandRankText != undefined) {
            objectHandRankText.setVisible(false);
        }
    }



    // ディーラーテキストの表示
    displayDealerText() {
        const player = this.players[this.currentDealerIndex ? this.currentDealerIndex : 0];
        const prePlayer = this.players[this.currentDealerIndex === 0 ? this.players.length - 1 : this.currentDealerIndex ? this.currentDealerIndex - 1 : 0];
        if (player.dealer) {
            if (player.playerType === 'player') {
                this.visibleTrueOrFalse(this.containerHelper.playerContainer, true);

                // 複数プレイヤーがいる場合は、動かない
                if (prePlayer.playerType === 'ai') {
                    this.visibleTrueOrFalse(this.containerHelper.houseContainer, false);
                }

            } else if (player.playerType === 'ai') {
                this.visibleTrueOrFalse(this.containerHelper.houseContainer, true);

                // 複数プレイヤーがいる場合は、動かない
                if (prePlayer.playerType === 'player') {
                    this.visibleTrueOrFalse(this.containerHelper.playerContainer, false);
                }
            }

        }
    }

    // ディーラーのテキストを非表示
    visibleTrueOrFalse(container: Phaser.GameObjects.Container, boolean: boolean) {
        const objectDealerText = container.getData('objectDealerText');
        objectDealerText.setVisible(boolean);
    }


    // animation
    // カードを配るアニメーション
    async animateDealing(card: Card, startX: number, y: number, spacing: number, index: number) {
        const width = card.displayWidth;
        const x = startX + index * (width + spacing);
        this.scene.tweens.add({
            targets: card,
            x: x,
            y: y,
            ease: 'Linear',
            duration: 200,
        });
        this.sounds.cardDeal.play();
    };

    // 配列に対応したカードを配るアニメーション
    async animateDealingTypeArray(cards: Array<Card | undefined>, startX: number, y: number, spacing: number) {
        const width = cards[0]!.displayWidth;

        for (let index in cards) {
            this.scene.tweens.add({
                targets: cards[index],
                x: startX + Number(index) * (width + spacing),
                y: y,
                ease: 'Linear',
                duration: 500,
            });
            this.sounds.cardDeal.play();
            await this.delay(0.3);
        }
    }

    //  プレイヤーの手札を表にするアニメーション
    async animatePlayerHandOpen(player: PokerPlayer | PokerAI) {
        for (let card of player.hand) {
            await this.delay(0.7);
            card?.tweenFlip();
            this.sounds.cardFlip.play();
        };
    }

    // カードを表にするアニメーション　 
    async animateCardOpen(card: Card) {
        await this.delay(1);
        card.tweenFlip();
        this.sounds.cardFlip.play();
    }


    createHomeButton() {
        const homeButton = this.scene.add.image(0, 0, 'button_home').setOrigin(0, 0);
        homeButton.setX(10);
        homeButton.setY(10);
        homeButton.setDisplaySize(50, 50);
        this.scene.add.existing(homeButton);

        homeButton.setInteractive({ cursor: 'pointer' });
        homeButton.on('pointerdown', () => {
            window.location.href = '/';
        })
    }


    checkRaiseAnte() {
        // ディーラーが一周したかどうか確認
        this.checkDealerRotationComplate();

        // １周したらante(参加料)を増やす　
        this.raiseAnte();
    }


    clearPlayersStatusForTurn() {
        // プレイヤーの初期化
        for (let player of this.players) {
            player.action = '';
            if (player.chips != 0) {
                player.isActive = true;
                player.bet = 0;
                player.handRank = 0;
            }
        }
    }

    // modal
    createModalBet(player: PokerPlayer | PokerAI, container: Phaser.GameObjects.Container): ViewBet | undefined {

        if (player instanceof PokerPlayer) {
            const viewBet = new ViewBet(this.scene, player, container);
            viewBet.create();
            viewBet.hide();
            return viewBet;
        }
        return undefined;
    }


    async showBetModal() {

        if (this.getCurrentPlayer() instanceof PokerPlayer) {
            this.modalBackground.setVisible(true);
            this.viewBet?.show();

            await new Promise<void>((resolve) => {

                this.viewBet?.dealButton.on('pointerdown', () => {
                    this.hideBetModal();
                    resolve();
                })

            })

        }

    }

    hideBetModal() {
        this.viewBet?.hide();
        this.modalBackground.setVisible(false);

    }


    // デッキの再生成

    /* 見た目 */



}
