import React from 'react';
import { useSelector } from 'react-redux';
import type { Campaign } from '../types';
import type { RootState } from '@/store';
import './CampaignDetailsModal.scss';

interface CampaignDetailsModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ campaign, onClose }) => {
  const { campaignProgress } = useSelector((state: RootState) => state.campaigns);

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
      case 'Draft': return '#ffd700';
      case 'Running': return '#00b4d8';
      case 'Completed': return '#4ade80';
      default: return '#64ffda';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'Draft': return 'fa-edit';
      case 'Running': return 'fa-play-circle';
      case 'Completed': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  };

  const progress = campaignProgress[campaign.id];
  const showProgress = campaign.status === 'Running' || progress?.status === 'running' || progress?.status === 'launching';
  const currentProgress = progress?.progress || (campaign.status === 'Running' ? 50 : 0);

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
                className={`status-badge ${campaign.status.toLowerCase()}`}
                style={{ backgroundColor: getStatusColor(campaign.status) }}
              >
                <i className={`fas ${getStatusIcon(campaign.status)}`}></i>
                {campaign.status}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
            <div className="overview-content">
              {showProgress && (
                <div className="progress-section">
                  <div className="progress-header">
                    <h3>Campaign Progress</h3>
                    <span>{Math.round(currentProgress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${currentProgress}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {progress?.status === 'launching' ? 'Campaign is launching...' :
                     progress?.status === 'running' ? 'Campaign is currently running...' :
                     currentProgress >= 100 ? 'Campaign completed!' : 'Campaign in progress...'}
                  </p>
                </div>
              )}

              <div className="campaign-info">
                <div className="info-section">
                  <h3>Campaign Details</h3>
                  <div className="info-grid">
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
                        {campaign.template?.name || 'Unknown Template'}
                        <span className='tags-container'>
                        <span className='tag'>
                          {campaign.template?.type || 'Text'}
                        </span>
                        </span>
                      </span>
                    </div>
                    {campaign.template?.imageUrl && campaign.template.type === 'Text & Image' && (
                      <div className="info-item template-image-item">
                        <span className="info-label">Template Image:</span>
                        <div className="template-image-preview">
                          <img src={campaign.template.imageUrl} alt="Template" />
                        </div>
                      </div>
                    )}
                    {campaign.template?.body && (
                      <div className="info-item template-content-item">
                        <span className="info-label">Template Content:</span>
                          <div className="form-group"><textarea 
                value={campaign.template?.body}
                disabled
              /></div>
                        
                      </div>
                    )}
                    {campaign.createdBy && (
                      <div className="info-item">
                        <span className="info-label">Created By:</span>
                        <span className="info-value">{campaign.createdBy.name}</span>
                      </div>
                    )}
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
                    {campaign.status === 'Completed' && (
                      <div className="timeline-item">
                        <div className="timeline-icon completed">
                          <i className="fas fa-check"></i>
                        </div>
                        <div className="timeline-content">
                          <h4>Campaign Completed</h4>
                          <p>Status: {campaign.status}</p>
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
