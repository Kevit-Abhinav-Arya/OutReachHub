const CONTACTS_API_BASE_URL = "http://localhost:3000";
const CONTACT_ENDPOINTS = {
  LIST: `${CONTACTS_API_BASE_URL}/contacts`,
  CREATE: `${CONTACTS_API_BASE_URL}/contacts`,
  UPDATE: (id) => `${CONTACTS_API_BASE_URL}/contacts/${id}`,
  DELETE: (id) => `${CONTACTS_API_BASE_URL}/contacts/${id}`,
  GET_BY_ID: (id) => `${CONTACTS_API_BASE_URL}/contacts/${id}`,
};

let currentContacts = [];
let currentPage = 1;
let totalPages = 1;
let tags = [];
const phoneRegex = /^[6789]\d{9}$/;

const ContactUtils = {
  getAuthHeaders: () => {
  
    const token = AuthUtils.getToken();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  },

  // Validate contact data
  validateContact: (contactData) => {
    const errors = [];
    
    console.log('Validating contact data:', contactData);
    
    if (!contactData.name || contactData.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!contactData.phoneNumber || contactData.phoneNumber.trim() === '') {
      errors.push('Phone number is required');
    } else if (!phoneRegex.test(contactData.phoneNumber.trim())) {
      errors.push('Phone number must be 10 digits starting with 6, 7, 8, or 9');
    }
    
    console.log('Validation errors:', errors);
    return errors;
  },

  formatPhoneNumber: (phone) => {
    if (!phone) return '';
    return "+91 " + phone;
  },

};

