export interface GameHudProps {
  moves?: number;
  timeFormatted?: string;
}

export function GameHud({ moves = 0, timeFormatted = '00:00' }: GameHudProps) {
  return (
    <section className="game-hud" aria-label="Game status">
      <div className="hud-metric hud-moves">
        <span className="hud-label">Moves</span>
        <span className="hud-value" data-testid="hud-moves-value">
          {moves}
        </span>
      </div>
      <div className="hud-metric hud-timer">
        <span className="hud-label">Time</span>
        <span
          className="hud-value hud-timer-value"
          data-testid="hud-timer-value"
        >
          {timeFormatted}
        </span>
      </div>
    </section>
  );
}
