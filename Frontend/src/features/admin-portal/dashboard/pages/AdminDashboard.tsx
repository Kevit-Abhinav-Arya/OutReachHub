import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import EditWorkspaceModal from '../components/EditWorkspaceModal';
import UserManagementModal from '../components/UserManagementModal';
import DeleteModal from '../components/DeleteModal';
import {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchWorkspaceUsers,
  createWorkspaceUser,
  updateWorkspaceUser,
  deleteWorkspaceUser,
  setCurrentWorkspace,
  clearWorkspaceUsers,
} from '../../slices/workspacesSlice';
import type { Workspace, WorkspaceUser, CreateWorkspaceUserRequest } from '../../slices/workspacesSlice';
import './AdminDashboard.scss';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const {
    workspaces,
    workspacesPagination,
    workspacesLoading,
    currentWorkspace,
  } = useSelector((state: RootState) => state.workspaces);

  // Local UI state  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaces({ 
      page: currentPage, 
      limit: 10,
      search: debouncedSearchTerm || undefined 
    }));
  }, [dispatch, currentPage, debouncedSearchTerm]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (workspacesPagination && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (workspacesPagination && currentPage < workspacesPagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  const handleWorkspaceAction = (workspace: Workspace, action: 'view' | 'edit' | 'delete' | 'manage-users') => {
    
    switch (action) {
      case 'edit':
        setEditingWorkspace(workspace);
        setIsEditModalOpen(true);
        break;
      case 'manage-users':
        setSelectedWorkspace(workspace);
        dispatch(setCurrentWorkspace(workspace));
        dispatch(fetchWorkspaceUsers({ workspaceId: workspace.id }));
        setIsUserModalOpen(true);
        break;
      case 'delete':
        setWorkspaceToDelete(workspace);
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleCreateWorkspace = async (workspaceName: string) => {
    try {
      await dispatch(createWorkspace({ name: workspaceName })).unwrap();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleEditWorkspace = async (workspaceName: string) => {
    if (!editingWorkspace) return;
    
    try {
      await dispatch(updateWorkspace({ 
        id: editingWorkspace.id, 
        data: { name: workspaceName } 
      })).unwrap();
      setIsEditModalOpen(false);
      setEditingWorkspace(null);
    } catch (error) {
      console.error('Error updating workspace:', error);
    }
  };

  // User management functions
  const handleUpdateUser = async (userId: string, userData: Partial<WorkspaceUser>) => {
    if (!currentWorkspace) return;
    
    try {
      await dispatch(updateWorkspaceUser({
        workspaceId: currentWorkspace.id,
        userId,
        data: userData
      })).unwrap();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentWorkspace) return;
    
    try {
      await dispatch(deleteWorkspaceUser({
        workspaceId: currentWorkspace.id,
        userId
      })).unwrap();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async (userData: CreateWorkspaceUserRequest) => {
    if (!currentWorkspace) return;
    
    try {
      await dispatch(createWorkspaceUser({
        workspaceId: currentWorkspace.id,
        data: userData
      })).unwrap();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedWorkspace(null);
    dispatch(clearWorkspaceUsers());
  };

  // Delete modal functions
  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteWorkspace(workspaceToDelete.id)).unwrap();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting workspace:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setWorkspaceToDelete(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWorkspace(null);
  };


  return (
    <main className="admin-dashboard-container">
      {/* Header Section */}
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage workspaces, users, and monitor platform activity</p>
        </div>
        <div className="header-actions">
          <button className="create-workspace-btn" onClick={openCreateModal}>
            <i className="fas fa-plus"></i> Create Workspace
          </button>
        </div>
      </div>


      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Workspaces Section */}
        <div className="workspaces-section">
          <div className="section-header">
            <h2>Workspaces</h2>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Workspaces List */}
          <div className="workspaces-list">
            {workspacesLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading workspaces...</p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-building fa-3x"></i>
                <h3>No workspaces found</h3>
                <p>
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Create your first workspace to get started'
                  }
                </p>
                {!searchTerm && (
                  <button className="create-workspace-btn" onClick={openCreateModal}>
                    <i className="fas fa-plus"></i> Create Workspace
                  </button>
                )}
              </div>
            ) : (
              workspaces.map((workspace: Workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onAction={handleWorkspaceAction}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {workspacesPagination && workspacesPagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={handlePrevPage}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, workspacesPagination.totalPages) }, (_, i) => {
                let pageNum;
                if (workspacesPagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= workspacesPagination.totalPages - 2) {
                  pageNum = workspacesPagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button 
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {workspacesPagination.totalPages > 5 && currentPage < workspacesPagination.totalPages - 2 && (
                <>
                  <span className="page-ellipsis">...</span>
                  <button 
                    className="page-btn"
                    onClick={() => handlePageChange(workspacesPagination.totalPages)}
                  >
                    {workspacesPagination.totalPages}
                  </button>
                </>
              )}
              
              <button 
                className="page-btn"
                disabled={currentPage === workspacesPagination.totalPages}
                onClick={handleNextPage}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateWorkspace}
      />

      {/* Edit Workspace Modal */}
      {editingWorkspace && (
        <EditWorkspaceModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditWorkspace}
          workspace={editingWorkspace}
        />
      )}

      {/* User Management Modal */}
      {selectedWorkspace && (
        <UserManagementModal
          isOpen={isUserModalOpen}
          onClose={closeUserModal}
          workspace={selectedWorkspace}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onCreateUser={handleCreateUser}
        />
      )}

      {/* Delete Workspace Modal */}
      {workspaceToDelete && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteWorkspace}
          title="Delete Workspace"
          message="You are about to delete this workspace. All data associated with this workspace will be permanently removed."
          itemName={workspaceToDelete.name}
          isDeleting={isDeleting}
        />
      )}

     
    </main>
  );
};

export default AdminDashboard;