// Contact API service functions
const ContactService = {
  getAllContacts: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'desc',
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });



      const response = await fetch(`${CONTACT_ENDPOINTS.LIST}?${params}`, {
        method: 'GET',
        headers: ContactUtils.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  // Get contact by ID
  getContactById: async (contactId) => {
    try {
      const response = await fetch(CONTACT_ENDPOINTS.GET_BY_ID(contactId), {
        method: 'GET',
        headers: ContactUtils.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contact: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  // Create new contact
  createContact: async (contactData) => {
    try {
      
      const errors = ContactUtils.validateContact(contactData);
      if (errors.length > 0) {
        console.log('Validation failed : ', errors);
      }
      console.log('Data to send:', contactData);

     

      const response = await fetch(CONTACT_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: ContactUtils.getAuthHeaders(),
        body: JSON.stringify(contactData)
      });


      if (!response.ok) {
       
        const errorData = await response.json();
        console.log('Error response data:', errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  },

  // Update existing contact
  updateContact: async (contactId, contactData) => {
    try {
      const errors = ContactUtils.validateContact(contactData);
      if (errors.length > 0) {
        console.log('Validation failed : ', errors);
      }

   

      const response = await fetch(CONTACT_ENDPOINTS.UPDATE(contactId), {
        method: 'PUT',
        headers: ContactUtils.getAuthHeaders(),
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
       
        const errorData = await response.json();
        console.log('Error response data:', errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  // Delete contact
  deleteContact: async (contactId) => {
    try {
      const response = await fetch(CONTACT_ENDPOINTS.DELETE(contactId), {
        method: 'DELETE',
        headers: ContactUtils.getAuthHeaders()
      });

      if (!response.ok) {
       
          const errorData = await response.json();
        console.log('Error response data:', errorData);
      }

      return "Message Deleted Sucessfully..";
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
};

//--------------------------------------------------------------------------------
// Display Contacts
//--------------------------------------------------------------------------------

async function loadContacts(options = {}) {
  try {
    showLoadingState();
    
    const response = await ContactService.getAllContacts({
      page: currentPage,
      limit: 10,
      ...options
    });
    
    const { data: contacts, total, page, limit, totalPages: tp } = response;
    currentContacts = contacts;
    totalPages = tp;
    currentPage = page;

    renderContactsList(contacts);
    updatePagination();
    
  } catch (error) {
    console.error('Error loading contacts:', error);
    safeShowNotification(error.message, 'error');
    showErrorState();
  }
}

function renderContactsList(contacts) {
  const contactsList = document.querySelector('.contacts-list');
  
  if (!contacts || contacts.length === 0) {
    const emptyTemplate = document.getElementById('empty-state-template');
    contactsList.innerHTML = emptyTemplate.innerHTML;
    return;
  }

  contactsList.innerHTML = '';

  const contactCardTemplate = document.getElementById('contact-card-template');
  
  contacts.forEach(contact => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contactCardTemplate.innerHTML;
    const contactCard = tempDiv.querySelector('.contact-card');
    
    contactCard.setAttribute('data-contact-id', contact.id);
    contactCard.querySelector('.contact-avatar').textContent = getInitials(contact.name);
    contactCard.querySelector('.contact-name').textContent = contact.name;
    contactCard.querySelector('.contact-phone span').textContent = ContactUtils.formatPhoneNumber(contact.phoneNumber);
    
    // Handle tags
    const tagsContainer = contactCard.querySelector('.contact-tags');
    if (contact.tags && contact.tags.length > 0) {
      tagsContainer.innerHTML = contact.tags.map(tag => 
        `<span class="tag">${(tag)}</span>`
      ).join('');
    } else {
      tagsContainer.innerHTML = '';
    }
    
    const viewBtn = contactCard.querySelector('.view-btn');
    const editBtn = contactCard.querySelector('.edit-btn');
    const deleteBtn = contactCard.querySelector('.delete-btn');
    
    viewBtn.onclick = () => viewContact(contact.id);
    editBtn.onclick = () => editContact(contact.id);
    deleteBtn.onclick = () => confirmDeleteContact(contact.id);
    
    contactsList.appendChild(contactCard);
  });
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function showLoadingState() {
  const contactsList = document.querySelector('.contacts-list');
  const loadingTemplate = document.getElementById('loading-state-template');
  contactsList.innerHTML = loadingTemplate.innerHTML;
}

function showErrorState() {
  const contactsList = document.querySelector('.contacts-list');
  const errorTemplate = document.getElementById('error-state-template');
  contactsList.innerHTML = errorTemplate.innerHTML;
}

//--------------------------------------------------------------------------------
// Contact Actions
//--------------------------------------------------------------------------------

async function viewContact(contactId) {
  try {
    const contact = await ContactService.getContactById(contactId);
    
    // Update view modal with contact data
    document.querySelector('#viewModal .detail-group:nth-child(1) .value').textContent = contact.name;
    document.querySelector('#viewModal .detail-group:nth-child(2) .value').textContent = ContactUtils.formatPhoneNumber(contact.phoneNumber);
    
    // Update tags
    const tagsContainer = document.querySelector('#viewModal .tags-list');
    if (contact.tags && contact.tags.length > 0) {
      tagsContainer.innerHTML = contact.tags.map(tag => 
        `<span class="tag">${(tag)}</span>`
      ).join('');
    } else {
      tagsContainer.innerHTML = '<span class="no-tags">No tags</span>';
    }
    
    implementation("viewModalOverlay", "viewModal");
  } catch (error) {
    console.error('Error viewing contact:', error);
    safeShowNotification(error.message, 'error');
  }
}

async function editContact(contactId) {


  try {
    const contact = await ContactService.getContactById(contactId);
    
    document.getElementById('editName').value = contact.name || '';
    document.getElementById('editPhone').value = contact.phoneNumber || '';
    
    // Set up tags
    tags = contact.tags || [];
    renderEditTags();
    
    // Store contact ID for saving
    document.getElementById('editModal').dataset.contactId = contactId;
    
    implementation("editModalOverlay", "editModal");
  } catch (error) {
    console.error('Error loading contact for edit:', error);
    safeShowNotification(error.message, 'error');
  }
}

async function saveEditedContact() {
  const contactId = document.getElementById('editModal').dataset.contactId;
  
  try {
    const name = document.getElementById('editName').value.trim();
    const phoneNumber = document.getElementById('editPhone').value.trim();

    // Validate required fields
    if (!name) {
      safeShowNotification('Name is required', 'error');
      return;
    }

    if (!phoneNumber) {
      safeShowNotification('Phone number is required', 'error');
      return;
    }

    // Validate phone number format using regex
    if (!phoneRegex.test(phoneNumber)) {
      safeShowNotification('Phone number must be 10 digits starting with 6, 7, 8, or 9', 'error');
      return;
    }

    const contactData = {
      name: name,
      phoneNumber: phoneNumber,
      tags: tags
    };

    await ContactService.updateContact(contactId, contactData);
    safeShowNotification('Contact updated successfully', 'success');
    closeModal("editModalOverlay", "editModal");
    await loadContacts();
  } catch (error) {
    console.error('Error updating contact:', error);
    safeShowNotification(error.message, 'error');
  }
}

function confirmDeleteContact(contactId) {


  document.getElementById('deleteModal').dataset.contactId = contactId;
  
  const contact = currentContacts.find(c => c.id == contactId);

  document.querySelector('#deleteModal .contact-name').textContent = contact.name;
  
  implementation("deleteModalOverlay", "deleteModal");
}

async function deleteContact() {
  const contactId = document.getElementById('deleteModal').dataset.contactId;
  
  try {
    await ContactService.deleteContact(contactId);
    safeShowNotification('Contact deleted successfully', 'success');
    closeModal("deleteModalOverlay", "deleteModal");
    await loadContacts();
  } catch (error) {
    console.error('Error deleting contact:', error);
    safeShowNotification(error.message, 'error');
  }
}

//--------------------------------------------------------------------------------
// Add Contact Modal and Functions
//--------------------------------------------------------------------------------

function addContact() {

  document.getElementById('addContactForm').reset();
  tags = [];
  renderTags('tagsContainer');
  
  document.querySelector("#addContactModalOverlay").classList.add("active");
  document.querySelector("#addContactModal").classList.add("active");
}

function closeAddModal() {
  document.querySelector("#addContactModalOverlay").classList.remove("active");
  document.querySelector("#addContactModal").classList.remove("active");
}

async function saveContact() {
  try {

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();

    console.log('Form values:', { firstName, lastName, phone });

    if (!firstName) {
      safeShowNotification('First name is required', 'error');
      return;
    }
    if (!lastName) {
      safeShowNotification('Last name is required', 'error');
      return;
    }
    if (!phone) {
      safeShowNotification('Phone number is required', 'error');
      return;
    }
    
    if (!phoneRegex.test(phone)) {
      safeShowNotification('Phone number must be 10 digits starting with 6, 7, 8, or 9', 'error');
      return;
    }

    const contactData = {
      name: `${firstName} ${lastName}`.trim(),
      phoneNumber: phone,
      tags: tags
    };

    console.log('Contact data being sent:', contactData);

    await ContactService.createContact(contactData);
    safeShowNotification('Contact created successfully', 'success');
    closeAddModal();
    await loadContacts();
  } catch (error) {
    console.error('Error creating contact:', error);
    safeShowNotification(error.message, 'error');
  }
}

//--------------------------------------------------------------------------------
// Tags Functionality
//--------------------------------------------------------------------------------

const tagInput = document.getElementById("tagInput");
const tagContainer = document.querySelector("#tagsContainer");

if (tagInput) {
  tagInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = this.value.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        addTag(tag, tagContainer);
        this.value = "";
      } else if (tags.includes(tag)) {
        safeShowNotification("Tag already added!", "error");
        this.value = "";
      }
    }
  });
}

// Suggestion Tags
const suggContainer = document.querySelector('.suggested-tags');
if (suggContainer) {
  const suggTag = suggContainer.querySelectorAll("span");

  suggTag.forEach(stag => {
    stag.addEventListener("click", function (e) {
      e.preventDefault();
      const tag = stag.textContent.toLowerCase();
      if (!tags.includes(tag)) {
        addTag(tag, tagContainer);
      } else {
        safeShowNotification("Tag already added!", "error");
      }
    });
  });
}

function addTag(tag, container) {
  tags.push(tag);
  const tagElement = document.createElement("span");
  tagElement.className = "tag";
  tagElement.innerHTML = `${tag} <button class="remove-tag" onclick="removeTag('${tag}','${container.id}')">&times;</button>`;
  container.appendChild(tagElement);
}

function removeTag(tag, containerId) {
  tags = tags.filter((t) => t !== tag);
  renderTags(containerId);
}

function renderTags(containerId) {
  let tagContainer = document.getElementById(containerId);
  tagContainer.innerHTML = "";
  tags.forEach((t) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `${t} <button class="remove-tag" onclick="removeTag('${t}','${tagContainer.id}')">&times;</button>`;
    tagContainer.appendChild(tagElement);
  });
}

function renderEditTags() {
  const editTagContainer = document.getElementById('editTagsContainer');
  editTagContainer.innerHTML = "";
  tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `${tag} <button class="remove-tag" onclick="removeEditTag('${tag}')">&times;</button>`;
    editTagContainer.appendChild(tagElement);
  });
}

function removeEditTag(tag) {
  tags = tags.filter((t) => t !== tag);
  renderEditTags();
}

// Edit tags input
const editTag = document.getElementById('editTagInput');
if (editTag) {
  editTag.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = this.value.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
        renderEditTags();
        this.value = "";
      } else if (tags.includes(tag)) {
        safeShowNotification("Tag already added!", "error");
        this.value = "";
      }
    }
  });
}

//--------------------------------------------------------------------------------
// Pagination
//--------------------------------------------------------------------------------


function updatePagination() {
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadContacts();
    }
  };
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      loadContacts();
    };
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadContacts();
    }
  };
  pagination.appendChild(nextBtn);
}

