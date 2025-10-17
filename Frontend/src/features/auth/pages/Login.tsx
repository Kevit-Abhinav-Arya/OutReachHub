import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  adminLogin, 
  userLogin, 
  selectIsLoading, 
  selectError, 
  selectRequiresWorkspaceSelection,
  clearError 
} from '../slices/authSlice';
import { FormField } from '../components/FormField';
import './Login.scss';
import { toast } from 'react-toastify';



const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const requiresWorkspaceSelection = useAppSelector(selectRequiresWorkspaceSelection);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, formData]);

  useEffect(() => {
    if (requiresWorkspaceSelection) {
      navigate('/select-workspace');
    }
  }, [requiresWorkspaceSelection, navigate]);

  const toggleUserType = () => {
    setIsAdmin(!isAdmin);
    setFormErrors({});
    dispatch(clearError());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setFormErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isAdmin) {
        const result = await dispatch(adminLogin(formData));
        if (adminLogin.fulfilled.match(result)) {
          // Get return URL or default to admin dashboard
          toast.success("Login Succesful");
          navigate("/admin", { replace: true });
        }
      } else {
        const result = await dispatch(userLogin(formData));
        if (userLogin.fulfilled.match(result)) {
                                toast.success("Login Succesful");

          if (!result.payload.requiresWorkspaceSelection) {
            const from = (location.state as any)?.from?.pathname || '/';
                      toast.success("Login Succesful");

            navigate(from, { replace: true });
          }
        }
      }
    } catch (error) {
      toast(String(error));
      console.error('Login failed:', error);
    }
  };

  const canSubmit = formData.email && formData.password && !isLoading;

  return (
    <div className="background">
      <div className="container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your OutreachHub account</p>
          <div className="user-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isAdmin ? 'active' : ''}`}
              onClick={() => !isAdmin || toggleUserType()}
            >
              User
            </button>
            <button
              type="button"
              className={`toggle-btn ${isAdmin ? 'active' : ''}`}
              onClick={() => isAdmin || toggleUserType()}
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fa-solid fa-triangle-exclamation error-icon"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={isLoading}
            icon={<i className='fa-solid fa-envelope'></i>}
          />
          
          <FormField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.password}
            disabled={isLoading}
            icon={<i className='fa-solid fa-lock'></i>}
          />
          
          <div className="form-actions">
            <a href="#" className="forgot-password">
              Forgot Password?
            </a>
            <button
              type="submit"
              className="submit-btn"
              disabled={!canSubmit}
            >
              Sign In
            </button>
          </div>
        </form>

       
      </div>
    </div>
  );
};

export default Login;
