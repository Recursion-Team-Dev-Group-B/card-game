export interface Position {
  x: number;
  y: number;
}

export interface GameInitData {
  betAmount: number;
  funds: number;
  mainChipsInBetArea: ChipType[];
  chipCounts: ChipNumType;
}

export type ChipKeys = 'warChip_1000' | 'warChip_500' | 'warChip_100' | 'warChip_25' | 'warChip_5' | 'warChip_1';

export type ChipNumType = {
  // チップのバリューとカウントで使用
  [key in ChipKeys]: number;
};

export type ChipTextType = {
  [key in ChipKeys]?: Phaser.GameObjects.Text;
};

export type ChipType = {
  id: number;
  x: number;
  y: number;
  key: string;
}

export interface ReplayPositionConfig {
  offsetX: number;
  offsetY: number;
  text: string;
  color: string;
  onClick: () => void;
}
