# DragAndSwap — Product Specification & Game Rules

- **Document Version:** 1.1.0
- **Status:** Approved by Product Owner
- **Phase:** Phase 1 (Product Specification and Game Rules)
- **Target Platform:** Mobile-Browser-First Web Application (Responsive to Desktop)

---

## 1. Core Gameplay Mechanics

### 1.1 Grid and Tile Layout

1. The puzzle board is a single, centered square container maintaining a fixed 1:1 aspect ratio across all screen sizes.
2. The board is partitioned into an $N \times N$ grid of equal square tiles, where $N$ denotes the difficulty dimension ($3 \times 3$, $4 \times 4$, or $5 \times 5$).
3. Each tile represents an exact square sub-region (slice) of the selected image:
   - **Original Position (`originIndex`):** The zero-indexed position `(0 ... N^2 - 1)` corresponding to where that slice belongs in the completed image.
   - **Current Position (`currentIndex`):** The zero-indexed position `(0 ... N^2 - 1)` where that tile is currently placed on the board.
4. Exactly one tile occupies each grid slot at all times. There are no blank, empty, or missing tiles (unlike a traditional 15-puzzle sliding block).

### 1.2 Tile Swapping Mechanics

1. **Free Pairwise Swapping:** Any tile on the board may be swapped directly with any other tile on the board, regardless of physical proximity (adjacent or non-adjacent).
2. **The Swap Action:**
   - A player initiates an interaction with a source tile (`Tile A`).
   - The player directs `Tile A` onto a destination tile (`Tile B`), where $B \neq A$.
   - Upon release or selection confirmation, `Tile A` takes the grid position previously held by `Tile B`, and `Tile B` takes the grid position previously held by `Tile A`.
   - The swap is executed as an atomic state transition accompanied by a smooth, hardware-accelerated position animation ($150\text{--}200\text{ms}$ ease-out).

### 1.3 Correct Position Definition

1. A tile is in its **correct (solved) position** if and only if:
   $$\text{currentIndex} == \text{originIndex}$$
2. Tiles placed in their correct position remain interactive—they are not permanently locked in place and can still be moved if the player chooses to swap them again.
3. Visual indication for solved tiles: In keeping with the calming, minimal, and premium aesthetic, correct tiles should not display aggressive badges or heavy green checkmarks. If visual feedback is desired, it should be an understated, subtle design detail (such as a slight border refinement or soft micro-transition).

### 1.4 Win Condition and Completion

1. A puzzle is considered **complete** when:
   $$\forall\, i \in [0, N^2 - 1], \quad \text{tile}[i].\text{currentIndex} == \text{tile}[i].\text{originIndex}$$
2. When the win condition evaluates to `true`:
   - Further board interactions are immediately locked to prevent state mutation.
   - The board transitions into the completed state.

---

## 2. Interaction Model: Mobile Touchscreen & Desktop

### 2.1 Touchscreen Interaction (Mobile-First)

#### Primary Gesture: Direct Drag-and-Drop

1. **Touch Down (`pointerdown`):**
   - Touching a tile designates it as the active dragged tile (`Tile A`).
   - `Tile A` visually lifts: subtle scale increase ($\sim 1.04\times$), z-index elevation, and a soft, warm drop shadow.
2. **Touch Move (`pointermove`):**
   - `Tile A` follows the player's touch coordinates directly beneath or slightly offset above the touch point for finger visibility.
   - When the centroid of `Tile A` moves over another tile (`Tile B`), `Tile B` receives an understated hover indicator (e.g., subtle outline or gentle scale anticipation) indicating it is the targeted swap destination.
3. **Touch Up / Drop (`pointerup`):**
   - If dropped over `Tile B` (where $B \neq A$), the two tiles smoothly animate into each other's slots via CSS transform transitions ($150\text{--}200\text{ms}$ ease-out), concluding the swap.
   - If dropped outside the grid or directly back onto its starting slot, `Tile A` glides smoothly back to its original slot with zero state change.

#### Secondary Gesture: Tap-to-Select and Tap-to-Swap (Ergonomic Fallback)

