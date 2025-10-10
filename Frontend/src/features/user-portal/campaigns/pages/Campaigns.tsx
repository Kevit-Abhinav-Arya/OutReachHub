import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CampaignCard from '../components/CampaignCard';
import CampaignModal from '../components/CampaignModal';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import type { Campaign, CopyCampaignRequest } from '../types';
import { selectUser } from '@/features/auth/slices/authSlice';
import { 
  fetchCampaigns,
  launchCampaignAsync,
  deleteCampaignAsync,
  copyCampaignAsync,
  startCampaignProgress,
  clearError
} from '../slices/campaignsSlice';
import type { RootState, AppDispatch } from '@/store';
import './Campaigns.scss';

const Campaigns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const canEdit = user?.type === 'admin' || user?.role === 'Editor';

  const { 
    campaigns, 
    loading, 
    pagination,
    campaignProgress 
  } = useSelector((state: RootState) => state.campaigns);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | 'copy' | 'launch' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [copyName, setCopyName] = useState('');

  // Debounce search term
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        if (searchTerm !== debouncedSearchTerm) {
          pagination.page
        }
      }, 300);
  
      return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);
        useEffect(() => {
          dispatch(fetchCampaigns({ 
            page: pagination.page, 
            limit: 10,
            search: debouncedSearchTerm || undefined 
          }));
        }, [dispatch, pagination.page, debouncedSearchTerm]);


  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCampaignAction = (campaign: Campaign, action: 'view' | 'edit' | 'delete' | 'copy' | 'launch') => {
    // Prevent viewers from performing restricted actions
    if (!canEdit && (action === 'edit' || action === 'delete' || action === 'launch')) {
      return;
    }
    
    setSelectedCampaign(campaign);
    setModalType(action);
    
    if (action === 'copy') {
      setCopyName(`Copy of ${campaign.name}`);
    }
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setModalType(null);
    setIsCreateModalOpen(false);
    setCopyName('');
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      await dispatch(launchCampaignAsync(campaignId)).unwrap();
      dispatch(startCampaignProgress(campaignId));
      closeModal();
    } catch (error) {
      console.error('Failed to launch campaign:', error);
    }
  };

  const handleCopyCampaign = async () => {
    if (!selectedCampaign || !copyName.trim()) return;
    
    try {
      const copyData: CopyCampaignRequest = { newName: copyName.trim() };
      await dispatch(copyCampaignAsync({ id: selectedCampaign.id, copyData })).unwrap();
      closeModal();
    } catch (error) {
      console.error('Failed to copy campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await dispatch(deleteCampaignAsync(campaignId)).unwrap();
      closeModal();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const showPages = 5; 
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button 
          className="page-btn" 
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {startPage > 1 && (
          <>
            <button className="page-btn" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="page-ellipsis">...</span>}
          </>
        )}
        {pages}
        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="page-ellipsis">...</span>}
            <button className="page-btn" onClick={() => handlePageChange(pagination.totalPages)}>
              {pagination.totalPages}
            </button>
          </>
        )}
        <button 
          className="page-btn"
          disabled={currentPage === pagination.totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  return (
    <main className="campaigns-container">
      {/* Header Section */} 
      <div className="campaigns-header">
        <div className="header-content">
          <h1>Campaigns</h1>
          {!canEdit && (
            <div className="view-only-indicator">
              <i className="fas fa-eye"></i>
              <span>View Only</span>
            </div>
          )}
        </div>
        {canEdit && (
          <button className="create-campaign-btn" onClick={() => setIsCreateModalOpen(true)}>
            <i className="fas fa-plus"></i> Create Campaign
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

     

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading campaigns...</span>
        </div>
      )}

      {/* Campaigns List */}
      <div className="campaigns-list">
        {!loading && campaigns.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bullhorn fa-3x"></i>
            <h3>No campaigns found</h3>
            <p>Create your first campaign to get started with outreach.</p>
            {canEdit && (
              <button className="create-campaign-btn" onClick={() => setIsCreateModalOpen(true)}>
                <i className="fas fa-plus"></i> Create Campaign
              </button>
            )}
          </div>
        ) : (
          campaigns.map((campaign: Campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              canEdit={canEdit}
              onAction={handleCampaignAction}
              progress={campaignProgress[campaign.id]}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && campaigns.length > 0 && renderPagination()}

      {/* Modals */}
      {isCreateModalOpen && (
        <CampaignModal
          type="create"
          onClose={closeModal}
        />
      )}

      {selectedCampaign && modalType === 'view' && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={closeModal}
        />
      )}

      {selectedCampaign && modalType === 'edit' && (
        <CampaignModal
          type="edit"
          campaign={selectedCampaign}
          onClose={closeModal}
        />
      )}

      {selectedCampaign && modalType === 'delete' && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Campaign</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <i className="fas fa-exclamation-triangle warning-icon"></i>
              <p>Are you sure you want to delete</p>
              <div className="campaign-name">{selectedCampaign.name}</div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="delete-btn" 
                onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaign && modalType === 'copy' && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="copy-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Copy Campaign</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="copy-icon">
                <i className="fas fa-copy"></i>
              </div>
              <p>Create a copy of</p>
              <div className="campaign-name">{selectedCampaign.name}</div>
              <div className="form-group">
                <label htmlFor="copyName">New Campaign Name *</label>
                <input 
                  type="text"
                  id="copyName"
                  name="copyName"
                  value={copyName}
                  onChange={(e) => setCopyName(e.target.value)}
                  placeholder="Enter name for the copy"
                  className={!copyName.trim() && copyName !== '' ? 'error' : ''}
                />
                {!copyName.trim() && copyName !== '' && (
                  <span className="error-message">Campaign name is required</span>
                )}
              </div>
              <p className="info-text">The copy will be created as a draft with the same configuration.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="copy-btn" 
                onClick={handleCopyCampaign}
                disabled={loading || !copyName.trim()}
              >
                {loading ? 'Copying...' : 'Copy Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaign && modalType === 'launch' && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal confirm-modal">
            <h3>Launch Campaign</h3>
            <p>Launch "<strong>{selectedCampaign.name}</strong>"?</p>
            <div className="launch-summary">
              <div className="summary-item">
                <span>Target Tags:</span>
                <span>{selectedCampaign.targetTags.join(', ')}</span>
              </div>
              <div className="summary-item">
                <span>Message Template:</span>
                <span>{selectedCampaign.template?.name || 'Unknown'}</span>
              </div>
            </div>
            <p className="warning">Once launched, this campaign cannot be edited.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="launch-btn" 
                onClick={() => handleLaunchCampaign(selectedCampaign.id)}
                disabled={loading}
              >
                {loading ? 'Launching...' : 'Launch Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Campaigns;
