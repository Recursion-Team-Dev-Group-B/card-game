export default class Pot {

    private totalAmount: number;

    constructor() {
        this.totalAmount = 0;
    }

    addAmount(amount: number) {
        if (amount >= 0) {
            this.totalAmount += amount;
        };
    }

    getTotalAmount(): number {
        return this.totalAmount;
    }

    resetAmount() {
        this.totalAmount = 0;
    }
}