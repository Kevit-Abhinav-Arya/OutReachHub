import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store';
import type { Workspace, WorkspaceUser } from '../types';
import { fetchWorkspaceUsers } from '../../slices/workspacesSlice';
import DeleteModal from './DeleteModal';
import './UserManagementModal.scss';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onUpdateUser: (userId: string, userData: Partial<WorkspaceUser>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onCreateUser: (userData: CreateUserData) => Promise<void>;
}

interface EditingUser {
  id: string;
  name: string;
  email: string;
  role: 'Editor' | 'Viewer';
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'Editor' | 'Viewer';
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'Editor' | 'Viewer';
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onUpdateUser,
  onDeleteUser,
  onCreateUser
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const workspaceUsers = useSelector((state: RootState) => state.workspaces.workspaceUsers);
  const workspaceUsersLoading = useSelector((state: RootState) => state.workspaces.workspaceUsersLoading);
  
  // Local UI state
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'Viewer'
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch workspace users when modal opens
  useEffect(() => {
    if (isOpen && workspace?.id) {
      dispatch(fetchWorkspaceUsers({ workspaceId: workspace.id }));
    }
  }, [isOpen, workspace?.id, dispatch]);

  const handleEditUser = (user: WorkspaceUser) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await onUpdateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: WorkspaceUser) => {
    setUserToDelete({ id: user.id, name: user.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteUser(userToDelete.id);
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateUser(newUser);
      
      setIsAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Viewer'
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="user-management-modal">
          <div className="modal-header">
            <h2>
              <i className="fas fa-users"></i>
              Manage Users - {workspace.name}
            </h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="modal-body">{workspaceUsersLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <>
                <div className="users-header">
                  <div className="users-count">
                    <span className="count">{workspaceUsers.length}</span>
                    <span className="label">Users in workspace</span>
                  </div>
                  <button 
                    className="add-user-btn"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Add User
                  </button>
                </div>

                <div className="users-list">
                  {workspaceUsers.map((user: WorkspaceUser) => (
                    <div key={user.id} className="user-card">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.name}
                          </div>
                          <div className="user-email">{user.email}</div>
                          <div className="user-meta">
                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditUser(user)}
                          disabled={workspaceUsersLoading}
                          title="Edit User"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                                                <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(user)}
                          disabled={workspaceUsersLoading}
                          title="Delete User"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {workspaceUsers.length === 0 && (
                  <div className="empty-state">
                    <i className="fas fa-users fa-3x"></i>
                    <h3>No users found</h3>
                    <p>This workspace doesn't have any users yet.</p>
                    <button 
                      className="add-user-btn"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <i className="fas fa-plus"></i>
                      Add First User
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && editingUser && (
        <div 
          className="modal-overlay edit-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditModalOpen(false);
              setEditingUser(null);
            }
          }}
        >
          <div className="user-management-modal edit-user-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-edit"></i>
                Edit User
              </h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => 
                      prev ? { ...prev, email: e.target.value } : null
                    )}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser(prev => 
                      prev ? { ...prev, role: e.target.value as 'Editor' | 'Viewer' } : null
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={handleUpdateUser}
                disabled={isSubmitting || !editingUser.name || !editingUser.email}
              >
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Update User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div 
          className="modal-overlay edit-modal-overlay"
          onClick={(event) => {
            // Only close if the click is directly on the overlay
            if (event.target === event.currentTarget) {
              setIsAddModalOpen(false);
              setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'Viewer'
              });
            }
          }}
        >
          <div className="user-management-modal edit-user-modal">
            <div className="modal-header">
              <h2>
                <i className="fas fa-user-plus"></i>
                Add New User
              </h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'Viewer'
                  });
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="newUserName">Name</label>
                  <input
                    type="text"
                    id="newUserName"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => 
                      ({ ...prev, name: e.target.value })
                    )}
                    placeholder="Enter user name..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newUserEmail">Email</label>
                  <input
                    type="email"
                    id="newUserEmail"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => 
                      ({ ...prev, email: e.target.value })
                    )}
                    placeholder="Enter email address..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newUserPassword">Password</label>
                  <input
                    type="password"
                    id="newUserPassword"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => 
                      ({ ...prev, password: e.target.value })
                    )}
                    placeholder="Enter password..."
                    disabled={isSubmitting}
                  />
                  <small className="password-hint">
                    Password must be 5-15 characters long and include uppercase, lowercase, number, and special character.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="newUserRole">Role</label>
                  <select
                    id="newUserRole"
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => 
                      ({ ...prev, role: e.target.value as 'Editor' | 'Viewer' })
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'Viewer'
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={handleCreateUser}
                disabled={isSubmitting || !newUser.name || !newUser.email || !newUser.password}
              >
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message="You are about to remove this user from the workspace. They will lose access to all workspace data and resources."
          itemName={userToDelete.name}
          isDeleting={isDeleting}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default UserManagementModal;
