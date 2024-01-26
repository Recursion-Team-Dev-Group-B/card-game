import { GameInitData, Position, ChipKeys, ChipNumType, ChipTextType, ChipType } from './interfaces';
import { imageAssets, soundAssets } from './assets';
import { NONE } from 'phaser';

export class TieBetScene extends Phaser.Scene {

  private amountText: Phaser.GameObjects.Text | null = null;
  private betAmount: number = 0;
  private funds: number = 3000;
  public mainGameResult: string = ''

  private chipIdCounter: number = 0; // チップのID

  public originalPosition: Position = { x: 0, y: 0 };
  public newChipPosition: Position = { x: 0, y: 0 };

  public chipCounts: ChipNumType = {
    'warChip_1': 10,
    'warChip_5': 8,
    'warChip_25': 10,
    'warChip_100': 7,
    'warChip_500': 2,
    'warChip_1000': 1,
  };

  private originalChipCounts: any; // 再戦開始時（追加のチップを置く前）のチッププールの状態を取得

  // メインゲーム（最初のゲーム）で賭けたチップの情報（位置、種類、インデックス）を保持する
  public mainChipsInBetArea: ChipType[] = [];
  // タイゲーム（再戦）で賭けるチップの情報は別で保持する
  public tieChipsInBetArea: ChipType[] = [];

