export type TroopType = 'infantry' | 'tank' | 'scout' | 'artillery';
export type Player = 1 | 2;

export interface Troop {
  id: string;
  type: TroopType;
  player: Player;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  hasMoved: boolean;
  hasAttacked: boolean;
}

export interface TroopStats {
  maxHp: number;
  attack: number;
  range: number;
  movement: number;
  icon: string;
  name: string;
  description: string;
}

export interface Level {
  id: number;
  name: string;
  size: number;
  walls: Array<[number, number]>;
  troopsPerPlayer: number;
}

export interface GameState {
  troops: Troop[];
  currentPlayer: Player;
  turnCount: number;
  levelId: number;
  player1Ready: boolean;
  player2Ready: boolean;
  gameStarted: boolean;
  winner: Player | null;
}