//--------------------------------------------------------------------------------
// Modal Functions
//--------------------------------------------------------------------------------

function implementation(overlay, modal) {
  document.getElementById(overlay).classList.add("active");
  document.getElementById(modal).classList.add("active");
}

function closeModal(overlay, modal) {
  document.getElementById(overlay).classList.remove("active");
  document.getElementById(modal).classList.remove("active");
}

//--------------------------------------------------------------------------------
// Filter Scripts
//--------------------------------------------------------------------------------

function toggleFilter() {
  document.querySelector(".filter-dropdown").classList.toggle("active");
  if (document.querySelector(".filter-dropdown").classList.contains("active")) {
    document.querySelector(".tags-dropdown").classList.remove("active");
  }
}

function toggleTagFilter() {
  document.querySelector(".tags-dropdown").classList.toggle("active");
  if (document.querySelector(".tags-dropdown").classList.contains("active")) {
    document.querySelector(".filter-dropdown").classList.remove("active");
  }
}




function safeShowNotification(message, type = 'info') {
  if (typeof showNotification === 'function') {
    showNotification(message, type);
  } else {
    // Fallback notification
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

//--------------------------------------------------------------------------------
// Event Listeners Setup
//--------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (typeof AuthUtils !== 'undefined') {
      loadContacts();
    } else {
      console.warn('AuthUtils not available, contacts will not be loaded automatically');
      const contactsList = document.querySelector('.contacts-list');
      if (contactsList) {
        const authTemplate = document.getElementById('auth-required-template');
        contactsList.innerHTML = authTemplate.innerHTML;
      }
    }
    

  }, 100);
  

  // Add contact button
  const addContactBtn = document.querySelector(".add-contact-btn");
  if (addContactBtn) {
    addContactBtn.addEventListener("click", addContact);
  }

  // Add contact modal overlay click
  const addContactModalOverlay = document.querySelector("#addContactModalOverlay");
  if (addContactModalOverlay) {
    addContactModalOverlay.addEventListener("click", function (e) {
      if (e.target === this) closeAddModal();
    });
  }

  // Close button handler
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest('[id$="Modal"]');
      if (!modal) return;
      const modalId = modal.id;
      const overlayId = modalId + "Overlay";
      closeModal(overlayId, modalId);
    });
  });

  document.querySelectorAll(".cancel-btn").forEach((cancel) => {
    cancel.addEventListener("click", function () {
      const modal = this.closest('[id$="Modal"]');
      if (!modal) return;
      const overlay = modal.id + "Overlay";
      closeModal(overlay, modal.id);
    });
  });

  // Modal overlay click handler
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", function (e) {
      const modal = overlay.id.replace("Overlay", "").trim();
      if (e.target === this) closeModal(overlay.id, modal);
    });
  });

  // Save button
  const editSaveBtn = document.querySelector('#editModal .save-btn');
  if (editSaveBtn) {
    editSaveBtn.addEventListener('click', saveEditedContact);
  }

  const deleteSaveBtn = document.querySelector('#deleteModal .delete-btn');
  if (deleteSaveBtn) {
    deleteSaveBtn.addEventListener('click', deleteContact);
  }

  // Reset filter button
  document.querySelectorAll('.reset-btn').forEach(reset => {
    reset.addEventListener('click', function() {
      const container = document.querySelectorAll('.filter-dropdown');
      container.forEach(container => {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } 
        });         
      });
    });
  });
});
