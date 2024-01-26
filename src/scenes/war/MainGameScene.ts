import Deck from '@/models/common/deck';
import Card from '@/models/common/card';
import { NONE } from 'phaser';
import { ChipNumType, ChipType, ChipKeys, ReplayPositionConfig } from './interfaces';
import { GameInitData } from './interfaces';
import { descendingChipValues } from './constants';
import { cardAssets, imageAssets, soundAssets } from './assets';
import { setBackground, displayPromptMessage, displayFunds, displayRangeText, displayBetAmount, displayActionIndicator, displayBetArea, startNextScene, createDealButton } from './MainBetScene';

export class MainGameScene extends Phaser.Scene {

  public mainGameResult: string = "";
  public betAmount: number = 0;
  public funds: number = 0;
  public mainChipsInBetArea: ChipType[] = [];
  public chipCounts: ChipNumType = {
    'warChip_1': 10,
    'warChip_5': 8,
    'warChip_25': 10,
    'warChip_100': 7,
    'warChip_500': 2,
    'warChip_1000': 1,
  };

  private resultContainer: Phaser.GameObjects.Container | null = null;
  private resultText: Phaser.GameObjects.Text | null = null;
  public fundsText: Phaser.GameObjects.Text | null = null;
  constructor() {
    super('maingame');
  }

  init(data: GameInitData) {
    this.betAmount = data.betAmount;
    this.funds = data.funds;
    this.mainChipsInBetArea = data.mainChipsInBetArea;
    this.chipCounts = data.chipCounts;
  }

