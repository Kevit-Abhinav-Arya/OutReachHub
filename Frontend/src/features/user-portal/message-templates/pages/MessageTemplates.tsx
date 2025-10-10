import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageTemplateCard from '../components/MessageTemplateCard';
import MessageTemplateModal from '../components/MessageTemplateModal';
import type { MessageTemplate } from '../types';
import { selectUser } from '@/features/auth/slices/authSlice';
import {
  fetchMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  setPage,
  selectTemplate,
  clearSelectedTemplate, 
  selectMessageTemplates,
  selectSelectedTemplate,
  selectPagination,
  selectFilters,
  selectLoading,
  selectErrors,
} from '../slices/messageTemplatesSlice';
import type { AppDispatch } from '@/store';
import './MessageTemplates.scss';

const MessageTemplates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const canEdit = user?.type === 'admin' || user?.role === 'Editor';

  // Redux state
  const templates = useSelector(selectMessageTemplates);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  

  // Local modal state
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | 'copy' | 'create' | null>(null);
  
  // Form state for create modal
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'Text' as 'Text' | 'Text & Image',
    body: '',
    imageUrl: null as string | null,
  });

  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'Text' as 'Text' | 'Text & Image',
    body: '',
    imageUrl: null as string | null,
  });


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
          dispatch(fetchMessageTemplates({ 
            page: pagination.page, 
            limit: 10,
            search: debouncedSearchTerm || undefined 
          }));
        }, [dispatch, pagination.page, debouncedSearchTerm]);


  const handleTemplateAction = (template: MessageTemplate, action: 'view' | 'edit' | 'delete' | 'copy') => {
    // Prevent viewers from performing restricted actions
    if (!canEdit && (action === 'edit' || action === 'delete' || action === 'copy')) {
      return;
    }
    
    dispatch(selectTemplate(template));
    setModalType(action);
    
    // Initialize edit form when opening edit modal
    if (action === 'edit') {
      setEditForm({
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl || null,
      });
    }
  };

  const closeModal = () => {
    dispatch(clearSelectedTemplate());
    setModalType(null);
    
    // Reset form states
    setCreateForm({
      name: '',
      type: 'Text',
      body: '',
      imageUrl: null,
    });
    setEditForm({
      name: '',
      type: 'Text',
      body: '',
      imageUrl: null,
    });
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await dispatch(deleteMessageTemplate(selectedTemplate.id)).unwrap();
      closeModal();
      // Optionally show success message
    } catch (error) {
      // Error is already handled in Redux state
      console.error('Failed to delete template:', error);
    }
  };

  const handleCopyTemplate = async () => {
    if (!selectedTemplate) return;
    
    const copyData = {
      name: `${selectedTemplate.name} (Copy)`,
      type: selectedTemplate.type,
      body: selectedTemplate.body,
      imageUrl: selectedTemplate.imageUrl,
    };
    
    try {
      await dispatch(createMessageTemplate(copyData)).unwrap();
      closeModal();
      // Refetch templates to get the new copy
      dispatch(fetchMessageTemplates({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
      }));
    } catch (error) {
      console.error('Failed to copy template:', error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    if (modalType === 'create') {
      setCreateForm(prev => ({ ...prev, [field]: value }));
    } else if (modalType === 'edit') {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFormSubmit = async () => {
    const formData = modalType === 'create' ? createForm : editForm;
    
    // Basic validation
    if (!formData.name.trim() || !formData.body.trim()) {
      return;
    }

    const templateData: any = {
      name: formData.name.trim(),
      type: formData.type,
      body: formData.body.trim(),
    };

    // Only include imageUrl if it has a valid value
    if (formData.imageUrl && formData.imageUrl.trim()) {
      templateData.imageUrl = formData.imageUrl.trim();
    }

    console.log('Submitting template data:', templateData);

    try {
      if (modalType === 'create') {
        await dispatch(createMessageTemplate(templateData)).unwrap();
        // Refetch templates to include the new one
        dispatch(fetchMessageTemplates({
          page: 1, // Go to first page to see new template
          limit: pagination.limit,
          search: filters.search || undefined,
          type: filters.type !== 'all' ? filters.type : undefined,
        }));
      } else if (modalType === 'edit' && selectedTemplate) {
        await dispatch(updateMessageTemplate({ 
          id: selectedTemplate.id, 
          templateData 
        })).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };


  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const filteredTemplates = templates.filter((template: MessageTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <main className="message-templates-container">
      {/* Header Section */}
      <div className="message-templates-header">
        <div className="header-content">
          <h1>Message Templates</h1>
          {!canEdit && (
            <div className="view-only-indicator">
              <i className="fas fa-eye"></i>
              <span>View Only</span>
            </div>
          )}
        </div>
        {canEdit && (
          <button 
            className="add-template-btn"
            onClick={() => setModalType('create')}
          >
            <i className="fas fa-plus"></i> Create Template
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search templates by name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

          />
        </div>
      </div>

      {/* Loading State */}
      {loading.list && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading templates...</span>
        </div>
      )}

      {/* Error State */}
      {errors.list && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Error: {errors.list}</span>
          <button 
            onClick={() => dispatch(fetchMessageTemplates({
              page: pagination.page,
              limit: pagination.limit,
              search: filters.search || undefined,
              type: filters.type !== 'all' ? filters.type : undefined,
            }))}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Templates List */}
      <div className="templates-list">
        {!loading.list && filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>No templates found</h3>
            
            {canEdit && (
              <button 
                className="btn-primary"
                onClick={() => setModalType('create')}
              >
                <i className="fas fa-plus"></i> Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="templates-grid">
            {filteredTemplates.map((template: MessageTemplate) => (
              <MessageTemplateCard
                key={template.id}
                template={template}
                canEdit={canEdit}
                onAction={handleTemplateAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading.list && pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {/* Generate page numbers */}
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
            return pageNum <= pagination.totalPages ? (
              <button 
                key={pageNum}
                className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ) : null;
          })}
          
          {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
            <>
              <span className="page-ellipsis">...</span>
              <button 
                className="page-btn"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </button>
            </>
          )}
          
          <button 
            className="page-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Template Modal */}
      <MessageTemplateModal
        isOpen={!!(modalType !== null)}
        onClose={closeModal}
        template={selectedTemplate}
        mode={modalType}
        formData={modalType === 'edit' ? editForm : createForm}
        onFormChange={handleFormChange}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteTemplate}
        onCopy={handleCopyTemplate}
      />
    </main>
  );
};

export default MessageTemplates;
