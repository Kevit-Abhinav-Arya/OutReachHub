import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CampaignCard from '../components/CampaignCard';
import CampaignModal from '../components/CampaignModal';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import type { Campaign } from '../types';
import { selectUser } from '@/features/auth/slices/authSlice';
import './Campaigns.scss';

const Campaigns: React.FC = () => {
  const user = useSelector(selectUser);
  const canEdit = user?.type === 'admin' || user?.role === 'Editor';

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Product Launch',
      description: 'Promote our new summer collection to premium customers',
      status: 'completed',
      targetTags: ['Premium', 'Customer'],
      messageTemplateId: '1',
      messageTemplateName: 'Summer Launch Template',
      messageTemplateType: 'text-image',
      contactsTargeted: 150,
      messagesSent: 148,
      messagesDelivered: 142,
      messagesFailed: 6,
      createdAt: '2024-08-15T10:00:00Z',
      updatedAt: '2024-08-15T14:30:00Z',
      launchedAt: '2024-08-15T11:00:00Z',
      completedAt: '2024-08-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Weekly Newsletter',
      description: 'Weekly updates for all subscribers',
      status: 'running',
      targetTags: ['Newsletter', 'Active'],
      messageTemplateId: '2',
      messageTemplateName: 'Weekly Newsletter Template',
      messageTemplateType: 'text',
      contactsTargeted: 300,
      messagesSent: 180,
      messagesDelivered: 175,
      messagesFailed: 5,
      createdAt: '2024-09-01T09:00:00Z',
      updatedAt: '2024-09-09T10:30:00Z',
      launchedAt: '2024-09-09T10:00:00Z',
      progress: 60
    },
    {
      id: '3',
      name: 'Tech Support Follow-up',
      description: 'Follow up with customers who contacted support',
      status: 'draft',
      targetTags: ['Support', 'Tech'],
      messageTemplateId: '3',
      messageTemplateName: 'Support Follow-up Template',
      messageTemplateType: 'text',
      contactsTargeted: 45,
      messagesSent: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      createdAt: '2024-09-08T15:30:00Z',
      updatedAt: '2024-09-08T15:30:00Z'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | 'copy' | 'launch' | null>(null);


  // Polling for running campaigns
  useEffect(() => {
    const runningCampaigns = campaigns.filter(c => c.status === 'running');
    if (runningCampaigns.length > 0) {
      const interval = setInterval(() => {
        // Simulate progress updates for running campaigns
        setCampaigns(prevCampaigns => 
          prevCampaigns.map(campaign => {
            if (campaign.status === 'running' && campaign.progress !== undefined) {
              const newProgress = Math.min(100, (campaign.progress || 0) + Math.random() * 5);
              if (newProgress >= 100) {
                return {
                  ...campaign,
                  status: 'completed' as const,
                  progress: 100,
                  completedAt: new Date().toISOString()
                };
              }
              return { ...campaign, progress: newProgress };
            }
            return campaign;
          })
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [campaigns]);

  const handleCampaignAction = (campaign: Campaign, action: 'view' | 'edit' | 'delete' | 'copy' | 'launch') => {
    // Prevent viewers from performing restricted actions
    if (!canEdit && (action === 'edit' || action === 'delete' || action === 'launch')) {
      return;
    }
    
    setSelectedCampaign(campaign);
    setModalType(action);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setModalType(null);
    setIsCreateModalOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleLaunchCampaign = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status: 'running' as const,
              launchedAt: new Date().toISOString(),
              progress: 0
            }
          : campaign
      )
    );
    closeModal();
  };

  const handleCopyCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `Copy of ${campaign.name}`,
      status: 'draft',
      messagesSent: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: undefined,
      completedAt: undefined,
      progress: undefined
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    closeModal();
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    closeModal();
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
          <input type="text" placeholder="Search campaigns..." />
        </div>
      </div>

      {/* Campaigns List */}
      <div className="campaigns-list">
        {campaigns.length === 0 ? (
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
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {campaigns.length > 0 && (
        <div className="pagination">
          <button className="page-btn" disabled>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="page-ellipsis">...</span>
          <button className="page-btn">10</button>
          <button className="page-btn">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CampaignModal
          type="create"
          onClose={closeModal}
          onSave={(campaign: Partial<Campaign>) => {
            const newCampaign: Campaign = {
              ...campaign,
              id: Date.now().toString(),
              status: 'draft',
              messagesSent: 0,
              messagesDelivered: 0,
              messagesFailed: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as Campaign;
            setCampaigns(prev => [newCampaign, ...prev]);
            closeModal();
          }}
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
          onSave={(updatedCampaign: Partial<Campaign>) => {
            setCampaigns(prev =>
              prev.map(c =>
                c.id === selectedCampaign.id
                  ? { ...c, ...updatedCampaign, updatedAt: new Date().toISOString() }
                  : c
              )
            );
            closeModal();
          }}
        />
      )}

      {selectedCampaign && modalType === 'delete' && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal confirm-modal">
            <h3>Delete Campaign</h3>
            <p>Are you sure you want to delete "<strong>{selectedCampaign.name}</strong>"?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="delete-btn" 
                onClick={() => handleDeleteCampaign(selectedCampaign.id)}
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaign && modalType === 'copy' && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal confirm-modal">
            <h3>Copy Campaign</h3>
            <p>Create a copy of "<strong>{selectedCampaign.name}</strong>"?</p>
            <p>The copy will be created as a draft with the same configuration.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="confirm-btn" 
                onClick={() => handleCopyCampaign(selectedCampaign)}
              >
                Create Copy
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
                <span>Contacts Targeted:</span>
                <span>{selectedCampaign.contactsTargeted}</span>
              </div>
              <div className="summary-item">
                <span>Message Template:</span>
                <span>{selectedCampaign.messageTemplateName}</span>
              </div>
            </div>
            <p className="warning">Once launched, this campaign cannot be edited.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className="launch-btn" 
                onClick={() => handleLaunchCampaign(selectedCampaign.id)}
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Campaigns;
