 window.addEventListener('scroll', function() {
          const navbar = document.querySelector('.nav-style');
          if (window.scrollY > 10) {
            navbar.classList.add('navbar-blur');
          } else {
            navbar.classList.remove('navbar-blur');
          }
        });

function toggleMenu(){
            document.getElementById('navigation').classList.toggle('active');
        }

// Enhanced navbar functionality with authentication awareness
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
});

function initializeNavbar() {
    // Wait for auth manager to be available
    setTimeout(() => {
        if (window.AuthUtils) {
            updateNavbarForUser();
        }
    }, 100);
}

function updateNavbarForUser() {
    const userRole = window.AuthUtils.getUserRole();
    
    if (userRole) {
        // Add user role indicator
        addUserRoleIndicator(userRole);
        
        // Update UI based on role
        updateUIForRole(userRole);
    }
}

function addUserRoleIndicator(role) {
    const navigation = document.getElementById('navigation');
    if (!navigation) return;

    // Remove existing role indicator
    const existingIndicator = document.getElementById('role-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create role indicator
    const roleIndicator = document.createElement('li');
    roleIndicator.id = 'role-indicator';
    roleIndicator.innerHTML = `<span class="role-badge">${role.toUpperCase()}</span>`;
    roleIndicator.style.cssText = `
        .role-badge {
            background: ${role === 'editor' ? '#10B981' : '#3B82F6'};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
    `;

    // Insert before logout button
    const logoutItem = document.getElementById('logout');
    if (logoutItem) {
        navigation.insertBefore(roleIndicator, logoutItem);
    }
}

function updateUIForRole(role) {
    // Add role-specific styling
    document.body.classList.add(`user-role-${role}`);
    
    // Show/hide elements based on role
    const viewerOnlyElements = document.querySelectorAll('[data-viewer-only]');
    const editorOnlyElements = document.querySelectorAll('[data-editor-only]');
    
    if (role === 'viewer') {
        editorOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
        viewerOnlyElements.forEach(el => {
            el.style.display = 'block';
        });
    } else if (role === 'editor') {
        editorOnlyElements.forEach(el => {
            el.style.display = 'block';
        });
        viewerOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Add styles for role indicators
const navbarStyles = document.createElement('style');
navbarStyles.textContent = `
    .role-badge {
        background: #10B981;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        display: inline-block;
    }
    
    .user-role-viewer .role-badge {
        background: #3B82F6;
    }
    
    .user-role-editor .role-badge {
        background: #10B981;
    }
    
    .nav-style #role-indicator {
        margin-right: 10px;
    }
    
    @media (max-width: 768px) {
        .nav-style #role-indicator {
            margin: 5px 0;
        }
    }
`;
document.head.appendChild(navbarStyles);