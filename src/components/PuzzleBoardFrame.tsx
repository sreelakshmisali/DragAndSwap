import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { getTileBackgroundPosition } from '@/lib/tile-layout';
import type {
  DifficultyDimension,
  PuzzleImage,
  PuzzleTile,
} from '@/types/puzzle';

export interface PuzzleBoardFrameProps {
  dimension: DifficultyDimension;
  tiles: readonly PuzzleTile[];
  image: PuzzleImage;
  isSolved: boolean;
  selectedSlot: number | null;
  draggedSlot: number | null;
  hoveredSlot: number | null;
  dragOffset: { x: number; y: number } | null;
  onTilePointerDown: (
    slotIndex: number,
    event: PointerEvent<HTMLDivElement>
  ) => void;
  onTilePointerMove: (
    slotIndex: number,
    event: PointerEvent<HTMLDivElement>
  ) => void;
  onTilePointerUp: (
    slotIndex: number,
    event: PointerEvent<HTMLDivElement>
  ) => void;
  onTilePointerCancel: (
    slotIndex: number,
    event: PointerEvent<HTMLDivElement>
  ) => void;
  onTileKeyDown?: (
    slotIndex: number,
    event: KeyboardEvent<HTMLDivElement>
  ) => void;
}

export function PuzzleBoardFrame({
  dimension,
  tiles,
  image,
  isSolved,
  selectedSlot,
  draggedSlot,
  hoveredSlot,
  dragOffset,
  onTilePointerDown,
  onTilePointerMove,
  onTilePointerUp,
  onTilePointerCancel,
  onTileKeyDown,
}: PuzzleBoardFrameProps) {
  return (
    <section
      className={`puzzle-board-container ${isSolved ? 'is-solved' : ''}`}
      aria-label="Puzzle board"
      data-testid="puzzle-board"
    >
      <div
        className={`puzzle-board-frame ${isSolved ? 'frame-solved' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${dimension}, 1fr)`,
          gridTemplateRows: `repeat(${dimension}, 1fr)`,
        }}
        role="region"
        aria-roledescription="puzzle board"
        aria-label={`Puzzle grid ${dimension} by ${dimension}, ${tiles.length} tiles total`}
        data-testid="puzzle-board-grid"
      >
        {tiles.map((tile, currentSlot) => {
          const bgPos = getTileBackgroundPosition(tile.originIndex, dimension);
          const isSelected = selectedSlot === currentSlot;
          const isDragged = draggedSlot === currentSlot;
          const isHovered = hoveredSlot === currentSlot && !isDragged;
          const isCorrect = tile.originIndex === currentSlot;

          const tileStyle: CSSProperties = {
            backgroundImage: `url(${image.filename})`,
            backgroundSize: bgPos.backgroundSize,
            backgroundPosition: bgPos.backgroundPosition,
            backgroundRepeat: 'no-repeat',
            ...(isDragged && dragOffset
              ? {
                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)`,
                  zIndex: 20,
                }
              : {}),
          };

          const accessibleLabel = isSolved
            ? `Restored image tile piece ${tile.originIndex + 1}`
            : `Position ${currentSlot + 1} of ${tiles.length}, contains piece ${tile.originIndex + 1}${
                isCorrect ? ', in correct position' : ''
              }${isSelected ? ', currently selected' : ''}`;

          return (
            <div
              key={tile.id}
              className={`puzzle-tile ${isSelected ? 'is-selected' : ''} ${
                isDragged ? 'is-dragged' : ''
              } ${isHovered ? 'is-hover-target' : ''} ${
                isCorrect ? 'is-correct' : ''
              } ${isSolved ? 'is-solved-tile' : ''}`}
              style={tileStyle}
              data-slot-index={currentSlot}
              data-origin-index={tile.originIndex}
              data-testid={`tile-slot-${currentSlot}`}
              role="button"
              tabIndex={isSolved ? -1 : 0}
              aria-label={accessibleLabel}
              aria-pressed={isSelected}
              aria-disabled={isSolved}
              onPointerDown={(e) => onTilePointerDown(currentSlot, e)}
              onPointerMove={(e) => onTilePointerMove(currentSlot, e)}
              onPointerUp={(e) => onTilePointerUp(currentSlot, e)}
              onPointerCancel={(e) => onTilePointerCancel(currentSlot, e)}
              onKeyDown={(e) => onTileKeyDown?.(currentSlot, e)}
            >
              {/* Subtle slot indicator badge only when not solved */}
              {!isSolved && (
                <span className="tile-slot-badge" aria-hidden="true">
                  {tile.originIndex + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
