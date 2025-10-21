import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('server');
  const [activeServer, setActiveServer] = useState('minecraft');
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // User management
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [userError, setUserError] = useState('');

  // Forum moderation
  const [moderationTopics, setModerationTopics] = useState([]);
  const [moderationComments, setModerationComments] = useState([]);
  const [moderationView, setModerationView] = useState('topics'); // 'topics' or 'comments'

  // Support tickets
  const [supportTickets, setSupportTickets] = useState([]);
  const [openTicketCount, setOpenTicketCount] = useState(0);

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    provider: 'resend',
    enabled: false,
    resend_api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    email_from: 'noreply@yourdomain.com',
    admin_email: ''
  });
  const [emailError, setEmailError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [historyRange, setHistoryRange] = useState('7d');

  // Roles & Permissions
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [roleError, setRoleError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' && isAuthenticated) {
      loadDashboardStats();
      loadMetricsHistory(historyRange);
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'dashboard' && isAuthenticated && historyRange) {
      loadMetricsHistory(historyRange);
    }
  }, [historyRange]);

  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated) {
      loadUsers();
      loadRoles(); // Also load roles for the dropdown
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'moderation' && isAuthenticated) {
      loadModerationData();
    }
  }, [activeTab, isAuthenticated, moderationView]);

  useEffect(() => {
    if (activeTab === 'support' && isAuthenticated) {
      loadSupportTickets();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'email' && isAuthenticated) {
      loadEmailSettings();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'roles' && isAuthenticated) {
      loadRoles();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTicketNotifications();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetchWithTimeout('/api/auth/check', {}, 8000);
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setIsDefaultPassword(data.isDefaultPassword);
        if (data.isDefaultPassword) {
          setShowPasswordChange(true);
        }
        loadContent();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setIsDefaultPassword(data.isDefaultPassword);
        setLoginError('');

        if (data.isDefaultPassword) {
          setShowPasswordChange(true);
        }

        loadContent();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword === 'admin123') {
      setPasswordError('Please choose a different password than the default');
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setShowPasswordChange(false);
        setIsDefaultPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        showMessage('success', 'Password changed successfully! Your account is now secure.');
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setContent(null);
    setIsDefaultPassword(false);
    setShowPasswordChange(false);
  };

  const loadContent = async () => {
    try {
      const res = await fetchWithTimeout('/api/content', {}, 10000);
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Load error:', error);
      showMessage('error', 'Failed to load content. Please refresh the page.');
    }
  };

  const saveContent = async () => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (res.ok) {
        showMessage('success', 'Changes saved successfully!');
      } else {
        showMessage('error', 'Error saving changes!');
      }
    } catch (error) {
      showMessage('error', 'Error saving changes!');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetchWithTimeout('/api/admin/dashboard', {}, 10000);
      const data = await res.json();
      if (res.ok) {
        setDashboardStats(data);
      } else {
        showMessage('error', 'Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
      showMessage('error', 'Failed to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadMetricsHistory = async (range = '7d') => {
    try {
      const res = await fetchWithTimeout(`/api/admin/metrics-history?range=${range}`, {}, 10000);
      const data = await res.json();
      if (res.ok) {
        setMetricsHistory(data.metrics || []);
      }
    } catch (error) {
      console.error('Metrics history error:', error);
    }
  };

  // Helper to check if content uses new dual-server structure
  const isDualServerStructure = () => {
    return content?.servers && (content.servers.minecraft || content.servers.fivem);
  };

  const updateServerInfo = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      // Backward compatibility for old structure
      setContent(prev => ({
        ...prev,
        serverInfo: { ...prev.serverInfo, [field]: value }
      }));
    }
  };

  const updateServerStatus = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        serverStatus: { ...prev.serverStatus, [field]: value }
      }));
    }
  };

  const updateJoinInfo = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        joinInfo: { ...prev.joinInfo, [field]: value }
      }));
    }
  };

  const updateGeneralInfo = (field, value) => {
    setContent(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const addFeature = () => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: [...(prev.servers[activeServer]?.features || []), 'New Feature']
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: [...(prev.features || []), { icon: '🎮', title: 'New Feature', description: 'Description' }]
      }));
    }
  };

  const updateFeature = (index, field, value) => {
    if (isDualServerStructure()) {
      // New structure uses string array
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: prev.servers[activeServer].features.map((f, i) => i === index ? value : f)
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
      }));
    }
  };

  const removeFeature = (index) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: prev.servers[activeServer].features.filter((_, i) => i !== index)
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const addChangelog = () => {
    const today = new Date().toISOString().split('T')[0];
    setContent(prev => ({
      ...prev,
      changelog: [
        { version: '1.0.0', date: today, changes: { features: [], improvements: [], fixes: [] } },
        ...(prev.changelog || [])
      ]
    }));
  };

  const updateChangelog = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const updateChangelogChanges = (index, type, value) => {
    const items = value.split('\n').filter(i => i.trim());
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) =>
        i === index ? { ...c, changes: { ...c.changes, [type]: items } } : c
      )
    }));
  };

  const removeChangelog = (index) => {
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.filter((_, i) => i !== index)
    }));
  };

  const addForumCategory = () => {
    setContent(prev => ({
      ...prev,
      forumCategories: [...(prev.forumCategories || []), {
        name: 'New Category',
        description: 'Description',
        icon: '💬',
        topics: 0,
        posts: 0,
        serverType: 'all',
        visibility: 'public',
        permissions: 'all',
        order: (prev.forumCategories?.length || 0)
      }]
    }));
  };

  const updateForumCategory = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      forumCategories: prev.forumCategories.map((c, i) =>
        i === index ? { ...c, [field]: field === 'topics' || field === 'posts' || field === 'order' ? parseInt(value) || 0 : value } : c
      )
    }));
  };

  const removeForumCategory = (index) => {
    if (confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      setContent(prev => ({
        ...prev,
        forumCategories: prev.forumCategories.filter((_, i) => i !== index)
      }));
    }
  };

  const moveCategoryUp = (index) => {
    if (index === 0) return;
    setContent(prev => {
      const categories = [...prev.forumCategories];
      [categories[index - 1], categories[index]] = [categories[index], categories[index - 1]];
      return { ...prev, forumCategories: categories };
    });
  };

  const moveCategoryDown = (index) => {
    setContent(prev => {
      if (index === prev.forumCategories.length - 1) return prev;
      const categories = [...prev.forumCategories];
      [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]];
      return { ...prev, forumCategories: categories };
    });
  };

  // Forum Moderation Functions
  const loadModerationData = async () => {
    try {
      const res = await fetch(`/api/forum/moderation?type=${moderationView}`);
      const data = await res.json();

      if (moderationView === 'topics') {
        setModerationTopics(data);
      } else {
        setModerationComments(data);
      }
    } catch (error) {
      console.error('Load moderation data error:', error);
    }
  };

  const handleModerateTopic = async (action, topicId, value = null) => {
    try {
      const res = await fetch('/api/forum/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'topic',
          targetId: topicId,
          value
        })
      });

      if (res.ok) {
        showMessage('success', `Topic ${action}ed successfully!`);
        loadModerationData();
      } else {
        showMessage('error', `Failed to ${action} topic`);
      }
    } catch (error) {
      showMessage('error', `Failed to ${action} topic`);
    }
  };

  const handleModerateComment = async (action, commentId) => {
    try {
      const res = await fetch('/api/forum/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'comment',
          targetId: commentId
        })
      });

      if (res.ok) {
        showMessage('success', `Comment ${action}ed successfully!`);
        loadModerationData();
      } else {
        showMessage('error', `Failed to ${action} comment`);
      }
    } catch (error) {
      showMessage('error', `Failed to ${action} comment`);
    }
  };

  // Support Ticket Functions
  const loadSupportTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      setSupportTickets(data);
    } catch (error) {
      console.error('Load support tickets error:', error);
    }
  };

  const loadTicketNotifications = async () => {
    try {
      const res = await fetch('/api/support/notifications');
      const data = await res.json();
      setOpenTicketCount(data.openTickets || 0);
    } catch (error) {
      console.error('Load ticket notifications error:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status })
      });

      if (res.ok) {
        showMessage('success', `Ticket status updated to ${status}!`);
        loadSupportTickets();
        loadTicketNotifications();
      } else {
        showMessage('error', 'Failed to update ticket status');
      }
    } catch (error) {
      showMessage('error', 'Failed to update ticket status');
    }
  };

  // User Management Functions
  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadEmailSettings = async () => {
    try {
      const res = await fetch('/api/email-settings');
      const data = await res.json();
      if (res.ok) {
        setEmailSettings({
          provider: data.provider || 'resend',
          enabled: data.enabled || false,
          resend_api_key: data.resend_api_key || '',
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || 587,
          smtp_user: data.smtp_user || '',
          smtp_pass: data.smtp_pass || '',
          smtp_secure: data.smtp_secure || false,
          email_from: data.email_from || 'noreply@yourdomain.com',
          admin_email: data.admin_email || ''
        });
      }
    } catch (error) {
      console.error('Load email settings error:', error);
    }
  };

  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    setEmailError('');

    // Validation
    if (emailSettings.enabled) {
      if (emailSettings.provider === 'resend') {
        if (!emailSettings.resend_api_key || !emailSettings.resend_api_key.trim()) {
          setEmailError('Resend API key is required when email is enabled');
          return;
        }
      } else if (emailSettings.provider === 'smtp') {
        if (!emailSettings.smtp_host || !emailSettings.smtp_user || !emailSettings.smtp_pass) {
          setEmailError('SMTP host, user, and password are required when email is enabled');
          return;
        }
      }

      if (!emailSettings.email_from || !emailSettings.email_from.includes('@')) {
        setEmailError('Valid sender email address is required');
        return;
      }
    }

    try {
      const res = await fetch('/api/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', 'Email settings saved successfully!');
      } else {
        setEmailError(data.error || 'Failed to save email settings');
      }
    } catch (error) {
      setEmailError('Failed to save email settings');
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailStatus('');

    // Validation
    if (!testEmail || !testEmail.includes('@')) {
      setTestEmailStatus('error:Please enter a valid email address');
      return;
    }

    if (!emailSettings.enabled) {
      setTestEmailStatus('error:Email notifications are disabled. Please enable them first.');
      return;
    }

    setSendingTestEmail(true);

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestEmailStatus('success:Test email sent successfully! Check your inbox.');
        setTestEmail('');
      } else {
        setTestEmailStatus(`error:${data.error || 'Failed to send test email'}`);
      }
    } catch (error) {
      setTestEmailStatus('error:Failed to send test email. Check your settings.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Role Management Functions
  const loadRoles = async () => {
    try {
      const res = await fetchWithTimeout('/api/roles', {}, 10000);
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles || []);
        setAvailablePermissions(data.availablePermissions || {});
      }
    } catch (error) {
      console.error('Load roles error:', error);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setRoleError('');

    if (!newRoleName.trim()) {
      setRoleError('Role name is required');
      return;
    }

    if (newRolePermissions.length === 0) {
      setRoleError('Please select at least one permission');
      return;
    }

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: newRolePermissions
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `Role "${newRoleName}" created successfully!`);
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions([]);
        loadRoles();
      } else {
        setRoleError(data.error || 'Failed to create role');
      }
    } catch (error) {
      setRoleError('Failed to create role');
    }
  };

  const handleUpdateRole = async (roleId) => {
    setRoleError('');

    if (!editingRole) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId,
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', 'Role updated successfully!');
        setEditingRole(null);
        loadRoles();
      } else {
        setRoleError(data.error || 'Failed to update role');
      }
    } catch (error) {
      setRoleError('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `Role "${roleName}" deleted successfully!`);
        loadRoles();
      } else {
        setRoleError(data.error || 'Failed to delete role');
      }
    } catch (error) {
      setRoleError('Failed to delete role');
    }
  };

  const togglePermission = (permission) => {
    if (newRolePermissions.includes(permission)) {
      setNewRolePermissions(newRolePermissions.filter(p => p !== permission));
    } else {
      setNewRolePermissions([...newRolePermissions, permission]);
    }
  };

  const toggleEditPermission = (permission) => {
    if (!editingRole) return;

    const currentPerms = editingRole.permissions || [];
    if (currentPerms.includes(permission)) {
      setEditingRole({
        ...editingRole,
        permissions: currentPerms.filter(p => p !== permission)
      });
    } else {
      setEditingRole({
        ...editingRole,
        permissions: [...currentPerms, permission]
      });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');

    if (newUserPassword.length < 8) {
      setUserError('Password must be at least 8 characters');
      return;
    }

    if (!newUserRole) {
      setUserError('Please select a role for the user');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
          roleId: newUserRole
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `User "${newUsername}" created successfully!`);
        setNewUsername('');
        setNewUserPassword('');
        setNewUserRole('');
        loadUsers();
      } else {
        setUserError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setUserError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `User "${username}" deleted successfully!`);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to delete user');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete user');
    }
  };

  const handleResetUserPassword = async (userId, username) => {
    const newPass = prompt(`Enter new password for "${username}" (min 8 characters):`);
    if (!newPass) return;

    if (newPass.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPass })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `Password reset for "${username}" successfully!`);
      } else {
        showMessage('error', data.error || 'Failed to reset password');
      }
    } catch (error) {
      showMessage('error', 'Failed to reset password');
    }
  };

  // Password Change Modal
  if (isAuthenticated && showPasswordChange) {
    return (
      <>
        <Head>
          <title>Change Password - EVU Server Admin</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="admin-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>⚠️ Change Default Password</h2>
              <p style={{ color: 'var(--accent-color)' }}>
                For security reasons, you must change the default password before continuing.
              </p>
            </div>
            {passwordError && (
              <div className="alert alert-error">
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-admin btn-admin-primary" style={{ flex: 1 }}>
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-admin btn-admin-danger"
                  style={{ flex: 1 }}
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - EVU Server</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div className="admin-login-wrapper">
          <div className="admin-card" style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>🔐 Admin Login</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to continue</p>
            </div>
            {loginError && (
              <div className="alert alert-error">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <button type="submit" className="btn-admin btn-admin-primary" style={{ width: '100%' }}>
                Login
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Default: admin / admin123
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!content) {
    return (
      <>
        <Head>
          <title>Loading... - EVU Server Admin</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div className="admin-login-wrapper">
          <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
            <h2>Loading...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - EVU Server</title>
        <link rel="stylesheet" href="/styles/style.css" />
        <link rel="stylesheet" href="/styles/admin.css" />
      </Head>

      <div className="admin-wrapper">
        {/* Admin Navbar */}
        <nav className="admin-navbar">
          <div className="admin-navbar-content">
            <div className="admin-navbar-left">
              <h1 className="admin-logo">⚙️ EVU ADMIN</h1>
              <Link href="/" className="admin-nav-link">
                ← Back to Site
              </Link>
            </div>
            <div className="admin-navbar-right">
              {isDefaultPassword && (
                <span className="admin-warning-badge">
                  ⚠️ Default Password
                </span>
              )}
              <button onClick={() => setShowPasswordChange(true)} className="btn-admin btn-admin-secondary">
                Change Password
              </button>
              <button onClick={handleLogout} className="btn-admin btn-admin-danger">
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="admin-content">
          <div className="admin-container">
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {message.text}
              </div>
            )}

            {/* Tabs */}
            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`admin-tab ${activeTab === 'server' ? 'active' : ''}`}
                onClick={() => setActiveTab('server')}
              >
                🖥️ Server Info
              </button>
              <button
                className={`admin-tab ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                ⭐ Features
              </button>
              <button
                className={`admin-tab ${activeTab === 'join' ? 'active' : ''}`}
                onClick={() => setActiveTab('join')}
              >
                🔗 Join Info
              </button>
              <button
                className={`admin-tab ${activeTab === 'changelog' ? 'active' : ''}`}
                onClick={() => setActiveTab('changelog')}
              >
                📝 Changelog
              </button>
              <button
                className={`admin-tab ${activeTab === 'forum' ? 'active' : ''}`}
                onClick={() => setActiveTab('forum')}
              >
                💬 Forum
              </button>
              <button
                className={`admin-tab ${activeTab === 'moderation' ? 'active' : ''}`}
                onClick={() => setActiveTab('moderation')}
              >
                🛡️ Moderation
              </button>
              <button
                className={`admin-tab ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                🎫 Support {openTicketCount > 0 && <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', background: 'var(--accent-color)', borderRadius: '12px', fontSize: '0.8rem' }}>{openTicketCount}</span>}
              </button>
              <button
                className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Users
              </button>
              <button
                className={`admin-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                📧 Email Settings
              </button>
              <button
                className={`admin-tab ${activeTab === 'roles' ? 'active' : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                🔐 Roles & Permissions
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'dashboard' && (
              <div className="admin-tab-content">
                {statsLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Loading statistics...</p>
                  </div>
                ) : dashboardStats ? (
                  <>
                    {/* Overview Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div className="admin-card" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{dashboardStats.users.total}</h3>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>👥 Total Users</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          {dashboardStats.users.admins} admins • {dashboardStats.users.regular} regular
                        </div>
                      </div>

                      <div className="admin-card" style={{ background: 'linear-gradient(135deg, var(--success-color) 0%, #10b981 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{dashboardStats.sessions.active}</h3>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>🔐 Active Sessions</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          Users currently logged in
                        </div>
                      </div>

                      <div className="admin-card" style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #e91e63 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{dashboardStats.forum.topics}</h3>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>💬 Forum Topics</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          {dashboardStats.forum.comments} comments • {dashboardStats.forum.totalViews} views
                        </div>
                      </div>

                      <div className="admin-card" style={{ background: 'linear-gradient(135deg, var(--warning-color) 0%, #f59e0b 100%)', color: 'white' }}>
                        <h3 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{dashboardStats.support.open}</h3>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>🎫 Open Tickets</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          {dashboardStats.support.inProgress} in progress • {dashboardStats.support.closed} closed
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                      {/* User Activity */}
                      <div className="admin-card">
                        <h3 className="admin-card-title">👥 User Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Total Users:</span>
                            <strong>{dashboardStats.users.total}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Administrators:</span>
                            <strong>{dashboardStats.users.admins}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Regular Users:</span>
                            <strong>{dashboardStats.users.regular}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--success-color)', color: 'white', borderRadius: '8px' }}>
                            <span>New (Last 7 Days):</span>
                            <strong>{dashboardStats.users.recentRegistrations}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Forum Stats */}
                      <div className="admin-card">
                        <h3 className="admin-card-title">💬 Forum Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Total Topics:</span>
                            <strong>{dashboardStats.forum.topics}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Total Comments:</span>
                            <strong>{dashboardStats.forum.comments}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Total Views:</span>
                            <strong>{dashboardStats.forum.totalViews.toLocaleString()}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--success-color)', color: 'white', borderRadius: '8px' }}>
                            <span>Active (24h):</span>
                            <strong>{dashboardStats.forum.recentActivity}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Support Stats */}
                      <div className="admin-card">
                        <h3 className="admin-card-title">🎫 Support Tickets</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Total Tickets:</span>
                            <strong>{dashboardStats.support.total}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--accent-color)', color: 'white', borderRadius: '8px' }}>
                            <span>Open:</span>
                            <strong>{dashboardStats.support.open}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--warning-color)', color: 'white', borderRadius: '8px' }}>
                            <span>In Progress:</span>
                            <strong>{dashboardStats.support.inProgress}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--success-color)', color: 'white', borderRadius: '8px' }}>
                            <span>Closed:</span>
                            <strong>{dashboardStats.support.closed}</strong>
                          </div>
                        </div>
                      </div>

                      {/* System Health */}
                      <div className="admin-card">
                        <h3 className="admin-card-title">⚡ System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Database:</span>
                            <strong style={{ color: 'var(--success-color)' }}>✓ Connected</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Uptime:</span>
                            <strong>{dashboardStats.system.uptime}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                            <span>Server Time:</span>
                            <strong>{new Date(dashboardStats.system.serverTime).toLocaleTimeString()}</strong>
                          </div>
                          {dashboardStats.system.lastContentUpdate && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--secondary-color)', borderRadius: '8px' }}>
                              <span>Last Update:</span>
                              <strong>{new Date(dashboardStats.system.lastContentUpdate).toLocaleString()}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Historical Metrics */}
                    <div className="admin-card" style={{ marginTop: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="admin-card-title" style={{ marginBottom: 0 }}>📈 Historical Metrics</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['24h', '7d', '30d', '90d'].map(range => (
                            <button
                              key={range}
                              onClick={() => setHistoryRange(range)}
                              className="btn-admin"
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: historyRange === range ? 'var(--primary-color)' : 'var(--secondary-color)',
                                color: historyRange === range ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {metricsHistory.length > 0 ? (
                        <>
                          {/* Simple Text-Based Chart */}
                          <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Total Users Over Time</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {metricsHistory.map((metric, index) => {
                                const maxValue = Math.max(...metricsHistory.map(m => m.total_users));
                                const percentage = (metric.total_users / maxValue) * 100;
                                return (
                                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ minWidth: '120px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                      {new Date(metric.recorded_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ flex: 1, height: '24px', background: 'var(--secondary-color)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                      }} />
                                    </div>
                                    <div style={{ minWidth: '50px', textAlign: 'right', fontWeight: 'bold' }}>
                                      {metric.total_users}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Metrics Summary Table */}
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'var(--secondary-color)' }}>
                                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--primary-color)' }}>Date</th>
                                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--primary-color)' }}>Users</th>
                                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--primary-color)' }}>Sessions</th>
                                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--primary-color)' }}>Topics</th>
                                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--primary-color)' }}>Tickets</th>
                                </tr>
                              </thead>
                              <tbody>
                                {metricsHistory.slice().reverse().map((metric, index) => (
                                  <tr key={index} style={{ borderBottom: '1px solid var(--secondary-color)' }}>
                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                      {new Date(metric.recorded_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                                      {metric.total_users}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                      {metric.active_sessions}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                      {metric.total_forum_topics}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                      {metric.open_tickets}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                          <p>No historical data available yet.</p>
                          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Metrics are recorded daily at midnight UTC by the automated system.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Refresh Button */}
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                      <button
                        onClick={loadDashboardStats}
                        disabled={statsLoading}
                        className="btn-admin btn-admin-primary"
                        style={{ minWidth: '200px' }}
                      >
                        {statsLoading ? 'Refreshing...' : '🔄 Refresh Stats'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Failed to load dashboard statistics</p>
                    <button onClick={loadDashboardStats} className="btn-admin btn-admin-primary" style={{ marginTop: '1rem' }}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'server' && (
              <div className="admin-tab-content">
                {isDualServerStructure() && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setActiveServer('minecraft')}
                          className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          ⛏️ Minecraft
                        </button>
                        <button
                          onClick={() => setActiveServer('fivem')}
                          className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          🚗 FiveM
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isDualServerStructure() ? (
                  <>
                    <div className="admin-card">
                      <h3 className="admin-card-title">{activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Server Info</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Enabled</label>
                          <select
                            className="form-input"
                            value={content.servers[activeServer]?.enabled}
                            onChange={(e) => updateServerInfo('enabled', e.target.value === 'true')}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Server Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.name || ''}
                            onChange={(e) => updateServerInfo('name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Server IP / Connect Command</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.serverIP || ''}
                            onChange={(e) => updateServerInfo('serverIP', e.target.value)}
                          />
                        </div>
                        {activeServer === 'minecraft' && (
                          <div className="form-group">
                            <label>Port</label>
                            <input
                              type="text"
                              className="form-input"
                              value={content.servers[activeServer]?.port || ''}
                              onChange={(e) => updateServerInfo('port', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">General Settings</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Website Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.general?.websiteTitle || ''}
                            onChange={(e) => updateGeneralInfo('websiteTitle', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Discord Link</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.general?.discordLink || ''}
                            onChange={(e) => updateGeneralInfo('discordLink', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="admin-card">
                      <h3 className="admin-card-title">Server Information</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Server Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.serverInfo?.name || ''}
                            onChange={(e) => updateServerInfo('name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.serverInfo?.title || ''}
                            onChange={(e) => updateServerInfo('title', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Subtitle</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.serverInfo?.subtitle || ''}
                            onChange={(e) => updateServerInfo('subtitle', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Version</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.serverInfo?.version || ''}
                            onChange={(e) => updateServerInfo('version', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">Server Status</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            className="form-input"
                            value={content.serverStatus?.isOnline}
                            onChange={(e) => updateServerStatus('isOnline', e.target.value === 'true')}
                          >
                            <option value="true">Online</option>
                            <option value="false">Offline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Max Players</label>
                          <input
                            type="number"
                            className="form-input"
                            value={content.serverStatus?.maxPlayers || 64}
                            onChange={(e) => updateServerStatus('maxPlayers', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Uptime</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.serverStatus?.uptime || ''}
                            onChange={(e) => updateServerStatus('uptime', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Server Info
                </button>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="admin-tab-content">
                {isDualServerStructure() && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setActiveServer('minecraft')}
                          className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          ⛏️ Minecraft
                        </button>
                        <button
                          onClick={() => setActiveServer('fivem')}
                          className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          🚗 FiveM
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-card">
                  <h3 className="admin-card-title">
                    {isDualServerStructure()
                      ? `${activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Features`
                      : 'Server Features'}
                  </h3>

                  {isDualServerStructure() ? (
                    <>
                      {content.servers[activeServer]?.features?.map((feature, index) => (
                        <div key={index} className="admin-item-card">
                          <div className="admin-item-header">
                            <h4>Feature #{index + 1}</h4>
                            <button
                              onClick={() => removeFeature(index)}
                              className="btn-admin btn-admin-danger btn-admin-sm"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Feature Description</label>
                            <input
                              type="text"
                              className="form-input"
                              value={feature}
                              onChange={(e) => updateFeature(index, null, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {content.features?.map((feature, index) => (
                        <div key={index} className="admin-item-card">
                          <div className="admin-item-header">
                            <h4>Feature #{index + 1}</h4>
                            <button
                              onClick={() => removeFeature(index)}
                              className="btn-admin btn-admin-danger btn-admin-sm"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Icon (emoji)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={feature.icon}
                                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Title</label>
                              <input
                                type="text"
                                className="form-input"
                                value={feature.title}
                                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              className="form-input"
                              value={feature.description}
                              onChange={(e) => updateFeature(index, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <button onClick={addFeature} className="btn-admin btn-admin-secondary">
                    ➕ Add Feature
                  </button>
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Features
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="admin-tab-content">
                {isDualServerStructure() ? (
                  <>
                    <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setActiveServer('minecraft')}
                            className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                          >
                            ⛏️ Minecraft
                          </button>
                          <button
                            onClick={() => setActiveServer('fivem')}
                            className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                          >
                            🚗 FiveM
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">
                        {activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Join Information
                      </h3>
                      <div className="form-group">
                        <label>Server IP / Connect Command</label>
                        <input
                          type="text"
                          className="form-input"
                          value={content.servers[activeServer]?.serverIP || ''}
                          onChange={(e) => updateJoinInfo('serverIP', e.target.value)}
                          placeholder={activeServer === 'minecraft' ? 'play.example.com' : 'connect cfx.re/join/xxxxx'}
                        />
                      </div>
                      {activeServer === 'minecraft' && (
                        <div className="form-group">
                          <label>Port (optional)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.port || ''}
                            onChange={(e) => updateJoinInfo('port', e.target.value)}
                            placeholder="25565"
                          />
                        </div>
                      )}
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">General Join Info</h3>
                      <div className="form-group">
                        <label>Discord Link</label>
                        <input
                          type="text"
                          className="form-input"
                          value={content.general?.discordLink || ''}
                          onChange={(e) => updateGeneralInfo('discordLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="admin-card">
                    <h3 className="admin-card-title">Join Information</h3>
                    <div className="form-group">
                      <label>Server IP / Connect Command</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.joinInfo?.serverIP || ''}
                        onChange={(e) => updateJoinInfo('serverIP', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Discord Link</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.joinInfo?.discordLink || ''}
                        onChange={(e) => updateJoinInfo('discordLink', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Join Info
                </button>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Changelog Entries</h3>
                    <button onClick={addChangelog} className="btn-admin btn-admin-secondary">
                      ➕ Add Version
                    </button>
                  </div>
                  {content.changelog?.map((entry, index) => (
                    <div key={index} className="admin-item-card">
                      <div className="admin-item-header">
                        <h4>Version {entry.version}</h4>
                        <button
                          onClick={() => removeChangelog(index)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Version</label>
                          <input
                            type="text"
                            className="form-input"
                            value={entry.version}
                            onChange={(e) => updateChangelog(index, 'version', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={entry.date}
                            onChange={(e) => updateChangelog(index, 'date', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Features (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.features?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'features', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="form-group">
                        <label>Improvements (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.improvements?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'improvements', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fixes (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.fixes?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'fixes', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Changelog
                </button>
              </div>
            )}

            {activeTab === 'forum' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h3 className="admin-card-title" style={{ marginBottom: '0.5rem' }}>Forum Categories</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Manage forum categories with icons, permissions, and visibility
                      </p>
                    </div>
                    <button onClick={addForumCategory} className="btn-admin btn-admin-secondary">
                      ➕ Add Category
                    </button>
                  </div>

                  {content.forumCategories?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📁 No categories yet</p>
                      <p>Click "Add Category" to create your first forum category</p>
                    </div>
                  ) : (
                    content.forumCategories?.map((category, index) => (
                      <div key={index} className="admin-item-card" style={{
                        borderLeft: `4px solid ${
                          category.serverType === 'minecraft' ? '#00d4ff' :
                          category.serverType === 'fivem' ? '#ff006e' :
                          'var(--primary-color)'
                        }`
                      }}>
                        <div className="admin-item-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>{category.icon || '💬'}</span>
                            <div>
                              <h4>{category.name}</h4>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.5rem',
                                  background: 'var(--dark-bg)',
                                  borderRadius: '4px',
                                  color: 'var(--text-secondary)'
                                }}>
                                  {category.serverType === 'all' ? '🌐 All Servers' :
                                   category.serverType === 'minecraft' ? '⛏️ Minecraft' :
                                   '🚗 FiveM'}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.5rem',
                                  background: category.visibility === 'public' ? 'rgba(0, 255, 136, 0.2)' :
                                             category.visibility === 'private' ? 'rgba(255, 170, 0, 0.2)' :
                                             'rgba(255, 0, 110, 0.2)',
                                  borderRadius: '4px',
                                  color: category.visibility === 'public' ? 'var(--success-color)' :
                                         category.visibility === 'private' ? 'var(--warning-color)' :
                                         'var(--accent-color)'
                                }}>
                                  {category.visibility === 'public' ? '👁️ Public' :
                                   category.visibility === 'private' ? '🔒 Private' :
                                   '🛡️ Admin Only'}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.5rem',
                                  background: 'var(--dark-bg)',
                                  borderRadius: '4px',
                                  color: 'var(--text-secondary)'
                                }}>
                                  {category.permissions === 'all' ? '📝 All Can Post' :
                                   category.permissions === 'registered' ? '👤 Registered Users' :
                                   '🛡️ Admin Only'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => moveCategoryUp(index)}
                              className="btn-admin btn-admin-sm btn-admin-secondary"
                              disabled={index === 0}
                              style={{ opacity: index === 0 ? 0.5 : 1 }}
                              title="Move Up"
                            >
                              ⬆️
                            </button>
                            <button
                              onClick={() => moveCategoryDown(index)}
                              className="btn-admin btn-admin-sm btn-admin-secondary"
                              disabled={index === content.forumCategories.length - 1}
                              style={{ opacity: index === content.forumCategories.length - 1 ? 0.5 : 1 }}
                              title="Move Down"
                            >
                              ⬇️
                            </button>
                            <button
                              onClick={() => removeForumCategory(index)}
                              className="btn-admin btn-admin-danger btn-admin-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>

                        <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                          <div className="form-group">
                            <label>Category Icon</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                className="form-input"
                                value={category.icon || '💬'}
                                onChange={(e) => updateForumCategory(index, 'icon', e.target.value)}
                                style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem' }}
                                maxLength={2}
                              />
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', flex: 1 }}>
                                {['💬', '📢', '🎮', '🏆', '📝', '🔧', '💡', '❓', '📰', '🎯', '🔥', '⚡'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => updateForumCategory(index, 'icon', emoji)}
                                    className="btn-admin btn-admin-sm btn-admin-secondary"
                                    style={{
                                      padding: '0.3rem 0.6rem',
                                      fontSize: '1.2rem',
                                      background: category.icon === emoji ? 'var(--primary-color)' : undefined
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Category Name</label>
                            <input
                              type="text"
                              className="form-input"
                              value={category.name}
                              onChange={(e) => updateForumCategory(index, 'name', e.target.value)}
                              placeholder="e.g., General Discussion"
                            />
                          </div>

                          <div className="form-group">
                            <label>Server Type</label>
                            <select
                              className="form-input"
                              value={category.serverType || 'all'}
                              onChange={(e) => updateForumCategory(index, 'serverType', e.target.value)}
                            >
                              <option value="all">🌐 All Servers</option>
                              <option value="minecraft">⛏️ Minecraft Only</option>
                              <option value="fivem">🚗 FiveM Only</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Visibility</label>
                            <select
                              className="form-input"
                              value={category.visibility || 'public'}
                              onChange={(e) => updateForumCategory(index, 'visibility', e.target.value)}
                            >
                              <option value="public">👁️ Public (Everyone can see)</option>
                              <option value="private">🔒 Private (Registered users only)</option>
                              <option value="admin">🛡️ Admin Only</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Post Permissions</label>
                            <select
                              className="form-input"
                              value={category.permissions || 'all'}
                              onChange={(e) => updateForumCategory(index, 'permissions', e.target.value)}
                            >
                              <option value="all">📝 All Can Post</option>
                              <option value="registered">👤 Registered Users</option>
                              <option value="admin">🛡️ Admin Only</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Display Order</label>
                            <input
                              type="number"
                              className="form-input"
                              value={category.order || index}
                              onChange={(e) => updateForumCategory(index, 'order', e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label>Description</label>
                          <textarea
                            className="form-input"
                            value={category.description}
                            onChange={(e) => updateForumCategory(index, 'description', e.target.value)}
                            rows={3}
                            placeholder="Brief description of what this category is for..."
                          />
                        </div>

                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                          <div className="form-group">
                            <label>Topics Count</label>
                            <input
                              type="number"
                              className="form-input"
                              value={category.topics || 0}
                              onChange={(e) => updateForumCategory(index, 'topics', e.target.value)}
                              min="0"
                            />
                          </div>
                          <div className="form-group">
                            <label>Posts Count</label>
                            <input
                              type="number"
                              className="form-input"
                              value={category.posts || 0}
                              onChange={(e) => updateForumCategory(index, 'posts', e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Forum Categories
                </button>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Forum Moderation</h3>

                  {/* View Toggle */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                      onClick={() => setModerationView('topics')}
                      className={`btn-admin ${moderationView === 'topics' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                    >
                      📝 Topics
                    </button>
                    <button
                      onClick={() => setModerationView('comments')}
                      className={`btn-admin ${moderationView === 'comments' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                    >
                      💬 Comments
                    </button>
                  </div>

                  {/* Topics View */}
                  {moderationView === 'topics' && (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Manage all forum topics
                      </h4>
                      {moderationTopics.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          No topics found
                        </p>
                      ) : (
                        moderationTopics.map((topic) => (
                          <div key={topic.id} className="admin-item-card" style={{ marginBottom: '1rem' }}>
                            <div className="admin-item-header">
                              <div>
                                <h4>
                                  {topic.is_pinned && <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>📌</span>}
                                  {topic.is_locked && <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>🔒</span>}
                                  {topic.is_deleted && <span style={{ color: '#ff6b6b', marginRight: '0.5rem' }}>🗑️</span>}
                                  {topic.title}
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                  By {topic.author_username} • {new Date(topic.created_at).toLocaleDateString()} • {topic.comment_count} comments
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {!topic.is_deleted && (
                                  <>
                                    <button
                                      onClick={() => handleModerateTopic('pin', topic.id, !topic.is_pinned)}
                                      className="btn-admin btn-admin-sm btn-admin-secondary"
                                      title={topic.is_pinned ? 'Unpin' : 'Pin'}
                                    >
                                      {topic.is_pinned ? '📌 Unpin' : '📌 Pin'}
                                    </button>
                                    <button
                                      onClick={() => handleModerateTopic('lock', topic.id, !topic.is_locked)}
                                      className="btn-admin btn-admin-sm btn-admin-secondary"
                                      title={topic.is_locked ? 'Unlock' : 'Lock'}
                                    >
                                      {topic.is_locked ? '🔓 Unlock' : '🔒 Lock'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete topic "${topic.title}"?`)) {
                                          handleModerateTopic('delete', topic.id);
                                        }
                                      }}
                                      className="btn-admin btn-admin-sm btn-admin-danger"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </>
                                )}
                                {topic.is_deleted && (
                                  <button
                                    onClick={() => handleModerateTopic('restore', topic.id)}
                                    className="btn-admin btn-admin-sm btn-admin-secondary"
                                  >
                                    ♻️ Restore
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--dark-bg)', borderRadius: '6px', fontSize: '0.9rem', maxHeight: '100px', overflow: 'auto' }}>
                              {topic.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Comments View */}
                  {moderationView === 'comments' && (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Manage all forum comments
                      </h4>
                      {moderationComments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          No comments found
                        </p>
                      ) : (
                        moderationComments.map((comment) => (
                          <div key={comment.id} className="admin-item-card" style={{ marginBottom: '1rem' }}>
                            <div className="admin-item-header">
                              <div>
                                <h4>
                                  {comment.is_deleted && <span style={{ color: '#ff6b6b', marginRight: '0.5rem' }}>🗑️</span>}
                                  Comment on: {comment.topic?.title || 'Unknown Topic'}
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                  By {comment.author_username} • {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!comment.is_deleted && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this comment?')) {
                                        handleModerateComment('delete', comment.id);
                                      }
                                    }}
                                    className="btn-admin btn-admin-sm btn-admin-danger"
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                                {comment.is_deleted && (
                                  <button
                                    onClick={() => handleModerateComment('restore', comment.id)}
                                    className="btn-admin btn-admin-sm btn-admin-secondary"
                                  >
                                    ♻️ Restore
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--dark-bg)', borderRadius: '6px', fontSize: '0.9rem', maxHeight: '100px', overflow: 'auto' }}>
                              {comment.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Support Tickets</h3>

                  <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                          {supportTickets.filter(t => t.status === 'open').length}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Open</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                          {supportTickets.filter(t => t.status === 'in-progress').length}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>In Progress</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                          {supportTickets.filter(t => t.status === 'closed').length}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Closed</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {supportTickets.length}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total</div>
                      </div>
                    </div>
                  </div>

                  {supportTickets.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      No support tickets yet
                    </p>
                  ) : (
                    <div>
                      {supportTickets.map((ticket) => (
                        <div key={ticket.id} className="admin-item-card" style={{ marginBottom: '1rem' }}>
                          <div className="admin-item-header">
                            <div>
                              <h4>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
                                  #{ticket.ticket_number}
                                </span>
                                {ticket.subject}
                              </h4>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                By {ticket.author_username} • {new Date(ticket.created_at).toLocaleString()} • {ticket.category}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                background: ticket.status === 'open' ? 'rgba(0, 255, 136, 0.2)' : ticket.status === 'in-progress' ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                                color: ticket.status === 'open' ? '#00ff88' : ticket.status === 'in-progress' ? '#ffaa00' : '#ff6b6b'
                              }}>
                                {ticket.status.replace('-', ' ').toUpperCase()}
                              </span>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                background: 'rgba(0, 212, 255, 0.2)',
                                color: 'var(--primary-color)'
                              }}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--dark-bg)', borderRadius: '6px', fontSize: '0.9rem' }}>
                            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{ticket.description}</p>

                            {ticket.author_email && (
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                📧 {ticket.author_email}
                              </p>
                            )}
                          </div>

                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {ticket.status !== 'in-progress' && (
                              <button
                                onClick={() => handleUpdateTicketStatus(ticket.id, 'in-progress')}
                                className="btn-admin btn-admin-sm btn-admin-secondary"
                              >
                                ▶️ Set In Progress
                              </button>
                            )}
                            {ticket.status !== 'closed' && (
                              <button
                                onClick={() => {
                                  if (confirm('Close this ticket?')) {
                                    handleUpdateTicketStatus(ticket.id, 'closed');
                                  }
                                }}
                                className="btn-admin btn-admin-sm btn-admin-primary"
                              >
                                ✅ Close Ticket
                              </button>
                            )}
                            {ticket.status === 'closed' && (
                              <button
                                onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                                className="btn-admin btn-admin-sm btn-admin-secondary"
                              >
                                🔄 Reopen
                              </button>
                            )}
                            <a
                              href={`/support/${ticket.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-admin btn-admin-sm btn-admin-secondary"
                              style={{ textDecoration: 'none' }}
                            >
                              💬 View Details
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">User Management</h3>

                  {/* Create New User Form */}
                  <div className="admin-item-card" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Create New User</h4>
                    {userError && (
                      <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        {userError}
                      </div>
                    )}
                    <form onSubmit={handleCreateUser}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            className="form-input"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Role</label>
                          <select
                            className="form-input"
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            required
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="">Select a role...</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name} {role.is_system && '(System)'}
                              </option>
                            ))}
                          </select>
                          {newUserRole && roles.find(r => r.id === newUserRole)?.description && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                              {roles.find(r => r.id === newUserRole)?.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button type="submit" className="btn-admin btn-admin-primary">
                        ➕ Create User
                      </button>
                    </form>
                  </div>

                  {/* Users List */}
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>All Users ({users.length})</h4>
                  {users.map((user) => (
                    <div key={user.id} className="admin-item-card">
                      <div className="admin-item-header">
                        <div>
                          <h4>{user.username}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                            Created: {new Date(user.created_at).toLocaleDateString()}
                            {user.is_default_password && (
                              <span style={{ color: 'var(--accent-color)', marginLeft: '1rem' }}>
                                ⚠️ Default Password
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleResetUserPassword(user.id, user.username)}
                            className="btn-admin btn-admin-secondary btn-admin-sm"
                          >
                            🔑 Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="btn-admin btn-admin-danger btn-admin-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                      No users found. Create one above.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email Settings Tab */}
            {activeTab === 'email' && (
              <div className="admin-section">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📧 Email Settings</h2>

                <form onSubmit={handleSaveEmailSettings}>
                  {/* Enable/Disable */}
                  <div className="admin-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <input
                        type="checkbox"
                        id="email-enabled"
                        checked={emailSettings.enabled}
                        onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                        style={{ width: '20px', height: '20px', marginRight: '1rem', cursor: 'pointer' }}
                      />
                      <label htmlFor="email-enabled" style={{ fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>
                        Enable Email Notifications
                      </label>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '2rem' }}>
                      Send welcome emails, ticket notifications, and status updates
                    </p>
                  </div>

                  {/* Provider Selection */}
                  <div className="admin-card">
                    <h3 className="admin-card-title">Provider Configuration</h3>
                    <div className="form-group">
                      <label>Email Provider</label>
                      <select
                        className="form-input"
                        value={emailSettings.provider}
                        onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                      >
                        <option value="resend">Resend API (Recommended)</option>
                        <option value="smtp">SMTP (Gmail, Outlook, etc.)</option>
                      </select>
                    </div>
                  </div>

                  {/* Resend Settings */}
                  {emailSettings.provider === 'resend' && (
                    <div className="admin-card">
                      <h3 className="admin-card-title">Resend API Configuration</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Sign up at <a href="https://resend.com" target="_blank" style={{ color: 'var(--primary-color)' }}>resend.com</a> - Free tier: 3,000 emails/month, 100/day
                      </p>

                      <div className="form-group">
                        <label>Resend API Key</label>
                        <input
                          type="password"
                          className="form-input"
                          value={emailSettings.resend_api_key}
                          onChange={(e) => setEmailSettings({ ...emailSettings, resend_api_key: e.target.value })}
                          placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                    </div>
                  )}

                  {/* SMTP Settings */}
                  {emailSettings.provider === 'smtp' && (
                    <div className="admin-card">
                      <h3 className="admin-card-title">SMTP Configuration</h3>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>SMTP Host</label>
                          <input
                            type="text"
                            className="form-input"
                            value={emailSettings.smtp_host}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                            placeholder="smtp.gmail.com"
                          />
                        </div>

                        <div className="form-group">
                          <label>SMTP Port</label>
                          <input
                            type="number"
                            className="form-input"
                            value={emailSettings.smtp_port}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) || 587 })}
                            placeholder="587"
                          />
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Common: 587 (TLS), 465 (SSL), 25 (Plain)
                          </p>
                        </div>

                        <div className="form-group">
                          <label>SMTP Username</label>
                          <input
                            type="text"
                            className="form-input"
                            value={emailSettings.smtp_user}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                            placeholder="your-email@gmail.com"
                          />
                        </div>

                        <div className="form-group">
                          <label>SMTP Password</label>
                          <input
                            type="password"
                            className="form-input"
                            value={emailSettings.smtp_pass}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_pass: e.target.value })}
                            placeholder="App Password (for Gmail)"
                          />
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Gmail users: Enable 2FA and create an App Password
                          </p>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={emailSettings.smtp_secure}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_secure: e.target.checked })}
                            style={{ width: '20px', height: '20px', marginRight: '0.75rem', cursor: 'pointer' }}
                          />
                          <span>Use SSL/TLS (check for port 465)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Shared Settings */}
                  <div className="admin-card">
                    <h3 className="admin-card-title">Email Addresses</h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>From Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={emailSettings.email_from}
                          onChange={(e) => setEmailSettings({ ...emailSettings, email_from: e.target.value })}
                          placeholder="noreply@yourdomain.com"
                        />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          Email address that will appear as sender
                        </p>
                      </div>

                      <div className="form-group">
                        <label>Admin Email (Optional)</label>
                        <input
                          type="email"
                          className="form-input"
                          value={emailSettings.admin_email}
                          onChange={(e) => setEmailSettings({ ...emailSettings, admin_email: e.target.value })}
                          placeholder="admin@yourdomain.com"
                        />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          Receive notifications for new support tickets
                        </p>
                      </div>
                    </div>
                  </div>

                  {emailError && (
                    <div style={{ padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', border: '2px solid #ff6b6b', borderRadius: '8px' }}>
                      <p style={{ color: '#ff6b6b', margin: 0 }}>{emailError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-admin btn-admin-primary"
                    style={{ marginTop: emailError ? '1rem' : '0' }}
                  >
                    💾 Save Email Settings
                  </button>
                </form>

                {/* Test Email Section */}
                <div className="admin-card">
                  <h3 className="admin-card-title">🧪 Test Email Configuration</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Send a test email to verify your configuration is working correctly.
                  </p>

                  <div className="form-group">
                    <label>Test Email Address</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <input
                        type="email"
                        className="form-input"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email address to test"
                        disabled={!emailSettings.enabled}
                        style={{
                          flex: 1,
                          opacity: emailSettings.enabled ? 1 : 0.5,
                          cursor: emailSettings.enabled ? 'text' : 'not-allowed'
                        }}
                      />
                      <button
                        onClick={handleSendTestEmail}
                        disabled={sendingTestEmail || !emailSettings.enabled}
                        className="btn-admin"
                        style={{
                          background: sendingTestEmail || !emailSettings.enabled
                            ? 'rgba(100, 100, 100, 0.3)'
                            : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                          cursor: sendingTestEmail || !emailSettings.enabled ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {sendingTestEmail ? '📤 Sending...' : '📧 Send Test'}
                      </button>
                    </div>
                  </div>

                  {!emailSettings.enabled && (
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 170, 0, 0.1)', border: '2px solid #ffaa00', borderRadius: '8px' }}>
                      <p style={{ color: '#ffaa00', margin: 0, fontSize: '0.9rem' }}>
                        ⚠️ Email notifications are disabled. Enable them above to send test emails.
                      </p>
                    </div>
                  )}

                  {testEmailStatus && (
                    <div
                      style={{
                        padding: '1rem',
                        background: testEmailStatus.startsWith('success:')
                          ? 'rgba(0, 255, 136, 0.1)'
                          : 'rgba(255, 107, 107, 0.1)',
                        border: `2px solid ${testEmailStatus.startsWith('success:') ? '#00ff88' : '#ff6b6b'}`,
                        borderRadius: '8px'
                      }}
                    >
                      <p
                        style={{
                          color: testEmailStatus.startsWith('success:') ? '#00ff88' : '#ff6b6b',
                          margin: 0
                        }}
                      >
                        {testEmailStatus.split(':')[1]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Help Section */}
                <div className="admin-card">
                  <h3 className="admin-card-title">📚 Quick Setup Guides</h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Resend (Recommended):</strong>
                    <ol style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <li>Sign up at <a href="https://resend.com" target="_blank" style={{ color: 'var(--primary-color)' }}>resend.com</a></li>
                      <li>Get your API key from dashboard</li>
                      <li>Paste it above and enable emails</li>
                    </ol>
                  </div>

                  <div>
                    <strong>Gmail SMTP:</strong>
                    <ol style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <li>Enable 2-Factor Authentication on your Google account</li>
                      <li>Go to Security → App passwords</li>
                      <li>Create app password for "Mail"</li>
                      <li>Use: smtp.gmail.com, port 587, your email, and app password</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Roles & Permissions Tab */}
            {activeTab === 'roles' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">🔐 Roles & Permissions Management</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Create custom roles with specific permissions to control what users can do in the system.
                  </p>

                  {roleError && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                      {roleError}
                    </div>
                  )}

                  {/* Create New Role Form */}
                  <form onSubmit={handleCreateRole} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>➕ Create New Role</h4>

                    <div className="form-group">
                      <label htmlFor="roleName">Role Name *</label>
                      <input
                        type="text"
                        id="roleName"
                        className="form-input"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g., Content Editor, Support Agent"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="roleDescription">Description</label>
                      <textarea
                        id="roleDescription"
                        className="form-input"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        placeholder="Brief description of this role's purpose"
                        rows={2}
                      />
                    </div>

                    <div className="form-group">
                      <label>Permissions * (Select at least one)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                        {Object.entries(availablePermissions).map(([perm, description]) => (
                          <label
                            key={perm}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              backgroundColor: newRolePermissions.includes(perm) ? 'rgba(107, 70, 193, 0.2)' : 'var(--card-bg)',
                              border: `2px solid ${newRolePermissions.includes(perm) ? 'var(--primary-color)' : 'transparent'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!newRolePermissions.includes(perm)) {
                                e.currentTarget.style.backgroundColor = 'rgba(107, 70, 193, 0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!newRolePermissions.includes(perm)) {
                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={newRolePermissions.includes(perm)}
                              onChange={() => togglePermission(perm)}
                              style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{perm}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {newRolePermissions.length} permission{newRolePermissions.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="btn-admin btn-admin-primary"
                      style={{ width: '100%' }}
                    >
                      ➕ Create Role
                    </button>
                  </form>

                  {/* Existing Roles List */}
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📋 Existing Roles</h4>
                  {roles.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="admin-card"
                          style={{
                            backgroundColor: role.is_system ? 'rgba(0, 212, 255, 0.05)' : 'var(--card-bg)',
                            border: role.is_system ? '2px solid rgba(0, 212, 255, 0.3)' : '1px solid var(--secondary-color)'
                          }}
                        >
                          {editingRole?.id === role.id ? (
                            // Edit Mode
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--primary-color)' }}>Editing: {role.name}</h4>
                                <button
                                  onClick={() => setEditingRole(null)}
                                  className="btn-admin btn-admin-secondary"
                                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                >
                                  ✖️ Cancel
                                </button>
                              </div>

                              <div className="form-group">
                                <label>Role Name</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editingRole.name}
                                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                />
                              </div>

                              <div className="form-group">
                                <label>Description</label>
                                <textarea
                                  className="form-input"
                                  value={editingRole.description || ''}
                                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                  rows={2}
                                />
                              </div>

                              <div className="form-group">
                                <label>Permissions</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                                  {Object.entries(availablePermissions).map(([perm, description]) => (
                                    <label
                                      key={perm}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: editingRole.permissions?.includes(perm) ? 'rgba(107, 70, 193, 0.2)' : 'var(--secondary-color)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={editingRole.permissions?.includes(perm) || false}
                                        onChange={() => toggleEditPermission(perm)}
                                        style={{ marginTop: '0.2rem' }}
                                      />
                                      <div>
                                        <div style={{ fontWeight: 'bold' }}>{perm}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{description}</div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleUpdateRole(role.id)}
                                className="btn-admin btn-admin-primary"
                                style={{ width: '100%' }}
                              >
                                💾 Save Changes
                              </button>
                            </div>
                          ) : (
                            // View Mode
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                                    {role.name}
                                    {role.is_system && (
                                      <span style={{
                                        marginLeft: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem',
                                        background: 'rgba(0, 212, 255, 0.2)',
                                        color: 'var(--primary-color)',
                                        borderRadius: '12px',
                                        fontWeight: 'normal'
                                      }}>
                                        SYSTEM
                                      </span>
                                    )}
                                  </h4>
                                  {role.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                      {role.description}
                                    </p>
                                  )}
                                </div>
                                {!role.is_system && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => setEditingRole(role)}
                                      className="btn-admin btn-admin-secondary"
                                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRole(role.id, role.name)}
                                      className="btn-admin btn-admin-danger"
                                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  Permissions ({role.permissions?.length || 0}):
                                </strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                                  {role.permissions && role.permissions.length > 0 ? (
                                    role.permissions.map((perm) => (
                                      <span
                                        key={perm}
                                        style={{
                                          padding: '0.4rem 0.8rem',
                                          fontSize: '0.8rem',
                                          backgroundColor: 'var(--secondary-color)',
                                          color: 'var(--text-primary)',
                                          borderRadius: '6px',
                                          border: '1px solid var(--primary-color)'
                                        }}
                                        title={availablePermissions[perm]}
                                      >
                                        {perm}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                      No permissions assigned
                                    </span>
                                  )}
                                </div>
                              </div>

                              {role.is_system && (
                                <p style={{
                                  marginTop: '1rem',
                                  padding: '0.75rem',
                                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-secondary)'
                                }}>
                                  ℹ️ System roles cannot be edited or deleted. They provide default permission templates.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      No roles found. Create one above to get started.
                    </p>
                  )}
                </div>

                {/* Permission Categories Info */}
                <div className="admin-card" style={{ marginTop: '1.5rem' }}>
                  <h4 className="admin-card-title">📚 Permission Categories</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                      <strong>Content Management</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        View and edit website content, server settings
                      </p>
                    </div>
                    <div>
                      <strong>User Management</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Create, edit, view, and delete user accounts
                      </p>
                    </div>
                    <div>
                      <strong>Role Management</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Manage roles and permissions for other users
                      </p>
                    </div>
                    <div>
                      <strong>Forum Management</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Post, edit, delete, and moderate forum content
                      </p>
                    </div>
                    <div>
                      <strong>Support Tickets</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        View, create, respond to, and manage support tickets
                      </p>
                    </div>
                    <div>
                      <strong>Dashboard & Analytics</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Access admin dashboard and view analytics data
                      </p>
                    </div>
                    <div>
                      <strong>System Settings</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        View and modify system-wide settings
                      </p>
                    </div>
                    <div>
                      <strong>Email Management</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Configure email settings and send emails
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
