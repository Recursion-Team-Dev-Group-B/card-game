import Card from './card';

export abstract class Player {

    private name: string;
    private playerType: string;
    private gameType: string;
    private chips: number;
    private totalAmount: number;
    private bet: number;
    private gameStatus: string;
    private hand: Array<Card> = [];


    constructor(name: string, playerType: string, gameType: string, chips: number, totalAmount: number, bet: number, gameStatus: string ) {
        this.name = name;
        this.playerType= playerType;
        this.gameType = gameType;
        this.chips = chips;
        this.totalAmount = totalAmount;
        this.bet = bet;
        this.gameStatus = gameStatus;
    }


    get getName(): string {
        return this.getName;
    }

    get getPlayerType(): string {
        return this.playerType;
    }

    get getGameType(): string {
        return this.gameType
    }

    get getChips(): number {
        return this.chips;
    }

    set setChips(chips: number) {
        this.chips = chips;
    }

    get getBet(): number {
        return this.bet; 
    }

    set setBet(bet: number) {
        this.bet = bet;
    }

    get getTotalAmount(): number {
        return this.totalAmount;
    }

    set setTotalAmount(totalAmount: number){
        this.totalAmount = totalAmount; 
    }

    get getGameStatus(): string {
        return this.gameStatus;
    }

    set setGameStatus(gameStatus: string){
        this.gameStatus = gameStatus;
    }


    clearHand() {
        this.hand = [];
    }

    addCardToHand(card: Card) {
        this.hand.push(card);
    }



    promptPlayer() {} 

    getHandScore() {}
}
