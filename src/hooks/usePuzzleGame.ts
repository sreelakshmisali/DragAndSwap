import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_IMAGE } from '@/lib/images';
import {
  changeDifficulty,
  createInitialPuzzle,
  restartPuzzle,
  swapTiles,
  undoSwap,
} from '@/lib/puzzle-engine';
import {
  DEFAULT_DIFFICULTY,
  type DifficultyDimension,
  type PuzzleImage,
  type PuzzleState,
} from '@/types/puzzle';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function findTargetSlotFromElements(
  elements: ReadonlyArray<{
    closest: (selector: string) => { dataset?: { slotIndex?: string } } | null;
  }>,
  draggedSlot: number | null,
  totalTiles: number
): number | null {
  for (const el of elements) {
    const tileEl = el.closest('[data-slot-index]');
    if (tileEl?.dataset?.slotIndex !== undefined) {
      const slot = Number(tileEl.dataset.slotIndex);
      if (
        !Number.isNaN(slot) &&
        slot !== draggedSlot &&
        slot >= 0 &&
        slot < totalTiles
      ) {
        return slot;
      }
    }
  }
  return null;
}

export type PendingConfirmation =
  { type: 'restart' } | { type: 'difficulty'; dimension: DifficultyDimension };

export interface UsePuzzleGameOptions {
  initialDimension?: DifficultyDimension;
  initialImage?: PuzzleImage;
  randomFn?: () => number;
}

