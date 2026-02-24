/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Volume2, VolumeX, Sparkles, LayoutGrid, Pause, X, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GRID_SIZE, 
  SHAPES, 
  COLORS, 
  AUDIO_ASSETS, 
  IMAGE_ASSETS,
  Shape,
  BlockType 
} from './constants';
import { BlockPiece } from './components/BlockPiece';

// --- Types ---
type Grid = (string | null)[][];
type GameState = 'START_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export default function App() {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>('START_MENU');
  const [grid, setGrid] = useState<Grid>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('block-blast-highscore');
    return saved ? parseInt(saved) : 0;
  });
  const [availableBlocks, setAvailableBlocks] = useState<BlockType[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Dragging state
  const [draggingBlock, setDraggingBlock] = useState<{
    block: BlockType;
    index: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [previewPos, setPreviewPos] = useState<{ x: number, y: number, isValid: boolean } | null>(null);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameOverMusicRef = useRef<HTMLAudioElement | null>(null);
  const cupuSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Helpers ---
  const generateRandomBlock = useCallback((): BlockType => {
    const shapeKeys = Object.keys(SHAPES);
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      shape: SHAPES[randomKey],
      color: randomColor,
    };
  }, []);

  const refreshBlocks = useCallback(() => {
    setAvailableBlocks([
      generateRandomBlock(),
      generateRandomBlock(),
      generateRandomBlock(),
    ]);
  }, [generateRandomBlock]);

  const checkGameOver = useCallback((currentGrid: Grid, currentBlocks: BlockType[]) => {
    if (currentBlocks.length === 0) return false;

    for (const block of currentBlocks) {
      const { shape } = block;
      for (let y = 0; y <= GRID_SIZE - shape.length; y++) {
        for (let x = 0; x <= GRID_SIZE - shape[0].length; x++) {
          let canPlace = true;
          for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[0].length; sx++) {
              if (shape[sy][sx] && currentGrid[y + sy][x + sx] !== null) {
                canPlace = false;
                break;
              }
            }
            if (!canPlace) break;
          }
          if (canPlace) return false;
        }
      }
    }
    return true;
  }, []);

  // --- Initialization ---
  useEffect(() => {
    if (gameState === 'PLAYING' && availableBlocks.length === 0) {
      refreshBlocks();
    }
  }, [gameState, availableBlocks.length, refreshBlocks]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('block-blast-highscore', score.toString());
    }
  }, [score, highScore]);

  // Audio handling
  useEffect(() => {
    if (AUDIO_ASSETS.BACKGROUND_MUSIC) {
      bgMusicRef.current = new Audio(AUDIO_ASSETS.BACKGROUND_MUSIC);
      bgMusicRef.current.loop = true;
    }
    if (AUDIO_ASSETS.GAME_OVER_MUSIC) {
      gameOverMusicRef.current = new Audio(AUDIO_ASSETS.GAME_OVER_MUSIC);
    }
    if (AUDIO_ASSETS.CUPU_SOUND) {
      cupuSoundRef.current = new Audio(AUDIO_ASSETS.CUPU_SOUND);
    }

    return () => {
      bgMusicRef.current?.pause();
      gameOverMusicRef.current?.pause();
      cupuSoundRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
      if (gameState === 'PLAYING' && !isMuted) {
        bgMusicRef.current.play().catch(() => {});
      } else {
        bgMusicRef.current.pause();
      }
    }
  }, [gameState, isMuted]);

  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      if (!isMuted) {
        if (gameOverMusicRef.current) gameOverMusicRef.current.play().catch(() => {});
        if (cupuSoundRef.current) cupuSoundRef.current.play().catch(() => {});
      }
    } else {
      gameOverMusicRef.current?.pause();
      if (gameOverMusicRef.current) gameOverMusicRef.current.currentTime = 0;
      cupuSoundRef.current?.pause();
      if (cupuSoundRef.current) cupuSoundRef.current.currentTime = 0;
    }
  }, [gameState, isMuted]);

  // --- Game Actions ---
  const startGame = () => {
    if (!isMuted && AUDIO_ASSETS.START_GAME) {
      new Audio(AUDIO_ASSETS.START_GAME).play().catch(() => {});
    }
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setScore(0);
    setCombo(0);
    setGameState('PLAYING');
    refreshBlocks();
  };

  const resetGame = () => {
    setGameState('START_MENU');
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, block: BlockType, index: number) => {
    if (gameState !== 'PLAYING') return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDraggingBlock({
      block,
      index,
      currentX: clientX,
      currentY: clientY,
    });
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingBlock) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDraggingBlock(prev => prev ? ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
    }) : null);

    // Calculate preview position
    const board = document.getElementById('game-board');
    if (board) {
      const rect = board.getBoundingClientRect();
      const cellSize = rect.width / GRID_SIZE;
      
      const { shape } = draggingBlock.block;
      
      // Visual offset matches the CSS transform: translate(-50%, -150%)
      const visualTop = clientY - (shape.length * cellSize * 1.5);
      const visualLeft = clientX - (shape[0].length * cellSize * 0.5);
      
      const x = Math.round((visualLeft - rect.left) / cellSize);
      const y = Math.round((visualTop - rect.top) / cellSize);
      
      let canPlace = true;
      if (x < 0 || y < 0 || x + shape[0].length > GRID_SIZE || y + shape.length > GRID_SIZE) {
        canPlace = false;
      } else {
        for (let sy = 0; sy < shape.length; sy++) {
          for (let sx = 0; sx < shape[0].length; sx++) {
            if (shape[sy][sx] && grid[y + sy][x + sx] !== null) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
      }

      // Always show preview if it's within board bounds (even if invalid)
      if (x >= -shape[0].length && x < GRID_SIZE && y >= -shape.length && y < GRID_SIZE) {
        setPreviewPos({ x, y, isValid: canPlace });
      } else {
        setPreviewPos(null);
      }
    }
  }, [draggingBlock, grid]);

  const handleDragEnd = useCallback(() => {
    if (!draggingBlock) return;

    if (previewPos && previewPos.isValid) {
      const { x, y } = previewPos;
      const { shape, color } = draggingBlock.block;
      const newGrid = grid.map(row => [...row]);
      let blocksPlaced = 0;

      for (let sy = 0; sy < shape.length; sy++) {
        for (let sx = 0; sx < shape[0].length; sx++) {
          if (shape[sy][sx]) {
            newGrid[y + sy][x + sx] = color;
            blocksPlaced++;
          }
        }
      }

      if (!isMuted && AUDIO_ASSETS.PLACE_BLOCK) {
        new Audio(AUDIO_ASSETS.PLACE_BLOCK).play().catch(() => {});
      }

      // Check for completed lines
      const rowsToClear: number[] = [];
      const colsToClear: number[] = [];

      for (let i = 0; i < GRID_SIZE; i++) {
        if (newGrid[i].every(cell => cell !== null)) rowsToClear.push(i);
        if (newGrid.every(row => row[i] !== null)) colsToClear.push(i);
      }

      const linesCleared = rowsToClear.length + colsToClear.length;
      
      let comboBonus = 0;
      if (linesCleared > 0) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        comboBonus = newCombo * 50;
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1000);

        rowsToClear.forEach(ri => {
          for (let i = 0; i < GRID_SIZE; i++) newGrid[ri][i] = null;
        });
        colsToClear.forEach(ci => {
          for (let i = 0; i < GRID_SIZE; i++) newGrid[i][ci] = null;
        });

        if (!isMuted) new Audio(AUDIO_ASSETS.CLEAR_LINE).play().catch(() => {});
        
        // Dramatic Explosion Effect
        const count = 150 * linesCleared;
        const defaults = {
          origin: { y: 0.7 },
          colors: [color, '#ffffff', '#ffd700', '#ff00ff', '#00ffff']
        };

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } else {
        setCombo(0);
      }

      const newScore = score + blocksPlaced + (linesCleared * 100 * linesCleared) + comboBonus;
      setScore(newScore);
      setGrid(newGrid);

      const nextBlocks = availableBlocks.filter((_, i) => i !== draggingBlock.index);
      if (nextBlocks.length === 0) {
        const fresh = [generateRandomBlock(), generateRandomBlock(), generateRandomBlock()];
        setAvailableBlocks(fresh);
        if (checkGameOver(newGrid, fresh)) setGameState('GAME_OVER');
      } else {
        setAvailableBlocks(nextBlocks);
        if (checkGameOver(newGrid, nextBlocks)) setGameState('GAME_OVER');
      }
    }

    setDraggingBlock(null);
    setPreviewPos(null);
  }, [draggingBlock, previewPos, grid, availableBlocks, score, isMuted, generateRandomBlock, checkGameOver]);

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <div className="game-container select-none">
      <div className="bg-mesh" />
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ 
            y: [0, -100, 0],
            rotate: [0, 90, 180],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"
        />
        <motion.div 
          animate={{ 
            y: [0, 150, 0],
            rotate: [0, -120, -240],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-10 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full"
        />
      </div>
      <AnimatePresence>
        {gameState === 'START_MENU' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-mesh" />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md w-full"
            >
              <div className="mb-12 relative inline-block">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-full blur-3xl"
                />
                <h1 className="text-7xl font-display font-black text-white tracking-tighter italic relative">
                  BLOCK<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">BLAST</span>
                </h1>
                <div className="flex justify-center gap-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm bg-white/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="menu-button menu-button-primary"
                >
                  <Play size={24} fill="currentColor" />
                  MAIN SEKARANG
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.close()}
                  className="menu-button menu-button-secondary"
                >
                  <X size={24} />
                  EXIT GAME
                </motion.button>
                
                <div className="flex gap-4">
                  <div className="flex-1 p-4 glass-panel flex flex-col items-center justify-center">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">High Score</span>
                    <span className="text-2xl font-display font-bold text-white">{highScore}</span>
                  </div>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-4 glass-panel text-zinc-400 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playing UI */}
      {gameState !== 'START_MENU' && (
        <>
          {/* Header */}
          <div className="w-full max-w-md flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Score</span>
              <span className="text-4xl font-display font-bold text-white tabular-nums">{score}</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setGameState('PAUSED')}
                className="p-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-95 shadow-lg"
                title="Pause Game"
              >
                <Pause size={20} fill="currentColor" />
              </button>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  <Trophy size={10} className="text-yellow-500" />
                  Best
                </div>
                <span className="text-2xl font-display font-bold text-zinc-400 tabular-nums">{highScore}</span>
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="relative">
            <div 
              id="game-board"
              className="board relative z-10"
            >
              {grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPreview = previewPos && 
                    draggingBlock && 
                    y >= previewPos.y && 
                    y < previewPos.y + draggingBlock.block.shape.length &&
                    x >= previewPos.x && 
                    x < previewPos.x + draggingBlock.block.shape[0].length &&
                    draggingBlock.block.shape[y - previewPos.y][x - previewPos.x];

                  const previewClass = isPreview 
                    ? (previewPos.isValid ? 'preview' : 'preview-invalid') 
                    : '';

                  return (
                    <div 
                      key={`${y}-${x}`} 
                      className={`grid-cell ${cell ? '' : 'active'} ${previewClass}`}
                      style={cell ? { 
                        backgroundColor: cell, 
                        borderColor: 'rgba(255,255,255,0.2)',
                        boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)'
                      } : {}}
                    />
                  );
                })
              )}
            </div>

            <AnimatePresence>
              {showCombo && combo > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -100, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-display font-black text-yellow-400 italic tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                      COMBO x{combo}
                    </span>
                    <span className="text-white font-bold text-sm">+{combo * 50} BONUS</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Available Blocks */}
          <div className="flex justify-center gap-4 mt-4 h-32 items-center">
            {availableBlocks.map((block, i) => (
              <div key={block.id} className="block-slot">
                <BlockPiece 
                  shape={block.shape} 
                  color={block.color} 
                  scale={0.5}
                  onDragStart={(e) => handleDragStart(e, block, i)}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="nav-button"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              onClick={resetGame}
              className="nav-button"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </>
      )}

      {/* Pause Menu */}
      <AnimatePresence>
        {gameState === 'PAUSED' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xs w-full space-y-4"
            >
              <h2 className="text-5xl font-display font-black text-white mb-8 tracking-tighter italic">PAUSED</h2>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameState('PLAYING')}
                className="menu-button menu-button-primary"
              >
                <Play size={20} fill="currentColor" />
                RESUME
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="menu-button menu-button-danger"
              >
                <LogOut size={20} />
                QUIT GAME
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      {draggingBlock && (
        <div 
          className="fixed pointer-events-none z-50"
          style={{
            left: draggingBlock.currentX,
            top: draggingBlock.currentY,
            transform: 'translate(-50%, -150%)',
          }}
        >
          <BlockPiece 
            shape={draggingBlock.block.shape} 
            color={draggingBlock.block.color} 
            isDragging
          />
        </div>
      )}

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full"
            >
              {IMAGE_ASSETS.GAME_OVER_PHOTO && (
                <div className="mb-8 relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-indigo-600 to-emerald-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  <img 
                    src={IMAGE_ASSETS.GAME_OVER_PHOTO} 
                    alt="Game Over" 
                    className="relative w-full aspect-square object-cover rounded-3xl border border-white/20 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-zinc-900 p-3 rounded-2xl border border-white/10 shadow-xl">
                    <Trophy className="text-yellow-500" size={24} />
                  </div>
                </div>
              )}
              
              <h2 className="text-6xl font-display font-black text-white mb-2 tracking-tighter italic">
                GAME<br/>OVER
              </h2>
              <div className="glass-panel p-6 mb-8">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Final Score</p>
                <p className="text-4xl font-display font-bold text-white">{score}</p>
              </div>
              
              <button 
                onClick={startGame}
                className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-xl text-lg"
              >
                <Play size={24} fill="currentColor" />
                TRY AGAIN
              </button>
              
              <button 
                onClick={resetGame}
                className="mt-4 text-zinc-500 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase"
              >
                Back to Menu
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