  preload() {
    // assetsで定義したカードをロードする
    cardAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });

    imageAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });

    soundAssets.forEach(asset => {
      this.load.audio(asset.key, asset.path);
    });
  }

  create() {
    const { width, height } = this.game.canvas;
    setBackground(this, width, height, 'war_table', { x: 1.7, y: 1 });

    // 白い枠線の円を描く
    displayBetArea(this);

    createChipsInBetArea(this, this.mainChipsInBetArea);

    // 左下に所持金を表示
    const fundsText = displayFunds(this, this.funds);

    // チップカウントの更新
    const updateChipCounts = (result: string) => {
      if (result === "win") {
        // 勝利時の処理: ベットエリア内の各チップの個数を2倍にする
        this.mainChipsInBetArea.forEach((chip: ChipType, index: number) => {
          const chipType = chip.key as keyof ChipNumType;
          // チップの種類ごとにカウントを2倍にする
          this.chipCounts[chipType] = (this.chipCounts[chipType] || 0) + 2;
          // 獲得したチップをもらうアニメーション
          const obtainedChip = this.add.image(width * 0.1, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用
          this.tweens.add({
            targets: obtainedChip,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2000, // 落下にかかる時間（ミリ秒）
            delay: index * 500, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip.setVisible(false);
            }
          });

        });
      } else if (result === "lose") {
        NONE;
      } else if (result === 'surrender') {
        // 賭けていたチップはそのまま没収と考える。
        // Math.ceil(this.betAmount / 2)だけ貪欲法で取られる→差し引きの金額が返却される
        let returnedAmount = this.betAmount - Math.ceil(this.betAmount / 2);

        // DescendingChipValuesからキーを取得して順に処理
        Object.keys(descendingChipValues).forEach((chipKey) => {
          const chipValue = descendingChipValues[chipKey as ChipKeys];
          const increasedChipCount = Math.floor(returnedAmount / chipValue); // 返却額で買えるチップの枚数を計算
          returnedAmount -= increasedChipCount * chipValue; // 使用した金額を返却額から引く
          this.chipCounts[chipKey as ChipKeys] = (this.chipCounts[chipKey as ChipKeys] || 0) + increasedChipCount; // チップのカウントを更新
        });

      } else {
        NONE;
      }
    }

    // 結果表示への誘導ボタン
    const showDisplay = () => {
      this.time.delayedCall(200, () => {

        // "Display Result?" テキストを作成
        const displayResultText = this.add.text(width * 0.85, height * 0.75, 'Display result?', {
          font: '32px Arial',
          color: '#FFFFFF'
        }).setOrigin(0.5, 0.5);

        const goButton = this.add.text(width * 0.845, height * 0.83, 'Go !', {
          font: '32px Arial',
          color: '#FFFFFF',
          backgroundColor: '#000000'
        }).setPadding(67, 10, 67, 10)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.sound.play('tap_sound'); // クリック時の効果音

            if (this.resultContainer && this.resultText) {
              showBandAnimation(
                this,
                this.resultContainer,
                this.resultText,
                this.mainGameResult,
                'WIN!', 'LOSE!', 'DRAW');
            }

            displayResultText.setVisible(false);
            goButton.setVisible(false);
            // ここにクリックされたときの処理を記述
            if (this.mainGameResult == "draw") {
              askForRewar();
            } else {
              // Win/Loseの場合
              this.funds = updateFunds(this.funds, this.betAmount, this.mainGameResult, fundsText, this.tweens);
              updateChipCounts(this.mainGameResult);
              askForGameReplay();
            }
          });
        // 光のパルスエフェクトを追加
        this.tweens.add({
          targets: goButton,
          alpha: { start: 0.65, to: 0.35 },
          duration: 500,
          yoyo: true,
          repeat: -1 // 無限に繰り返す
        });
      });
    }

    const deck = new Deck(this);
    const { firstCard, secondCard } = distributeTwoCards(this, deck, showDisplay); // 後で下に置く

    this.mainGameResult = setGameResult(firstCard, secondCard);

    const band = createBand(this);
    this.resultContainer = band.container;
    this.resultText = band.resultText;


    // リプレイの決定
    const askForGameReplay = () => {

      // 実行を遅延
      this.time.delayedCall(2500, () => {
        this.add.text(width * 0.85, height * 0.75, "Play again?", { fontSize: '32px' }).setOrigin(0.5);

        const yesButtonConfig: ReplayPositionConfig = {
          offsetX: 0.79,
          offsetY: 0.83,
          text: 'YES',
          color: '#00FF00',
          onClick: () => { }
        };
        const zone_yes = createYNButton(this, yesButtonConfig);
        // Yesをクリック→リスタート
        zone_yes.on('pointerdown', () => {
          this.sound.play('tap_sound'); // クリック時の効果音
          this.scene.start('mainbet', { timelineID: 'start', 'funds': this.funds, 'chipCounts': this.chipCounts });
        });

        // Noボタン
        const noButtonConfig: ReplayPositionConfig = {
          offsetX: 0.91,
          offsetY: 0.83,
          text: 'NO',
          color: '#FF0000',
          onClick: () => { }
        };
        const zone_no = createYNButton(this, noButtonConfig);
        // Noをクリックしたら初期画面に遷移
        zone_no.on('pointerdown', () => {
          this.sound.play('tap_sound');
          window.location.href = 'http://localhost:3001/'; // ローカルホストで仮に設定しておく
        });
      });
    }

    const askForRewar = () => {
      this.time.delayedCall(2500, () => {
        const drawDescription = this.add.text(width * 0.8, height * 0.6, "Play a tiebreaker?", { fontSize: '32px' })
        drawDescription.setOrigin(0.5);

        // 再戦とサレンダーを選ぶ。
        // Yesボタン（再戦を選択）
        const bgYes = this.add.graphics();
        bgYes.fillStyle(0x00ff00, 0.5); // 透明度0.5の緑色
        bgYes.fillRect(width * 0.64, height * 0.65, 150, 50);

        const zoneYes = this.add.zone(width * 0.64 + 75, height * 0.65 + 25, 150, 50);
        const textYes = this.add.text(0, 0, 'Yes', {
          font: '28px Arial',
          color: '#FFFFFF'
        }).setOrigin(0.5, 0.5);
        Phaser.Display.Align.In.Center(textYes, zoneYes);
        zoneYes.setInteractive({ useHandCursor: true });
        zoneYes.on('pointerdown', () => {
          // 再戦時の処理
          this.sound.play('tap_sound'); // クリック時の効果音
          this.scene.start('tiebet', { timelineID: 'start', 'mainGameResult': this.mainGameResult, 'betAmount': this.betAmount, 'funds': this.funds, chipCounts: this.chipCounts, 'mainChipsInBetArea': this.mainChipsInBetArea })
        });

        // サレンダーボタン
        const bgSurrender = this.add.graphics();
        bgSurrender.fillStyle(0xff0000, 0.5); // 透明度0.5の赤色
        bgSurrender.fillRect(width * 0.8, height * 0.65, 150, 50);
        const zoneSurrender = this.add.zone(width * 0.8 + 75, height * 0.65 + 25, 150, 50);
        const textSurrender = this.add.text(0, 0, 'Surrender', {
          font: '26px Arial',
          color: '#FFFFFF'
        }).setOrigin(0.5, 0.5);
        Phaser.Display.Align.In.Center(textSurrender, zoneSurrender);
        zoneSurrender.setInteractive({ useHandCursor: true });
        zoneSurrender.on('pointerdown', () => {
          // サレンダー時の処理
          this.sound.play('tap_sound'); // クリック時の効果音
          this.mainGameResult = "surrender";
          // 引き分け時の質問部分を画面から削除
          drawDescription.destroy();
          bgYes.destroy();
          zoneYes.destroy();
          textYes.destroy();
          bgSurrender.destroy();
          zoneSurrender.destroy();
          textSurrender.destroy();
          // 次の処理へ移る
          this.funds = updateFunds(this.funds, this.betAmount, this.mainGameResult, fundsText, this.tweens);
          updateChipCounts(this.mainGameResult);
          askForGameReplay();
        });
      });
    }
    this.load.start();
  }
}

