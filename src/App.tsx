import { CompletionCard } from '@/components/CompletionCard';
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
    togglePreview,
    closePreview,
    handleUndo,
    handleRestart,
    handleDifficultyChange,
    handleTilePointerDown,
    handleTilePointerMove,
    handleTilePointerUp,
    handleTilePointerCancel,
  } = usePuzzleGame();

  return (
    <main className="game-layout">
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
    </main>
  );
}
