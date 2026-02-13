import './index.css';

import { StrictMode, useState, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import type { Troop, Level, Player } from '../shared/types';
import { TROOP_STATS, LEVELS } from '../shared/constants';

export const App = () => {
  // Using non-null assertion since LEVELS array always has at least one element
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]!);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [selectedTroop, setSelectedTroop] = useState<Troop | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [turnCount, setTurnCount] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  // Initialize game with random troop spawns
  const initializeGame = useCallback((level: Level) => {
    const newTroops: Troop[] = [];
    const troopTypes = Object.keys(TROOP_STATS) as Array<keyof typeof TROOP_STATS>;
    
    const isValidPosition = (x: number, y: number, existing: Troop[]) => {
      if (level.walls.some(([wx, wy]) => wx === x && wy === y)) return false;
      if (existing.some(t => t.x === x && t.y === y)) return false;
      return true;
    };

    // Spawn troops for player 1 (left side)
    for (let i = 0; i < level.troopsPerPlayer; i++) {
      let x = 0, y = 0;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * 3);
        y = Math.floor(Math.random() * level.size);
        attempts++;
        if (attempts > 100) {
          console.error('Could not find valid spawn position for player 1');
          break;
        }
      } while (!isValidPosition(x, y, newTroops) && attempts <= 100);

      const type = troopTypes[Math.floor(Math.random() * troopTypes.length)]!;
      const stats = TROOP_STATS[type];
      
      newTroops.push({
        id: `p1-${i}`,
        type,
        player: 1,
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        x,
        y,
        hasMoved: false,
        hasAttacked: false
      });
    }

    // Spawn troops for player 2 (right side)
    for (let i = 0; i < level.troopsPerPlayer; i++) {
      let x = 0, y = 0;
      let attempts = 0;
      do {
        x = level.size - 1 - Math.floor(Math.random() * 3);
        y = Math.floor(Math.random() * level.size);
        attempts++;
        if (attempts > 100) {
          console.error('Could not find valid spawn position for player 2');
          break;
        }
      } while (!isValidPosition(x, y, newTroops) && attempts <= 100);

      const type = troopTypes[Math.floor(Math.random() * troopTypes.length)]!;
      const stats = TROOP_STATS[type];
      
      newTroops.push({
        id: `p2-${i}`,
        type,
        player: 2,
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        x,
        y,
        hasMoved: false,
        hasAttacked: false
      });
    }

    setTroops(newTroops);
    setCurrentPlayer(1);
    setSelectedTroop(null);
    setGameOver(false);
    setWinner(null);
    setTurnCount(1);
    setShowLevelSelect(false);
  }, []);

  // Game logic functions
  const canMoveTo = useCallback((troop: Troop, targetX: number, targetY: number): boolean => {
    if (troop.hasMoved) return false;
    const distance = Math.abs(targetX - troop.x) + Math.abs(targetY - troop.y);
    if (distance > TROOP_STATS[troop.type].movement) return false;
    if (currentLevel.walls.some(([wx, wy]) => wx === targetX && wy === targetY)) return false;
    if (troops.some(t => t.x === targetX && t.y === targetY)) return false;
    return true;
  }, [currentLevel.walls, troops]);

  const canAttack = useCallback((attacker: Troop, target: Troop): boolean => {
    if (attacker.hasAttacked) return false;
    if (attacker.player === target.player) return false;
    const distance = Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y);
    return distance <= TROOP_STATS[attacker.type].range;
  }, []);

  const moveTroop = useCallback((troop: Troop, targetX: number, targetY: number) => {
    setTroops(prev => prev.map(t => 
      t.id === troop.id ? { ...t, x: targetX, y: targetY, hasMoved: true } : t
    ));
    setSelectedTroop(prev => prev ? { ...prev, x: targetX, y: targetY, hasMoved: true } : null);
  }, []);

  const attackTroop = useCallback((attacker: Troop, target: Troop) => {
    const damage = TROOP_STATS[attacker.type].attack;
    const newHp = Math.max(0, target.hp - damage);
    
    setTroops(prev => {
      const updated = prev.map(t => {
        if (t.id === attacker.id) return { ...t, hasAttacked: true };
        if (t.id === target.id) return { ...t, hp: newHp };
        return t;
      }).filter(t => t.hp > 0);
      
      const p1Alive = updated.some(t => t.player === 1);
      const p2Alive = updated.some(t => t.player === 2);
      
      if (!p1Alive) {
        setGameOver(true);
        setWinner(2);
      } else if (!p2Alive) {
        setGameOver(true);
        setWinner(1);
      }
      
      return updated;
    });
    
    setSelectedTroop(prev => prev ? { ...prev, hasAttacked: true } : null);
  }, []);

  const endTurn = useCallback(() => {
    setTroops(prev => prev.map(t => ({ ...t, hasMoved: false, hasAttacked: false })));
    setSelectedTroop(null);
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    setTurnCount(prev => currentPlayer === 2 ? prev + 1 : prev);
  }, [currentPlayer]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (gameOver) return;

    const clickedTroop = troops.find(t => t.x === x && t.y === y);
    
    if (clickedTroop) {
      if (clickedTroop.player === currentPlayer) {
        setSelectedTroop(clickedTroop);
      } else if (selectedTroop && canAttack(selectedTroop, clickedTroop)) {
        attackTroop(selectedTroop, clickedTroop);
      }
    } else if (selectedTroop && canMoveTo(selectedTroop, x, y)) {
      moveTroop(selectedTroop, x, y);
    }
  }, [gameOver, troops, currentPlayer, selectedTroop, canAttack, attackTroop, canMoveTo, moveTroop]);

  const getValidMoves = useCallback((troop: Troop): Array<[number, number]> => {
    if (troop.hasMoved) return [];
    const moves: Array<[number, number]> = [];
    const range = TROOP_STATS[troop.type].movement;
    
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= range) {
          const newX = troop.x + dx;
          const newY = troop.y + dy;
          if (newX >= 0 && newX < currentLevel.size && newY >= 0 && newY < currentLevel.size) {
            if (canMoveTo(troop, newX, newY)) {
              moves.push([newX, newY]);
            }
          }
        }
      }
    }
    return moves;
  }, [currentLevel.size, canMoveTo]);

  const getAttackTargets = useCallback((troop: Troop): Troop[] => {
    if (troop.hasAttacked) return [];
    return troops.filter(t => canAttack(troop, t));
  }, [troops, canAttack]);

  const validMoves = useMemo(() => 
    selectedTroop ? getValidMoves(selectedTroop) : [],
    [selectedTroop, getValidMoves]
  );

  const attackTargets = useMemo(() => 
    selectedTroop ? getAttackTargets(selectedTroop) : [],
    [selectedTroop, getAttackTargets]
  );

  // Render grid cells
  const renderGrid = useCallback(() => {
    const gridSize = currentLevel.size;
    const cells = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const troop = troops.find(t => t.x === x && t.y === y);
        const isWall = currentLevel.walls.some(([wx, wy]) => wx === x && wy === y);
        const isValidMove = validMoves.some(([mx, my]) => mx === x && my === y);
        const isAttackTarget = attackTargets.some(t => t.x === x && t.y === y);
        const isSelected = selectedTroop?.x === x && selectedTroop?.y === y;
        const isHovered = hoveredCell?.[0] === x && hoveredCell?.[1] === y;
        const cellSize = Math.min(500 / gridSize, 50);

        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => setHoveredCell([x, y])}
            onMouseLeave={() => setHoveredCell(null)}
            className={`
              relative cursor-pointer transition-all duration-150
              ${isWall ? 'bg-slate-800 cursor-not-allowed' : 'bg-slate-900/80 hover:bg-slate-800/80'}
              ${isValidMove ? 'bg-cyan-500/30 ring-1 ring-cyan-400 animate-pulse' : ''}
              ${isAttackTarget ? 'bg-red-500/30 ring-1 ring-red-400 animate-pulse' : ''}
              ${isSelected ? 'ring-2 ring-yellow-400' : ''}
              ${isHovered ? 'ring-1 ring-white/50' : ''}
            `}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`
            }}
          >
            {isWall && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xl font-bold">
                ▓
              </div>
            )}
            {troop && (
              <div className={`
                absolute inset-0.5 rounded flex flex-col items-center justify-center
                ${troop.player === 1 ? 'bg-linear-to-br from-cyan-600 to-blue-700 border border-cyan-400' : 'bg-linear-to-br from-pink-600 to-purple-700 border border-pink-400'}
                ${isSelected ? 'scale-110 shadow-lg' : 'scale-100'}
                transition-transform duration-200
              `}>
                <div className="text-lg md:text-xl">{TROOP_STATS[troop.type].icon}</div>
                {/* HP Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div
                    className={`h-full transition-all duration-300 ${troop.player === 1 ? 'bg-cyan-400' : 'bg-pink-400'}`}
                    style={{ width: `${(troop.hp / troop.maxHp) * 100}%` }}
                  ></div>
                </div>
                {troop.hasMoved && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
                {troop.hasAttacked && (
                  <div className="absolute top-0 left-0 w-2 h-2 bg-red-400 rounded-full"></div>
                )}
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  }, [currentLevel, troops, validMoves, attackTargets, selectedTroop, hoveredCell, handleCellClick]);

  // Level select screen
  if (showLevelSelect) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'grid-scroll 20s linear infinite'
          }}></div>
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl" style={{ fontFamily: 'Impact, sans-serif' }}>
              TACTICAL
            </h1>
            <h2 className="text-4xl md:text-6xl font-black bg-linear-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent" style={{ fontFamily: 'Impact, sans-serif' }}>
              SKIRMISH
            </h2>
            <p className="text-cyan-400 text-xl mt-4 font-bold tracking-widest">SELECT BATTLEFIELD</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => {
                  setCurrentLevel(level);
                  initializeGame(level);
                }}
                className="group relative bg-linear-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/50 p-6 rounded-lg hover:border-cyan-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
              >
                <div className="absolute top-2 right-2 text-4xl font-black text-cyan-500/30">
                  {level.id}
                </div>
                <h3 className="text-2xl font-black text-cyan-300 mb-2 group-hover:text-cyan-100 transition-colors">
                  {level.name.toUpperCase()}
                </h3>
                <div className="space-y-1 text-sm text-cyan-400/80">
                  <p>📏 {level.size}×{level.size} Grid</p>
                  <p>⚔️ {level.troopsPerPlayer} Units per side</p>
                  <p>🧱 {level.walls.length} Obstacles</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes grid-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
        `}</style>
      </div>
    );
  }

  // Main game screen
  const gridSize = currentLevel.size;
  const cellSize = Math.min(500 / gridSize, 50);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-cyan-950 to-slate-950 p-2 md:p-4 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: 'Impact, sans-serif' }}>
            {currentLevel.name.toUpperCase()}
          </h1>
          <div className="flex justify-center gap-6 mt-2 text-sm md:text-base">
            <div className="text-cyan-400">
              Turn: <span className="font-bold text-white">{turnCount}</span>
            </div>
            <div className={`font-bold ${currentPlayer === 1 ? 'text-cyan-400' : 'text-pink-400'}`}>
              {currentPlayer === 1 ? '🔷 PLAYER 1' : '🔶 PLAYER 2'}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          {/* Game Board */}
          <div className="shrink-0">
            <div 
              className="grid gap-0.5 bg-cyan-900/30 p-1 border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-500/20"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                width: 'fit-content'
              }}
            >
              {renderGrid()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Selected Troop Info */}
            {selectedTroop && (
              <div className="bg-linear-to-br from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{TROOP_STATS[selectedTroop.type].icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300">{TROOP_STATS[selectedTroop.type].name}</h3>
                    <p className="text-xs text-cyan-400">{TROOP_STATS[selectedTroop.type].description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-black/30 p-2 rounded">
                    <div className="text-xs text-cyan-400">HP</div>
                    <div className="font-bold text-white">{selectedTroop.hp}/{selectedTroop.maxHp}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <div className="text-xs text-cyan-400">Attack</div>
                    <div className="font-bold text-white">{TROOP_STATS[selectedTroop.type].attack}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <div className="text-xs text-cyan-400">Range</div>
                    <div className="font-bold text-white">{TROOP_STATS[selectedTroop.type].range}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded">
                    <div className="text-xs text-cyan-400">Move</div>
                    <div className="font-bold text-white">{TROOP_STATS[selectedTroop.type].movement}</div>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  {selectedTroop.hasMoved && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Moved
                    </div>
                  )}
                  {selectedTroop.hasAttacked && (
                    <div className="flex items-center gap-1 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Attacked
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Army Status */}
            <div className="bg-linear-to-br from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-cyan-300 mb-3">ARMY STATUS</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 text-sm">🔷 Player 1</span>
                  <span className="font-bold text-white">{troops.filter(t => t.player === 1).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-400 text-sm">🔶 Player 2</span>
                  <span className="font-bold text-white">{troops.filter(t => t.player === 2).length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={endTurn}
                className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                END TURN
              </button>
              <button
                onClick={() => setShowLevelSelect(true)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Change Level
              </button>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-linear-to-br from-cyan-900 to-blue-900 border-4 border-cyan-400 rounded-xl p-8 max-w-md mx-4 text-center">
              <h2 className="text-5xl font-black mb-4 bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                VICTORY!
              </h2>
              <p className="text-3xl font-bold mb-6 text-white">
                {winner === 1 ? '🔷 Player 1 Wins!' : '🔶 Player 2 Wins!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => initializeGame(currentLevel)}
                  className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Change Level
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}