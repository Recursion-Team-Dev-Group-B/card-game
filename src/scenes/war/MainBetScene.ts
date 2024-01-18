import { GameInitData, Position, ChipNumType, ChipTextType, ChipType, ChipKeys } from './interfaces';
import { imageAssets, soundAssets } from './assets';
import { descendingChipValues } from './constants';

export class MainBetScene extends Phaser.Scene {
  private amountText: Phaser.GameObjects.Text | null = null;
  private betAmount: number = 0;
  private funds: number = 0;
  private chipIdCounter: number = 0; // チップのID
  public originalPositions: { [key in ChipKeys]?: Position };
  public newChipPosition: Position = { x: 0, y: 0 };
  public chipCounts: ChipNumType = {
    'warChip_1': 10,
    'warChip_5': 8,
    'warChip_25': 10,
    'warChip_100': 7,
    'warChip_500': 2,
    'warChip_1000': 1,
  };
  public mainChipsInBetArea: ChipType[] = [];
  public chipCountTexts: ChipTextType = {};

  constructor() {
    super('mainbet');
    this.originalPositions = {};
  }

  init(data: GameInitData) {
    this.funds = data.funds;
    // 前のゲームの中身を消すために初期化する。
    this.mainChipsInBetArea = [];
  }

  preload() {
    imageAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
    soundAssets.forEach(asset => {
      this.load.audio(asset.key, asset.path);
    });
  }

