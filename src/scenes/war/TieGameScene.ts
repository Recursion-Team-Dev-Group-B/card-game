import Deck from '@/models/common/deck';
import { NONE } from 'phaser';
import { ChipNumType, ChipType, ChipKeys } from './interfaces';
import { descendingChipValues } from './constants';
import { GameInitData } from './interfaces';
import { cardAssets, imageAssets, soundAssets } from './assets';
import { setBackground } from './MainBetScene';
import { setGameResult } from './MainGameScene';
import { displayTieGameLogo } from './TieBetScene';

export class TieGameScene extends Phaser.Scene {

  public betAmount: number = 0;
  public funds: number = 0;
  public chipPosition: any;
  public tieGameResult: string = '';
  public mainChipsInBetArea: ChipType[] = [];
  public tieChipsInBetArea: ChipType[] = [];
  public chipCounts: ChipNumType = {
    'warChip_1': 10,
    'warChip_5': 8,
    'warChip_25': 10,
    'warChip_100': 7,
    'warChip_500': 2,
    'warChip_1000': 1,
  };

  constructor() {
    super('tiegame');
  }

  init(data: any) {
    this.betAmount = data.betAmount;
    this.funds = data.funds;
    this.chipPosition = data.chipPosition;
    this.mainChipsInBetArea = data.mainChipsInBetArea;
    this.tieChipsInBetArea = data.tieChipsInBetArea;
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

    displayTieGameLogo(this);

    // 白い枠線の円を描く
    const circlecenterHeight = height * 0.8
    const graphics = this.add.graphics();
    graphics.lineStyle(5, 0xffffff); // 線の太さと色を設定 (ここでは太さ5の白色)
    graphics.strokeCircle(width * 0.5, circlecenterHeight, 35); // 中心座標(x, y)と半径を指定して円を描画

    // 複数のチップでも再表示する。
    // 各チップを表示
    this.mainChipsInBetArea.forEach((chip: ChipType) => {
      // チップ画像を生成
      const newChip = this.add.image(chip.x, chip.y, chip.key)
        .setOrigin(0.5, 0.5)
        .setScale(0.5, 0.5);
    });
    this.tieChipsInBetArea.forEach((chip: ChipType) => {
      // チップ画像を生成
      const newChip = this.add.image(chip.x, chip.y, chip.key)
        .setOrigin(0.5, 0.5)
        .setScale(0.5, 0.5);
    });

    // 左下に所持金を表示
    const fundsBackground = this.add.graphics();
    fundsBackground.fillStyle(0x000000, 0.7); // 黒色で半透明の塗りつぶし
    fundsBackground.fillRect(width * 0.1 - 90, height * 0.85 - 20, 180, 90);
    // 所持金に関するテキストを追加
    const fundsText_1 = this.add.text(width * 0.1, height * 0.87, 'Current funds:', {
      fontSize: '18px',
      color: '#f5f5f5'
    }).setOrigin(0.5);
    const fundsText_2 = this.add.text(width * 0.1, height * 0.91, '$ ' + this.funds, {
      fontSize: '20px',
      color: '#f5f5f5'
    }).setOrigin(0.5);

    // デッキから２つカードを出す
    const deck = new Deck(this.sys.scene);
    deck.shuffle();
    // first card = 自分のカード
    const firstCard = deck.cardList[0]
      .setDisplaySize(width * 0.1, width * 0.14)
      .setPosition(width * 0.4, height * 0.6)
      .setVisible(false);
    // second card = 相手のカード
    const secondCard = deck.cardList[1]
      .setDisplaySize(width * 0.1, width * 0.14)
      .setPosition(width * 0.6, height * 0.2)
      .setVisible(false);

    // 裏面のカードを2枚作成
    const first_backCard = this.add.sprite(width * 0.4, -height, 'backcard')
      .setDisplaySize(width * 0.1, width * 0.14);
    const second_backCard = this.add.sprite(width * 0.6, -height, 'backcard')
      .setDisplaySize(width * 0.1, width * 0.14);

    // カード移動中のサウンド（シャッフル）
    let shuffleSound = this.sound.add('shuffle_sound');
    shuffleSound.play();
    setTimeout(() => {
      shuffleSound.stop();
    }, 2000);

    // Tweenを使用して1枚目の裏カードを画面内に移動
    this.tweens.add({
      targets: first_backCard,
      y: height * 0.6, // 画面内の目的の位置
      duration: 1500, // アニメーションの時間（ミリ秒）
      ease: 'easeOut',
      delay: 200, // アニメーション開始までの時間
      onComplete: () => {
        // Tween完了後のフラッシュ効果をシミュレートするためのTween
        this.tweens.add({
          targets: first_backCard,
          alpha: 0, // 完全に透明に
          duration: 100, // 点滅の速度
          ease: 'Linear', // 線形のイージング
          yoyo: true, // 元に戻す
          repeat: 4, // 繰り返し回数
          onComplete: () => {
            first_backCard.destroy(); // 背面カードを削除
            firstCard.setVisible(true); // 実際のカードを表示
          }
        });
      }
    });
    // 2枚目の裏カードのアニメーション。1枚目と同じ。
    this.tweens.add({
      targets: second_backCard,
      y: height * 0.2, // 画面内の目的の位置
      duration: 1500, // アニメーションの時間（ミリ秒）
      ease: 'easeOut',
      delay: 200, // アニメーション開始までの時間
      onComplete: () => {
        // Tween完了後のフラッシュ効果をシミュレートするためのTween
        this.tweens.add({
          targets: second_backCard,
          alpha: 0, // 完全に透明に
          duration: 100, // 点滅の速度
          ease: 'Linear', // 線形のイージング
          yoyo: true, // 元に戻す
          repeat: 4, // 繰り返し回数
          onComplete: () => {
            second_backCard.destroy(); // 背面カードを削除
            secondCard.setVisible(true); // 実際のカードを表示
            showDisplay();
          }
        });
      }
    });
    this.add.existing(firstCard);
    this.add.existing(secondCard);

    this.tieGameResult = setGameResult(firstCard, secondCard); // タイゲームの結果
    // ゲーム結果を伝える帯
    const resultContainer = this.add.container(0, 0);
    // 半透明の帯を作成
    const bandHeight = 100;
    const band = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
    band.fillRect(0, 0, width, bandHeight); // 帯の初期位置をコンテナの上部に設定
    // 勝ち負けの結果を表示するテキストオブジェクト
    const resultText = this.add.text(width * 0.5, bandHeight / 2, '', {
      fontSize: '60px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    // 帯とテキストをコンテナに追加
    resultContainer.add(band);
    resultContainer.add(resultText);
    // コンテナの初期位置を設定（画面の上に隠れるように）
    resultContainer.y = -bandHeight;

    // アニメーションを追加
    const showResultAnimation = (result: String) => {
      resultText.setText(result === "win" ? "WIN!" : (result === "lose" ? "LOSE" : "GREAT DRAW!!")); // 再戦時の表示を少し変更
      this.tweens.add({
        targets: resultContainer,
        y: height * 0.4 - bandHeight / 2, // 画面中央にコンテナの上部が来るようにする
        duration: 1000,
        ease: 'Power2'
      });
      // 効果音
      if (result === 'win') {
        this.sound.play('win_sound');
      } else if (result === 'lose') {
        this.sound.play('lose_sound');
      } else if (result === 'draw') {
        this.sound.play('draw_sound');
      } else {
        NONE;
      }
    };

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
            showResultAnimation(this.tieGameResult);
            displayResultText.setVisible(false);
            goButton.setVisible(false);
            // Win/Lose/Drawの全ての場合で同じ
            updateFundsForTieGame(this.tieGameResult, fundsText_2);
            updateChipCounts(this.chipCounts, this.tieGameResult);
            askForGameReplay();
          });

        // ゾーンの背景に光のパルスエフェクトを追加
        this.tweens.add({
          targets: goButton,
          alpha: { start: 0.65, to: 0.35 }, // アルファ値を0.3から0.8まで変化
          duration: 500, // 1秒でアニメーション
          yoyo: true, // アニメーションを元に戻す
          repeat: -1 // 無限に繰り返す
        });
      });
    }

    // リプレイするかどうか。（Winかloseの場合）
    const askForGameReplay = () => {
      // 実行を遅らせたい
      this.time.delayedCall(2500, () => {
        this.add.text(width * 0.85, height * 0.75, "Play again?", { fontSize: '32px' }).setOrigin(0.5);
        // Yesボタン
        const bgYes = this.add.graphics();
        bgYes.fillStyle(0x00ff00, 0.5); // 透明度0.5の緑色
        bgYes.fillRect(width * 0.79 - 50, height * 0.83 - 25, 100, 50);
        const zone_yes = this.add.zone(width * 0.79, height * 0.83, 100, 50);
        const text_yes = this.add.text(0, 0, 'YES', {
          font: '28px Arial',
          color: '#FFFFFF'
        }).setOrigin(0.5, 0.5);
        Phaser.Display.Align.In.Center(text_yes, zone_yes);
        zone_yes.setInteractive({ useHandCursor: true });
        // Yesをクリック→リスタート
        zone_yes.on('pointerdown', () => {
          this.sound.play('tap_sound'); // クリック時の効果音
          this.scene.start('mainbet', { timelineID: 'start', 'funds': this.funds, 'chipCounts': this.chipCounts });
        });
        // Noボタン
        const bgNo = this.add.graphics();
        bgNo.fillStyle(0xff0000, 0.5); // 透明度0.5の赤色
        bgNo.fillRect(width * 0.91 - 50, height * 0.83 - 25, 100, 50);
        const zone_no = this.add.zone(width * 0.91, height * 0.83, 100, 50);
        const text_no = this.add.text(0, 0, 'NO', {
          font: '28px Arial',
          color: '#FFFFFF'
        }).setOrigin(0.5, 0.5);
        Phaser.Display.Align.In.Center(text_no, zone_no);
        zone_no.setInteractive({ useHandCursor: true });
        // Noをクリックしたら初期画面に遷移
        zone_no.on('pointerdown', () => {
          this.sound.play('tap_sound'); // クリック時の効果音
          // ローカルホストで仮に設定しておく
          window.location.href = './';
        });
      });
    }

    // チップカウントの更新
    // 再ゲーム実行後はwin, lose, drawのみ。surrenderは存在しない。
    const updateChipCounts = (chipCounts: any, result: string) => {
      if (result === "win") {
        // 勝利時の処理: ベットエリア内の各チップの個数を2倍にする（旧版。あとで消す）
        // やること１：mainChipsInBetAreaを追加（実質返却）
        // やること２：tieChipsInBetArea分を追加（実質返却）
        // やること３：tieChipsInBetAreaの２倍を追加（これが実質的な配当となる）＝1つのチップあたりカウントを2つ増やす。

        // やること１を実装
        this.mainChipsInBetArea.forEach((chip: ChipType, index: number) => {
          const chipType = chip.key as keyof ChipNumType;
          chipCounts[chipType] = (chipCounts[chipType] || 0) + 1;
          // 獲得したチップをもらうアニメーション
          const obtainedChip = this.add.image(width * 0.1, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションは返却には適用されない。
        });

        // やること２と３を同時に実装
        this.tieChipsInBetArea.forEach((chip: ChipType, index: number) => {
          const chipType = chip.key as keyof ChipNumType;
          // チップの種類ごとにカウントを2倍にする
          chipCounts[chipType] = (chipCounts[chipType] || 0) + 3; // 3でいいはず。あとで検証する。
          // 獲得したチップをもらうアニメーション
          const obtainedChip = this.add.image(width * 0.09, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用
          this.tweens.add({
            targets: obtainedChip,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2300, // 落下にかかる時間（ミリ秒）
            delay: index * 500, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip.setVisible(false);
            }
          });
          const obtainedChip2 = this.add.image(width * 0.12, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用（2回目）
          this.tweens.add({
            targets: obtainedChip2,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2000, // 落下にかかる時間（ミリ秒）
            delay: index * 1000, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip2.setVisible(false);
            }
          });
        });
      } else if (result === "lose") {
        NONE;
      } else if (result === 'draw') {
        // ドローのとき
        // やること１：mainChipsInBetArea分を追加（実質返却）
        // やること２：tieChipsInBetArea分を追加（実質返却）
        // やること３：mainChipsInBetAreaの２倍を追加（実質的な配当となる）
        // やること４：tieChipsInBetAreaの２倍を追加（実質的な配当となる）

        // やること１と３を同時に実装
        this.mainChipsInBetArea.forEach((chip: ChipType, index: number) => {
          const chipType = chip.key as keyof ChipNumType;
          //
          chipCounts[chipType] = (chipCounts[chipType] || 0) + 3;
          // 獲得したチップをもらうアニメーション
          const obtainedChip = this.add.image(width * 0.09, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用
          this.tweens.add({
            targets: obtainedChip,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2300, // 落下にかかる時間（ミリ秒）
            delay: index * 500, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip.setVisible(false);
            }
          });
          const obtainedChip2 = this.add.image(width * 0.12, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用（2回目）
          this.tweens.add({
            targets: obtainedChip2,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2000, // 落下にかかる時間（ミリ秒）
            delay: index * 1000, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip2.setVisible(false);
            }
          });
        });
        // やること２と４を同時に実装
        this.tieChipsInBetArea.forEach((chip: ChipType, index: number) => {
          const chipType = chip.key as keyof ChipNumType;
          //
          chipCounts[chipType] = (chipCounts[chipType] || 0) + 3;
          // 獲得したチップをもらうアニメーション
          const obtainedChip = this.add.image(width * 0.11, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用
          this.tweens.add({
            targets: obtainedChip,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 2500, // 落下にかかる時間（ミリ秒）
            delay: index * 700, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip.setVisible(false);
            }
          });
          const obtainedChip2 = this.add.image(width * 0.08, -height, chip.key)
            .setOrigin(0.5, 0.5)
            .setScale(0.5, 0.5);
          // 落下アニメーションを適用（2回目）
          this.tweens.add({
            targets: obtainedChip2,
            y: height * 0.9, // 最終的なY座標（画面下部または特定の位置）
            ease: 'Power1',
            duration: 1800, // 落下にかかる時間（ミリ秒）
            delay: index * 1200, // 連続して落下するようにディレイを設定
            onComplete: () => {
              // アニメーションが完了したらチップを非表示にする
              obtainedChip2.setVisible(false);
            }
          });
        });
      } else {
        NONE;
      }
    }

    // 所持金の更新
    const updateFundsForTieGame = (result: string, fundsText: Phaser.GameObjects.Text) => {
      if (result === "win") {
        this.funds += this.betAmount;
      } else if (result === "lose") {
        this.funds -= this.betAmount;
      } else if (result === 'draw') {
        this.funds += this.betAmount * 2;
      } else {
        NONE;
      }
      fundsText.setText('$ ' + this.funds);
      // 更新時に点滅する
      this.tweens.add({
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
    }
    this.load.start();
  }
}
