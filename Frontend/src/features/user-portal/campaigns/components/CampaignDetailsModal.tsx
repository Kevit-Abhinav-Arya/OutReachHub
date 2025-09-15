import React from 'react';
import type { Campaign } from '../types';
import './CampaignDetailsModal.scss';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ campaign, onClose }) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
        case 'draft': return '#ffd700';
        case 'running': return '#00b4d8';
        case 'completed': return '#4ade80';
        default: return '#64ffda';
        }
    };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'fa-edit';
      case 'running': return 'fa-play-circle';
      case 'completed': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  };



  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal campaign-details-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>{campaign.name}</h2>
            <div className="campaign-status">
              <span 
                className={`status-badge ${campaign.status}`}
                style={{ backgroundColor:   getStatusColor(campaign.status) }}
              >
                <i className={`fas ${getStatusIcon(campaign.status)}`}></i>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
            <div className="overview-content">
              {campaign.progress !== undefined && campaign.status === 'running' && (
                <div className="progress-section">
                  <div className="progress-header">
                    <h3>Campaign Progress</h3>
                    <span>{Math.round(campaign.progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {campaign.progress < 100 ? 'Campaign is currently running...' : 'Campaign completed!'}
                  </p>
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{campaign.contactsTargeted}</h3>
                    <p>Contacts Targeted</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{campaign.messagesSent}</h3>
                    <p>Messages Sent</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{campaign.messagesDelivered}</h3>
                    <p>Messages Delivered</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{campaign.messagesFailed}</h3>
                    <p>Messages Failed</p>
                  </div>
                </div>
              </div>

              <div className="campaign-info">
                <div className="info-section">
                  <h3>Campaign Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Description:</span>
                      <span className="info-value">{campaign.description || 'No description'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Target Tags:</span>
                      <div className="tags-container">
                        {campaign.targetTags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Message Template:</span>
                      <span className="info-value">
                        {campaign.messageTemplateName}
                        <span className='tags-container'>
                        <span className='tag'>
                          {campaign.messageTemplateType === 'text-image' ? 'Text + Image' : 'Text'}
                        </span>
                        </span>

                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Timeline</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon">
                        <i className="fas fa-plus"></i>
                      </div>
                      <div className="timeline-content">
                        <h4>Campaign Created</h4>
                        <p>{formatDate(campaign.createdAt)}</p>
                      </div>
                    </div>
                    {campaign.launchedAt && (
                      <div className="timeline-item">
                        <div className="timeline-icon launched">
                          <i className="fas fa-rocket"></i>
                        </div>
                        <div className="timeline-content">
                          <h4>Campaign Launched</h4>
                          <p>{formatDate(campaign.launchedAt)}</p>
                        </div>
                      </div>
                    )}
                    {campaign.completedAt && (
                      <div className="timeline-item">
                        <div className="timeline-icon completed">
                          <i className="fas fa-check"></i>
                        </div>
                        <div className="timeline-content">
                          <h4>Campaign Completed</h4>
                          <p>{formatDate(campaign.completedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsModal;
