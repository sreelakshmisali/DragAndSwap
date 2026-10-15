import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { CompletionCard } from '@/components/CompletionCard';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ControlBar } from '@/components/ControlBar';
import { GameHud } from '@/components/GameHud';
import { Header } from '@/components/Header';
import { PuzzleBoardFrame } from '@/components/PuzzleBoardFrame';
import { ReferencePreviewModal } from '@/components/ReferencePreviewModal';
import { findTargetSlotFromElements, formatTime } from '@/hooks/usePuzzleGame';
import { CURATED_IMAGES, DEFAULT_IMAGE } from '@/lib/images';
import { createSolvedTiles } from '@/lib/puzzle-engine';
import { getTileBackgroundPosition } from '@/lib/tile-layout';

const noop = () => {};

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
  it('renders moves and formatted timer displays', () => {
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
  it('renders action buttons with undo disabled when canUndo is false', () => {
    const html = renderToStaticMarkup(
      <ControlBar canUndo={false} selectedDifficulty={3} />
    );
    expect(html).toContain('Undo');
    expect(html).toContain('Restart');
    expect(html).toContain('Preview');

    // Undo is disabled
    expect(html).toMatch(
      /<button\b(?=[^>]*\bdata-testid="control-undo")(?=[^>]*\bdisabled)[^>]*>/
    );
    // Restart and preview are enabled
    expect(html).not.toMatch(
      /<button\b(?=[^>]*\bdata-testid="control-restart")(?=[^>]*\bdisabled)[^>]*>/
    );
    expect(html).not.toMatch(
      /<button\b(?=[^>]*\bdata-testid="control-preview")(?=[^>]*\bdisabled)[^>]*>/
    );
  });

  it('renders undo enabled when canUndo is true and not solved', () => {
    const html = renderToStaticMarkup(
      <ControlBar canUndo={true} isSolved={false} selectedDifficulty={3} />
    );
    expect(html).not.toMatch(
      /<button\b(?=[^>]*\bdata-testid="control-undo")(?=[^>]*\bdisabled)[^>]*>/
    );
  });

  it('disables undo when puzzle is solved even if canUndo was true', () => {
    const html = renderToStaticMarkup(
      <ControlBar canUndo={true} isSolved={true} selectedDifficulty={3} />
    );
    expect(html).toMatch(
      /<button\b(?=[^>]*\bdata-testid="control-undo")(?=[^>]*\bdisabled)[^>]*>/
    );
  });

  it('renders difficulty tiers 3×3, 4×4, and 5×5 with active selected indicator', () => {
    const html = renderToStaticMarkup(<ControlBar selectedDifficulty={4} />);
    expect(html).toContain('3×3');
    expect(html).toContain('4×4');
    expect(html).toContain('5×5');
    expect(html).toMatch(
      /class="[^"]*is-selected"[^>]*data-testid="difficulty-4x4"/
    );
  });
});