To ensure accessibility, comfort on smaller handheld screens, and resilience against imprecise finger gestures:

1. **First Tap:** Tapping `Tile A` toggles an active "selected" state (subtle highlight border, gentle elevation).
2. **Second Tap on Different Tile:** Tapping `Tile B` immediately triggers an animated swap between `Tile A` and `Tile B`. The selection state clears.
3. **Second Tap on Same Tile:** Tapping `Tile A` again deselects it without performing a swap.
4. **Second Tap Outside:** Tapping outside the board deselects the currently selected tile.

### 2.2 Invalid Moves and Edge Cases

1. **Drag Released Outside the Board:**
   - The dragged tile cancels the action and animates back to its pre-drag position.
   - The move counter does not increment.
2. **Drag Released on Starting Tile:**
   - Evaluated as a canceled action.
   - The move counter does not increment.
3. **Ambiguous Drag Overlap:**
   - If the dragged tile overlaps multiple tiles upon release, the swap targets the tile with the greatest bounding-box intersection area.
   - If intersection with any valid tile is below an intentional threshold (e.g., $<25\%$), the drag cancels and returns to origin.
4. **Interrupted Touch (`pointercancel`):**
   - Incoming OS notifications, phone calls, or multi-finger interruptions safely abort the drag operation and restore the tile to its position.

### 2.3 Mobile Browser Hygiene

1. **Prevent Default Browser Interference:**
   - The puzzle container must have `touch-action: none` to prevent mobile browser pull-to-refresh, double-tap zoom, and viewport scroll interference during tile dragging.
   - Text and image selection are strictly disabled (`user-select: none`, `-webkit-user-select: none`).
   - Long-press context menus and image callouts are suppressed (`-webkit-touch-callout: none`).
2. **Safe Viewport and Overflow:**
   - The board dynamically scales to fit the viewport width with appropriate padding (minimum $16\text{px}$ horizontal margin).
   - Zero horizontal scrollbar under all mobile screen dimensions ($320\text{px}$ through large tablets).

### 2.4 Desktop Interaction

1. **Pointer Events Integration:**
   - Both mouse and touch use the unified Pointer Events API.
   - Left-click drag-and-drop or click-to-select behaves identically to touchscreen interactions.
2. **Tactile Hover:**
   - Non-touch devices display subtle cursor changes (`grab` on hover, `grabbing` on active drag) and gentle hover borders.

---

## 3. Image and Puzzle Rules

### 3.1 Curated Image Collection

1. **Image Source:**
   - High-fidelity, curated image collection stored locally in `public/images/`.
   - Free from external API dependencies, network latency, or runtime asset paywalls.
2. **Asset Specifications:**
   - **Aspect Ratio:** Strictly square ($1:1$) to avoid letterboxing or distortion on square grids.
   - **Format:** Modern compressed formats (`.webp` primary, `.jpg`/`.png` fallback).
   - **Resolution:** Recommended $1080 \times 1080\text{px}$ (or $800 \times 800\text{px}$) to ensure crisp rendering on high-DPI (Retina) mobile screens without excessive memory load.
3. **Image Metadata Registry:**
   - Each curated image has structured metadata:
     ```typescript
     interface PuzzleImage {
       id: string;
       title: string;
       filename: string;
       artist?: string;
       attribution?: string;
     }
     ```
4. **Image Selection:**
   - Initial state loads a featured default curated image.
   - Players can choose from an image selector drawer or carousel displaying thumbnails of curated artworks.

### 3.2 Image Slicing and Tile Generation

1. **Client-Side CSS Slicing:**
   - Slicing does not require server-side image processing or heavy runtime canvas re-encoding.
   - Each tile is a DOM element rendering the full image as a CSS background:
     - `background-image: url(...)`
     - `background-size: N * 100% N * 100%`
     - `background-position: (col / (N - 1) * 100%) (row / (N - 1) * 100%)`
   - This approach is lightweight, hardware-accelerated, and instant across all device profiles.

