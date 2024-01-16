import * as Phaser from 'phaser';
import Deck from '@/models/common/deck';
import BlackjackPlayer from '@/models/blackjack/blackjackPlayer';

import Storage from '@/utils/storage';

import STYLE from '@/constants/style';
import Zone = Phaser.GameObjects.Zone;
import Text = Phaser.GameObjects.Text;
import Image = Phaser.GameObjects.Image;

class BaseGameScene extends Phaser.Scene {
  // Phaser.GameObjects.Text
  chips!: Text;
  bet!: Text;

  players: BlackjackPlayer[] = [];
  tableImage: Image | undefined;
  deck: Deck | undefined;
  playerNames: Text[] = [];
  width: number = 0;
  height: number = 0;
  storage: Storage;

  //Zone
  gameZone: Zone | undefined;
  handZones: Zone[] = [];
  chipBetZone: Zone | undefined;

  constructor(sceneKey: string) {
    super(sceneKey);
    this.storage = new Storage();
    this.setChips();
  }

  create(gameTitle: string) {
    this.initGame(gameTitle);
    this.placeTableImage();
    this.createTextObj();

    // デッキ作成
    this.deck = new Deck(this.sys.scene);
    // シャッフル
    this.deck.shuffle();
    this.createGameZone();

    this.createChipsAndBetZone();
    this.setChipsText();
    this.setBetText();
  }

  private setChips() {
    const chips: number = this.storage.get('chips') || 1000;
    const bet: number = 0;

    this.storage.set('chips', chips);
    this.storage.set('bet', bet);
  }

  initGame(gameTitle: string): void {
    this.width = this.sys.game.canvas.width
    this.height = this.sys.game.canvas.height

    // Blackjackプレイヤー作成
    if (gameTitle == 'blackjackGame') {
      this.players = [
        new BlackjackPlayer('player1', 'player', 'blackjack'),
        new BlackjackPlayer('house1', 'house', 'blackjack'),
      ];
    }
  }

  // Blackjackのテーブル画像を配置
  placeTableImage(): void {
    const table = this.add.image(this.width / 2, this.height / 2, 'blackjackTable')
    const tableScaleX = this.width / table.width
    const tableScaleY = this.height / table.height
    const tableScale = Math.max(tableScaleX, tableScaleY)
    table.setScale(tableScale)
  }

  private createTextObj() {
    // 掛け金表示用Textオブジェクト
    this.bet = this.add.text(0, 0, '', STYLE.CHIPS);
    // チップ表示用Textオブジェクト
    this.chips = this.add.text(0, 0, '', STYLE.CHIPS);
  }

  // GameZoneを作成
  createGameZone(): void {
    this.gameZone = this.add.zone(0, 0, this.width, this.height).setOrigin(0);
  }

  // Chip(持っているお金)とBet(賭けたお金)を表示するZoneを作成
  createChipsAndBetZone(): void {
    this.chipBetZone = this.add.zone(0, 0, 700, 100).setOrigin(0);

    Phaser.Display.Align.In.BottomCenter(
      this.chipBetZone as Zone,
      this.gameZone as Zone,
      300,
      0,
    );

    // のちのち returnの手前まで削除。
    // Zoneがどの範囲か分かるように記載
    // Graphics オブジェクトの作成
    // const graphics = this.add.graphics();
    // // 枠線のスタイルを設定
    // graphics.lineStyle(5, 0x00ff00, 1);
    // // Zone の位置とサイズに合わせて枠線を描画
    // graphics.strokeRect(
    //   this.chipBetZone.x,
    //   this.chipBetZone.y,
    //   this.chipBetZone.width,
    //   this.chipBetZone.height,
    // );
  }

  protected setChipsText(): void {
    const chipsValue: number = this.storage.get('chips') || 0;
    const chips: Text = this.chips!.setText(`chips: ${String(chipsValue)}`);

    Phaser.Display.Align.In.TopLeft(chips, this.chipBetZone as Zone, 0, 0);
  }

  protected setBetText(): void {
    const betValue: number = this.storage.get('bet') || 0;
    this.bet.setText(`bet: ${String(betValue)}`);

    Phaser.Display.Align.To.BottomLeft(
      this.bet as Text,
      this.chips as Text,
      0,
      5,
    );
  }

  updateStorageChips(chips: number) {
    this.storage.set('chips', chips);
  }
  updateStorageBet() {
    this.storage.set('bet', 0);
  }
}

export default BaseGameScene;
