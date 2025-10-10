import React from 'react';
import { createPortal } from 'react-dom';
import './DeleteModal.scss';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-exclamation-triangle"></i>
            {title}
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={isDeleting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          
          <h3>Are you sure?</h3>
          <p>{message}</p>
          
          <div className="workspace-name">
            "{itemName}"
          </div>
          
          <div className="warning-text">
            <i className="fas fa-info-circle"></i>
            This action cannot be undone.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="btn-spinner"></div>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteModal;