import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ContactCard from '../components/ContactCard';
import ContactModal from '../components/ContactModal';
import './Contacts.scss';
import type { ContactDisplay, CreateContactDto, UpdateContactDto } from '../types/contact.types';
import { 
  fetchContacts, 
  setPage, 
  clearErrors,
  createContact,
  updateContact,
  deleteContact as deleteContactAction
} from '../slices/contactsSlice';
import { selectUser } from '@/features/auth/slices/authSlice';
import type { RootState } from '@/store';
import type { AppDispatch } from '@/store';



const Contacts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    contacts, 
    pagination, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.contacts);

  const user = useSelector(selectUser);
  
  const canEdit = user?.type === 'admin' || user?.role === 'Editor';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDisplay | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
      dispatch(fetchContacts({ 
        page: pagination.page, 
        limit: 10,
        search: debouncedSearchTerm || undefined 
      }));
    }, [dispatch, pagination.page, debouncedSearchTerm]);



  const handleContactAction = (contact: ContactDisplay, action: 'view' | 'edit' | 'delete') => {
    if (!canEdit && (action === 'edit' || action === 'delete')) {
      return;
    }
    
    setSelectedContact(contact);
    setModalType(action);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setModalType(null);
    setIsAddModalOpen(false);
    dispatch(clearErrors());
  };

  const handleSaveContact = async (contactData: CreateContactDto | UpdateContactDto) => {
    try {
      if (isAddModalOpen) {
        await dispatch(createContact(contactData as CreateContactDto)).unwrap();
      } else if (modalType === 'edit' && selectedContact) {
        await dispatch(updateContact({ 
          id: selectedContact.id, 
          contactData: contactData as UpdateContactDto 
        })).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await dispatch(deleteContactAction(contactId)).unwrap();
      closeModal();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };



  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };
  return (
    <main className="contacts-container">
      {/* Header Section */}
      <div className="contacts-header">
        <div className="header-content">
          <h1>Contacts</h1>
          {!canEdit && (
            <div className="view-only-indicator">
              <i className="fas fa-eye"></i>
              <span>View Only</span>
            </div>
          )}
        </div>
        {canEdit && (
          <button className="add-contact-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i> Add Contact
          </button>
        )}
      </div>

      {/* Error Display */}
      {error.list && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error.list}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search contacts... by name or phone number" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading.list ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          Loading contacts...
        </div>
      ) : (
        <>
          {/* Contacts List */}
          <div className="contacts-list">
            {contacts.length > 0 ? (
              contacts.map((contact: ContactDisplay) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAction={handleContactAction}
                  canEdit={canEdit}
                />
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-address-book"></i>
                <h3>No contacts found</h3>
                <p>Start by adding your first contact or adjust your search filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
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
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {(selectedContact && modalType) && (
        <ContactModal
          contact={selectedContact}
          type={modalType}
          onClose={closeModal}
          onSave={handleSaveContact}
          onDelete={handleDeleteContact}
        />
      )}

      {isAddModalOpen && (
        <ContactModal
          type="add"
          onClose={closeModal}
          onSave={handleSaveContact}
        />
      )}
    </main>
  );
};

export default Contacts;
