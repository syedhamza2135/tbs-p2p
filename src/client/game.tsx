import './index.css';
import { StrictMode, useState, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import type { Troop, Level, Player } from '../shared/types';
import { TROOP_STATS, LEVELS } from '../shared/constants';

// --- HELPER: PATHFINDING (BFS) ---
// Gets all valid coordinates a unit can walk to, respecting walls and other units
const getValidMovesBFS = (
  unit: Troop, 
  allTroops: Troop[], 
  walls: Level['walls'], 
  gridSize: number
) => {
  if (unit.hasMoved) return [];
  
  const moveRange = TROOP_STATS[unit.type].movement;
  const validMoves: Array<[number, number]> = [];
  const visited = new Set<string>();
  const queue: Array<{x: number, y: number, dist: number}> = [{ x: unit.x, y: unit.y, dist: 0 }];
  
  visited.add(`${unit.x},${unit.y}`);

  // Helper to check if a cell is occupied
  const isOccupied = (tx: number, ty: number) => {
    // Check walls
    if (walls.some(([wx, wy]) => wx === tx && wy === ty)) return true;
    // Check other troops
    if (allTroops.some(t => t.x === tx && t.y === ty && t.hp > 0)) return true;
    return false;
  };

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.dist >= moveRange) continue;

    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dx, dy] of directions) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 && nx < gridSize && 
        ny >= 0 && ny < gridSize && 
        !visited.has(key)
      ) {
        visited.add(key);
        // We can only move to a tile if it is NOT occupied
        if (!isOccupied(nx, ny)) {
          validMoves.push([nx, ny]);
          queue.push({ x: nx, y: ny, dist: curr.dist + 1 });
        }
      }
    }
  }
  return validMoves;
};

