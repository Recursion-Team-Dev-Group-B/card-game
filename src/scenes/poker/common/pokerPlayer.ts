import Player from '@/scenes/poker/common/player';
import Card from "@/scenes/poker/common/card";

export default class PokerPlayer extends Player {

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