// 所持金の更新
const updateFunds = (
  funds: number,
  betAmount: number,
  result: string,
  fundsText: Phaser.GameObjects.Text,
  tweens: Phaser.Tweens.TweenManager
): number => {
  if (result === "win") {
    funds += betAmount;
  } else if (result === "lose") {
    funds -= betAmount;
  } else if (result === "surrender") {
    // 奇数の場合は切り上げて没収される（0.5多めに取られる）
    funds -= Math.ceil(betAmount / 2);
  } else {
    NONE;
  }
  fundsText.setText('$ ' + funds);
  // 更新時に点滅する
  tweens.add({
    targets: fundsText,
    alpha: { start: 0, to: 1 },
    duration: 250,
    ease: 'Linear',
    yoyo: true,
    repeat: 5,
    onComplete: () => {
      fundsText.alpha = 1;
    }
  });
  return funds;
}

// 結果の帯を作成
export const createBand = (
  scene: Phaser.Scene
): { container: Phaser.GameObjects.Container, resultText: Phaser.GameObjects.Text } => {

  const { width } = scene.scale;
  const bandHeight = 100;
  const resultContainer = scene.add.container(0, -bandHeight); // コンテナ作成。画面の上から開始
  const band = scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
  band.fillRect(0, 0, width, bandHeight);

  // 勝ち負けの結果を表示するテキストオブジェクト
  const resultText = scene.add.text(width / 2, bandHeight / 2, '', {
    fontSize: '60px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 帯とテキストをコンテナに追加
  resultContainer.add(band);
  resultContainer.add(resultText);

  return { container: resultContainer, resultText };
};

export const showBandAnimation = (
  scene: Phaser.Scene,
  resultContainer: Phaser.GameObjects.Container,
  resultText: Phaser.GameObjects.Text,
  gameResult: string,
  winText: string,
  loseText: string,
  drawText: string
): void => {
  const bandHeight = 100;
  const { height } = scene.scale;

  // 結果テキストを設定
  let displayText = '';
  switch (gameResult) {
    case 'win':
      displayText = winText;
      break;
    case 'lose':
      displayText = loseText;
      break;
    case 'draw':
      displayText = drawText;
      break;
  }
  resultText.setText(displayText);

  // コンテナのアニメーション
  scene.tweens.add({
    targets: resultContainer,
    y: height * 0.4 - bandHeight / 2,
    duration: 1000,
    ease: 'Power2'
  });

  // 効果音を再生
  const soundKey = gameResult + '_sound';
  scene.sound.play(soundKey);
};

// ベットエリアにチップを再表示
export const createChipsInBetArea = (
  scene: Phaser.Scene,
  mainChipsInBetArea: ChipType[]
): void => {
  mainChipsInBetArea.forEach((chip: ChipType) => {
    // add.imageはライブラリまたはコードの他の部分からの関数であると仮定します。
    scene.add.image(chip.x, chip.y, chip.key)
      .setOrigin(0.5, 0.5)
      .setScale(0.5, 0.5);
  });
};


// 2枚のカードを配布
export const distributeTwoCards = (
  scene: Phaser.Scene,
  deck: Deck,
  showDisplay: () => void
): { firstCard: Card, secondCard: Card } => {

  const { width, height } = scene.scale;
  deck.shuffle();

  // 最初のカード（プレイヤーのカード）
  const firstCard = deck.cardList[0]
    .setDisplaySize(width * 0.1, width * 0.14)
    .setPosition(width * 0.4, height * 0.6)
    .setVisible(false);

  // 二番目のカード（相手のカード）
  const secondCard = deck.cardList[1]
    .setDisplaySize(width * 0.1, width * 0.14)
    .setPosition(width * 0.6, height * 0.2)
    .setVisible(false);

  // 裏面のカードを作成
  const first_backCard = scene.add.sprite(width * 0.4, -height, 'backcard')
    .setDisplaySize(width * 0.1, width * 0.14);
  const second_backCard = scene.add.sprite(width * 0.6, -height, 'backcard')
    .setDisplaySize(width * 0.1, width * 0.14);

  // シャッフルサウンド
  let shuffleSound = scene.sound.add('shuffle_sound');
  shuffleSound.play();
  setTimeout(() => {
    shuffleSound.stop();
  }, 2000);

  // 1枚目のカードのアニメーション
  scene.tweens.add({
    targets: first_backCard,
    y: height * 0.6,
    duration: 1500,
    ease: 'easeOut',
    delay: 200,
    onComplete: () => {
      scene.tweens.add({
        targets: first_backCard,
        alpha: 0,
        duration: 100,
        ease: 'Linear',
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          first_backCard.destroy();
          firstCard.setVisible(true);
        }
      });
    }
  });

  // 2枚目のカードのアニメーション
  scene.tweens.add({
    targets: second_backCard,
    y: height * 0.2,
    duration: 1500,
    ease: 'easeOut',
    delay: 200,
    onComplete: () => {
      scene.tweens.add({
        targets: second_backCard,
        alpha: 0,
        duration: 100,
        ease: 'Linear',
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          second_backCard.destroy();
          secondCard.setVisible(true);
          showDisplay();
        }
      });
    }
  });

  // カードをシーンに追加
  scene.add.existing(firstCard);
  scene.add.existing(secondCard);

  return { firstCard, secondCard };

}

