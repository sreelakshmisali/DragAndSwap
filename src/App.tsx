import { CompletionCard } from '@/components/CompletionCard';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ControlBar } from '@/components/ControlBar';
import { GameHud } from '@/components/GameHud';
import { Header } from '@/components/Header';
import { PuzzleBoardFrame } from '@/components/PuzzleBoardFrame';
import { ReferencePreviewModal } from '@/components/ReferencePreviewModal';
import { usePuzzleGame } from '@/hooks/usePuzzleGame';

export default function App() {
  const {
    puzzleState,
    currentImage,
    selectedSlot,
    draggedSlot,
    hoveredSlot,
    dragOffset,
    formattedTime,
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
  } = usePuzzleGame();

  const isRestartConfirm = pendingConfirmation?.type === 'restart';
  const targetDifficulty =
    pendingConfirmation?.type === 'difficulty'
      ? pendingConfirmation.dimension
      : null;

  return (
    <main className="game-layout">
      {/* Accessible live region for screen-reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="sr-announcements"
      >
        {announcement}
      </div>

      <Header />
      <GameHud moves={puzzleState.moves} timeFormatted={formattedTime} />

      <PuzzleBoardFrame
        dimension={puzzleState.dimension}
        tiles={puzzleState.tiles}
        image={currentImage}
        isSolved={puzzleState.isSolved}
        selectedSlot={selectedSlot}
        draggedSlot={draggedSlot}
        hoveredSlot={hoveredSlot}
        dragOffset={dragOffset}
        onTilePointerDown={handleTilePointerDown}
        onTilePointerMove={handleTilePointerMove}
        onTilePointerUp={handleTilePointerUp}
        onTilePointerCancel={handleTilePointerCancel}
        onTileKeyDown={handleTileKeyDown}
      />

      {puzzleState.isSolved ? (
        <CompletionCard
          image={currentImage}
          moves={puzzleState.moves}
          timeFormatted={formattedTime}
          onPlayAgain={handleRestart}
          onSelectDifficulty={handleDifficultyChange}
          currentDimension={puzzleState.dimension}
        />
      ) : (
        <ControlBar
          canUndo={puzzleState.canUndo}
          onUndo={handleUndo}
          onRestart={handleRestart}
          onTogglePreview={togglePreview}
          selectedDifficulty={puzzleState.dimension}
          onDifficultyChange={handleDifficultyChange}
          isSolved={puzzleState.isSolved}
        />
      )}

      <ReferencePreviewModal
        isOpen={isPreviewOpen}
        image={currentImage}
        onClose={closePreview}
      />

      <ConfirmationModal
        isOpen={pendingConfirmation !== null}
        title={isRestartConfirm ? 'Restart Puzzle?' : 'Change Grid Dimension?'}
        message={
          isRestartConfirm
            ? `You have made ${puzzleState.moves} move${puzzleState.moves === 1 ? '' : 's'}. Are you sure you want to restart with a fresh scramble?`
            : `You have made ${puzzleState.moves} move${puzzleState.moves === 1 ? '' : 's'}. Changing to a ${targetDifficulty}×${targetDifficulty} grid will start a new puzzle.`
        }
        confirmLabel={isRestartConfirm ? 'Restart' : 'Change Grid'}
        cancelLabel="Keep Playing"
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
      />
    </main>
  );
}
