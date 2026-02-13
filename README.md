# Tactical Skirmish - Reddit Hackathon Game

A competitive 1v1 turn-based tactical warfare game built with React TypeScript for the Reddit Devvit platform.

## 🎮 Game Features

- **1v1 Turn-Based Combat**: Strategic grid-based warfare between two players
- **4 Unique Unit Types**:
  - ⚔️ **Infantry**: Balanced fighter (HP: 100, Attack: 25, Range: 1, Movement: 3)
  - 🛡️ **Tank**: Heavy armor, slow movement (HP: 200, Attack: 40, Range: 1, Movement: 2)
  - ⚡ **Scout**: Fast & fragile (HP: 60, Attack: 15, Range: 1, Movement: 5)
  - 🎯 **Artillery**: Long-range sniper (HP: 50, Attack: 50, Range: 3, Movement: 2)

- **4 Unique Battlefields**:
  1. **Open Field** - 10x10 grid with central obstacles
  2. **The Corridor** - 12x12 with narrow passage gameplay
  3. **Fortress Siege** - 14x14 with fortified positions
  4. **Labyrinth** - 14x14 with complex maze-like walls

- **Dynamic Gameplay**:
  - Random troop spawning at game start
  - HP tracking and damage system
  - Movement and attack indicators
  - Status tracking (moved/attacked)
  - Victory conditions

## 🎨 Design

Cyberpunk tactical aesthetic featuring:
- Neon cyan/blue/purple color scheme
- Animated grid backgrounds
- Glowing UI elements
- Tactical command center interface
- Responsive design for mobile and desktop

## 📁 File Structure

```
/client/
  game.tsx         - Main game component
  splash.tsx       - Splash screen
  index.css        - Tailwind imports
  game.html        - Game page HTML
  splash.html      - Splash page HTML

/shared/
  types.ts         - TypeScript interfaces
  constants.ts     - Game configuration (troops, levels)
```

## 🎯 How to Play

### Game Start
1. Select a battlefield from the level select screen
2. Troops spawn randomly on opposite sides of the map
3. Player 1 (cyan) starts first

### On Your Turn
1. **Select a Unit**: Click on one of your units (cyan for P1, pink for P2)
2. **Move**: Click on any highlighted cyan cell within movement range
3. **Attack**: Click on enemy units within your attack range (highlighted in red)
4. **End Turn**: Click "END TURN" when you're done

### Unit Actions
- Each unit can **move once** and **attack once** per turn
- Yellow dot = unit has moved
- Red dot = unit has attacked
- Units can move and attack in any order

### Victory
Eliminate all enemy troops to win!

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+
- Reddit Devvit CLI

### Installation

1. Clone or download this game
2. Replace the files in your Devvit app:
   - `src/client/game.tsx`
   - `src/client/splash.tsx`
   - `src/client/game.html`
   - `src/client/splash.html`

3. Create the shared directory:
   - `src/shared/types.ts`
   - `src/shared/constants.ts`

4. Install dependencies (if needed):
   ```bash
   npm install
   ```

5. Run locally:
   ```bash
   devvit playtest
   ```

6. Upload to Reddit:
   ```bash
   devvit upload
   ```

## 🎮 Controls

- **Mouse Click**: Select units, move, attack, and navigate menus
- **END TURN Button**: Pass turn to opponent
- **Change Level Button**: Return to level select

## 🎨 Customization

### Modify Troop Stats
Edit `src/shared/constants.ts` - adjust HP, attack, range, movement for each troop type

### Add New Levels
Add new level configurations to the `LEVELS` array in `src/shared/constants.ts`:

```typescript
{
  id: 5,
  name: 'Your Level Name',
  size: 12,              // Grid size (12x12)
  walls: [[x, y], ...],  // Wall positions
  troopsPerPlayer: 6     // Units per side
}
```

### Change Colors
Modify Tailwind classes in `game.tsx`:
- Player 1: `cyan` colors
- Player 2: `pink` colors
- Backgrounds: `slate` colors

## 🏆 Strategy Tips

1. **Infantry**: Your versatile units - good for holding positions
2. **Tanks**: Use as front-line shields to absorb damage
3. **Scouts**: Perfect for flanking and hit-and-run tactics
4. **Artillery**: Position behind your lines for devastating ranged attacks

5. **Control the Center**: Central positions often provide tactical advantages
6. **Use Walls**: Position units behind walls for protection
7. **Focus Fire**: Concentrate attacks to eliminate threats quickly
8. **Positioning Matters**: Range 3 artillery can attack from safety!

## 🐛 Known Issues

- This is a local/hot-seat multiplayer game (both players use same device)
- No AI opponent (requires another human player)

## 🚀 Future Enhancements

Potential features for future versions:
- AI opponent with difficulty levels
- Backend multiplayer via Redis
- Persistent leaderboards
- More unit types (healer, engineer, etc.)
- Special abilities and cooldowns
- Fog of war mechanics
- Campaign mode with progressive difficulty

## 📜 License

Built for Reddit Hackathon - feel free to modify and extend!

## 🤝 Credits

Created with:
- React + TypeScript
- Tailwind CSS
- Reddit Devvit Platform