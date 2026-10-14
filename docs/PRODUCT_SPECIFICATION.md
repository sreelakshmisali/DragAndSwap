# DragAndSwap — Product Specification & Game Rules

- **Document Version:** 1.0.0
- **Status:** Pending Product Owner Approval
- **Phase:** Phase 1 (Product Specification and Game Rules)
- **Target Platform:** Mobile-Browser-First Web Application (Responsive to Desktop)

---

## 1. Core Gameplay Mechanics

### 1.1 Grid and Tile Layout

1. The puzzle board is a single, centered square container with a fixed 1:1 aspect ratio.
2. The board is partitioned into an $N \times N$ grid of equal square tiles, where $N$ denotes the difficulty dimension (e.g., $3 \times 3$, $4 \times 4$, $5 \times 5$).
3. Each tile represents an exact sub-region (slice) of the original image:
   - **Original Position (`originIndex`):** The zero-indexed position `(0 ... N^2 - 1)` corresponding to where that slice belongs in the completed image.
   - **Current Position (`currentIndex`):** The zero-indexed position `(0 ... N^2 - 1)` where that tile is currently placed on the board.
4. Exactly one tile occupies each grid slot at any time. There are no blank, empty, or missing tiles (unlike a traditional 15-puzzle sliding block).

### 1.2 Tile Swapping Mechanics

1. **Free Pairwise Swapping:** Any tile on the board may be swapped directly with any other tile on the board, regardless of physical proximity (adjacent or non-adjacent).
2. **The Swap Action:**
   - A player initiates an interaction with a source tile (`Tile A`).
   - The player directs `Tile A` onto a destination tile (`Tile B`).
   - Upon release/confirmation, `Tile A` takes the grid position previously held by `Tile B`, and `Tile B` takes the grid position previously held by `Tile A`.
   - The swap is executed as an atomic state transition.

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

1. **Standard Difficulty Tiers:**
   - **Easy:** $3 \times 3$ grid (9 tiles) — Recommended for casual, quick-play, and initial player onboarding.
   - **Medium:** $4 \times 4$ grid (16 tiles) — Balanced challenge offering deeper visual analysis.
   - **Hard:** $5 \times 5$ grid (25 tiles) — Detailed puzzle experience for focused play.
2. **Default Tier:** $3 \times 3$ is the default setting upon first launch.

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
     - Final statistics: total moves taken and elapsed time (if timer enabled).
   - Available actions:
     - **"Play Again" / "Replay":** Reshuffles the current picture.
     - **"Next Picture":** Advances to the next curated artwork in the collection.
     - **"Choose Picture":** Opens the curated gallery.

### 4.2 Move Counting

1. **Definition of a Move:**
   - Exactly one move is tallied when two distinct tiles ($A \neq B$) are successfully swapped.
2. **Exclusions:**
   - Canceled drags, drags dropped outside the board, or drops back onto the originating slot increment zero moves.
   - If an undo feature is approved, undo behavior will adhere to the agreed rule (see Section 6).

### 4.3 Timer (Play Duration)

1. **Timer Behavior:**
   - Starts upon the player's first tile interaction (drag start or tap).
   - Pauses if the browser tab goes into the background (`visibilitychange`).
   - Stops permanently when the win condition is achieved.
   - Format: `MM:SS` (e.g., `01:42`).

### 4.4 Reference Preview / Hint

1. **Reference Image Preview:**
   - Players may tap an understated "Preview" or eye icon to view the completed reference image in a subtle overlay or toggle.
   - Keeps the experience accessible without frustration, especially on complex or abstract artworks.

### 4.5 Reset / Restart

1. **Restart Action:**
   - Resets the current board.
   - If moves have been made ($>0$), the action provides a clean, non-intrusive confirmation to prevent accidental loss of progress.
   - Resets the move counter to 0 and restarts the timer upon the next move.

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

## 6. Product Owner Decision Matrix (Open Items for Approval)

The following specific product choices are documented with recommended options for your explicit approval:

### Decision Item 1: Tile Swap Scope

