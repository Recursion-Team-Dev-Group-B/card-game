import Player from '@/scenes/poker/common/player';
//import Card from "@/scenes/poker/common/Card";
import { callExpression } from '@babel/types';

export default class PokerAI extends Player {

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

    checkCall(roundBet: number): boolean {
        return this.chips > roundBet;
    }

    chooseAction(roundBet: number, lastAction: string) {
        if (
            lastAction === 'bet' ||
            lastAction === 'raise' ||
            lastAction === 'call' ||
            lastAction === 'fold' ||
            lastAction === 'allin') {
            if (this.checkCall(roundBet)) {
                return 'call';
            } else {
                return 'allin';
            }
        } else if (lastAction === 'check') {
            return 'check';
        } else if (lastAction === '') {
            return 'bet';
        }
        return '';
    }

}