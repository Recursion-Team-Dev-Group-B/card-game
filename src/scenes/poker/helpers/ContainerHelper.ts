import ImageHelper from '@/scenes/poker/helpers/imageHelper';
import Pot from '@/scenes/poker/common/pot';
import commonConfig from '@/scenes/poker/common/config';
import { object } from 'prop-types';
import { template } from '@babel/core';


export default class ContainerHelper {
    public scene: Phaser.Scene;

    public gameZone: Phaser.GameObjects.Zone;
    public playerContainer: Phaser.GameObjects.Container;
    public communityContainer: Phaser.GameObjects.Container;
    public houseContainer: Phaser.GameObjects.Container;
    public actionContainer: Phaser.GameObjects.Container;
    public actionButtonContainer: Phaser.GameObjects.Container;
    public imageHelper: ImageHelper;
    public arrayModal: Array<Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle>

    constructor(scene: Phaser.Scene, pot: Pot) {
        // playerZoneの作成
        this.scene = scene;
        this.imageHelper = new ImageHelper(this.scene);
        this.gameZone = this.createGameZone();
        this.playerContainer = this.createPlayerContainer();
        this.communityContainer = this.createCommunityContainer(pot);
        this.houseContainer = this.createHouseContainer();
        this.actionContainer = this.createActionContainer();
        this.actionButtonContainer = this.createActionButtonContainer();
        this.arrayModal = this.createModal();
    };

    // GameZoneを作成
    createGameZone(): Phaser.GameObjects.Zone {
        const gameZone = this.scene.add.zone(
            commonConfig.phaserConfig.width * 0.5,
            commonConfig.phaserConfig.height * 0.5,
            commonConfig.phaserConfig.width,
            commonConfig.phaserConfig.height,
        );
        gameZone.setInteractive({
            draggable: false,
        });

        /*
        gameZone.on('pointerdown', () => {
            console.log('gameZone Click!');
        });
        */

        //this.scene.add.existing(gameZone);

        return gameZone;
    }

    /*
    updateTextToPlayerMoney(container: Phaser.GameObjects.Container) {
        const money = container.getData('money');
    }
     */



    createPlayerContainer(): Phaser.GameObjects.Container {
        const container = this.scene.add.container(0, commonConfig.container.player.y);

        /*
        // コンテナエリアの確認用
        const playerOutLine = this.scene.add.graphics();
        playerOutLine.lineStyle(3, 0x0000ff);
        playerOutLine.strokeRect(0, 0, commonConfig.phaserConfig.width, (commonConfig.phaserConfig.height / 12) * 3 - 10);
        container.add(playerOutLine);
        */


        // nameText
        const nameText = this.scene.add.text(0, 0, "Player").setOrigin(0, 0);
        nameText.setX((commonConfig.phaserConfig.width / 12) * 1);
        nameText.setY((commonConfig.container.player.height / 4) * 0.4);
        nameText.setFontSize(commonConfig.text.fontSize.playerName)
        container.add(nameText);

        // amountText
        let amount: number = 1000;
        const templateAmountText = '所持金: '
        const playerAmountText = this.scene.add.text(0, 0, `${templateAmountText} ${amount}`).setOrigin(0, 0.5);
        playerAmountText.setX((commonConfig.phaserConfig.width / 12) * 1);
        playerAmountText.setY((commonConfig.container.player.height / 4) * 1.5);
        playerAmountText.setFontSize(commonConfig.text.fontSize.amount);
        container.add(playerAmountText);

        // actionText
        const templateActionText = 'Action: ';
        const action = '';
        const objectActionText = this.scene.add.text(0, 0, `${templateActionText} ${action}`).setOrigin(0, 0.5);
        objectActionText.setX((commonConfig.phaserConfig.width / 12) * 1);
        objectActionText.setY((commonConfig.container.player.height / 4) * 2.2);
        objectActionText.setFontSize(commonConfig.text.fontSize.playerAction);
        container.add(objectActionText);

        // betText
        const templateBetText = 'BET: ';
        const bet = 0;
        const objectBetText = this.scene.add.text(0, 0, `${templateBetText} ${bet}`).setOrigin(0, 0.5);
        objectBetText.setX((commonConfig.phaserConfig.width / 12) * 1);
        objectBetText.setY((commonConfig.container.player.height / 4) * 3.0);
        objectBetText.setFontSize(commonConfig.text.fontSize.amount);
        container.add(objectBetText);

        // handRankText
        const objectHandRankText = this.scene.add.text(0, 0, '').setOrigin(0, 0.5);
        objectHandRankText.setX((commonConfig.phaserConfig.width / 12) * 3);
        objectHandRankText.setY((commonConfig.container.player.height / 3) * 1.5);
        objectHandRankText.setFontSize(commonConfig.text.fontSize.handRank);
        objectHandRankText.setVisible(false);
        container.add(objectHandRankText);

        // dealerText
        const objectDealerText = this.scene.add.text(0, 0, 'Dealer').setOrigin(0, 0.5);
        objectDealerText.setX((commonConfig.phaserConfig.width / 12) * 4);
        objectDealerText.setY((commonConfig.container.player.height / 3) * 1);
        objectDealerText.setFontSize(commonConfig.text.fontSize.playerDealer);
        objectDealerText.setVisible(false);
        container.add(objectDealerText);


        container.setData({
            templateAmountText: templateAmountText,
            objectPlayerAmountText: playerAmountText,
            amount: amount,
            templateActionText: templateActionText,
            action: action,
            objectActionText: objectActionText,
            templateBetText: templateBetText,
            objectBetText: objectBetText,
            objectHandRankText: objectHandRankText,
            objectDealerText: objectDealerText,
            hand: [],
        });


        this.scene.add.existing(container);

        return container;
    }