  create(): void {
    const { width, height } = this.game.canvas;
    setBackground(this, width, height, 'war_table', { x: 1.7, y: 1 });

    // 所持金とベット金額の初期化
    if (this.funds === undefined) {
      this.funds = 3000;
    }
    if (this.betAmount != 0) {
      this.betAmount = 0;
    }

    displayPromptMessage(this, 'Place your bet'); // ベット画面であることを示す文字を表示
    const minAmount = 50, maxAmount = 500;
    displayRangeText(this, minAmount, maxAmount); // bet金額の範囲を表示
    displayFunds(this, this.funds); // 左下に所持金を表示
    this.amountText = displayBetAmount(this, this.betAmount); // 画面中央に賭け金を表示

    const cardContainer = createDealButton(this);
    cardContainer.on('pointerdown', () => {
      this.sound.play('tap_sound');
      const startNextSceneAction = startNextScene(this, 'maingame', this.betAmount, this.funds, this.chipCounts, this.mainChipsInBetArea);
      startNextSceneAction(); // いらないかも。普通にメソッドでいい。
    });

    const circleCenterHeight = height * 0.8; // 白い枠線の円
    displayBetArea(this);
    displayActionIndicator(this);
    // チップが1つ以上ある場合には各チップを生成。
    const result = displayInitialChips(this, this.chipCounts);
    this.chipCountTexts = result.chipCountTexts;
    this.originalPositions = result.originalPositions;

    const updateChipCountDisplay = (
      chipCounts: ChipNumType,
    ) => {
      // 既存のテキストオブジェクトの内容を更新
      Object.keys(chipCounts).forEach((chipKey) => {
        const chipTextObject = this.chipCountTexts[chipKey as ChipKeys];
        if (chipTextObject && chipTextObject.setText) {
          chipTextObject.setText(`${chipCounts[chipKey as ChipKeys]}`);
        }

      });
    }

    // マウスアウトイベントのリスナーを追加
    cardContainer.on('pointerout', () => {
      this.input.setDefaultCursor('default'); // マウスアウト時にカーソルをデフォルトに戻す
    });

    // チップのドラッグ開始時の処理
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      const whiteCircleX = width / 2;
      const radius = 30;
      const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, whiteCircleX, circleCenterHeight);
      gameObject.setData('wasInsideBetArea', distance < radius);
    });

    // チップのドラッグイベントの設定
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // チップのドラッグ終了イベントの設定
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (!gameObject.input) {
        return; // gameObject.inputがnullの場合、処理を中断。以降、nullでないことを保証。
      }

      if (exchangeAreaBounds.contains(pointer.x, pointer.y)) {
        const chipKey = gameObject.texture.key as keyof ChipNumType;
        const wasInsideBetArea = gameObject.getData('wasInsideBetArea'); // ドラッグ開始時に定義したwasInsideBetAreaをここで取得

        if (wasInsideBetArea) {
          this.sound.play('wrong_sound'); // 警告音
          // 元の位置に戻す
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
        } else {
          // 両替エリア内でドロップされた場合の処理
          exchangeChip(gameObject);
          gameObject.destroy();
          updateChipCountDisplay(this.chipCounts);
          // チップ画像の再表示
        }

      } else {

        const whiteCircleX = width / 2;
        const radius = 30;
        const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, whiteCircleX, circleCenterHeight); // 移動後の座標と白い円の距離を計算。

        const chipKey = gameObject.texture.key as keyof ChipNumType;

        // ドラッグ前後に枠内にいたかどうかで場合わけ
        const isNowInsideBetArea = distance < radius; // 一定距離（ここでは30）以内ならば「枠内」と判定する

        const wasInsideBetArea = gameObject.getData('wasInsideBetArea'); // ドラッグ開始時に定義したwasInsideBetAreaをここで取得

        if (!wasInsideBetArea && isNowInsideBetArea) {
          // 条件1
          this.sound.play('putchip_sound'); // チップ配置が成功した時のサウンド

          // チップがベットエリア内にドロップされた場合に、まだIDをつけて記録
          const chipId = this.chipIdCounter++;
          gameObject.setData('id', chipId);
          this.mainChipsInBetArea.push({
            id: chipId,
            x: gameObject.x,
            y: gameObject.y,
            key: chipKey
          });

          // bet金額の加算
          if (chipKey in descendingChipValues) {
            this.betAmount += descendingChipValues[chipKey];
          }

          if (this.amountText) { this.amountText.setText('Current bet: $ ' + this.betAmount.toString()); }


          this.newChipPosition = { x: gameObject.x, y: gameObject.y }; // チップの新しい位置を保存

          // min-maxの範囲になったらDEALのアニメーションを開始。
          if (this.betAmount >= minAmount && this.betAmount <= maxAmount) {
            startDealAnimation(cardContainer, this.tweens); // 中央のコンテナのアニメーションを開始
            cardContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -50 / 2, 100 + 50, 50), Phaser.Geom.Rectangle.Contains); // コンテナをクリック可能にする
          } else if (this.betAmount < minAmount || this.betAmount > maxAmount) {
            cardContainer.disableInteractive();
            stopDealAnimation(cardContainer, this.tweens);
            this.input.setDefaultCursor('default');
          }

          // 同じ種類のチップを盤面に補充する
          // 残数がまだある場合、新しいチップを生成
          if (this.chipCounts[chipKey] > 0) {
            this.chipCounts[chipKey]--;

            if (this.chipCounts[chipKey] > 0) {
              const newPosition = this.originalPositions[chipKey];
              if (newPosition !== undefined) {
                const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
                newChip.setInteractive({ useHandCursor: true, draggable: true });

                // チップにユニークなIDを割り当てる
                newChip.setData('id', `chip_${this.chipIdCounter++}`);
              }
            }
          }

          // チップカウントの表示を更新
          updateChipCountDisplay(this.chipCounts);

        } else if (wasInsideBetArea && !isNowInsideBetArea) {
          // 条件2
          const key = gameObject.texture.key;
          if (key in this.originalPositions) {
            const originalPosition = this.originalPositions[key as ChipKeys];
            // originalPosition を使用する処理
            if (originalPosition !== undefined) {
              gameObject.setPosition(originalPosition.x, originalPosition.y);
            }
          }

          this.chipCounts[chipKey]++;

          // エリアから外れた場合に、削除
          const chipId = gameObject.getData('id');
          this.mainChipsInBetArea = this.mainChipsInBetArea.filter((chip: ChipType) => chip.id !== chipId);

          // bet金額の減算
          if (chipKey in descendingChipValues) {
            this.betAmount -= descendingChipValues[chipKey];
          }

          if (this.amountText) { this.amountText.setText('Current bet: $ ' + this.betAmount.toString()); }

          // min-maxの範囲になったらDEALのアニメーションを開始。
          if (this.betAmount >= minAmount && this.betAmount <= maxAmount) {
            startDealAnimation(cardContainer, this.tweens); // 中央のコンテナのアニメーションを開始
            cardContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -50 / 2, 100 + 50, 50), Phaser.Geom.Rectangle.Contains); // コンテナをクリック可能にする
          } else if (this.betAmount < minAmount || this.betAmount > maxAmount) {
            cardContainer.disableInteractive();
            stopDealAnimation(cardContainer, this.tweens);
            this.input.setDefaultCursor('default');
          }

          // チップカウントの表示を更新
          updateChipCountDisplay(this.chipCounts);

        } else if (!wasInsideBetArea && !isNowInsideBetArea) {
          const key = gameObject.texture.key;
          if (key in this.originalPositions) {
            const originalPosition = this.originalPositions[key as ChipKeys];
            // originalPosition を使用する処理
            if (originalPosition !== undefined) {
              gameObject.setPosition(originalPosition.x, originalPosition.y);
            }
          }
        }
      }
    });

    // 両替所を作る
    // ランクが一つ下のチップに必ず崩す仕様とする。
    // 両替エリア（ボックス）の作成
    const exchangeAreaCenterX = width * 0.1;
    const exchangeAreaCenterY = height * 0.73;
    const exchangeArea = this.add.rectangle(exchangeAreaCenterX, exchangeAreaCenterY, 180, 85, 0X71B33C).setAlpha(0.8);
    exchangeArea.setInteractive();
    const exchangeText = this.add.text(exchangeAreaCenterX, exchangeAreaCenterY, "Exchange\nbox", { fontSize: '24px', color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
    const exchangeAreaBounds = exchangeArea.getBounds();

    // 両替処理
    const exchangeChip = (gameObject: Phaser.GameObjects.Sprite) => {
      // 両替前のチップを減らす
      const chipKey: keyof ChipNumType = gameObject.texture.key as keyof ChipNumType;

      //
      if (chipKey !== 'warChip_1') {
        // 両替前のチップを減らす
        this.chipCounts[chipKey]--;

        // 両替前のチップを再生産
        if (this.chipCounts[chipKey] > 0) {
          const newPosition = this.originalPositions[chipKey];
          if (newPosition !== undefined) {
            const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
            newChip.setInteractive({ useHandCursor: true, draggable: true });
          }
        }

        let newChipKey: keyof ChipNumType;
        let newChipCount = 0;

        // 両替後のチップを増やす
        switch (chipKey) {
          case 'warChip_1000':
            newChipKey = 'warChip_500';
            newChipCount = 2;
            break;
          case 'warChip_500':
            newChipKey = 'warChip_100';
            newChipCount = 5;
            break;
          case 'warChip_100':
            newChipKey = 'warChip_25';
            newChipCount = 4;
            break;
          case 'warChip_25':
            newChipKey = 'warChip_5';
            newChipCount = 5;
            break;
          case 'warChip_5':
            newChipKey = 'warChip_1';
            newChipCount = 5;
            break;
        }
        this.chipCounts[newChipKey] += newChipCount;

        // 両替後のチップも再生産
        if (this.chipCounts[newChipKey] > 0) {
          const newPosition = this.originalPositions[newChipKey];
          if (newPosition !== undefined) {
            const newChip = this.add.image(newPosition.x, newPosition.y, newChipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
            newChip.setInteractive({ useHandCursor: true, draggable: true });
          }
        }

        // チップカウントの表示を更新
        // 追加したチップの枚数分鳴るようにする
        updateChipCountDisplay(this.chipCounts);
        for (let i = 0; i < newChipCount; i++) {
          this.time.delayedCall(350 * i, () => {
            this.sound.play('coinDrop_sound');
          });
        }

      } else {
        const newPosition = this.originalPositions[chipKey];
        if (newPosition !== undefined) {
          const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
          newChip.setInteractive({ useHandCursor: true, draggable: true });
        }
      }
    };
  }
}

// DEALアニメーションを開始
const startDealAnimation = (
  container: Phaser.GameObjects.Container,
  tweens: Phaser.Tweens.TweenManager
) => {
  tweens.add({
    targets: container,
    scaleX: 1.3,
    scaleY: 1.3,
    yoyo: true,
    duration: 800,
    repeat: -1
  });
}

// DEALアニメーションを停止
const stopDealAnimation = (
  container: Phaser.GameObjects.Container,
  tweens: Phaser.Tweens.TweenManager
) => {
  tweens.killTweensOf(container);
  container.setScale(1, 1);
}

// 画面全体の背景画像
export const setBackground = (
  scene: Phaser.Scene, // Phaser.Scene のインスタンスを受け取る
  width: number,
  height: number,
  imageKey: string,
  scale: { x: number; y: number }
) => {
  scene.cameras.main.setBackgroundColor('#242424');
  const backgroundImage = scene.add.image(width / 2, height / 2, imageKey).setOrigin(0.5, 0.5);
  backgroundImage.setScale(scale.x, scale.y);
};

// 賭け金の決定を促す文字を中央上部に表示
export const displayPromptMessage = (scene: Phaser.Scene, message: string) => {
  const { width, height } = scene.scale;
  scene.add.text(width * 0.5, height * 0.1, message, {
    fontSize: '36px',
    color: '#ffffff'
  }).setOrigin(0.5);
};

// 左下に長方形を描き、所持金を表示
export const displayFunds = (scene: Phaser.Scene, funds: number): Phaser.GameObjects.Text => {
  const { width, height } = scene.scale;

  const rectWidth = 180;
  const rectHeight = 90;

  // 長方形の左上隅の座標を計算
  const rectX = width * 0.1 - rectWidth / 2;
  const rectY = height * 0.85 - rectHeight / 5;

  // 背景グラフィックスを作成
  const fundsBackground = scene.add.graphics();
  fundsBackground.fillStyle(0x000000, 0.7);
  fundsBackground.fillRect(rectX, rectY, rectWidth, rectHeight);

  // テキストの追加
  scene.add.text(width * 0.1, height * 0.87, 'Current funds:', {
    fontSize: '18px',
    color: '#f5f5f5'
  }).setOrigin(0.5);

  // 所持金額のテキスト
  const fundsText = scene.add.text(width * 0.1, height * 0.91, `$ ${funds}`, {
    fontSize: '20px',
    color: '#f5f5f5'
  }).setOrigin(0.5);

  return fundsText; // 後で更新するのでテキストを取得できるようにする
};

export const displayRangeText = (scene: Phaser.Scene, minAmount: number, maxAmount: number) => {
  const { width, height } = scene.scale;

  // 範囲のテキストを表示
  scene.add.text(width * 0.5, height * 0.2, `Range: $${minAmount} - $${maxAmount}`, {
    fontSize: '30px',
    color: '#ffffff'
  }).setOrigin(0.5);
};

export const displayBetAmount = (scene: Phaser.Scene, betAmount: number): Phaser.GameObjects.Text => {
  const { width, height } = scene.scale;

  // 賭け金のテキストを表示
  const amountText = scene.add.text(width * 0.5, height * 0.65, `Current bet: $${betAmount}`, {
    font: '36px Arial',
    color: '#ffffff'
  }).setOrigin(0.5, 0.5);

  return amountText;
};

// 黄色い三角形＝アクションインジケーター
export const displayActionIndicator = (scene: Phaser.Scene): void => {
  const { width, height } = scene.scale;

  // 逆三角形のサイズと位置を定義
  const triangleSize = 20;
  const trianglePosition = height * 0.63;
  const triangleHeight = (triangleSize * Math.sqrt(3)) / 2;
  const offsetY = 60; // Y座標に加える値

  // グラフィックスオブジェクト（逆三角形）を作成
  const triangle = scene.add.graphics({ fillStyle: { color: 0xffff00 } });

  // 逆三角形を描画
  triangle.beginPath();
  triangle.moveTo(width * 0.5, trianglePosition + triangleHeight / 2 + offsetY);
  triangle.lineTo(width * 0.5 - triangleSize / 2, trianglePosition - triangleHeight / 2 + offsetY);
  triangle.lineTo(width * 0.5 + triangleSize / 2, trianglePosition - triangleHeight / 2 + offsetY);
  triangle.lineTo(width / 2, trianglePosition + triangleHeight / 2 + offsetY);
  triangle.closePath();
  triangle.fillPath();

  // 三角形を上下に動かすTweenを作成
  scene.tweens.add({
    targets: triangle,
    y: '+=' + triangleHeight, // 三角形の高さ分動かす
    duration: 1000,
    yoyo: true,
    repeat: -1 // 無限に繰り返す
  });
};

// 白い枠の円
export const displayBetArea = (scene: Phaser.Scene) => {
  const { width, height } = scene.scale;
  const circleCenterHeight = height * 0.8; // 円の中心の高さを設定
  const circleGraphics = scene.add.graphics();
  circleGraphics.lineStyle(5, 0xffffff); // 線の太さと色を設定
  circleGraphics.strokeCircle(width * 0.5, circleCenterHeight, 35); // 円を描画
};

// 右下に最初にチップを表示
// あとで更新できるようにchipCountsTextsを返す
export const displayInitialChips = (
  scene: Phaser.Scene,
  chipCounts: ChipNumType
): { chipCountTexts: ChipTextType, originalPositions: { [key: string]: Position } } => {
  const { width, height } = scene.scale;

  const chipKeys = Object.keys(descendingChipValues) as ChipKeys[];
  const startX = width * 0.85;
  const startY = height * 0.75;
  const xInterval = width * 0.07;
  const yInterval = height * 0.08;

  const originalPositions: { [key: string]: Position } = {};
  const chipCountTexts: ChipTextType = {};

  chipKeys.forEach((chipKey, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;

    const x = startX + column * xInterval;
    const y = startY + row * yInterval;
    originalPositions[chipKey] = { x, y };

    if (chipCounts[chipKey] > 0) {
      scene.add.image(x, y, chipKey)
        .setOrigin(0.5, 0.5)
        .setScale(0.5, 0.5)
        .setInteractive({ useHandCursor: true, draggable: true });

      chipCountTexts[chipKey] = scene.add.text(
        x + 22, y - 22,
        `${chipCounts[chipKey]}`,
        { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', backgroundColor: '#000000' }
      ).setOrigin(0.5);
    }
  });

  return { chipCountTexts, originalPositions };
};

export const startNextScene = (
  scene: Phaser.Scene,
  sceneName: string,
  betAmount: number,
  funds: number,
  chipCounts: ChipNumType,
  mainChipsInBetArea: ChipType[],
  tieChipsInBetArea?: ChipType[]
) => {
  return () => {
    const inputData: {
      timelineID: string,
      betAmount: number,
      funds: number,
      chipCounts: ChipNumType,
      mainChipsInBetArea: ChipType[],
      tieChipsInBetArea?: ChipType[]
    } = {
      timelineID: 'start',
      betAmount: betAmount,
      funds: funds,
      chipCounts: chipCounts,
      mainChipsInBetArea: mainChipsInBetArea
    };

    // tieChipsInBetArea が undefined でない場合のみ、プロパティを追加
    if (tieChipsInBetArea !== undefined) {
      inputData.tieChipsInBetArea = tieChipsInBetArea;
    }

    scene.scene.start(sceneName, inputData);
  }

};

export const createDealButton = (
  scene: Phaser.Scene,
): Phaser.GameObjects.Container => {
  const { width, height } = scene.scale;
  const cardContainer = scene.add.container(width / 2, height * 0.4).setInteractive();
  const card1 = scene.add.image(-15, 10, 'backcard').setScale(0.3, 0.3);
  const card2 = scene.add.image(15, 5, 'backcard').setScale(0.3, 0.3);
  const dealText = scene.add.text(0, 10, 'DEAL', { font: 'bold 18px Arial', color: '#7fff00' }).setOrigin(0.5, 0.5);

  cardContainer.add([card1, card2, dealText]);

  cardContainer.on('pointerover', () => { scene.input.setDefaultCursor('pointer'); });
  cardContainer.on('pointerdown', () => { scene.input.setDefaultCursor('default'); });

  return cardContainer;
}
