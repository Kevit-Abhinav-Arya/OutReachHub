import React from 'react';
import type { Campaign } from '../types';
import './CampaignCard.scss';

interface CampaignCardProps {
  campaign: Campaign;
  canEdit: boolean;
  onAction: (campaign: Campaign, action: 'view' | 'edit' | 'delete' | 'copy' | 'launch') => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, canEdit, onAction }) => {
 

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'fa-edit';
      case 'running': return 'fa-play-circle';
      case 'completed': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  };

  const getDeliveryRate = () => {
    if (campaign.messagesSent === 0) return 0;
    return Math.round((campaign.messagesDelivered / campaign.messagesSent) * 100);
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

  return (
    <div className="campaign-card">
      <div className="campaign-header">
        <div className="campaign-title">
          <h3>{campaign.name}</h3>
          <div className="campaign-status">
            <span 
              className={`status-badge ${campaign.status}`}
            >
              <i className={`fas ${getStatusIcon(campaign.status)}`}></i>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
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
          
          {canEdit && campaign.status === 'draft' && (
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
          
          {canEdit && campaign.status === 'draft' && (
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

      {campaign.description && (
        <p className="campaign-description">{campaign.description}</p>
      )}

      <div className="campaign-details">
        <div className="detail-row">
          <div className="detail-item">
            <i className="fas fa-tags"></i>
            <span className="detail-label">Target Tags:</span>
            <div className="tags-container">
              {campaign.targetTags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <i className="fas fa-envelope"></i>
            <span className="detail-label">Template:</span>
            <span className="detail-value">
              {campaign.messageTemplateName}
              <span className='tags-container'>
              <span className="tag">
                {campaign.messageTemplateType === 'text-image' ? 'Text + Image' : 'Text'}
              </span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="campaign-stats">
        <div className="stat-item">
          <div className="stat-number">{campaign.contactsTargeted}</div>
          <div className="stat-label">Targeted</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{campaign.messagesSent}</div>
          <div className="stat-label">Sent</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{campaign.messagesDelivered}</div>
          <div className="stat-label">Delivered</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{getDeliveryRate()}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      {campaign.status === 'running' && campaign.progress !== undefined && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Progress</span>
            <span>{Math.round(campaign.progress)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${campaign.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="campaign-footer">
        <div className="footer-item">
          <i className="fas fa-calendar-plus"></i>
          <span>Created: {formatDate(campaign.createdAt)}</span>
        </div>
        {campaign.launchedAt && (
          <div className="footer-item">
            <i className="fas fa-rocket"></i>
            <span>Launched: {formatDate(campaign.launchedAt)}</span>
          </div>
        )}
        {campaign.completedAt && (
          <div className="footer-item">
            <i className="fas fa-check"></i>
            <span>Completed: {formatDate(campaign.completedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
