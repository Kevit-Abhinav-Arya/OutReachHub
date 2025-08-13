const API_BASE_URL = "http://localhost:3000";
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};



const AuthUtils = {
  getToken: () => {
    return localStorage.getItem("access_token");
  },

  setToken: (token) => {
    localStorage.setItem("access_token", token);
  },

  removeToken: () => {
    localStorage.removeItem("access_token");
  },

  isAuthenticated: () => {
    const token = AuthUtils.getToken();
    return token !== null && token !== undefined && token !== "";
  },

  getUserRole: () => {
    const token = AuthUtils.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  //Role Check logic

  hasRole: (requiredRole) => {
    const userRole = AuthUtils.getUserRole();
    return userRole === requiredRole;
  },

  canPerformAction: (action) => {
    const userRole = AuthUtils.getUserRole();
    if (userRole === 'editor') return true;
    if (userRole === 'viewer' && action === 'read') return true;
    return false;
  }
};


// Login Logic
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#user").value.trim();
    const password = document.querySelector("#pass").value.trim();


    try {
      await handleLogin(username, password);
    } catch (error) {
      console.error("Login error:", error);
      showNotification(error.message || "Login failed. Please try again.", "error");
    } 
  });
}

const handleLogin = async (username, password) => {
  console.log("Attempting login for user:", username);
  
  const data = {
    username: username,
    password: password,
  };

  const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) 
    throw new Error("Invalid credentials");

  const responseData = await response.json();

  if (responseData.access_token) {
    console.log("Login successful");
    console.log("Token received:", responseData.access_token);
    AuthUtils.setToken(responseData.access_token);
    
    showNotification("Login successful! Redirecting...", "success");
    
    setTimeout(() => {
      window.location.href = "../Main Pages/index.html";
      }, 100000);
  } else {
    console.error("No access token in response:", responseData);
    throw new Error("No access token received from server");
  }
};

// Logout Logic

const handleLogout = async () => {
  const token = AuthUtils.getToken();
  
  if (!token) {
    window.location.href = "../Auth Files/login.html";
    return;
  }

  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    AuthUtils.removeToken();
    
    if (response.ok) {
      console.log("Logout successful");
      showNotification("Logout successful", "success");
    } 
  } catch (error) {
    console.error("Logout error:", error);
    AuthUtils.removeToken();
  } finally {
    setTimeout(() => {
      window.location.href = "../Auth Files/login.html";
    }, 500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  
  const logoutElements = document.querySelectorAll('#logout');
 
  logoutElements.forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });

  checkRouteProtection();
  
    setupRoleBasedUI();
 
});


//Protected page logic
function checkRouteProtection() {
  const protectedPages = [
    'index.html',
    'contact.html'
  ];

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  const isProtectedPage = protectedPages.includes(currentPage);

  
  console.log("Is protected page:", isProtectedPage);
  console.log("Is authenticated:", AuthUtils.isAuthenticated());
 

  if (isProtectedPage) {
    if (!AuthUtils.isAuthenticated()) {
      console.log("Not authenticated, redirecting to login");
      alert("Not Authorized. Login to continue.");
     
        window.location.href = "../Auth Files/login.html";
      
      return;
    } else {
      console.log("Authenticated, checking token validity");
      const token = AuthUtils.getToken();
      try {

        const parts = token.split('.');
  
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          console.log("Token is expired");
          AuthUtils.removeToken();
          alert("Token expired. Login again!");
          
            window.location.href = "../Auth Files/login.html";
          
          return;
        }
        
        console.log("Token not expired ");
      } catch (error) {
        console.log("Token validation failed:", error);
        AuthUtils.removeToken();
        alert("Token Validation Failed. Login Again");
          window.location.href = "../Auth Files/login.html";
       
        return;
      }
    }
  }

  //When user is on login page
  if (currentPage === 'login.html' && AuthUtils.isAuthenticated()) {
    console.log("ALready authenticated");
      window.location.href = "../Main Pages/index.html";
    
  }
}



// UI Changes

// Notification UI
function showNotification(message, type = "info") {

    let notification = document.createElement('div');
    notification.id = 'auth-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(notification);
  

  notification.textContent = message;
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }

  notification.style.opacity = '1';

  setTimeout(() => {
    notification.style.opacity = '0';
  }, 3000);
}


// Role-based UI 
function setupRoleBasedUI() {
  const userRole = AuthUtils.getUserRole();
  console.log("Setting UI for", userRole);
  
  if (!userRole) {
    console.log("No user role found");
    return;
  }

  
  applyRoleBasedRestrictions(userRole);
}



function applyRoleBasedRestrictions(role) {
  console.log("UI for:", role);
  
  if (role === 'viewer') {
    hideElementsForViewer();
    disableFormsForViewer();
  } else if (role === 'editor') {
    showElementsForEditor();
  }
}

function hideElementsForViewer() {

  const elementsToHide = document.querySelectorAll('[data-editor-only]');
  elementsToHide.forEach(elements => {
    elements.style.display = 'none';
  })


}

function disableFormsForViewer() {
  const formsToDisable = [
    '#addContactForm',
    '#contactForm',
    '.edit-contact-modal form'
  ];

  formsToDisable.forEach(selector => {
    const forms = document.querySelectorAll(selector);
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Only editor can edit these fields');
      });
    });
  });
}



function showElementsForEditor() {
  const elementsToShow = [
  
    '[data-editor-only]'
  ];

  elementsToShow.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = '';
    });
  });


}