export function usePuzzleGame({
  initialDimension = DEFAULT_DIFFICULTY,
  initialImage = DEFAULT_IMAGE,
  randomFn,
}: UsePuzzleGameOptions = {}) {
  // Puzzle state managed strictly via pure engine
  const [puzzleState, setPuzzleState] = useState<PuzzleState>(() =>
    createInitialPuzzle(initialDimension, randomFn)
  );

  const [currentImage, setCurrentImage] = useState<PuzzleImage>(initialImage);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasMovedSignificantly = useRef(false);

  // Starts timer on first player interaction
  const ensureTimerStarted = useCallback(() => {
    if (!isTimerRunning && !puzzleState.isSolved) {
      setIsTimerRunning(true);
    }
  }, [isTimerRunning, puzzleState.isSolved]);

  // Timer effect: increments every second when active and window is visible
  useEffect(() => {
    if (!isTimerRunning || puzzleState.isSolved) {
      return;
    }

    const intervalId = window.setInterval(() => {
      // Pause timer when document is in background
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerRunning, puzzleState.isSolved]);

  // Handle Free Pairwise Swap
  const executeSwap = useCallback(
    (slotA: number, slotB: number) => {
      setPuzzleState((prev) => {
        const next = swapTiles(prev, slotA, slotB);
        if (next.isSolved) {
          setIsTimerRunning(false);
          announce(
            `Picture Restored! Puzzle completed successfully in ${next.moves} moves.`
          );
        } else {
          announce(
            `Swapped tile at position ${slotA + 1} with tile at position ${slotB + 1}. Total moves: ${next.moves}.`
          );
        }
        return next;
      });
      setSelectedSlot(null);
      setDraggedSlot(null);
      setHoveredSlot(null);
      setDragOffset(null);
    },
    [announce]
  );

  // Undo previous swap
  const handleUndo = useCallback(() => {
    if (!puzzleState.canUndo || puzzleState.isSolved) return;
    setPuzzleState((prev) => {
      const next = undoSwap(prev);
      announce(`Previous move undone. Current moves: ${next.moves}.`);
      return next;
    });
    setSelectedSlot(null);
  }, [announce, puzzleState.canUndo, puzzleState.isSolved]);

  // Core restart implementation
  const performRestart = useCallback(() => {
    setPuzzleState((prev) => {
      const next = restartPuzzle(prev, randomFn);
      announce(
        `Puzzle restarted with a fresh scramble on ${next.dimension} by ${next.dimension} grid.`
      );
      return next;
    });
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setSelectedSlot(null);
    setDraggedSlot(null);
    setHoveredSlot(null);
    setDragOffset(null);
    setPendingConfirmation(null);
  }, [announce, randomFn]);

  // Core difficulty change implementation
  const performDifficultyChange = useCallback(
    (newDim: DifficultyDimension) => {
      setPuzzleState((prev) => {
        const next = changeDifficulty(prev, newDim, randomFn);
        announce(
          `Difficulty changed to ${newDim} by ${newDim} grid with a fresh scramble.`
        );
        return next;
      });
      setElapsedSeconds(0);
      setIsTimerRunning(false);
      setSelectedSlot(null);
      setDraggedSlot(null);
      setHoveredSlot(null);
      setDragOffset(null);
      setPendingConfirmation(null);
    },
    [announce, randomFn]
  );

  // Restart puzzle with confirmation if moves > 0 and unsolved
  const handleRestart = useCallback(() => {
    if (puzzleState.moves > 0 && !puzzleState.isSolved) {
      setPendingConfirmation({ type: 'restart' });
    } else {
      performRestart();
    }
  }, [performRestart, puzzleState.isSolved, puzzleState.moves]);

  // Change difficulty with confirmation if moves > 0 and unsolved
  const handleDifficultyChange = useCallback(
    (newDim: DifficultyDimension) => {
      if (newDim === puzzleState.dimension) return;
      if (puzzleState.moves > 0 && !puzzleState.isSolved) {
        setPendingConfirmation({ type: 'difficulty', dimension: newDim });
      } else {
        performDifficultyChange(newDim);
      }
    },
    [
      performDifficultyChange,
      puzzleState.dimension,
      puzzleState.isSolved,
      puzzleState.moves,
    ]
  );

  const confirmPendingAction = useCallback(() => {
    if (!pendingConfirmation) return;
    if (pendingConfirmation.type === 'restart') {
      performRestart();
    } else if (pendingConfirmation.type === 'difficulty') {
      performDifficultyChange(pendingConfirmation.dimension);
    }
  }, [pendingConfirmation, performDifficultyChange, performRestart]);

  const cancelPendingAction = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

  // Deselect tile when tapping outside the board
  useEffect(() => {
    if (selectedSlot === null) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-slot-index]')) {
        setSelectedSlot(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () =>
      window.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [selectedSlot]);

  // Keyboard navigation & accessibility interaction
  const handleTileKeyDown = useCallback(
    (slotIndex: number, event: React.KeyboardEvent<HTMLDivElement>) => {
      if (puzzleState.isSolved) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        ensureTimerStarted();

        if (selectedSlot === null) {
          setSelectedSlot(slotIndex);
          announce(
            `Tile at position ${slotIndex + 1} selected. Navigate to another tile and press Enter or Space to swap, or press Escape to cancel.`
          );
        } else if (selectedSlot === slotIndex) {
          setSelectedSlot(null);
          announce(`Tile at position ${slotIndex + 1} deselected.`);
        } else {
          executeSwap(selectedSlot, slotIndex);
        }
        return;
      }

      if (event.key === 'Escape' && selectedSlot !== null) {
        event.preventDefault();
        setSelectedSlot(null);
        announce('Tile selection canceled.');
        return;
      }

      const totalTiles = puzzleState.tiles.length;
      let nextSlot: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          if (slotIndex + 1 < totalTiles) nextSlot = slotIndex + 1;
          break;
        case 'ArrowLeft':
          if (slotIndex - 1 >= 0) nextSlot = slotIndex - 1;
          break;
        case 'ArrowDown':
          if (slotIndex + puzzleState.dimension < totalTiles) {
            nextSlot = slotIndex + puzzleState.dimension;
          }
          break;
        case 'ArrowUp':
          if (slotIndex - puzzleState.dimension >= 0) {
            nextSlot = slotIndex - puzzleState.dimension;
          }
          break;
        case 'Home':
          nextSlot = 0;
          break;
        case 'End':
          nextSlot = totalTiles - 1;
          break;
      }

      if (nextSlot !== null) {
        event.preventDefault();
        const nextEl = document.querySelector<HTMLElement>(
          `[data-slot-index="${nextSlot}"]`
        );
        nextEl?.focus();
      }
    },
    [
      announce,
      ensureTimerStarted,
      executeSwap,
      puzzleState.dimension,
      puzzleState.isSolved,
      puzzleState.tiles.length,
      selectedSlot,
    ]
  );

  // Pointer interactions for mobile touchscreen and desktop mouse
  const handleTilePointerDown = useCallback(
    (slotIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
      if (puzzleState.isSolved) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      ensureTimerStarted();

      // Initiate drag tracking safely
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture unsupported or inactive in current environment
      }

      setDraggedSlot(slotIndex);
      dragStartPos.current = { x: event.clientX, y: event.clientY };
      hasMovedSignificantly.current = false;
      setDragOffset({ x: 0, y: 0 });
    },
    [ensureTimerStarted, puzzleState.isSolved]
  );

  const handleTilePointerMove = useCallback(
    (_slotIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
      if (draggedSlot === null || !dragStartPos.current) return;

      const deltaX = event.clientX - dragStartPos.current.x;
      const deltaY = event.clientY - dragStartPos.current.y;

      // Threshold of 6px to distinguish between tap and deliberate drag
      if (Math.hypot(deltaX, deltaY) > 6) {
        hasMovedSignificantly.current = true;
      }

      setDragOffset({ x: deltaX, y: deltaY });

      // Determine slot under pointer safely using elementsFromPoint or fallback
      let targetSlot: number | null = null;
      if (typeof document !== 'undefined') {
        if (typeof document.elementsFromPoint === 'function') {
          const elements = document.elementsFromPoint(
            event.clientX,
            event.clientY
          );
          targetSlot = findTargetSlotFromElements(
            elements,
            draggedSlot,
            puzzleState.tiles.length
          );
        } else if (typeof document.elementFromPoint === 'function') {
          const el = document.elementFromPoint(event.clientX, event.clientY);
          targetSlot = el
            ? findTargetSlotFromElements(
                [el],
                draggedSlot,
                puzzleState.tiles.length
              )
            : null;
        }
      }
      setHoveredSlot(targetSlot);
    },
    [draggedSlot, puzzleState.tiles.length]
  );

  const handleTilePointerUp = useCallback(
    (slotIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
      if (draggedSlot === null) return;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture might be already released
      }

      const wasDrag = hasMovedSignificantly.current;
      const targetSlot = hoveredSlot;

      if (wasDrag && targetSlot !== null && targetSlot !== slotIndex) {
        // Drop onto a valid different tile: Execute Swap
        executeSwap(slotIndex, targetSlot);
      } else if (!wasDrag) {
        // Tap gesture: Tap-to-select and Tap-to-swap
        if (selectedSlot === null) {
          setSelectedSlot(slotIndex);
          announce(`Tile at position ${slotIndex + 1} selected.`);
        } else if (selectedSlot === slotIndex) {
          setSelectedSlot(null); // Tap same tile to deselect
          announce(`Tile at position ${slotIndex + 1} deselected.`);
        } else {
          // Tap second tile: Execute Swap
          executeSwap(selectedSlot, slotIndex);
        }
      }

      // Reset drag state
      setDraggedSlot(null);
      setHoveredSlot(null);
      setDragOffset(null);
      dragStartPos.current = null;
      hasMovedSignificantly.current = false;
    },
    [announce, draggedSlot, executeSwap, hoveredSlot, selectedSlot]
  );

  const handleTilePointerCancel = useCallback(() => {
    setDraggedSlot(null);
    setHoveredSlot(null);
    setDragOffset(null);
    dragStartPos.current = null;
    hasMovedSignificantly.current = false;
  }, []);

  const togglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return {
    puzzleState,
    currentImage,
    setCurrentImage,
    selectedSlot: puzzleState.isSolved ? null : selectedSlot,
    draggedSlot: puzzleState.isSolved ? null : draggedSlot,
    hoveredSlot: puzzleState.isSolved ? null : hoveredSlot,
    dragOffset: puzzleState.isSolved ? null : dragOffset,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isTimerRunning: isTimerRunning && !puzzleState.isSolved,
    isPreviewOpen,
    pendingConfirmation,
    confirmPendingAction,
    cancelPendingAction,
    announcement,
    togglePreview,
    closePreview,
    handleUndo,
    handleRestart,
    handleDifficultyChange,
    handleTilePointerDown,
    handleTilePointerMove,
    handleTilePointerUp,
    handleTilePointerCancel,
    handleTileKeyDown,
    executeSwap,
  };
}