export const App = () => {
  // --- STATE ---
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]!);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [turnCount, setTurnCount] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  
  // Interaction State
  const [selectedTroopId, setSelectedTroopId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  // Derived State helpers
  const selectedTroop = useMemo(() => 
    troops.find(t => t.id === selectedTroopId) || null
  , [troops, selectedTroopId]);

  // --- GAME LOGIC ENGINE ---

  const initializeGame = useCallback((level: Level) => {
    const newTroops: Troop[] = [];
    const troopTypes = Object.keys(TROOP_STATS) as Array<keyof typeof TROOP_STATS>;
    
    const spawnUnit = (player: Player, xZoneStart: number, xZoneEnd: number) => {
      // Deterministic spawn to prevent infinite loops
      const availableSpots: [number, number][] = [];
      for(let x = xZoneStart; x <= xZoneEnd; x++) {
        for(let y = 0; y < level.size; y++) {
          // Check Wall
          if(!level.walls.some(([wx, wy]) => wx === x && wy === y)) {
            availableSpots.push([x, y]);
          }
        }
      }

      // Shuffle spots
      availableSpots.sort(() => Math.random() - 0.5);

      for (let i = 0; i < level.troopsPerPlayer; i++) {
        if(availableSpots.length === 0) break; 
        const [spawnX, spawnY] = availableSpots.pop()!;
        
        const type = troopTypes[Math.floor(Math.random() * troopTypes.length)]!;
        newTroops.push({
          id: `p${player}-${i}`,
          type,
          player,
          hp: TROOP_STATS[type].maxHp,
          maxHp: TROOP_STATS[type].maxHp,
          x: spawnX,
          y: spawnY,
          hasMoved: false,
          hasAttacked: false
        });
      }
    };

    spawnUnit(1, 0, 2); // Player 1 Left side
    spawnUnit(2, level.size - 3, level.size - 1); // Player 2 Right side

    setTroops(newTroops);
    setCurrentPlayer(1);
    setSelectedTroopId(null);
    setWinner(null);
    setTurnCount(1);
    setShowLevelSelect(false);
  }, []);

  // Calculate valid moves for the CURRENTLY selected troop
  const validMoves = useMemo(() => {
    if (!selectedTroop) return [];
    return getValidMovesBFS(selectedTroop, troops, currentLevel.walls, currentLevel.size);
  }, [selectedTroop, troops, currentLevel]);

  // Calculate valid attack targets
  const validTargets = useMemo(() => {
    if (!selectedTroop || selectedTroop.hasAttacked) return [];
    
    return troops.filter(target => {
      if (target.player === selectedTroop.player) return false;
      const dist = Math.abs(target.x - selectedTroop.x) + Math.abs(target.y - selectedTroop.y);
      return dist <= TROOP_STATS[selectedTroop.type].range;
    });
  }, [selectedTroop, troops]);


  // --- ACTIONS ---

  const handleCellClick = (x: number, y: number) => {
    if (winner) return;

    const clickedTroop = troops.find(t => t.x === x && t.y === y);

    // 1. Select Own Troop
    if (clickedTroop?.player === currentPlayer) {
      setSelectedTroopId(clickedTroop.id);
      return;
    }

    // 2. Move Logic
    if (selectedTroop && !clickedTroop) {
      const isMoveValid = validMoves.some(([mx, my]) => mx === x && my === y);
      if (isMoveValid) {
        setTroops(prev => prev.map(t => 
          t.id === selectedTroop.id ? { ...t, x, y, hasMoved: true } : t
        ));
        // Keep selection but update internal state reference via effect/render
        return;
      }
    }

    // 3. Attack Logic
    if (selectedTroop && clickedTroop && clickedTroop.player !== currentPlayer) {
      const isTargetValid = validTargets.some(t => t.id === clickedTroop.id);
      
      if (isTargetValid) {
        const damage = TROOP_STATS[selectedTroop.type].attack;
        
        setTroops(prev => {
          const nextTroops = prev.map(t => {
            if (t.id === selectedTroop.id) return { ...t, hasAttacked: true };
            if (t.id === clickedTroop.id) return { ...t, hp: t.hp - damage };
            return t;
          }).filter(t => t.hp > 0);

          // Check Win Condition immediately after update
          const p1Exists = nextTroops.some(t => t.player === 1);
          const p2Exists = nextTroops.some(t => t.player === 2);
          if (!p1Exists) setWinner(2);
          if (!p2Exists) setWinner(1);

          return nextTroops;
        });
        setSelectedTroopId(null); // Deselect after attack
      }
    }
  };

  const endTurn = () => {
    setTroops(prev => prev.map(t => ({ ...t, hasMoved: false, hasAttacked: false })));
    setSelectedTroopId(null);
    setCurrentPlayer(curr => curr === 1 ? 2 : 1);
    if (currentPlayer === 2) setTurnCount(c => c + 1);
  };

  // --- RENDER HELPERS ---
  
  // (Your existing render logic was actually pretty good, just simplified slightly)
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < currentLevel.size; y++) {
      for (let x = 0; x < currentLevel.size; x++) {
        const troop = troops.find(t => t.x === x && t.y === y);
        const isWall = currentLevel.walls.some(([wx, wy]) => wx === x && wy === y);
        
        // Visual States
        const isValidMove = validMoves.some(([mx, my]) => mx === x && my === y);
        const isTarget = validTargets.some(t => t.x === x && t.y === y);
        const isSelected = selectedTroop?.x === x && selectedTroop?.y === y;
        const isHovered = hoveredCell?.[0] === x && hoveredCell?.[1] === y;

        // Styling logic kept from your code...
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
                ${isTarget ? 'bg-red-500/30 ring-1 ring-red-400 animate-pulse' : ''}
                ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                ${isHovered ? 'ring-1 ring-white/50' : ''}
            `}
            style={{ width: '50px', height: '50px' }} // Fixed size for simplicity
            >
            {isWall && <div className="absolute inset-0 flex items-center justify-center text-slate-600">▓</div>}
            
            {troop && (
                <div className={`
                    absolute inset-1 rounded flex items-center justify-center text-xl shadow-lg transition-transform
                    ${troop.player === 1 ? 'bg-cyan-700 border border-cyan-400' : 'bg-purple-700 border border-purple-400'}
                    ${isSelected ? 'scale-110 z-10' : 'scale-100'}
                    ${troop.hasMoved && !troop.hasAttacked ? 'grayscale-50' : ''} 
                    ${troop.hasAttacked ? 'grayscale opacity-70' : ''} 
                `}>
                {TROOP_STATS[troop.type].icon}
                {/* Simple HP Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black">
                    <div 
                        className={`h-full ${troop.player === 1 ? 'bg-cyan-300' : 'bg-purple-300'}`} 
                        style={{width: `${(troop.hp / troop.maxHp) * 100}%`}} 
                    />
                </div>
                </div>
            )}
            </div>
        );
      }
    }
    return cells;
  };

  // ... (Keep your existing return/JSX structure for the layout, it was good) ...
  // Only changed the "Game Over" check to use the 'winner' state variable directly.

  if (showLevelSelect) {
      // (Your existing Level Select JSX)
      return (
         <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
                {LEVELS.map(l => (
                    <button key={l.id} onClick={() => { setCurrentLevel(l); initializeGame(l); }} className="p-4 bg-slate-800 text-white hover:bg-slate-700 rounded">
                        {l.name}
                    </button>
                ))}
            </div>
         </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{currentLevel.name}</h1>
                <div className="bg-slate-800 px-4 py-2 rounded">
                    Turn: {turnCount} | <span className={currentPlayer===1 ? 'text-cyan-400' : 'text-purple-400'}>Player {currentPlayer}</span>
                </div>
            </div>

            <div className="flex gap-8 justify-center">
                <div className="grid gap-1" style={{ 
                    gridTemplateColumns: `repeat(${currentLevel.size}, 50px)` 
                }}>
                    {renderGrid()}
                </div>

                <div className="w-64 space-y-4">
                    {/* Only show "End Turn" if game is active */}
                    {!winner && (
                        <button onClick={endTurn} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold">
                            End Turn
                        </button>
                    )}
                    
                    {winner && (
                        <div className="p-4 bg-green-900/50 border border-green-500 rounded text-center">
                            <h2 className="text-2xl font-bold text-green-400">GAME OVER</h2>
                            <p className="mb-4">Player {winner} Wins!</p>
                            <button onClick={() => setShowLevelSelect(true)} className="px-4 py-2 bg-slate-700 rounded">
                                Back to Menu
                            </button>
                        </div>
                    )}

                    {selectedTroop && (
                        <div className="p-4 bg-slate-800 rounded border border-slate-700">
                             <h3 className="font-bold text-lg mb-2">{TROOP_STATS[selectedTroop.type].name}</h3>
                             <div className="text-sm space-y-1 text-slate-300">
                                <p>HP: {selectedTroop.hp}/{selectedTroop.maxHp}</p>
                                <p>Attack: {TROOP_STATS[selectedTroop.type].attack}</p>
                                <p>Move: {TROOP_STATS[selectedTroop.type].movement}</p>
                             </div>
                        </div>
                    )}
                </div>
            </div>
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