### 3.3 Difficulty and Grid Dimensions

1. **Player-Selectable Difficulty Tiers:**
   - **Easy:** $3 \times 3$ grid (9 tiles) — Recommended for casual, quick-play, and initial onboarding.
   - **Medium:** $4 \times 4$ grid (16 tiles) — Balanced challenge offering deeper visual analysis.
   - **Hard:** $5 \times 5$ grid (25 tiles) — Detailed puzzle experience for focused play.
2. **Default Tier:** $3 \times 3$ is the default setting upon first launch.
3. **Difficulty Switching Rules:**
   - Changing difficulty mid-game prompts for confirmation if moves $>0$.
   - Switching difficulty generates a fresh scramble for the current image at the newly chosen grid dimension.
   - Resets the move counter to 0, resets the timer to 00:00, and clears the single-step undo buffer.

### 3.4 Scramble Algorithm and Solvability Guarantee

1. **Permutation Generation:**
   - The puzzle is shuffled using a constrained random permutation.
2. **Non-Trivial Initial State (Derangement):**
   - The shuffle algorithm enforces that no tile starts in its solved position ($\text{currentIndex} \neq \text{originIndex}$ for all tiles), guaranteeing a meaningful challenge from the start.
   - The puzzle cannot generate an already-solved board.
3. **Solvability Guarantee:**
   - Because players can freely swap any two tiles on the board, **every permutation of an $N \times N$ grid is $100\%$ solvable**. Any permutation of $K$ elements can be resolved into the identity permutation via a finite sequence of transpositions (pair swaps).

---

## 4. Game State, Completion, and Controls

### 4.1 Completion Flow

1. **Seamless Picture Reveal:**
   - When the final tile is swapped into place and the win condition is met, the board enters completion mode.
   - Tile borders, gaps, and separation lines smoothly fade to zero ($300\text{ms}$ transition), seamlessly revealing the complete, unfragmented artwork.
2. **Completion Overlay / Card:**
   - A minimalist, warm completion card gently appears below or over the board.
   - Presents:
     - Calming congratulatory phrase (e.g., _"Picture Restored"_).
     - Artwork title (and artist attribution if applicable).
     - Final statistics: total moves taken and elapsed time.
   - Available actions:
     - **"Play Again" / "Replay":** Generates a fresh scramble of the current picture.
     - **"Next Picture":** Advances to the next curated artwork in the collection.
     - **"Choose Picture":** Opens the curated gallery.

### 4.2 Move Counting

1. **Definition of a Move:**
   - Exactly one move is tallied when two distinct tiles ($A \neq B$) are successfully swapped.
2. **Exclusions:**
   - Canceled drags, drags dropped outside the board, or drops back onto the originating slot increment zero moves.
3. **Undo Decrement:**
   - Triggering a single-step undo successfully reverses the previous swap and decrements the move counter by 1.

### 4.3 Minimal HUD (Moves Counter & Timer)

1. **Visual Styling:**
   - Clean, quiet, minimal typography positioned adjacent to the puzzle board.
   - Avoids visual pressure or clutter; uses soft charcoal text (`#6b665f`).
2. **Moves Display:**
   - Displays current move count: `Moves: X` (or simply `X moves`).
3. **Timer Display:**
   - Format: `MM:SS` (e.g., `01:42`).
   - Starts upon the player's first tile interaction (drag start or tap selection).
   - Pauses when the browser tab loses focus or enters the background (`document.hidden` via `visibilitychange`).
   - Resumes seamlessly when the tab returns to the foreground.
   - Stops permanently when the win condition is achieved.
   - Does not rewind or pause during an undo action.

### 4.4 Single-Step Undo Mechanics

1. **Availability:**
   - Single-step undo is available exclusively when at least one move has been made ($\text{moves} > 0$) and a previous swap record exists in memory.
   - Only the immediately preceding swap can be reversed (1-step memory limit).
2. **Execution:**
   - Reverses the positions of the two tiles involved in the last swap with an animated transition.
   - Decrements the move counter by 1.
   - Disables the undo control immediately following execution until a new swap is performed (preventing double-undo).
