const STYLE = {
  TEXT: {
    font: '24px Arial',
    color: '#000000',
    // stroke: '#000000',
    strokeThickness: 2,
  },
  LOAD_TEXT: {
    font: '18px Arial',
    color: '#FFFFFF',
  },
  PLAYER_NAME: {
    font: '24px Arial',
    strokeThickness: 2,
    fontStyle: 'strong',
    padding: {
      x: 20,
      y: 10,
    },
  },
  DECK_SIZE: {
    font: 'normal 24px Impact',
    color: '#FFFFFF',
  },
  TIMER: {
    font: 'normal 300px Impact',
    color: '#2051e5',
    stroke: '#000000',
    strokeThickness: 5,
  },
  GUTTER_SIZE: 20,
  CHIPS: {
    font: '24px Arial',
    color: '#FFFFFF',
    strokeThickness: 2,
  },
} as const;

export default STYLE;
