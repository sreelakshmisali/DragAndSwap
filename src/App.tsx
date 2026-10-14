import { ControlBar } from '@/components/ControlBar';
import { GameHud } from '@/components/GameHud';
import { Header } from '@/components/Header';
import { PuzzleBoardFrame } from '@/components/PuzzleBoardFrame';

export default function App() {
  return (
    <main className="game-layout">
      <Header />
      <GameHud moves={0} timeFormatted="00:00" />
      <PuzzleBoardFrame dimension={3} />
      <ControlBar selectedDifficulty={3} />
      <p className="phase-notice" role="status">
        Phase 2B: Static presentational preview. Gameplay mechanics will be
        introduced in subsequent phases.
      </p>
    </main>
  );
}
