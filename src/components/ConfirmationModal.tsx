import { useEffect } from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      data-testid="confirmation-modal-backdrop"
    >
      <div
        className="modal-card confirmation-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="modal-header">
          <h3 id="confirm-dialog-title" className="modal-title">
            {title}
          </h3>
        </div>

        <p id="confirm-dialog-desc" className="confirm-modal-message">
          {message}
        </p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            data-testid="btn-confirm-cancel"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            autoFocus
            data-testid="btn-confirm-proceed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
