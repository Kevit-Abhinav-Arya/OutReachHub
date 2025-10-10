import React from 'react';
import type { MessageTemplateCardProps } from '../types';
import './MessageTemplateCard.scss';



const MessageTemplateCard: React.FC<MessageTemplateCardProps> = ({ template, canEdit, onAction }) => {
  const handleAction = (action: 'view' | 'edit' | 'delete' | 'copy') => {
    onAction(template, action);
  };

  return (
    <div className="template-card"> 
      <div className="template-header">
        <div className="template-type">
          <div className={`type-indicator ${template.type.toLowerCase().replace(' & ', '-')}`}></div>
          <span>{template.type}</span>
        </div>
        <div className="template-actions">
          <button 
            className="action-btn view-btn"
            onClick={() => handleAction('view')}
            title="View Template"
          >
            <i className="fas fa-eye"></i>
          </button>
          {canEdit && (
            <>
              <button 
                className="action-btn edit-btn"
                onClick={() => handleAction('edit')}
                title="Edit Template"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="action-btn copy-btn"
                onClick={() => handleAction('copy')}
                title="Copy Template"
              >
                <i className="fas fa-copy"></i>
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleAction('delete')}
                title="Delete Template"
              >
                <i className="fas fa-trash"></i>
              </button>
            </>
          )}
        </div>
      </div> 
      
      <div className="template-content">
        <h3>{template.name}</h3>
        <div className="template-body">
          {template.body.length > 120 
            ? `${template.body.substring(0, 120)}...` 
            : template.body
          }
        </div>
        {template.imageUrl && (
          <div className="template-image">
            <img src={template.imageUrl} alt="Template preview" />
          </div>
        )}
      </div>
      
      <div className="template-footer">
        <div className="template-meta">
          <span className="created-by">By {template.createdBy.name}</span>
          <span className="created-date">
            {new Date(template.createdAt).toLocaleDateString()}
          </span>
        </div>
       
      </div>
      
    </div>
  );
};

export default MessageTemplateCard;
