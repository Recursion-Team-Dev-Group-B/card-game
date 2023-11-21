const GAME = {
  STORAGE: {
    BLACKJACK_HIGH_SCORE_STORAGE: 'blackjack_high_score',
  },
  // テーブルはそのまま
  TABLE: {
    BET_DENOMINATIONS: [5, 21, 50, 100],
    RED_CHIP_KEY: 'redChip',
    WHITE_CHIP_KEY: 'whiteChip',
    BLUE_CHIP_KEY: 'blueChip',
    ORANGE_CHIP_KEY: 'orangeChip',
    YELLOW_CHIP_KEY: 'yellowChip',
    BET_TABLE_KEY: 'betTable',
    BLACKJACK_TABLE_KEY: 'blackjackTable',
    SPEED_TABLE_KEY: 'speedTable',
    BUTTON: 'button',
    BACK: 'back',
    COG: 'cog',
    COUNT_DOWN_SOUND_KEY: 'countDown',
    ENTER_GAME_SOUND_KEY: 'enterGame',
    WIN_GAME_SOUND_KEY: 'winGame',
    LOSS_GAME_SOUND_KEY: 'lossGame',
    BUTTON_CLICK_SOUND_KEY: 'buttonClick',
    CHIP_CLICK_SOUND_KEY: 'chipClick',
    ERROR_SOUND_KEY: 'error'
  },
  // プレイヤーはそのまま
  PLAYER: {
    CHIPS: 1000
  },
  CARD: {
    SUIT_CHOICES: ['Spades', 'Clubs', 'Hearts', 'Diamonds'],
    RANK_CHOICES: [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K'
    ],
    WIDTH: 140,
    HEIGHT: 190,
    FLIP_TIME: 800,
    ATLAS_KEY: 'cards',
    BACK_KEY: 'cardBack',
    FLIP_OVER_SOUND_KEY: 'flipOverCard',
    PUT_DOWN_SOUND_KEY: 'putDownCard'
  },
  DECK: {
    POKER_HEIGHT: 600
  },
  // 画像のパスは後で変更する
  COMMON_IMG_ASSETS_PATH: '/game_assets/common/images',
  COMMON_SOUND_ASSETS_PATH: '/game_assets/common/sounds'
} as const;

export default GAME;
