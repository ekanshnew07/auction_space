/**
 * Module: features/register/useRegisterForm.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Register Form flow.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { register, reset } from '../../redux/authSlice';
import { getPasswordChecks } from './passwordRules';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasTypedPassword, setHasTypedPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('local_shield_verified_init');
  const turnstileRef = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || 'free-local-shield';

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (isError && message) {
      toast.error(message, { toastId: `register-error-${message}` });
      turnstileRef.current?.reset?.();
    }

    if (isSuccess) {
      toast.success('Registration successful. Please sign in to continue.', { toastId: 'register-success' });
      navigate('/login');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const onChange = (event) => {
    const { name: fieldName, value } = event.target;
    if (fieldName === 'password' && !hasTypedPassword) {
      setHasTypedPassword(true);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please satisfy all password requirements.');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    dispatch(
      register({
        name,
        email,
        password,
        turnstileToken: turnstileToken || `local_shield_verified_${Date.now()}`,
      })
    );
  };

  return {
    formData,
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    hasTypedPassword,
    turnstileRef,
    turnstileSiteKey,
    isLoading,
    passwordChecks,
    isPasswordValid,
    passwordsMatch,
    setTurnstileToken,
    onChange,
    onSubmit,
  };
};