- **Option A (Recommended): Free Swap (Any-to-Any).** Any tile can be swapped with any other tile on the board. Provides an intuitive, satisfying, and modern picture reconstruction experience.
- **Option B: Adjacent-Only Swap.** Swapping is restricted to horizontally or vertically neighboring tiles. Creates a more restrictive mathematical challenge.
- _Recommendation: Option A._

### Decision Item 2: Tap-to-Swap Ergonomic Support

- **Option A (Recommended): Support both Drag-and-Drop and Tap-to-Swap.** Drag is natural for visual play; tap is accessible and prevents finger fatigue on mobile screens.
- **Option B: Pure Drag-and-Drop Only.** Only dragging is recognized.
- _Recommendation: Option A._

### Decision Item 3: Move Counter and Timer Visibility

- **Option A (Recommended): Subtle Minimal HUD.** Display moves and time in small, quiet, neutral typography above or below the board.
- **Option B: Zen Mode (Hidden / Toggleable).** Hide timers and move counters by default for a pressure-free contemplative experience, with an option to reveal stats at the end.
- _Recommendation: Option A (or Option A with a Zen toggle)._

### Decision Item 4: Undo Functionality

- **Option A (Recommended): Single-Step Undo.** Allows undoing the most immediate swap. Reversing decrements the move counter by 1.
- **Option B: Multi-Step Undo History.** Unlimited undo back to the initial scrambled state.
- **Option C: No Undo.** Swaps are permanent; players simply swap tiles back manually if they make a mistake.
- _Recommendation: Option A._

### Decision Item 5: Restart / Replay Behavior

- **Option A (Recommended): Reshuffle (New Scramble).** Restarting generates a fresh random scramble of the current image.
- **Option B: Reset to Initial Scramble.** Restores the exact board layout that was presented when the puzzle first loaded.
- _Recommendation: Option A._

### Decision Item 6: Difficulty Selector Placement

- **Option A (Recommended): Segmented control or modal option (`3×3`, `4×4`, `5×5`).** Player can change difficulty anytime, defaulting to `3×3`.
- **Option B: Image-tied difficulty.** Each curated artwork has a predetermined difficulty.
- _Recommendation: Option A._

---

## 7. Acceptance Criteria (Given / When / Then)

### AC 1: Tile Drag and Swap

- **Given** a puzzle board with scrambled tiles,
- **When** the player drags `Tile A` and drops it onto `Tile B`,
- **Then** `Tile A` and `Tile B` exchange positions with a smooth animation, and the move counter increments by 1.

### AC 2: Invalid Drag Recovery

- **Given** an active drag operation with `Tile A`,
- **When** `Tile A` is released outside the boundaries of the board or dropped on its own slot,
- **Then** `Tile A` glides back to its original slot, no swap occurs, and the move counter does not increment.

### AC 3: Tap-to-Swap Interaction

- **Given** no active drag operation,
- **When** the player taps `Tile A` (selecting it) and then taps `Tile B`,
- **Then** `Tile A` and `Tile B` swap positions, the selection is cleared, and the move counter increments by 1.

### AC 4: Win Detection & Board Reveal

- **Given** a puzzle where $N^2 - 1$ tiles are in their correct positions and the player performs the final swap,
- **When** the swap completes and all tiles have `currentIndex == originIndex`,
- **Then** input is locked, tile borders/gaps smoothly disappear, the restored image is displayed seamlessly, and the completion card appears with total moves and time.

### AC 5: Mobile Viewport Protection

- **Given** a mobile browser with screen width between $320\text{px}$ and $480\text{px}$,
- **When** dragging tiles or interacting with the game,
- **Then** no horizontal scrollbar or screen overflow occurs, and page refresh/scroll gestures do not disrupt the game board.

---

## 8. Development Roadmap Sequence (Following Phase 1 Approval)

1. **Phase 1 (Current):** Product Specification and Game Rules approval.
2. **Phase 2:** Visual Design System, Typography, Palette, and Mobile-First Component Foundations.
3. **Phase 3:** Curated Image Registry and Tile Generation Engine.
4. **Phase 4:** Core Drag-and-Swap Interaction Engine and Game State Store.
5. **Phase 5:** Completion Flow, UI Polish, and Edge Case Hardening.
