import type { PuzzleImage } from '@/types/puzzle';

export const CURATED_IMAGES: readonly PuzzleImage[] = [
  {
    id: 'warm-sanctuary',
    title: 'Warm Sanctuary',
    filename: '/images/warm-sanctuary.svg',
    artist: 'DragAndSwap Studio',
    attribution: 'Original Vector Artwork',
  },
  {
    id: 'geometric-dawn',
    title: 'Geometric Dawn',
    filename: '/images/geometric-dawn.svg',
    artist: 'DragAndSwap Studio',
    attribution: 'Original Vector Artwork',
  },
];

export const DEFAULT_IMAGE: PuzzleImage = CURATED_IMAGES[0];
