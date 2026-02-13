// utils.ts or inside the component
// Define the Troop type if not imported from elsewhere
type Troop = {
  x: number;
  y: number;
  hp: number;
};

const getReachableCells = (
  start: { x: number; y: number },
  maxMove: number,
  gridSize: number,
  walls: Array<[number, number]>,
  troops: Troop[]
) => {
  const moves: { x: number; y: number; dist: number }[] = [];
  const visited = new Set<string>();
  const queue: { x: number; y: number; dist: number }[] = [
    { x: start.x, y: start.y, dist: 0 }
  ];
  visited.add(`${start.x},${start.y}`);

  const isBlocked = (tx: number, ty: number) => {
    return walls.some(([wx, wy]) => wx === tx && wy === ty) ||
           troops.some(t => t.x === tx && t.y === ty && t.hp > 0); // Living troops block path
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Directions: Up, Down, Left, Right
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y }
    ];

    for (const n of neighbors) {
      const key = `${n.x},${n.y}`;
      if (
        n.x >= 0 && n.x < gridSize &&
        n.y >= 0 && n.y < gridSize &&
        !visited.has(key)
      ) {
        // If it's not blocked, or it IS the final step (we can't walk THRU units, but we stop AT them)
        // Actually for movement, we usually cannot step ON a unit.
        if (!isBlocked(n.x, n.y)) {
          const newDist = current.dist + 1;
          if (newDist <= maxMove) {
            visited.add(key);
            queue.push({ ...n, dist: newDist });
            moves.push({ ...n, dist: newDist });
          }
        }
      }
    }
  }
  return moves;
};