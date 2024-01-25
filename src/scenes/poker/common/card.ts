import * as Phaser from 'phaser';
import config from '@/scenes/poker/common/config';
export default class Card extends Phaser.GameObjects.Image {
  // カードはsuit（スペード、ハート、ダイヤモンド、クラブ）、rank（A、2-10、JQK）、裏表のプロパティを持つものとする。
  readonly suit: string;
  readonly rank: string;
  //private texture: string;
  texture: any;
  private backTexture: any;
  private faceDown = false;

  constructor(
    scene: Phaser.Scene,
    suit: string,
    rank: string,
    texture: string,
  ) {
    super(scene, 10, 10, texture);
    // scene.add.existing(this);
    this.scene = scene;
    this.suit = suit;
    this.rank = rank;
    this.texture = texture;
    //this.backTexture = this.scene.add.sprite(this.x, this.y, 'backCard');
  }

  // suitのgetter
  get getsuit(): string {
    return this.suit;
  }

  // rankのgetter
  get getrank(): string {
    return this.rank;
  }

  // faceDownのsetter
  set setfaceDown(faceDown: boolean) {
    this.faceDown = faceDown;
  }

  // faceDownのgetter
  get getfaceDown(): boolean {
    return this.faceDown;
  }

  // カードのUI実装。
  // 裏向きでなければ、そのsuit-rankに紐づくカードの画像を返す
  getAtlasFrame(): string {
    return !this.faceDown ? `card-${this.suit}-${this.rank}.png` : '';
  }

  // rankに対応する数値を取得。
  getRankNumber(): number {
    const rankToNum: { [key: string]: number } = {
      A: 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      J: 11,
      Q: 12,
      K: 13,
    };
    return rankToNum[this.rank] ? rankToNum[this.rank] : 0; // if rankToNum[this.rank] is undefined, this function returns 0
  }

  back() {
    this.setTexture('backCard');
    this.setScale(0.65);
    this.faceDown = true;
    /*
    this.on('pointerdown', () => {
      this.flip();
    })
    */
  }

  open() {
    this.on('pointerdown', () => {
      this.setTexture(`${this.suit}_${this.rank}`);
      this.setScale(config.card.scaleX);
    })
  }

  flip() {
    if (this.faceDown) {
      this.setTexture(`${this.suit}_${this.rank}`);
      this.setScale(config.card.scaleX);
    } else {
      this.setTexture('backCard');
      this.setScale(0.7);
    }
    this.faceDown != this.faceDown;
  }

  tweenFlip() {
    //this.setInteractive();
    //this.on('pointerdown', () => {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: 'Linear',
      onComplete: (): void => {
        this.setTexture(`${this.suit}_${this.rank}`);
        this.setScale(0.13);
        this.scene.tweens.add({
          targets: this,
          scaleX: 0.13,
          //scaleY: 0.13,
          duration: 350,
          ease: 'Linear'
        })
      }
    })


    //})

  }
}