describe('PuzzleBoardFrame Component', () => {
  it('renders 9 tiles with CSS background image slicing for a 3x3 grid', () => {
    const tiles = createSolvedTiles(3);
    const html = renderToStaticMarkup(
      <PuzzleBoardFrame
        dimension={3}
        tiles={tiles}
        image={DEFAULT_IMAGE}
        isSolved={false}
        selectedSlot={null}
        draggedSlot={null}
        hoveredSlot={null}
        dragOffset={null}
        onTilePointerDown={noop}
        onTilePointerMove={noop}
        onTilePointerUp={noop}
        onTilePointerCancel={noop}
      />
    );

    expect(html).toContain('puzzle-board-frame');
    const tileMatches = (html.match(/class="puzzle-tile/g) || []).length;
    expect(tileMatches).toBe(9);
    expect(html).toContain(`background-image:url(${DEFAULT_IMAGE.filename})`);
    expect(html).toContain('background-size:300% 300%');
  });

  it('renders 16 tiles for a 4x4 grid and 25 tiles for a 5x5 grid', () => {
    const tiles4 = createSolvedTiles(4);
    const html4 = renderToStaticMarkup(
      <PuzzleBoardFrame
        dimension={4}
        tiles={tiles4}
        image={DEFAULT_IMAGE}
        isSolved={false}
        selectedSlot={null}
        draggedSlot={null}
        hoveredSlot={null}
        dragOffset={null}
        onTilePointerDown={noop}
        onTilePointerMove={noop}
        onTilePointerUp={noop}
        onTilePointerCancel={noop}
      />
    );
    expect((html4.match(/class="puzzle-tile/g) || []).length).toBe(16);

    const tiles5 = createSolvedTiles(5);
    const html5 = renderToStaticMarkup(
      <PuzzleBoardFrame
        dimension={5}
        tiles={tiles5}
        image={DEFAULT_IMAGE}
        isSolved={false}
        selectedSlot={null}
        draggedSlot={null}
        hoveredSlot={null}
        dragOffset={null}
        onTilePointerDown={noop}
        onTilePointerMove={noop}
        onTilePointerUp={noop}
        onTilePointerCancel={noop}
      />
    );
    expect((html5.match(/class="puzzle-tile/g) || []).length).toBe(25);
  });

  it('renders selected, dragged, and hover states with live drag translation', () => {
    const tiles = createSolvedTiles(3);
    const html = renderToStaticMarkup(
      <PuzzleBoardFrame
        dimension={3}
        tiles={tiles}
        image={DEFAULT_IMAGE}
        isSolved={false}
        selectedSlot={1}
        draggedSlot={2}
        hoveredSlot={3}
        dragOffset={{ x: 15, y: -20 }}
        onTilePointerDown={noop}
        onTilePointerMove={noop}
        onTilePointerUp={noop}
        onTilePointerCancel={noop}
      />
    );

    expect(html).toContain('is-selected');
    expect(html).toContain('is-dragged');
    expect(html).toContain('is-hover-target');
    expect(html).toContain('translate3d(15px, -20px, 0)');
  });

  it('renders seamless unbroken frame when solved and omits slot badges', () => {
    const tiles = createSolvedTiles(3);
    const html = renderToStaticMarkup(
      <PuzzleBoardFrame
        dimension={3}
        tiles={tiles}
        image={DEFAULT_IMAGE}
        isSolved={true}
        selectedSlot={null}
        draggedSlot={null}
        hoveredSlot={null}
        dragOffset={null}
        onTilePointerDown={noop}
        onTilePointerMove={noop}
        onTilePointerUp={noop}
        onTilePointerCancel={noop}
      />
    );

    expect(html).toContain('frame-solved');
    expect(html).toContain('is-solved-tile');
    expect(html).not.toContain('tile-slot-badge');
  });
});

describe('ReferencePreviewModal Component', () => {
  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      <ReferencePreviewModal
        isOpen={false}
        image={DEFAULT_IMAGE}
        onClose={noop}
      />
    );
    expect(html).toBe('');
  });

  it('renders reference image, title, and artist when open', () => {
    const html = renderToStaticMarkup(
      <ReferencePreviewModal
        isOpen={true}
        image={DEFAULT_IMAGE}
        onClose={noop}
      />
    );
    expect(html).toContain('reference-modal');
    expect(html).toContain(DEFAULT_IMAGE.title);
    expect(html).toContain(DEFAULT_IMAGE.artist!);
    expect(html).toContain(DEFAULT_IMAGE.filename);
  });
});

describe('CompletionCard Component', () => {
  it('renders completion title, artwork details, moves, and time', () => {
    const html = renderToStaticMarkup(
      <CompletionCard
        image={DEFAULT_IMAGE}
        moves={14}
        timeFormatted="01:23"
        onPlayAgain={noop}
        onSelectDifficulty={noop}
        currentDimension={3}
      />
    );

    expect(html).toContain('completion-card');
    expect(html).toContain('Picture Restored');
    expect(html).toContain(DEFAULT_IMAGE.title);
    expect(html).toContain('14');
    expect(html).toContain('01:23');
    expect(html).toContain('Play Again');
    expect(html).toContain('Try 4×4');
  });

  it('cycles from 5x5 back to 3x3 challenge suggestion', () => {
    const html = renderToStaticMarkup(
      <CompletionCard
        image={DEFAULT_IMAGE}
        moves={30}
        timeFormatted="04:12"
        onPlayAgain={noop}
        onSelectDifficulty={noop}
        currentDimension={5}
      />
    );
    expect(html).toContain('Try 3×3');
  });
});

describe('ConfirmationModal Component', () => {
  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      <ConfirmationModal
        isOpen={false}
        title="Restart Puzzle?"
        message="Are you sure?"
        onConfirm={noop}
        onCancel={noop}
      />
    );
    expect(html).toBe('');
  });

  it('renders title, message, cancel and confirm buttons when open', () => {
    const html = renderToStaticMarkup(
      <ConfirmationModal
        isOpen={true}
        title="Restart Puzzle?"
        message="You have made 5 moves. Are you sure you want to restart?"
        confirmLabel="Restart"
        cancelLabel="Keep Playing"
        onConfirm={noop}
        onCancel={noop}
      />
    );

    expect(html).toContain('modal-backdrop');
    expect(html).toContain('Restart Puzzle?');
    expect(html).toContain(
      'You have made 5 moves. Are you sure you want to restart?'
    );
    expect(html).toContain('Restart');
    expect(html).toContain('Keep Playing');
    expect(html).toContain('data-testid="btn-confirm-proceed"');
    expect(html).toContain('data-testid="btn-confirm-cancel"');
  });
});

describe('App Root Layout', () => {
  it('renders full interactive game interface with board, HUD, and controls', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('DragAndSwap');
    expect(html).toContain('Moves');
    expect(html).toContain('Time');
    expect(html).toContain('puzzle-board-frame');
    expect(html).toContain('Undo');
    expect(html).toContain('Restart');
    expect(html).toContain('Preview');
    expect(html).toContain('3×3');
    expect(html).toContain('data-slot-index="0"');
    expect(html).toContain('data-slot-index="8"');
  });
});

describe('Tile Layout & Time Formatter Utilities', () => {
  it('calculates background position percentages correctly for 3x3 grid', () => {
    // Corner: top-left (0,0) -> 0% 0%
    const p0 = getTileBackgroundPosition(0, 3);
    expect(p0.backgroundSize).toBe('300% 300%');
    expect(p0.backgroundPosition).toBe('0% 0%');

    // Center: (1,1) -> 50% 50%
    const p4 = getTileBackgroundPosition(4, 3);
    expect(p4.backgroundPosition).toBe('50% 50%');

    // Bottom-right: (2,2) -> 100% 100%
    const p8 = getTileBackgroundPosition(8, 3);
    expect(p8.backgroundPosition).toBe('100% 100%');
  });

  it('calculates background position percentages correctly for 4x4 and 5x5 grids', () => {
    // 4x4 bottom-right (origin 15) -> 100% 100%
    const p15 = getTileBackgroundPosition(15, 4);
    expect(p15.backgroundSize).toBe('400% 400%');
    expect(p15.backgroundPosition).toBe('100% 100%');

    // 5x5 center (origin 12) -> 50% 50%
    const p12 = getTileBackgroundPosition(12, 5);
    expect(p12.backgroundSize).toBe('500% 500%');
    expect(p12.backgroundPosition).toBe('50% 50%');
  });

  it('formats seconds to MM:SS correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(125)).toBe('02:05');
  });

  it('includes curated images meeting quality standards', () => {
    expect(CURATED_IMAGES.length).toBeGreaterThanOrEqual(2);
    expect(CURATED_IMAGES[0].id).toBe('warm-sanctuary');
    expect(CURATED_IMAGES[1].id).toBe('geometric-dawn');
  });
});