export const setGameResult = (
  firstCard: Card,
  secondCard: Card
): string => {
  let myScore = firstCard.rank === 'A' ? 14 :
    firstCard.rank === 'K' ? 13 :
      firstCard.rank === 'Q' ? 12 :
        firstCard.rank === 'J' ? 11 :
          firstCard.getRankNumber();

  let houseScore = secondCard.rank === 'A' ? 14 :
    secondCard.rank === 'K' ? 13 :
      secondCard.rank === 'Q' ? 12 :
        secondCard.rank === 'J' ? 11 :
          secondCard.getRankNumber();

  // return 'draw'; // 動作確認のため常にdrawを返す
  if (myScore > houseScore) {
    return "win";
  } else if (myScore < houseScore) {
    return "lose";
  } else {
    return "draw";
  }
}

// YES/NO ボタン
export const createYNButton = (
  scene: Phaser.Scene,
  config: ReplayPositionConfig
) => {

  const { width, height } = scene.scale;

  const bg = scene.add.graphics();
  bg.fillStyle(Phaser.Display.Color.HexStringToColor(config.color).color, 0.5);
  bg.fillRect(width * config.offsetX - 50, height * config.offsetY - 25, 100, 50);

  const textArea = scene.add.text(width * config.offsetX, height * config.offsetY, config.text, {
    font: '28px Arial',
    color: '#FFFFFF'
  }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

  // クリックイベントを設定
  textArea.on('pointerdown', config.onClick);

  return textArea;
};
