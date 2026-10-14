# Project Overview: DragAndSwap

## Product Purpose

DragAndSwap is a picture puzzle game designed for mobile browsers. The game presents players with a fragmented image divided into square tiles. Players reconstruct the original picture by dragging one tile onto another to swap their positions until the entire image is correctly assembled.

## Core Mechanic: Drag-and-Swap

- The puzzle board consists of square tiles forming a grid.
- Players interact by dragging a tile and dropping it directly onto another tile.
- When dropped, the two tiles exchange positions (drag-and-swap).
- The objective is to restore the complete picture.

## Release Target: Mobile-Browser-First

- Designed and optimized primarily for mobile web browsers.
- Viewports and layout are structured to prevent horizontal overflow on narrow screens.
- Touch-friendly layout and interaction considerations are central to the product architecture.

## Approved Visual Direction

The visual experience follows these explicit principles:

- **Clean**: Uncluttered interfaces prioritizing image visibility.
- **Minimal**: Purposeful elements without superfluous UI ornamentation.
- **Calming**: Low-stress, thoughtful experience.
- **Warm**: Welcoming, comfortable color tones and atmosphere.
- **Artistic**: Emphasis on aesthetic quality and curated imagery.
- **Premium**: Polished, intentional, human-designed visual conventions.

### Explicit Visual Constraints

- No AI-generated decorative assets or icons.
- No fake branding.
- No meaningless gradients or generic AI-style UI tropes.
- No unnecessary decorative illustrations.

## Image Asset Strategy: Curated Image Library

- The game will initially utilize a curated collection of image assets stored locally within the application (`public/images/`).
- Initial releases do not rely on user uploads, dynamic external image scraping, or third-party image hosting services.

## Architecture: No-Backend Initial Release

- Fully client-side application running in the browser.
- No server-side backend, database, authentication, or paid external APIs are required for the initial release.

## Explicit Phase 0 Boundaries

Phase 0 is strictly limited to establishing the project foundation:

- Application scaffolding with React, Vite, and TypeScript.
- Strict type-checking, linting, and formatting tools.
- Target directory hierarchy.
- Minimal, neutral application shell with proper viewport configuration.
- Comprehensive documentation of environment and roadmap setup.

No puzzle boards, mechanics, image collections, or game loops are implemented in Phase 0.