    // actionZoneの作成
    createActionContainer(): Phaser.GameObjects.Container {

        const container = this.scene.add.container(0, commonConfig.container.action.y);

        /*
        // コンテナエリアの確認用
        const actionOutLine = this.scene.add.graphics();
        actionOutLine.lineStyle(3, 0xea9198);
        actionOutLine.strokeRect(0, 0, commonConfig.phaserConfig.width, (commonConfig.phaserConfig.height / 12) * 2);
        container.add(actionOutLine);
        */


        //掛け金の入力欄
        // スピンボタンを変更するにはCSSでの記述が必要
        const inputHtmlContent = `
        <div style="display: flex; align-items: center">
        <span style='color: #ffffff; margin-right: 30px; font-size: 20px'>Bet: </span>
        <input type='number', step='50', value='100', min='100', style="background-color: white; width: 100px; height: 40px; text-align: right; font-size: 20px;" >
        </div>
        `;
        const input = this.scene.add.dom(800, 10).createFromHTML(inputHtmlContent);
        input.setOrigin(0, 0);

        container.setData('betInput', input);
        container.add(input);


        this.scene.add.existing(container);

        return container;
    }

    // communityZoneの作成
    createCommunityContainer(pot: Pot): Phaser.GameObjects.Container {

        const container = this.scene.add.container(0, commonConfig.container.community.y);


        /*
        // コンテナエリアの確認用
        const commuOutline = this.scene.add.graphics();
        commuOutline.lineStyle(3, 0x3baf75);
        commuOutline.strokeRect(0, 0, commonConfig.phaserConfig.width, (commonConfig.phaserConfig.height / 12) * 4);
        container.add(commuOutline);
        */


        // ポットの表示
        pot.addAmount(0);
        let potAmount = pot.getTotalAmount();
        const templateAmountText = 'POT: '
        container.setData('templateAmountText', templateAmountText);
        const objectPotText = this.scene.add.text(0, 0, `${templateAmountText}${potAmount}`).setOrigin(0, 0.5);
        objectPotText.setX((commonConfig.phaserConfig.width / 12) * 10);
        objectPotText.setY(commonConfig.container.community.height / 4);
        objectPotText.setFontSize(commonConfig.text.fontSize.pot);
        container.add(objectPotText);

        // 現在のroundを表示
        const currentRoundText = 'start';
        const objectRoundText = this.scene.add.text(0, 0, `${currentRoundText}`).setOrigin(0, 0.5);
        objectRoundText.setX((commonConfig.phaserConfig.width / 12) * 10);
        objectRoundText.setY((commonConfig.container.community.height / 4) * 1.5);
        objectRoundText.setFontSize(commonConfig.text.fontSize.round);
        container.add(objectRoundText);

        // 最低掛け金の表示
        const templateBetText = '参加料: ';
        const betAmount = 100;
        const objectBetText = this.scene.add.text(0, 0, `${templateBetText} ${betAmount}`).setOrigin(0, 0.5);
        objectBetText.setX((commonConfig.phaserConfig.width / 12) * 10);
        objectBetText.setY((commonConfig.container.community.height / 4) * 3);
        objectBetText.setFontSize(commonConfig.text.fontSize.ante);
        container.add(objectBetText);

        // ラウンド終了時のアナウンス
        const objectRoundEndText = this.scene.add.text(0, 0, '').setOrigin(0, 0.5);
        objectRoundEndText.setX((commonConfig.phaserConfig.width / 12) * 5);
        objectRoundEndText.setY((commonConfig.container.community.height / 2) * 1);
        objectRoundEndText.setFontSize(30);
        objectRoundEndText.setVisible(false);
        container.add(objectRoundEndText);

        container.setData({
            potAmount: potAmount,
            templateAmountText: templateAmountText,
            objectPotText: objectPotText,
            currentRoundText: currentRoundText,
            objectRoundText: objectRoundText,
            templateBetText: templateBetText,
            betAmount: betAmount,
            objectBetText: objectBetText,
            objectRoundEndText: objectRoundEndText,
        });


        this.scene.add.existing(container);

        return container;
    }

