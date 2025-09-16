import React from 'react';
import type { Workspace } from '../types';
import './WorkspaceCard.scss';

interface WorkspaceCardProps {
  workspace: Workspace;
  onAction: (workspace: Workspace, action: 'view' | 'edit' | 'delete' | 'manage-users') => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onAction }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="workspace-card">
      <div className="workspace-card-header">
        <div className="workspace-info">
          <div className="workspace-name-section">
            <h3 className="workspace-name">{workspace.name}</h3>
          </div>
        </div>
        <div className="workspace-actions">
          <button
            className="action-btn"
            onClick={() => onAction(workspace, 'manage-users')}
            title="Manage Users"
          >
            <i className="fas fa-users"></i>
          </button>
          <button
            className="action-btn"
            onClick={() => onAction(workspace, 'edit')}
            title="Edit Workspace"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="action-btn delete"
            onClick={() => onAction(workspace, 'delete')}
            title="Delete Workspace"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      {/* Only showing stats that are available from backend */}
      <div className="workspace-stats">
        {workspace.usersCount !== undefined && (
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <span className="stat-value">{workspace.usersCount}</span>
              <span className="stat-label">Users</span>
            </div>
          </div>
        )}
      </div>

      <div className="workspace-footer">
        <div className="workspace-meta">
          <div className="created-date">
            <i className="fas fa-calendar-plus"></i>
            <span>Created {formatDate(workspace.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
