import { Player } from '../common/player';
import Card from '../common/card';

class BlackjackPlayer extends Player {
  getHandScore(): number {
    let score = 0;
    let aceCount = 0;

    this.hand.forEach((card) => {
      const value = card.getRankNumber();
      score += value;
      if (card.rank === 'A') {
        aceCount += 1;
      }
    });

    for (let i = 0; i < aceCount; i += 1) {
      if (score > 21) {
        score -= 10; // NOTE: Scoreが21を越える場合は、Aを11ではなく、1としてカウントするため、10を引く
      } else {
        break;
      }
    }

    return score;
  }
}

export default BlackjackPlayer;
