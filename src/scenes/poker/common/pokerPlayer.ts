import Player from '@/scenes/poker/common/player';
import Card from "@/scenes/poker/common/card";

export default class PokerPlayer extends Player {

    /*
    public name: string;
    public playerType: string;
    public gameType: string;
    public chips: number;
    public winAmount: number;
    public bet: number;
    public action: string;
    */
    // ここまでエラー表示
    public hand: Array<Card> = [];
    public dealer: boolean;
    public handRank: number;
    public isActive: boolean;

    constructor(
        name: string,
        playerType: string,
        gameType: string,
        chips: number,
        winAmount: number,
        bet: number,
        action: string,
    ) {
        super(name, playerType, gameType, chips, winAmount, bet, action);
        this.dealer = false;
        this.handRank = 0;
        this.isActive = true;

    };


}