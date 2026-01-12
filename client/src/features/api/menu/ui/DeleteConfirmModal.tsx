import './style.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  foodName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  foodName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirm-icon">🗑️</div>
        <h2 className="delete-confirm-title">Подтвердите удаление</h2>
        <p className="delete-confirm-message">
          Вы уверены, что хотите удалить <span className="delete-confirm-message-food-name">"{foodName}"</span>?
        </p>
        <p className="delete-confirm-warning">
          Это действие нельзя отменить.
        </p>
        <div className="delete-confirm-actions">
          <button
            type="button"
            onClick={onCancel}
            className="delete-confirm-button delete-confirm-button-cancel"
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="delete-confirm-button delete-confirm-button-confirm"
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};

