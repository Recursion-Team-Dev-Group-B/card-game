export default class imageHelper {
    public scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createCardObject(
        //image: Phaser.GameObjects.Image,
        card: any,
        positionX: number,
        positionY: number,
        scaleX: number,
        scaleY: number
    ): any {
        /*
        const addCard = this.scene.add.image(0, 0, card.texture).setOrigin(0, 0.5);
        addCard.setX(positionX);
        addCard.setY(positionY);
        addCard.setScale(scaleX, scaleY);
        */
        card.setX(positionX);
        card.setY(positionY);
        card.setScale(scaleX, scaleY);
        //return addCard;
        return card;
    }



}