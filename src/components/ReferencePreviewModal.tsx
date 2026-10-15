import type { PuzzleImage } from '@/types/puzzle';

export interface ReferencePreviewModalProps {
  isOpen: boolean;
  image: PuzzleImage;
  onClose: () => void;
}

export function ReferencePreviewModal({
  isOpen,
  image,
  onClose,
}: ReferencePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Reference image preview"
      data-testid="reference-modal"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3 className="modal-title">{image.title}</h3>
            {image.artist && <p className="modal-artist">{image.artist}</p>}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </header>
        <div className="modal-image-wrapper">
          <img
            src={image.filename}
            alt={image.title}
            className="modal-reference-image"
          />
        </div>
      </div>
    </div>
  );
}
