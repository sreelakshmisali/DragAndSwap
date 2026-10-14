import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { ControlBar } from '@/components/ControlBar';
import { GameHud } from '@/components/GameHud';
import { Header } from '@/components/Header';
import { PuzzleBoardFrame } from '@/components/PuzzleBoardFrame';

describe('Header Component', () => {
  it('renders default title and subtitle', () => {
    const html = renderToStaticMarkup(<Header />);
    expect(html).toContain('DragAndSwap');
    expect(html).toContain('A mindful picture puzzle');
  });

  it('renders custom title and subtitle when provided', () => {
    const html = renderToStaticMarkup(
      <Header title="Custom Puzzle" subtitle="Custom Subtitle" />
    );
    expect(html).toContain('Custom Puzzle');
    expect(html).toContain('Custom Subtitle');
  });
});

describe('GameHud Component', () => {
  it('renders static moves and timer displays', () => {
    const html = renderToStaticMarkup(
      <GameHud moves={0} timeFormatted="00:00" />
    );
    expect(html).toContain('Moves');
    expect(html).toContain('0');
    expect(html).toContain('Time');
    expect(html).toContain('00:00');
  });

  it('renders arbitrary metric values correctly', () => {
    const html = renderToStaticMarkup(
      <GameHud moves={12} timeFormatted="02:45" />
    );
    expect(html).toContain('12');
    expect(html).toContain('02:45');
  });
});

describe('ControlBar Component', () => {
  it('renders presentational action buttons in disabled state', () => {
    const html = renderToStaticMarkup(<ControlBar />);
    expect(html).toContain('Undo');
    expect(html).toContain('Restart');
    expect(html).toContain('Preview');

    // Confirm buttons are marked disabled to prevent appearing functional
    expect(html).toMatch(/<button[^>]*disabled[^>]*>.*?Undo/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>.*?Restart/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>.*?Preview/);
  });

  it('renders difficulty tiers 3×3, 4×4, and 5×5 with 3×3 selected by default', () => {
    const html = renderToStaticMarkup(<ControlBar selectedDifficulty={3} />);
    expect(html).toContain('3×3');
    expect(html).toContain('4×4');
    expect(html).toContain('5×5');
    expect(html).toContain('is-selected');
  });
});

describe('PuzzleBoardFrame Component', () => {
  it('renders 9 placeholder tiles for a 3×3 grid', () => {
    const html = renderToStaticMarkup(<PuzzleBoardFrame dimension={3} />);
    const matchCount = (html.match(/class="puzzle-tile-placeholder"/g) || [])
      .length;
    expect(matchCount).toBe(9);
    expect(html).toContain('tile-slot-number">1<');
    expect(html).toContain('tile-slot-number">9<');
  });

  it('renders 16 placeholder tiles for a 4×4 grid', () => {
    const html = renderToStaticMarkup(<PuzzleBoardFrame dimension={4} />);
    const matchCount = (html.match(/class="puzzle-tile-placeholder"/g) || [])
      .length;
    expect(matchCount).toBe(16);
  });
});

describe('App Root Layout', () => {
  it('renders full presentational game interface', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('DragAndSwap');
    expect(html).toContain('Moves');
    expect(html).toContain('Time');
    expect(html).toContain('puzzle-board-frame');
    expect(html).toContain('Undo');
    expect(html).toContain('Restart');
    expect(html).toContain('Preview');
    expect(html).toContain('3×3');
  });
});