3. **Edge Cases:**
   - **Post-Completion:** Undo is disabled once the puzzle is completed/locked.
   - **Active Selection:** If a tile is currently selected via tap-to-select, executing undo clears the active selection and reverts the last swap.
   - **Session Reset / Restart:** Restarting or changing difficulty clears the undo history and disables the undo control.
   - **Timer Independence:** Undo alters board position and move count, but does not rewind elapsed time.

### 4.5 Reset / Restart

1. **Restart Action:**
   - Generates a **fresh random scramble** (derangement) of the current image at the current difficulty tier.
   - If moves have been made ($\text{moves} > 0$), a gentle, non-intrusive confirmation avoids accidental loss of progress.
   - Resets move counter to 0.
   - Resets elapsed time to 00:00 (timer restarts upon the player's next move).
   - Clears the single-step undo history.

### 4.6 Reference Preview / Hint

1. **Reference Image Preview:**
   - Players may tap an understated "Preview" or eye icon to view the completed reference image in a subtle overlay or toggle.
   - Keeps the experience accessible and relaxing, especially on complex or abstract artworks.

---

## 5. Visual Direction & Aesthetic Harmony

All UI elements must strictly observe the approved visual direction:

| Principle    | Execution Standard                                                                                                  |
| :----------- | :------------------------------------------------------------------------------------------------------------------ |
| **Clean**    | Uncluttered viewport, generous whitespace, zero visual noise or marketing banners.                                  |
| **Minimal**  | Controls appear only where functionally needed with understated, refined typography.                                |
| **Calming**  | Gentle motion curves ($150\text{--}300\text{ms}$ ease-out); no flashing lights, countdown alarms, or buzzer sounds. |
| **Warm**     | Natural off-whites (`#FAF8F5`, `#F4EFEA`), deep charcoal text (`#262422`), soft stone dividers (`#E5DFD7`).         |
| **Artistic** | The curated picture remains the hero of the screen; UI complements rather than competes.                            |
| **Premium**  | Crisp high-DPI rendering, intentional micro-interactions, smooth touch feedback.                                    |

**Prohibited Elements:**

- No AI-generated decorative avatars, badges, or mascot illustrations.
- No neon gradients, fluorescent accents, or synthetic casino-style win effects.
- No simulated currencies, ads, streaks, or gamified push notifications.

---

## 6. Approved Product Decisions & Technical Specifications

The following 6 product decisions have been formally approved by the Product Owner:

### Decision 1: Tile Swapping Rule — Free Pairwise Swapping

- **Approved Decision:** Free swap between any two distinct tiles on the board.
- **Specification:** Swapping is not restricted to adjacent neighbors. Any tile may be dragged or selected to swap with any other tile on the board.

### Decision 2: Interaction Model — Hybrid Drag & Tap-to-Swap

- **Approved Decision:** Full support for both direct drag-and-drop and tap-to-select/tap-to-swap.
- **Specification:** Players may drag tiles directly or tap one tile to select and tap a second tile to complete the swap. Both modes are active concurrently without requiring a mode switch.

### Decision 3: HUD Display — Minimal Moves Counter and Timer

- **Approved Decision:** Minimal HUD displaying moves and elapsed time.
- **Specification:** Understated typography placed adjacent to the puzzle board. Timer runs in `MM:SS` format, pauses on backgrounding, and stops upon completion.

### Decision 4: Undo Behavior — Single-Step Undo

- **Approved Decision:** Single-step undo.
- **Specification:** Exactly one previous swap can be reversed. Executing undo decrements the move counter by 1 and disables undo until another swap is completed. Undo cannot be triggered twice consecutively or after puzzle completion.

### Decision 5: Restart Behavior — Fresh Scramble

- **Approved Decision:** Restarting generates a fresh scramble for the current image and difficulty.
- **Specification:** Tapping restart produces a newly randomized derangement rather than resetting to the previous scramble layout. Confirmed if moves have been made; resets moves to 0, timer to 00:00, and clears undo.

### Decision 6: Difficulty Tiers — Player-Selectable 3×3, 4×4, 5×5

- **Approved Decision:** Player-selectable difficulty tiers defaulting to 3×3.
- **Specification:** Segmented control or selector allowing $3 \times 3$ (Easy - 9 tiles), $4 \times 4$ (Medium - 16 tiles), and $5 \times 5$ (Hard - 25 tiles). Changing difficulty generates a fresh scramble at the chosen dimension.

---

## 7. Acceptance Criteria (Given / When / Then)

### AC 1: Free Tile Drag and Swap

- **Given** an active puzzle board with scrambled tiles,
- **When** the player drags `Tile A` and drops it onto any distinct `Tile B` (adjacent or non-adjacent),
- **Then** `Tile A` and `Tile B` exchange positions with an ease-out animation, the move counter increments by 1, and single-step undo becomes enabled.

### AC 2: Invalid Drag Recovery

- **Given** an active drag operation with `Tile A`,
- **When** `Tile A` is released outside board boundaries or dropped back onto its starting slot,
- **Then** `Tile A` glides smoothly back to its starting slot, no swap occurs, the move counter does not increment, and previous undo state is preserved.

### AC 3: Tap-to-Select and Tap-to-Swap Interaction

- **Given** no active drag operation,
- **When** the player taps `Tile A` (activating selection highlight) and then taps distinct `Tile B`,
- **Then** `Tile A` and `Tile B` exchange positions, the selection highlight clears, the move counter increments by 1, and single-step undo becomes enabled.

### AC 4: Minimal HUD & Timer Behavior

- **Given** a newly scrambled puzzle with 0 moves,
- **When** the player initiates the first move or tap selection,
- **Then** the timer starts counting upwards (`MM:SS`), the HUD reflects moves accurately, and the timer pauses if the tab enters the background.

### AC 5: Single-Step Undo

- **Given** a puzzle where at least one valid swap has been completed,
- **When** the player taps the Undo control,
- **Then** the most recent swap is reversed with animation, the move counter decrements by 1, and the Undo control becomes disabled until another swap is performed.

### AC 6: Restart with Fresh Scramble

- **Given** an active puzzle with recorded moves,
- **When** the player confirms a Restart action,
- **Then** a fresh random scramble of the current image is generated (no tile in solved position), moves reset to 0, timer resets to 00:00, and undo is disabled.

### AC 7: Player-Selectable Difficulty

- **Given** an active puzzle session,
- **When** the player selects a new difficulty tier ($3 \times 3$, $4 \times 4$, or $5 \times 5$),
- **Then** the board reconfigures to the chosen grid dimension with a freshly scrambled layout of the current image, moves reset to 0, timer resets to 00:00, and undo is disabled.

### AC 8: Win Detection & Board Reveal

- **Given** a puzzle where all tiles except two are in their correct positions and the player performs the final swap,
- **When** the swap completes and all tiles have `currentIndex == originIndex`,
- **Then** input is locked, tile borders/gaps smoothly disappear, the restored image is displayed seamlessly, timer stops, and the completion card appears with total moves and elapsed time.

### AC 9: Mobile Viewport Protection

- **Given** a mobile browser with screen width between $320\text{px}$ and $480\text{px}$,
- **When** dragging tiles or interacting with the game,
- **Then** no horizontal scrollbar or screen overflow occurs, and page refresh/scroll gestures do not disrupt the game board.

---

## 8. Development Roadmap Sequence (Following Phase 1 Approval)

1. **Phase 1 (Completed):** Product Specification and Game Rules approved.
2. **Phase 2 (Next):** Visual Design System, Design Tokens, Typography, Palette, and Mobile-First Component Shell.
3. **Phase 3:** Curated Image Registry, Image Metadata, and CSS Tile Generation Engine.
4. **Phase 4:** Core Drag-and-Swap Interaction Engine, Single-Step Undo, and Game State Store.
5. **Phase 5:** Completion Flow, Timers, Move Tracking, and UI Polish.
