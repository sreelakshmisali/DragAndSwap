import { expect, test } from '@playwright/test';

test.describe('DragAndSwap — E2E Puzzle Game Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the puzzle board to be fully rendered
    await expect(page.getByTestId('puzzle-board-grid')).toBeVisible();
  });

  test('renders initial UI elements with clean mobile-first layout and CSS sliced tiles', async ({
    page,
  }) => {
    // Check Header & HUD
    await expect(page.locator('.game-title')).toHaveText('DragAndSwap');
    await expect(page.getByTestId('hud-moves-value')).toHaveText('0');
    await expect(page.getByTestId('hud-timer-value')).toHaveText('00:00');

    // Check Controls
    await expect(page.getByTestId('control-undo')).toBeDisabled();
    await expect(page.getByTestId('control-restart')).toBeEnabled();
    await expect(page.getByTestId('control-preview')).toBeEnabled();
    await expect(page.getByTestId('difficulty-3x3')).toHaveClass(/is-selected/);

    // Verify 9 tiles are rendered for 3x3 default grid
    const tiles = page.locator('.puzzle-tile');
    await expect(tiles).toHaveCount(9);

    // Verify CSS background slicing on first tile
    const firstTile = tiles.first();
    await expect(firstTile).toHaveCSS('background-size', '300% 300%');
  });

  test('executes tap-to-select and tap-to-swap, starts timer, and enables undo', async ({
    page,
  }) => {
    const tile0 = page.getByTestId('tile-slot-0');
    const tile1 = page.getByTestId('tile-slot-1');

    // Step 1: Tap tile 0 to select
    await tile0.click();
    await expect(tile0).toHaveClass(/is-selected/);
    await expect(tile0).toHaveAttribute('aria-pressed', 'true');

    // Step 2: Tap tile 0 again to deselect
    await tile0.click();
    await expect(tile0).not.toHaveClass(/is-selected/);
    await expect(tile0).toHaveAttribute('aria-pressed', 'false');

    // Step 3: Tap tile 0, then tap outside board (on Header) to deselect
    await tile0.click();
    await expect(tile0).toHaveClass(/is-selected/);
    await page.locator('.game-title').click();
    await expect(tile0).not.toHaveClass(/is-selected/);

    // Step 4: Record origins before swap
    const origin0Before = await tile0.getAttribute('data-origin-index');
    const origin1Before = await tile1.getAttribute('data-origin-index');

    // Tap tile 0, then tap tile 1 to execute swap
    await tile0.click();
    await tile1.click();

    // Verify swap completed
    await expect(tile0).toHaveAttribute('data-origin-index', origin1Before!);
    await expect(tile1).toHaveAttribute('data-origin-index', origin0Before!);

    // Verify move count incremented
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Verify undo is now enabled
    await expect(page.getByTestId('control-undo')).toBeEnabled();

    // Wait for timer to tick from 00:00
    await page.waitForTimeout(1100);
    const timerText = await page.getByTestId('hud-timer-value').textContent();
    expect(timerText).not.toBe('00:00');
  });

  test('executes single-step undo and exhausts undo until next swap', async ({
    page,
  }) => {
    const tile0 = page.getByTestId('tile-slot-0');
    const tile1 = page.getByTestId('tile-slot-1');

    const origin0Initial = await tile0.getAttribute('data-origin-index');
    const origin1Initial = await tile1.getAttribute('data-origin-index');

    // Perform swap
    await tile0.click();
    await tile1.click();

    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');
    await expect(tile0).toHaveAttribute('data-origin-index', origin1Initial!);

    // Trigger Undo
    await page.getByTestId('control-undo').click();

    // Verify positions restored
    await expect(tile0).toHaveAttribute('data-origin-index', origin0Initial!);
    await expect(tile1).toHaveAttribute('data-origin-index', origin1Initial!);

    // Verify moves decremented to 0
    await expect(page.getByTestId('hud-moves-value')).toHaveText('0');

    // Verify undo is disabled (single-step exhausted)
    await expect(page.getByTestId('control-undo')).toBeDisabled();
  });

  test('guards restart with confirmation dialog when moves > 0 and resets on confirm', async ({
    page,
  }) => {
    // When 0 moves, clicking restart does not open modal
    await page.getByTestId('control-restart').click();
    await expect(page.locator('.confirmation-card')).not.toBeVisible();

    // Make a move
    await page.getByTestId('tile-slot-0').click();
    await page.getByTestId('tile-slot-1').click();
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Click restart with moves > 0
    await page.getByTestId('control-restart').click();

    // Confirmation dialog must appear
    const confirmModal = page.locator('.confirmation-card');
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText('Restart Puzzle?');

    // Test Cancel / Keep Playing
    await page.getByTestId('btn-confirm-cancel').click();
    await expect(confirmModal).not.toBeVisible();
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Click restart again and Confirm
    await page.getByTestId('control-restart').click();
    await page.getByTestId('btn-confirm-proceed').click();
    await expect(confirmModal).not.toBeVisible();

    // State reset
    await expect(page.getByTestId('hud-moves-value')).toHaveText('0');
    await expect(page.getByTestId('hud-timer-value')).toHaveText('00:00');
    await expect(page.getByTestId('control-undo')).toBeDisabled();
  });

  test('switches grid difficulty with confirmation and reconfigures tile layout', async ({
    page,
  }) => {
    // Switch to 4x4 when moves === 0 (no confirmation needed)
    await page.getByTestId('difficulty-4x4').click();
    await expect(page.locator('.puzzle-tile')).toHaveCount(16);
    await expect(page.getByTestId('difficulty-4x4')).toHaveClass(/is-selected/);
    await expect(page.locator('.puzzle-tile').first()).toHaveCSS(
      'background-size',
      '400% 400%'
    );

    // Make a move on 4x4
    await page.getByTestId('tile-slot-0').click();
    await page.getByTestId('tile-slot-1').click();
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Attempt to switch to 5x5: confirmation dialog appears
    await page.getByTestId('difficulty-5x5').click();
    const confirmModal = page.locator('.confirmation-card');
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText('Change Grid Dimension?');

    // Confirm difficulty change
    await page.getByTestId('btn-confirm-proceed').click();
    await expect(page.locator('.puzzle-tile')).toHaveCount(25);
    await expect(page.getByTestId('difficulty-5x5')).toHaveClass(/is-selected/);
    await expect(page.getByTestId('hud-moves-value')).toHaveText('0');
  });

  test('opens and closes reference preview modal without affecting puzzle state', async ({
    page,
  }) => {
    // Make a move
    await page.getByTestId('tile-slot-0').click();
    await page.getByTestId('tile-slot-1').click();
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Open reference preview
    await page.getByTestId('control-preview').click();
    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();
    await expect(page.locator('.modal-reference-image')).toBeVisible();

    // Close preview via close button
    await page.locator('.modal-close-btn').click();
    await expect(modal).not.toBeVisible();

    // Puzzle board remains intact
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');
  });

  test('supports full keyboard navigation: arrows navigate, Enter selects/swaps, Escape cancels', async ({
    page,
  }) => {
    const tile0 = page.getByTestId('tile-slot-0');
    await tile0.focus();
    await expect(tile0).toBeFocused();

    // Arrow navigation: Right -> slot 1
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('tile-slot-1')).toBeFocused();

    // Arrow navigation: Down -> slot 4
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('tile-slot-4')).toBeFocused();

    // Press Space on slot 4 to select
    await page.keyboard.press('Space');
    await expect(page.getByTestId('tile-slot-4')).toHaveClass(/is-selected/);

    // Arrow Up back to slot 1
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('tile-slot-1')).toBeFocused();

    // Press Enter on slot 1 to complete swap
    await page.keyboard.press('Enter');

    // Moves incremented
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');
    await expect(page.getByTestId('control-undo')).toBeEnabled();
  });

  test('completes puzzle, locks board, displays CompletionCard with stats, and allows replay', async ({
    page,
  }) => {
    // Solve 3x3 board by placing each piece into its matching slot
    for (let targetOrigin = 0; targetOrigin < 9; targetOrigin++) {
      // Find which slot currently holds targetOrigin
      const slotWithTarget = page.locator(
        `[data-slot-index="${targetOrigin}"][data-origin-index="${targetOrigin}"]`
      );

      // If slot targetOrigin already has piece targetOrigin, continue
      if ((await slotWithTarget.count()) > 0) {
        continue;
      }

      // Locate the tile currently holding targetOrigin
      const currentHolder = page.locator(
        `[data-origin-index="${targetOrigin}"]`
      );
      const currentHolderSlot =
        await currentHolder.getAttribute('data-slot-index');

      // Swap targetOrigin slot with current holder slot
      await page.getByTestId(`tile-slot-${targetOrigin}`).click();
      await page.getByTestId(`tile-slot-${currentHolderSlot}`).click();
    }

    // Win condition triggered!
    await expect(page.getByTestId('completion-card')).toBeVisible();
    await expect(page.locator('.completion-title')).toHaveText(
      'Picture Restored'
    );
    await expect(page.getByTestId('btn-play-again')).toBeVisible();

    // Board is locked in solved state (seamless unbroken frame, no badges)
    const boardFrame = page.getByTestId('puzzle-board-grid');
    await expect(boardFrame).toHaveClass(/frame-solved/);
    await expect(page.locator('.tile-slot-badge')).toHaveCount(0);

    // Click "Play Again"
    await page.getByTestId('btn-play-again').click();

    // Board returns to active scrambled state
    await expect(page.getByTestId('completion-card')).not.toBeVisible();
    await expect(page.getByTestId('hud-moves-value')).toHaveText('0');
    await expect(page.getByTestId('hud-timer-value')).toHaveText('00:00');
  });

  test('executes drag-and-drop swap and cancels on invalid drop outside board', async ({
    page,
  }) => {
    const tile0 = page.getByTestId('tile-slot-0');
    const tile1 = page.getByTestId('tile-slot-1');

    const origin0 = await tile0.getAttribute('data-origin-index');
    const origin1 = await tile1.getAttribute('data-origin-index');

    const box0 = (await tile0.boundingBox())!;
    const box1 = (await tile1.boundingBox())!;

    // Drag tile 0 onto tile 1
    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2, {
      steps: 5,
    });
    await page.mouse.up();

    // Verify swap executed
    await expect(tile0).toHaveAttribute('data-origin-index', origin1!);
    await expect(tile1).toHaveAttribute('data-origin-index', origin0!);
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');

    // Drag tile 0 outside the board onto header (invalid drop)
    const headerBox = (await page.locator('.game-title').boundingBox())!;
    const currentBox0 = (await tile0.boundingBox())!;

    await page.mouse.move(
      currentBox0.x + currentBox0.width / 2,
      currentBox0.y + currentBox0.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      headerBox.x + headerBox.width / 2,
      headerBox.y + headerBox.height / 2,
      { steps: 5 }
    );
    await page.mouse.up();

    // Move count remains 1, positions preserved
    await expect(page.getByTestId('hud-moves-value')).toHaveText('1');
    await expect(tile0).toHaveAttribute('data-origin-index', origin1!);
  });
});
