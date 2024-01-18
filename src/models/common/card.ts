// エラーのため　import Phaser from 'phaser';　を修正。
import * as Phaser from 'phaser';

class Card extends Phaser.GameObjects.Image {
  // カードはsuit（スペード、ハート、ダイヤモンド、クラブ）、rank（A、2-10、JQK）、裏表のプロパティを持つものとする。
  readonly #suit: string;
  readonly #rank: string;
  #texture: string;
  #faceDown = false;

  dealCardSound: Phaser.Sound.BaseSound;

  constructor(
    scene: Phaser.Scene,
    suit: string,
    rank: string,
    texture: string,
  ) {
    super(scene, 0, -100, texture);
    this.scene = scene;
    this.#suit = suit;
    this.#rank = rank;
    this.#texture = texture;

    this.dealCardSound = this.scene.sound.add("dealCard", {
      volume: 1
    });
    this.displayHeight = 150
    this.displayWidth = 120
    scene.add.existing(this);
    this.setInteractive();
  }

  // suitのgetter
  get suit(): string {
    return this.#suit;
  }

  // rankのgetter
  get rank(): string {
    return this.#rank;
  }

  // faceDownのsetter
  set faceDown(faceDown: boolean) {
    this.#faceDown = faceDown;
  }

  // faceDownのgetter
  get faceDown(): boolean {
    return this.#faceDown;
  }

  /**
 * カードを裏返すアニメーションを再生。
 * アニメーション完了後、カードの表面に更新する。
 */
  playFlipOverTween(card: any): void {

    console.log("back", this)
    this.scene.add.tween({
      targets: this,
      scaleX: 0,
      duration: 500,
      ease: 'Linear',
      onComplete: () => {
        this.setTexture(card.texture.key)
        this.scene.add.tween({
          targets: this,
          scaleX: 1,
          duration: 500,
          ease: 'Linear'
        })
      }
    });
  }


  /**
  * カードを新しい位置に移動するアニメーション
  * @param toX 移動先のx座標
  * @param toY 移動先のy座標
  */
  moveTween(toX: number, toY: number): void {
    this.dealCardSound.play();
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: 500,
      ease: 'Linear'
    });
  }

  // 非表示にする
  hide(): void {
    this.setVisible(false);;
  }
  // 表示にする
  show(): void {
    this.setVisible(true);
  }

  // rankに対応する数値を取得。
  getRankNumber(): number {
    const rankToNum: { [key: string]: number } = {
      A: 11,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      J: 10,
      Q: 10,
      K: 10,
    };
    return rankToNum[this.#rank] ?? 0; // if rankToNum[this.rank] is undefined, this function returns 0
  }
}

export default Card;