    // houseZoneの作成
    createHouseContainer(): Phaser.GameObjects.Container {

        const container = this.scene.add.container(0, 0);

        /*
        // コンテナエリアの確認用
        const houseOutline = this.scene.add.graphics();
        houseOutline.lineStyle(3, 0xff0000);
        houseOutline.strokeRect(0, 0, commonConfig.phaserConfig.width, (commonConfig.phaserConfig.height / 12) * 3);
        container.add(houseOutline);
        */


        // playerText  
        const text = this.scene.add.text(0, 0, "house").setOrigin(0, 0);
        text.setX((commonConfig.phaserConfig.width / 12) * 1);
        text.setY((commonConfig.container.house.height / 4) * 0.8);
        text.setFontSize(commonConfig.text.fontSize.playerName);
        container.add(text);

        // amountText
        let amount: number = 1000;
        const templateAmountText = '所持金: '
        const playerAmountText = this.scene.add.text(0, 0, `${templateAmountText} ${amount}`).setOrigin(0, 0.5);
        playerAmountText.setX((commonConfig.phaserConfig.width / 12) * 1);
        playerAmountText.setY((commonConfig.container.house.height / 4) * 1.8);
        playerAmountText.setFontSize(commonConfig.text.fontSize.amount);
        container.add(playerAmountText);

        // actionText
        const templateActionText = 'Action: ';
        const action = '';
        const objectActionText = this.scene.add.text(0, 0, `${templateActionText} ${action}`).setOrigin(0, 0.5);
        objectActionText.setX((commonConfig.phaserConfig.width / 12) * 1);
        objectActionText.setY((commonConfig.container.house.height / 4) * 2.6);
        objectActionText.setFontSize(commonConfig.text.fontSize.playerAction);
        container.add(objectActionText);


        // betText
        const templateBetText = 'BET: ';
        const bet = 0;
        const objectBetText = this.scene.add.text(0, 0, `${templateBetText} ${bet}`).setOrigin(0, 0.5);
        objectBetText.setX((commonConfig.phaserConfig.width / 12) * 1);
        objectBetText.setY((commonConfig.container.house.height / 4) * 3.3);
        objectBetText.setFontSize(commonConfig.text.fontSize.amount);
        container.add(objectBetText);

        // handRankText
        const objectHandRankText = this.scene.add.text(0, 0, '').setOrigin(0, 0.5);
        objectHandRankText.setX((commonConfig.phaserConfig.width / 12) * 3);
        objectHandRankText.setY((commonConfig.container.house.height / 3) * 1.5);
        objectHandRankText.setFontSize(commonConfig.text.fontSize.handRank);
        objectHandRankText.setVisible(false);
        container.add(objectHandRankText);

        // dealerText
        const objectDealerText = this.scene.add.text(0, 0, 'Dealer').setOrigin(0, 0.5);
        objectDealerText.setX((commonConfig.phaserConfig.width / 12) * 4);
        objectDealerText.setY((commonConfig.container.house.height / 3) * 1);
        objectDealerText.setFontSize(commonConfig.text.fontSize.playerDealer);
        objectDealerText.setVisible(false);
        container.add(objectDealerText);

        container.setData({
            templateAmountText: templateAmountText,
            objectPlayerAmountText: playerAmountText,
            amount: amount,
            templateActionText: templateActionText,
            aciton: action,
            objectActionText: objectActionText,
            templateBetText: templateBetText,
            objectBetText: objectBetText,
            objectHandRankText: objectHandRankText,
            objectDealerText: objectDealerText,
            hand: [],
        });

        this.scene.add.existing(container);

        return container;
    }

    createActionButtonContainer() {

        let container = this.scene.add.container(0, 0);

        container.x = (commonConfig.container.action.width / 12) * 4.2;
        container.y = commonConfig.container.action.height / 2;

        ;

        return container;

    }

    createModal() {
        const modalBackground = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5).setOrigin(0, 0).setInteractive();
        modalBackground.setVisible(false);

        const modalTextGameOver = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 100,
            "ゲーム終了",
        ).setOrigin(0.5);
        modalTextGameOver.setFontSize(commonConfig.text.fontSize.modal);
        modalTextGameOver.visible = false;

        const modalTextLinkHome = this.scene.add.text(
            modalTextGameOver.x,
            modalTextGameOver.y + 150,
            'ホーム画面に戻る',
        ).setOrigin(0.5);
        modalTextLinkHome.setFontSize(commonConfig.text.fontSize.modal - 10);
        modalTextLinkHome.visible = false;

        return [modalBackground, modalTextGameOver, modalTextLinkHome];
    }
}