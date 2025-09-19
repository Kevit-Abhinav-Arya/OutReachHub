import React from 'react';
import type { Campaign } from '../types';
import './CampaignCard.scss';

interface CampaignCardProps {
  campaign: Campaign;
  canEdit: boolean;
  onAction: (campaign: Campaign, action: 'view' | 'edit' | 'delete' | 'copy' | 'launch') => void;
  progress?: {
    status: 'launching' | 'running' | 'completed';
    progress: number;
    startTime?: number;
  };
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, canEdit, onAction, progress }) => {

 

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'Draft': return 'fa-edit';
      case 'Running': return 'fa-play-circle';
      case 'Completed': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentProgress = progress?.progress || (campaign.status === 'Running' ? 50 : 0);
  const showProgress = campaign.status === 'Running' || progress?.status === 'running' || progress?.status === 'launching';

  return (
    <div className="campaign-card">
      <div className="campaign-header">
        <div className="campaign-title">
          <h3>{campaign.name}</h3>
          <div className="campaign-status">
            <span 
              className={`status-badge ${campaign.status.toLowerCase()}`}
            >
              <i className={`fas ${getStatusIcon(campaign.status)}`}></i>
              {campaign.status}
            </span>
          </div>
        </div>
        
        <div className="campaign-actions">
          <button 
            className="action-btn view-btn" 
            onClick={() => onAction(campaign, 'view')}
            title="View Details"
          >
            <i className="fas fa-eye"></i>
          </button>
          
          {canEdit && campaign.status === 'Draft' && (
            <>
              <button 
                className="action-btn edit-btn" 
                onClick={() => onAction(campaign, 'edit')}
                title="Edit Campaign"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="action-btn launch-btn" 
                onClick={() => onAction(campaign, 'launch')}
                title="Launch Campaign"
              >
                <i className="fas fa-rocket"></i>
              </button>
              
            </>
          )}
          {canEdit && (
          <button 
            className="action-btn copy-btn" 
            onClick={() => onAction(campaign, 'copy')}
            title="Copy Campaign"
          >
            <i className="fas fa-copy"></i>
          </button>
          )}
          
          {canEdit && campaign.status === 'Draft' && (
            <button 
              className="action-btn delete-btn" 
              onClick={() => onAction(campaign, 'delete')}
              title="Delete Campaign"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      </div>

      <div className="campaign-details">
        <div className="detail-row">
          <div className="detail-item">
            <i className="fas fa-tags"></i>
            <span className="detail-label">Target Tags:</span>
            <div className="tags-container">
              {campaign.targetTags?.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              )) || <span className="tag">No tags</span>}
            </div>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <i className="fas fa-envelope"></i>
            <span className="detail-label">Template:</span>
            <span className="detail-value">
              {campaign.template?.name || 'Unknown Template'}
              <span className='tags-container'>
              <span className="tag">
                {campaign.template?.type || 'Text'}
              </span>
              </span>
            </span>
          </div>
        </div>

        {campaign.template?.imageUrl && campaign.template.type === 'Text & Image' && (
          <div className="detail-row">
            <div className="detail-item template-image-preview">
              <i className="fas fa-image"></i><span className="detail-label">Template Image:</span>
              
              <div className="image-thumbnail">
                <img 
                  src={campaign.template.imageUrl} 
                  alt="Template" 
                  onError={(e) => console.error('Image failed to load:', campaign.template?.imageUrl, e)}
                />
              </div>
            </div>
          </div>
        )}

     

       
      </div>

      {showProgress && (
        <div className="progress-section">
          <div className="progress-header">
            <span>
              {progress?.status === 'launching' ? 'Launching...' : 
               progress?.status === 'running' ? 'In Progress' : 'Progress'}
            </span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="campaign-footer">
        <div className="footer-item">
          <i className="fas fa-calendar-plus"></i>
          <span>Created: {formatDate(campaign.createdAt)}</span>
        </div>
        {campaign.createdBy && (
          <div className="footer-item">
            <i className="fas fa-user"></i>
            <span>By: {campaign.createdBy.name}</span>
          </div>
        )}
        {campaign.launchedAt && (
          <div className="footer-item">
            <i className="fas fa-rocket"></i>
            <span>Launched: {formatDate(campaign.launchedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
