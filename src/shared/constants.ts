import type { TroopStats, Level, TroopType } from './types';

export const TROOP_STATS: Record<TroopType, TroopStats> = {
  infantry: {
    maxHp: 100,
    attack: 25,
    range: 1,
    movement: 3,
    icon: '⚔️',
    name: 'Infantry',
    description: 'Balanced fighter'
  },
  tank: {
    maxHp: 200,
    attack: 40,
    range: 1,
    movement: 2,
    icon: '🛡️',
    name: 'Tank',
    description: 'Heavy armor, slow'
  },
  scout: {
    maxHp: 60,
    attack: 15,
    range: 1,
    movement: 5,
    icon: '⚡',
    name: 'Scout',
    description: 'Fast & fragile'
  },
  artillery: {
    maxHp: 50,
    attack: 50,
    range: 3,
    movement: 2,
    icon: '🎯',
    name: 'Artillery',
    description: 'Long range sniper'
  }
};

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Open Field',
    size: 10,
    walls: [
      [4, 4], [5, 4], [4, 5], [5, 5]
    ],
    troopsPerPlayer: 4
  },
  {
    id: 2,
    name: 'The Corridor',
    size: 12,
    walls: [
      [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 6], [3, 7], [3, 8], [3, 9], [3, 10], [3, 11],
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11]
    ],
    troopsPerPlayer: 5
  },
  {
    id: 3,
    name: 'Fortress Siege',
    size: 14,
    walls: [
      [5, 5], [6, 5], [7, 5], [8, 5],
      [5, 8], [6, 8], [7, 8], [8, 8],
      [5, 6], [5, 7], [8, 6], [8, 7],
      [1, 1], [1, 12], [12, 1], [12, 12]
    ],
    troopsPerPlayer: 6
  },
  {
    id: 4,
    name: 'Labyrinth',
    size: 14,
    walls: [
      [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
      [4, 2], [5, 2], [6, 2], [7, 2], [8, 2],
      [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
      [10, 2], [10, 3], [10, 4], [10, 5], [10, 6],
      [4, 10], [5, 10], [6, 10], [7, 10], [8, 10]
    ],
    troopsPerPlayer: 7
  }
];