describe('findTargetSlotFromElements', () => {
  it('returns target slot when hovered element is a tile with different slot', () => {
    const mockElements = [
      {
        closest: (sel: string) =>
          sel === '[data-slot-index]' ? { dataset: { slotIndex: '5' } } : null,
      },
    ];

    expect(findTargetSlotFromElements(mockElements, 2, 9)).toBe(5);
  });

  it('skips dragged slot when dragged tile is top of stack and finds slot below it', () => {
    const mockElements = [
      {
        closest: (sel: string) =>
          sel === '[data-slot-index]'
            ? { dataset: { slotIndex: '2' } } // dragged tile
            : null,
      },
      {
        closest: (sel: string) =>
          sel === '[data-slot-index]'
            ? { dataset: { slotIndex: '7' } } // destination tile beneath
            : null,
      },
    ];

    expect(findTargetSlotFromElements(mockElements, 2, 9)).toBe(7);
  });

  it('returns null when elements do not match tile selector', () => {
    const mockElements = [
      {
        closest: () => null,
      },
    ];
    expect(findTargetSlotFromElements(mockElements, 1, 9)).toBeNull();
  });

  it('returns null when slot index is out of bounds or invalid', () => {
    const mockElements = [
      {
        closest: () => ({ dataset: { slotIndex: '99' } }),
      },
    ];
    expect(findTargetSlotFromElements(mockElements, 0, 9)).toBeNull();

    const nanElements = [
      {
        closest: () => ({ dataset: { slotIndex: 'invalid' } }),
      },
    ];
    expect(findTargetSlotFromElements(nanElements, 0, 9)).toBeNull();
  });

  it('returns null when element list is empty', () => {
    expect(findTargetSlotFromElements([], 0, 9)).toBeNull();
  });
});
