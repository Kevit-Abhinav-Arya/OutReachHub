import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectIsAdmin, selectUser, logout } from '../../features/auth/slices/authSlice';
import OutreachHubLogo from '@/common/components/OutreachHubLogo';
import './Navbar.scss';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  // Helper function to get role badge info
  const getRoleBadge = () => {
    if (user?.type === 'admin') {
      return { role: 'Admin', className: 'admin-badge' };
    } else if (user?.role === 'Editor') {
      return { role: 'Editor', className: 'editor-badge' };
    } else if (user?.role === 'Viewer') {
      return { role: 'Viewer', className: 'viewer-badge' };
    }
    return null;
  };

  const roleBadge = getRoleBadge();

  if (isAdmin) {
    return (
      <nav className={`nav-style admin-nav ${isScrolled ? 'navbar-blur' : ''}`}>
        <div className="logo">
          <Link to="/admin">
            <OutreachHubLogo />
          </Link>
        </div>

        <div className="navbar-role-section">
          {roleBadge && (
            <div className={`role-badge ${roleBadge.className}`}>
              <i className="fas fa-crown"></i>
              <span>{roleBadge.role}</span>
            </div>
          )}
        </div>
        
      <ul className={`nav-items ${isMenuOpen ? 'active' : ''}`} id="navigation">
         
          <li>
          <Link 
            to="/login" 
            className={isActive('/login') ? 'active' : ''}
            onClick={handleLogout}
          >
            Logout
          </Link>
        </li>
        </ul>
      </nav>
    );
  }

  // User navigation
  return (
    <nav className={`nav-style ${isScrolled ? 'navbar-blur' : ''}`}>
      <div className="logo">
        <Link to="/">
          <OutreachHubLogo />
        </Link>
      </div>

      <div className="navbar-role-section">
        {roleBadge && (
          <div className={`role-badge ${roleBadge.className}`}>
            <i className={roleBadge.role === 'Editor' ? 'fas fa-edit' : 'fas fa-eye'}></i>
            <span>{roleBadge.role}</span>
          </div>
        )}
      </div>
      
      <ul className={`nav-items ${isMenuOpen ? 'active' : ''}`} id="navigation">
        <li>
          <Link 
            to="/contacts" 
            className={isActive('/contacts') ? 'active' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Contacts
          </Link>
        </li>
        <li>
          <Link 
            to="/campaigns" 
            className={isActive('/campaigns') ? 'active' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Campaign
          </Link>
        </li>
        <li>
          <Link 
            to="/message-templates" 
            className={isActive('/message-templates') ? 'active' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Message
          </Link>
        </li>
        <li >
          <Link 
            to="/login"
                        className={isActive('/logout') ? 'active' : ''}

            onClick={handleLogout}
          >
            Logout
          </Link>
        </li>
      </ul>
      
      <div className="toggle" onClick={toggleMenu}>
        <img src="/Assets/web.png" alt="toggle" />
      </div>
    </nav>
  );
};

export default Navbar;
