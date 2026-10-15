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
  const executeSwap = useCallback((slotA: number, slotB: number) => {
    setPuzzleState((prev) => {
      const next = swapTiles(prev, slotA, slotB);
      if (next.isSolved) {
        setIsTimerRunning(false);
      }
      return next;
    });
    setSelectedSlot(null);
    setDraggedSlot(null);
    setHoveredSlot(null);
    setDragOffset(null);
  }, []);

  // Undo previous swap
  const handleUndo = useCallback(() => {
    if (!puzzleState.canUndo || puzzleState.isSolved) return;
    setPuzzleState((prev) => undoSwap(prev));
    setSelectedSlot(null);
  }, [puzzleState.canUndo, puzzleState.isSolved]);

  // Core restart implementation
  const performRestart = useCallback(() => {
    setPuzzleState((prev) => restartPuzzle(prev, randomFn));
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setSelectedSlot(null);
    setDraggedSlot(null);
    setHoveredSlot(null);
    setDragOffset(null);
    setPendingConfirmation(null);
  }, [randomFn]);

  // Core difficulty change implementation
  const performDifficultyChange = useCallback(
    (newDim: DifficultyDimension) => {
      setPuzzleState((prev) => changeDifficulty(prev, newDim, randomFn));
      setElapsedSeconds(0);
      setIsTimerRunning(false);
      setSelectedSlot(null);
      setDraggedSlot(null);
      setHoveredSlot(null);
      setDragOffset(null);
      setPendingConfirmation(null);
    },
    [randomFn]
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
        } else if (selectedSlot === slotIndex) {
          setSelectedSlot(null); // Tap same tile to deselect
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
    [draggedSlot, executeSwap, hoveredSlot, selectedSlot]
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
    togglePreview,
    closePreview,
    handleUndo,
    handleRestart,
    handleDifficultyChange,
    handleTilePointerDown,
    handleTilePointerMove,
    handleTilePointerUp,
    handleTilePointerCancel,
    executeSwap,
  };
}
