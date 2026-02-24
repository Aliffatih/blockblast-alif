import React from 'react';
import { motion } from 'motion/react';
import { Shape } from '../constants';

interface BlockPieceProps {
  shape: Shape;
  color: string;
  scale?: number;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const BlockPiece: React.FC<BlockPieceProps> = ({ 
  shape, 
  color, 
  scale = 1, 
  isDragging = false,
  onDragStart 
}) => {
  return (
    <motion.div
      className="relative cursor-grab active:cursor-grabbing touch-none"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
        gap: '2px',
        width: 'fit-content',
        scale: scale,
        opacity: isDragging ? 0.6 : 1,
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      whileHover={{ scale: scale * 1.05 }}
      whileTap={{ scale: scale * 0.95 }}
    >
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: cell ? color : 'transparent',
              border: cell ? '1px solid rgba(255,255,255,0.3)' : 'none',
            }}
          >
            {cell && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                <div className="absolute inset-0 border-t border-l border-white/40 rounded-lg" />
                <div className="absolute inset-0 border-b border-r border-black/20 rounded-lg" />
              </>
            )}
          </div>
        ))
      )}
    </motion.div>
  );
};
