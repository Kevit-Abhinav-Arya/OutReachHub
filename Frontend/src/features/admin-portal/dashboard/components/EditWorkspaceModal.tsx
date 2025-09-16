import React, { useState, useEffect } from 'react';
import type { Workspace } from '../types';
import './EditWorkspaceModal.scss';

interface EditWorkspaceModalProps {
  isOpen: boolean;
  workspace: Workspace | null;
  onClose: () => void;
  onSubmit: (workspaceId: string, workspaceName: string) => void;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
  isOpen,
  workspace,
  onClose,
  onSubmit
}) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial workspace name when modal opens
  useEffect(() => {
    if (isOpen && workspace) {
      setWorkspaceName(workspace.name);
    }
  }, [isOpen, workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceName.trim() || !workspace) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(workspace.id, workspaceName.trim());
      onClose();
    } catch (error) {
      console.error('Error updating workspace:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWorkspaceName('');
      onClose();
    }
  };

  if (!isOpen || !workspace) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Workspace</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-workspace-form">
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="editWorkspaceName">Workspace Name</label>
              <input
                id="editWorkspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name..."
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !workspaceName.trim() || workspaceName.trim() === workspace.name}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkspaceModal;
