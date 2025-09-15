import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  selectWorkspace,
  selectUser,
  selectAvailableWorkspaces,
  selectTempToken,
  selectIsLoading,
  selectError,
  selectRequiresWorkspaceSelection,
  clearError
} from '../slices/authSlice';
import './WorkspaceSelection.scss';

const WorkspaceSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const tempToken = useAppSelector(selectTempToken);
  
  const user = useAppSelector(selectUser);
  const availableWorkspaces = useAppSelector(selectAvailableWorkspaces);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const requiresWorkspaceSelection = useAppSelector(selectRequiresWorkspaceSelection);
  
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  useEffect(() => {
    if (!requiresWorkspaceSelection) {
      navigate('/login');
    }
  }, [requiresWorkspaceSelection, navigate]);

  // Clear errors when selection changes
  useEffect(() => {
    dispatch(clearError());
    setLocalError('');
  }, [selectedWorkspaceId, dispatch]);

  const handleWorkspaceSelect = async () => {
    if (!selectedWorkspaceId) {
      setLocalError('Please select a workspace');
      return;
    }

    setLocalError('');

    try {
      const result = await dispatch(selectWorkspace({
        tempToken: tempToken || '',
        workspaceId: selectedWorkspaceId
      }));

      if (selectWorkspace.fulfilled.match(result)) {
        navigate('/');
      }
    } catch (error) {
      console.error('Workspace selection failed:', error);
    }
  };



  if (!user) {
    return (
      <div className="workspace-selection-background">
        <div className="workspace-container">
          <div className="error-message">
            <i className="fa-solid fa-triangle-exclamation error-icon"></i>
            User information not found. Please log in again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-selection-container">
      <div className="workspace-selection-card">
        <div className="header">
          <h1>Select Workspace</h1>
          <p>Hello {user?.name || user?.email}! You have access to multiple workspaces. Please select one to continue.</p>
        </div>

        {(error || localError) && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error || localError}
          </div>
        )}

        <div className="workspaces-list">
          {availableWorkspaces.map((workspace: any) => (
            <div
              key={workspace.workspaceId}
              className={`workspace-item ${
                selectedWorkspaceId === workspace.workspaceId ? 'selected' : ''
              }`}
              onClick={() => setSelectedWorkspaceId(workspace.workspaceId)}
            >
              <div className="workspace-info">
                <h3>{workspace.name}</h3>
                <span className={`role-badge ${workspace.role.toLowerCase()}`}>
                  {workspace.role}
                </span>
              </div>
              <div className="workspace-icon">
                {selectedWorkspaceId === workspace.workspaceId ? (
                  <span className="check-icon">✓</span>
                ) : (
                  <span className="arrow-icon">→</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          
          
          <button
            type="button"
            className="btn-primary"
            onClick={handleWorkspaceSelect}
            disabled={!selectedWorkspaceId || isLoading}
          >
            {isLoading ? 'Connecting...' : 'Continue'}
          </button>
        </div>

        <div className="session-info">
          <p>⏱️ For security, this session will expire in 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelection;