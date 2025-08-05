// // Enhanced Authentication Script for OutReachHub
// // This script handles authentication, authorization, and role-based access control

// const API_BASE_URL = "http://localhost:7000";
// const AUTH_ENDPOINTS = {
//   LOGIN: `${API_BASE_URL}/auth/login`,
//   LOGOUT: `${API_BASE_URL}/auth/logout`,
// };
// // 
// // Authentication utility class
// class AuthenticationManager {
//   constructor() {
//     this.tokenKey = "access_token";
//     this.userDataKey = "user_data";
//     this.init();
//   }

//   init() {
//     // Check authentication on page load
//     this.checkAuthOnLoad();
//     // Set up logout handlers
//     this.setupLogoutHandlers();
//     // Set up form handlers if on login page
//     this.setupLoginForm();
//   }

//   // Token management
//   getToken() {
//     return localStorage.getItem(this.tokenKey);
//   }

//   setToken(token) {
//     localStorage.setItem(this.tokenKey, token);
//   }

//   removeToken() {
//     localStorage.removeItem(this.tokenKey);
//     localStorage.removeItem(this.userDataKey);
//   }

//   // User authentication status
//   isAuthenticated() {
//     const token = this.getToken();
//     return token !== null && token !== undefined && token !== "";
//   }

//   // JWT token parsing
//   parseJWTPayload(token) {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//       }).join(''));
//       return JSON.parse(jsonPayload);
//     } catch (error) {
//       console.error("Error parsing JWT:", error);
//       return null;
//     }
//   }

//   // Get user data from token
//   getUserData() {
//     const token = this.getToken();
//     if (!token) return null;

//     let userData = localStorage.getItem(this.userDataKey);
//     if (userData) {
//       return JSON.parse(userData);
//     }

//     // Parse from token if not in localStorage
//     const payload = this.parseJWTPayload(token);
//     if (payload) {
//       userData = {
//         username: payload.username || payload.sub,
//         role: payload.role,
//         exp: payload.exp
//       };
//       localStorage.setItem(this.userDataKey, JSON.stringify(userData));
//       return userData;
//     }

//     return null;
//   }

//   // Role-based access control
//   getUserRole() {
//     const userData = this.getUserData();
//     return userData ? userData.role : null;
//   }

//   hasRole(requiredRole) {
//     const userRole = this.getUserRole();
//     return userRole === requiredRole;
//   }

//   canPerformAction(action) {
//     const userRole = this.getUserRole();
    
//     switch (action) {
//       case 'read':
//         return userRole === 'editor' || userRole === 'viewer';
//       case 'create':
//       case 'update':
//       case 'delete':
//         return userRole === 'editor';
//       default:
//         return false;
//     }
//   }

//   // Check if token is expired
//   isTokenExpired() {
//     const userData = this.getUserData();
//     if (!userData || !userData.exp) return true;
    
//     const currentTime = Math.floor(Date.now() / 1000);
//     return currentTime >= userData.exp;
//   }

//   // Login functionality
//   async login(username, password) {
//     try {
//       this.showLoading(true);
      
//       const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Invalid credentials");
//       }

//       if (data.access_token) {
//         this.setToken(data.access_token);
//         this.showNotification("Login successful! Redirecting...", "success");
        
//         // Redirect based on user role or to default page
//         setTimeout(() => {
//           this.redirectToPage("../../Main Pages/index.html");
//         }, 1000);
        
//         return { success: true, data };
//       } else {
//         throw new Error("No access token received");
//       }
//     } catch (error) {
//       this.showNotification(error.message, "error");
//       throw error;
//     } finally {
//       this.showLoading(false);
//     }
//   }

//   // Logout functionality
//   async logout() {
//     const token = this.getToken();
    
//     try {
//       if (token) {
//         await fetch(AUTH_ENDPOINTS.LOGOUT, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//           }
//         });
//       }
//     } catch (error) {
//       console.warn("Logout API call failed:", error);
//     } finally {
//       this.removeToken();
//       this.showNotification("Logged out successfully", "success");
//       setTimeout(() => {
//         this.redirectToPage("../../Auth Files/login.html");
//       }, 500);
//     }
//   }

//   // Token validation
//   async validateToken() {
//     const token = this.getToken();
//     if (!token) return false;

//     if (this.isTokenExpired()) {
//       this.removeToken();
//       return false;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/contacts?limit=1`, {
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });

//       if (response.status === 401) {
//         this.removeToken();
//         return false;
//       }

//       return response.ok;
//     } catch (error) {
//       console.warn("Token validation failed:", error);
//       return true; // Don't invalidate on network errors
//     }
//   }

//   // Route protection
//   async checkAuthOnLoad() {
//     const currentPath = window.location.pathname;
//     const protectedPages = [
//       '/Main Pages/index.html',
//       '/Main Pages/contact.html'
//     ];

//     const isProtectedPage = protectedPages.some(page => 
//       currentPath.includes(page) || currentPath.endsWith(page.split('/').pop())
//     );

//     if (isProtectedPage) {
//       if (!this.isAuthenticated()) {
//         this.showNotification("Please login to access this page", "error");
//         setTimeout(() => {
//           this.redirectToPage("../../Auth Files/login.html");
//         }, 1000);
//         return;
//       }

//       const isValid = await this.validateToken();
//       if (!isValid) {
//         this.showNotification("Session expired. Please login again.", "error");
//         setTimeout(() => {
//           this.redirectToPage("../../Auth Files/login.html");
//         }, 1000);
//       }
//     }

//     // If on login page and already authenticated, redirect to dashboard
//     if (currentPath.includes('login.html') && this.isAuthenticated()) {
//       const isValid = await this.validateToken();
//       if (isValid) {
//         this.redirectToPage("../../Main Pages/index.html");
//       }
//     }
//   }

//   // UI setup methods
//   setupLoginForm() {
//     const loginForm = document.querySelector("#login-form");
//     if (!loginForm) return;

//     loginForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const username = document.querySelector("#user").value.trim();
//       const password = document.querySelector("#pass").value.trim();

//       if (!username || !password) {
//         this.showNotification("Please enter both username and password", "error");
//         return;
//       }

//       try {
//         await this.login(username, password);
//       } catch (error) {
//         console.error("Login failed:", error);
//       }
//     });
//   }

//   setupLogoutHandlers() {
//     // Wait for DOM to load
//     document.addEventListener('DOMContentLoaded', () => {
//       const logoutElements = document.querySelectorAll('#logout, [data-logout], .logout-btn');
//       logoutElements.forEach(element => {
//         element.addEventListener('click', (e) => {
//           e.preventDefault();
//           this.logout();
//         });
//       });
//     });
//   }

//   // Utility methods
//   redirectToPage(url) {
//     window.location.href = url;
//   }

//   showLoading(show) {
//     const submitButton = document.querySelector('input[type="submit"], .login-btn');
//     const form = document.querySelector('#login-form');
    
//     if (submitButton) {
//       submitButton.disabled = show;
//       if (submitButton.tagName === 'INPUT') {
//         submitButton.value = show ? "Logging in..." : "Login";
//       } else {
//         submitButton.textContent = show ? "Logging in..." : "Login";
//       }
//     }
    
//     if (form) {
//       form.style.opacity = show ? "0.7" : "1";
//     }
//   }

//   showNotification(message, type = "info") {
//     let notification = document.getElementById('auth-notification');
//     if (!notification) {
//       notification = document.createElement('div');
//       notification.id = 'auth-notification';
//       notification.style.cssText = `
//         position: fixed;
//         top: 20px;
//         right: 20px;
//         padding: 15px 25px;
//         border-radius: 8px;
//         color: white;
//         font-weight: 500;
//         font-size: 14px;
//         z-index: 10000;
//         opacity: 0;
//         transition: all 0.3s ease;
//         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//         max-width: 350px;
//         word-wrap: break-word;
//       `;
//       document.body.appendChild(notification);
//     }

//     notification.textContent = message;
    
//     // Set colors based on type
//     const colors = {
//       success: '#10B981',
//       error: '#EF4444',
//       warning: '#F59E0B',
//       info: '#3B82F6'
//     };
    
//     notification.style.backgroundColor = colors[type] || colors.info;
//     notification.style.opacity = '1';

//     setTimeout(() => {
//       notification.style.opacity = '0';
//     }, 4000);
//   }

//   // API request helper with authentication
//   async authenticatedFetch(url, options = {}) {
//     const token = this.getToken();
    
//     const defaultOptions = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { 'Authorization': `Bearer ${token}` })
//       }
//     };

//     const mergedOptions = {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...options.headers
//       }
//     };

//     const response = await fetch(url, mergedOptions);

//     if (response.status === 401) {
//       this.removeToken();
//       this.showNotification("Session expired. Please login again.", "error");
//       setTimeout(() => {
//         this.redirectToPage("../../Auth Files/login.html");
//       }, 1000);
//       throw new Error("Unauthorized");
//     }

//     return response;
//   }
// }

// // Initialize authentication manager
// const authManager = new AuthenticationManager();

// // Export for global use
// window.AuthManager = authManager;
// window.AuthUtils = {
//   isAuthenticated: () => authManager.isAuthenticated(),
//   getUserRole: () => authManager.getUserRole(),
//   canPerformAction: (action) => authManager.canPerformAction(action),
//   logout: () => authManager.logout(),
//   authenticatedFetch: (url, options) => authManager.authenticatedFetch(url, options)
// };

// // For backward compatibility
// window.authManager = authManager;