  // DEALアニメーションを開始するメソッド
  private startDealAnimation(container: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: container,
      scaleX: 1.3,
      scaleY: 1.3,
      yoyo: true,
      duration: 800,
      repeat: -1
    });
  }

  // DEALアニメーションを停止するメソッド
  private stopDealAnimation(container: Phaser.GameObjects.Container) {
    this.tweens.killTweensOf(container);
    container.setScale(1, 1);
  }


  constructor() {
    super('tiebet');
  }

  init(data: any) {
    this.betAmount = data.betAmount;
    this.funds = data.funds;
    this.mainChipsInBetArea = data.mainChipsInBetArea;
    this.chipCounts = data.chipCounts;
    this.mainGameResult = data.mainGameResult;
    this.originalChipCounts = data.chipCounts;
    this.tieChipsInBetArea = [];
  }

  preload() {
    imageAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });

    soundAssets.forEach(asset => {
      this.load.audio(asset.key, asset.path);
    });
  }

  create() {
    const { width, height } = this.game.canvas;
    this.cameras.main.setBackgroundColor('#242424');
    const backgroundImage = this.add.image(width * 0.5, height * 0.5, 'war_table').setOrigin(0.5, 0.5);
    backgroundImage.setScale(1, 1);

    displayTieGameLogo(this);


    // 途中でサレンダーに切り替えても正常に処理できるように、オリジナルの状態を保持する
    const originalBetAmount = this.betAmount;

    // 左下に所持金を表示。（全く同じ）
    const fundsBackground = this.add.graphics();
    fundsBackground.fillStyle(0x000000, 0.7);
    fundsBackground.fillRect(width * 0.1 - 90, height * 0.85 - 20, 180, 90);
    // テキストを追加
    const fundsText_1 = this.add.text(width * 0.1, height * 0.87, 'Current funds:', {
      fontSize: '18px',
      color: '#f5f5f5'
    }).setOrigin(0.5);
    const fundsText_2 = this.add.text(width * 0.1, height * 0.91, '$ ' + this.funds, {
      fontSize: '20px',
      color: '#f5f5f5'
    }).setOrigin(0.5);

    // 中央のDEAL誘導のボタンを作成する。
    const cardContainer = this.add.container(width / 2, height * 0.4); // コンテナを作成
    // 2枚のカードをコンテナに追加
    const card1 = this.add.image(-15, 10, 'backcard').setScale(0.3, 0.3);
    const card2 = this.add.image(15, 5, 'backcard').setScale(0.3, 0.3);
    const dealText = this.add.text(0, 10, 'DEAL', { font: 'bold 18px Arial', color: '#7fff00' }).setOrigin(0.5, 0.5);
    cardContainer.add(card1);
    cardContainer.add(card2);
    cardContainer.add(dealText);
    cardContainer.on('pointerover', () => { this.input.setDefaultCursor('pointer'); });
    // ZoneをクリックしたらMainGameSceneに遷移
    cardContainer.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      this.sound.play('tap_sound'); // クリック時の効果音
      this.scene.start('tiegame', { timelineID: 'start', 'betAmount': this.betAmount, 'funds': this.funds, chipCounts: this.chipCounts, 'mainChipsInBetArea': this.mainChipsInBetArea, 'tieChipsInBetArea': this.tieChipsInBetArea });
    });

    // 白い枠線の円
    const circleCenterHeight = height * 0.8;
    const graphics = this.add.graphics();
    graphics.lineStyle(5, 0xffffff); // 線の太さと色を設定
    graphics.strokeCircle(width * 0.5, circleCenterHeight, 35); // 中心座標(x, y)と半径を指定して円を描画


    // 手持ちのチップを表示する
    // チップの個数を表示する
    // チップが1つ以上ある場合には各チップを生成。
    // チップ個数表示用のテキストオブジェクトを保持する辞書
    const chipCountTexts: ChipTextType = {};
    // チップの種類のリスト
    const chipKeys: (keyof ChipTextType)[] = ['warChip_1', 'warChip_5', 'warChip_25', 'warChip_100', 'warChip_500', 'warChip_1000'];

    // チップの初期位置と間隔を定義
    const startX = width * 0.85;
    const startY = height * 0.75;
    const xInterval = width * 0.07; // 横方向の間隔
    const yInterval = height * 0.08; // 縦方向の間隔

    // 各チップの初期位置を保存するオブジェクト
    const originalPositions: { [key: string]: Position } = {};

    // 各チップを生成し、個数を表示
    chipKeys.forEach((chipKey, index) => {

      const row = Math.floor(index / 2); // 行 (0, 1, 2...)
      const column = index % 2; // 列 (0 or 1)

      // 各チップの初期位置を計算して取得
      const x = startX + column * xInterval;
      const y = startY + row * yInterval;
      originalPositions[chipKey] = { x, y };

      if (this.chipCounts[chipKey] > 0) {
        // チップの画像を生成
        const chip = this.add.image(originalPositions[chipKey].x, originalPositions[chipKey].y, chipKey)
          .setOrigin(0.5, 0.5)
          .setScale(0.5, 0.5)
          .setInteractive({ useHandCursor: true, draggable: true });

        // チップの個数を表示するテキストを生成
        chipCountTexts[chipKey] = this.add.text(
          originalPositions[chipKey].x + 22, // チップの右上
          originalPositions[chipKey].y - 22,
          `${this.chipCounts[chipKey]}`,
          { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', backgroundColor: '#000000' }
        ).setOrigin(0.5);
      }
    });

    const updateChipCountDisplay = (chipKey: keyof ChipTextType) => {
      // 既存のテキストオブジェクトの内容を更新
      const chipText = chipCountTexts[chipKey];
      if (chipText) {
        chipText.setText(`${this.chipCounts[chipKey]}`);
      }
    };

    const DescendingChipValues: { [key in ChipKeys]: number } = {
      'warChip_1000': 1000,
      'warChip_500': 500,
      'warChip_100': 100,
      'warChip_25': 25,
      'warChip_5': 5,
      'warChip_1': 1,
    };

    // チップが豊富にある場合。
    // 自動でチップを追加しユーザーは確認だけ行う
    const updateBettingChips_true = () => {
      // ベット金額を確認する文字を表示
      this.add.text(width * 0.5, height * 0.1, 'Confirm your bet', { fontSize: '36px' }).setOrigin(0.5);
      const chipScale = 0.5; // チップのスケール
      const chipOffsetX = 30; // チップを横に並べるときのオフセット

      // 再戦前のベットチップ一つずつに対して実行
      this.mainChipsInBetArea.forEach((chip: ChipType) => {
        // chipCountsの更新（チップのプールから一つ取り出すから1つ分減らす）
        this.chipCounts[chip.key as keyof ChipNumType] -= 1;
        // オリジナルのチップを表示
        const originalChip = this.add.image(chip.x, chip.y, chip.key)
          .setOrigin(0.5, 0.5)
          .setScale(chipScale);
        // 新しいチップをオリジナルのチップの横に配置
        const newChip = this.add.image(chip.x + chipOffsetX, chip.y, chip.key)
          .setOrigin(0.5, 0.5)
          .setScale(chipScale);

        // chipsInBetAreaの更新（カウンターを追加した上で）
        // 新しく賭けるチップは、tieChipsInBetAreaに入れる。
        const chipId = this.chipIdCounter++;
        newChip.setData('id', chipId);
        this.tieChipsInBetArea.push({
          id: chipId,
          x: chip.x + chipOffsetX,
          y: chip.y,
          key: chip.key
        });

        updateChipCountDisplay(chip.key as keyof ChipTextType);
        this.betAmount += DescendingChipValues[chip.key as keyof ChipTextType];
        this.startDealAnimation(cardContainer);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -50 / 2, 100 + 50, 50), Phaser.Geom.Rectangle.Contains);

        // trueケースではチップは動かせないので、透明な長方形を作りクリックされたら音を出す
        const chipTexture = this.textures.get('warChip_1');
        const originalChipWidth = chipTexture.getSourceImage().width;
        const chipRadius = originalChipWidth * chipScale / 2;
        let graphics = this.add.graphics();
        let unClickableArea = new Phaser.Geom.Rectangle(width * 0.85 - chipRadius, height * 0.75 - chipRadius, (width * 0.92) - (width * 0.85) + chipRadius * 2, (height * 0.91) - (height * 0.75) + chipRadius * 2);
        // graphics.fillStyle(0xff0000, 0.5); // 赤色、半透明度50%
        graphics.fillRectShape(unClickableArea);
        // インタラクティブなエリアを作成
        this.add.zone(width * 0.85 - chipRadius, height * 0.75 - chipRadius, (width * 0.92) - (width * 0.85) + chipRadius * 2, (height * 0.91) - (height * 0.75) + chipRadius * 2)
          .setOrigin(0)
          .setInteractive()
          .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // クリックされた位置が長方形の範囲内かどうかを確認
            if (unClickableArea.contains(pointer.x, pointer.y)) {
              // 音を再生
              this.sound.play('wrong_sound');
            }
          });

      });
    };

    // チップが不足している場合
    const updateBettingChips_false = () => {
      // ベット金額の入力を促す文字を表示
      this.add.text(width * 0.5, height * 0.1, 'Place your bet', { fontSize: '36px' }).setOrigin(0.5);
      const requiredAmount = this.betAmount * 2; // 再戦に必要な追加チップの総額
      this.add.text(width * 0.5, height * 0.2, 'You have to put $' + requiredAmount.toString() + ' in total for Tie Game', { fontSize: '26px' }).setOrigin(0.5);

      this.mainChipsInBetArea.forEach((chip: ChipType) => {
        // メインベット時のチップを表示
        const originalChip = this.add.image(chip.x, chip.y, chip.key)
          .setOrigin(0.5, 0.5)
          .setScale(0.5);
      });

      // チッププールの操作はチップ不足ケースでのみ
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
            updateChipCountDisplay(chipKey);
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
            this.tieChipsInBetArea.push({
              id: chipId,
              x: gameObject.x,
              y: gameObject.y,
              key: chipKey
            });

            // bet金額の加算
            if (chipKey in DescendingChipValues) {
              this.betAmount += DescendingChipValues[chipKey];
            }

            if (this.amountText) { this.amountText.setText('Current bet: $ ' + this.betAmount.toString()); }


            this.newChipPosition = { x: gameObject.x, y: gameObject.y }; // チップの新しい位置を保存

            // ２倍額と一致したらDEALのアニメーションを開始。
            if (this.betAmount == requiredAmount) {
              this.startDealAnimation(cardContainer); // 中央のコンテナのアニメーションを開始
              cardContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -50 / 2, 100 + 50, 50), Phaser.Geom.Rectangle.Contains); // コンテナをクリック可能にする
            } else {
              cardContainer.disableInteractive();
              this.stopDealAnimation(cardContainer);
              this.input.setDefaultCursor('default');
            }

            // 同じ種類のチップを盤面に補充する
            // 残数がまだある場合、新しいチップを生成
            if (this.chipCounts[chipKey] > 0) {
              this.chipCounts[chipKey]--;

              if (this.chipCounts[chipKey] > 0) {
                const newPosition = originalPositions[chipKey];
                const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
                newChip.setInteractive({ useHandCursor: true, draggable: true });

                // チップにユニークなIDを割り当てる
                newChip.setData('id', `chip_${this.chipIdCounter++}`);
              }

            }

            // チップカウントの表示を更新
            updateChipCountDisplay(chipKey);

          } else if (wasInsideBetArea && !isNowInsideBetArea) {
            // 条件2
            const originalPosition = originalPositions[gameObject.texture.key];
            gameObject.setPosition(originalPosition.x, originalPosition.y);

            this.chipCounts[chipKey]++;

            // エリアから外れた場合に、削除
            const chipId = gameObject.getData('id');
            this.tieChipsInBetArea = this.tieChipsInBetArea.filter((chip: ChipType) => chip.id !== chipId);

            // bet金額の減算
            if (chipKey in DescendingChipValues) {
              this.betAmount -= DescendingChipValues[chipKey];
            }

            if (this.amountText) { this.amountText.setText('Current bet: $ ' + this.betAmount.toString()); }

            // 2倍額に一致したらDEALのアニメーションを開始。
            if (this.betAmount == requiredAmount) {
              this.startDealAnimation(cardContainer); // 中央のコンテナのアニメーションを開始
              cardContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -50 / 2, 100 + 50, 50), Phaser.Geom.Rectangle.Contains); // コンテナをクリック可能にする
            } else {
              cardContainer.disableInteractive();
              this.stopDealAnimation(cardContainer);
              this.input.setDefaultCursor('default');
            }

            // チップカウントの表示を更新
            updateChipCountDisplay(chipKey);

          } else if (!wasInsideBetArea && !isNowInsideBetArea) {
            const originalPosition = originalPositions[gameObject.texture.key];
            gameObject.setPosition(originalPosition.x, originalPosition.y);
          }
        }
      });

      // 両替所の関数（Tie Game用）
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
            const newPosition = originalPositions[chipKey];
            const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
            newChip.setInteractive({ useHandCursor: true, draggable: true });
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
            const newPosition = originalPositions[newChipKey];
            const newChip = this.add.image(newPosition.x, newPosition.y, newChipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
            newChip.setInteractive({ useHandCursor: true, draggable: true });
          }

          // チップカウントの表示を更新
          // 追加したチップの枚数分鳴るようにする
          updateChipCountDisplay(newChipKey);
          for (let i = 0; i < newChipCount; i++) {
            this.time.delayedCall(350 * i, () => {
              this.sound.play('coinDrop_sound');
            });
          }

        } else {
          const newPosition = originalPositions[chipKey];
          const newChip = this.add.image(newPosition.x, newPosition.y, chipKey).setOrigin(0.5, 0.5).setScale(0.5, 0.5);
          newChip.setInteractive({ useHandCursor: true, draggable: true });
        }
      };


      // サレンダーの出口を設置
      const bgSurrender = this.add.graphics();
      bgSurrender.fillStyle(0xff0000, 0.5); // 透明度0.5の赤色
      bgSurrender.fillRect(width * 0.85, height * 0.03, 120, 100);
      const zoneSurrender = this.add.zone(width * 0.85 + 60, height * 0.03 + 50, 120, 100);
      const textSurrender = this.add.text(0, 0, 'You can\nSurrender\nhere', {
        font: '20px Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5, 0.5);
      Phaser.Display.Align.In.Center(textSurrender, zoneSurrender);
      zoneSurrender.setInteractive({ useHandCursor: true });
      zoneSurrender.on('pointerdown', () => {
        // サレンダー時の処理
        this.sound.play('tap_sound'); // クリック時の効果音

        this.mainGameResult = "surrender";
        // 再戦ベット中のアクションを全部巻き戻し、最初からサレンダーを選択していたのと同じ処理にする。
        this.betAmount = originalBetAmount; // 賭け金はメインゲーム時に簡単に戻せる。
        // this.chipCounts = { ...this.originalChipCounts };
        updateFundsForSurrender(this.betAmount, this.mainGameResult, fundsText_2);
        updateChipCountsForSurrender(this.chipCounts, this.tieChipsInBetArea, this.betAmount, this.mainGameResult);

        // 一度しか押せないようにサレンダーボタンを削除
        bgSurrender.destroy();
        zoneSurrender.destroy();
        textSurrender.destroy();
        askForGameReplay();
        // コンテナを停止
        cardContainer.disableInteractive();
        this.stopDealAnimation(cardContainer);
      });
    }

    // 再戦時にチップが追加で置けるほど十分にあるのかを確かめる
    const hasEnoughChipsForBet = () => {
      const betAreaChipCounts: { [key in ChipKeys]?: number } = {};
      this.mainChipsInBetArea.forEach(chip => {
        const chipKey = chip.key as ChipKeys; // ChipKeys型にキャスト
        betAreaChipCounts[chipKey] = (betAreaChipCounts[chipKey] || 0) + 1;
      });
      for (let key in betAreaChipCounts) {
        const count = betAreaChipCounts[key as ChipKeys];
        if (!count || !this.chipCounts[key as ChipKeys] || this.chipCounts[key as ChipKeys] < count) {
          return false; // 十分なチップがない
        }
      }
      return true; // 十分なチップがある
    };

    if (hasEnoughChipsForBet()) {
      updateBettingChips_true();
    } else {
      updateBettingChips_false();
    }

    // マウスアウトイベントのリスナーを追加
    cardContainer.on('pointerout', () => {
      this.input.setDefaultCursor('default'); // マウスアウト時にカーソルをデフォルトに戻す
    });

    // 賭け金の表示
    this.amountText = this.add.text(width * 0.5, height * 0.65, 'Current bet: $ ' + this.betAmount.toString(), {
      font: '36px Arial',
      color: '#ffffff'
    }).setInteractive().setOrigin(0.5, 0.5);

    // 所持金の更新（あとで共通化する）
    const updateFundsForSurrender = (betAmount: number, result: string, fundsText: Phaser.GameObjects.Text) => {
      if (result === "surrender") {
        // 奇数の場合は切り上げて没収される（0.5多めに取られる）
        this.funds -= Math.ceil(betAmount / 2);
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

    // リプレイの決定
    const askForGameReplay = () => {

      // 実行を遅延
      this.time.delayedCall(100, () => {
        const playAgainText = this.add.text(width * 0.85, height * 0.1, "Play again?", { fontSize: '32px' }).setOrigin(0.5);
        // テキストの点滅アニメーション
        this.tweens.add({
          targets: playAgainText,
          alpha: { start: 0.4, to: 1 }, // 透明度を0から1へ変化させる
          duration: 600, // 1回の点滅の持続時間（ミリ秒）
          ease: 'Linear', // 線形のイージング
          yoyo: true, // アニメーションを元に戻す
          repeat: -1 // 無限に繰り返す
        });

        // Yesボタン
        const bgYes = this.add.graphics();
        bgYes.fillStyle(0x00ff00, 0.8); // 透明度0.5の緑色
        bgYes.fillRect(width * 0.79 - 50, height * 0.18 - 25, 100, 50);
        const zone_yes = this.add.zone(width * 0.79, height * 0.18, 100, 50);
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
        bgNo.fillStyle(0xff0000, 0.8); // 透明度0.5の赤色
        bgNo.fillRect(width * 0.91 - 50, height * 0.18 - 25, 100, 50);
        const zone_no = this.add.zone(width * 0.91, height * 0.18, 100, 50);
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
          window.location.href = 'http://localhost:3001/';
        });
      });
    }

    // チップカウントの更新
    // サレンダーでしか使わない
    const updateChipCountsForSurrender = (chipCounts: any, tieChipsInBetArea: any, betAmount: number, result: string) => {
      if (result === 'surrender') {
        // やること１：mainChipsInBetArea分の半分を計算して追加（通常サレンダーと同じ）
        // やること２：tieChipsInBetArea分を追加（実質返却ではある）

        // やること１
        // Math.ceil(this.betAmount / 2)だけ貪欲法で取られる→差し引きの金額が返却される
        let returnedAmount = betAmount - Math.ceil(betAmount / 2);
        // 利用可能なチップの単位。貪欲法のため大きい順に並べる
        const DescendingChipValues: { [key in ChipKeys]: number } = {
          'warChip_1000': 1000,
          'warChip_500': 500,
          'warChip_100': 100,
          'warChip_25': 25,
          'warChip_5': 5,
          'warChip_1': 1,
        };
        // DescendingChipValuesからキーを取得して順に処理
        Object.keys(DescendingChipValues).forEach((chipKey) => {
          const chipValue = DescendingChipValues[chipKey as ChipKeys];
          const increasedChipCount = Math.floor(returnedAmount / chipValue); // 返却額で買えるチップの枚数を計算
          returnedAmount -= increasedChipCount * chipValue; // 使用した金額を返却額から引く

          chipCounts[chipKey as ChipKeys] = (chipCounts[chipKey as ChipKeys] || 0) + increasedChipCount; // チップのカウントを更新
        });

        // やること２
        tieChipsInBetArea.forEach((chip: any) => {
          const chipKey = chip.key; // チップの種類（キー）
          // chipCountsに対応するチップが存在する場合は加算、存在しない場合は初期値1を設定
          chipCounts[chipKey] = (chipCounts[chipKey] || 0) + 1;
        });
      } else {
        NONE;
      }
    }
    this.load.start();
  }
}

export const displayTieGameLogo = (scene: Phaser.Scene): void => {
  // 黒い半透明の四角形を描画
  const leftRect = scene.add.graphics();
  leftRect.fillStyle(0x000000, 0.5); // 黒色で半透明
  leftRect.fillRect(0, 0, 120, 60); // 画面の左上に配置

  // 'Tie Game' テキストを作成
  scene.add.text(60, 30, 'Tie game', {
    font: '20px Arial',
    color: '#FFFFFF',
    align: 'center'
  }).setOrigin(0.5);
}
