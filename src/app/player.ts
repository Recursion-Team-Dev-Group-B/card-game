export abstract class Player {

    public  name: string;
    playerType: string;
    gameType: string;
    // #chips: number;
    private chips: number;

    constructor(name: string, playerType: string, gameType: string, chips: number ) {
        this.name = name;
        this.playerType= playerType;
        this.gameType = gameType;
        this.chips = chips;
    }


    promptPlayer() {}

    winAmount() {}

    getHandScore() {}

    get getPlayerType(): string {
        return this.playerType;
    }

}