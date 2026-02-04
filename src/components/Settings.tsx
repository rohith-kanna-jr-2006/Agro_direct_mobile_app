import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Eye, EyeOff, Lock, MapPin, Shield, Tractor, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, profileAPI } from '../services/api';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'password' | 'security'>('password');

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    // MFA & User Data State
    const [mfaEnabled, setMfaEnabled] = useState(user?.isMfaVerified || false);
    const [isTogglingMfa, setIsTogglingMfa] = useState(false);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    const [currentUserData, setCurrentUserData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);

    // Load all data from database when component mounts
    useEffect(() => {
        const loadAllData = async () => {
            if (!user?.userId) return;

            setIsLoadingUserData(true);
            try {
                // 1. Fetch User Data
                const userRes = await authAPI.getUser(user.userId);
                if (userRes.data?.success) {
                    const userData = userRes.data.user;
                    setCurrentUserData(userData);
                    setMfaEnabled(userData.isMfaVerified || false);
                }

                // 2. Fetch Profile Data (Farmer/Buyer)
                const role = user.role || 'farmer';
                const profileRes = await profileAPI.get(user.userId, role);
                if (profileRes.data) {
                    setProfileData(profileRes.data);
                }
            } catch (err: any) {
                console.error('[Settings] Failed to load data:', err);
                setCurrentUserData(user);
                setMfaEnabled(user?.isMfaVerified || false);
            } finally {
                setIsLoadingUserData(false);
            }
        };

        loadAllData();
    }, [user?.userId]);

    // Password validation
    const validatePassword = (pass: string) => {
        if (!pass) return "Password is required";
        if (pass.length < 8) return "Password must be at least 8 characters";
        if (!/[a-z]/.test(pass)) return "Password must include a lowercase letter";
        if (!/[A-Z]/.test(pass)) return "Password must include an uppercase letter";
        if (!/[0-9]/.test(pass)) return "Password must include a number";
        if (!/[@$!%*?&]/.test(pass)) return "Password must include a special character (@, $, !, %, *, ?, &)";
        if (/\s/.test(pass)) return "Password cannot contain whitespace";
        return "";
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate new password
        const passError = validatePassword(passwordData.newPassword);
        if (passError) {
            toast.error(passError);
            return;
        }

        // Check if passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match. Please ensure both passwords are exactly the same (case-sensitive).");
            return;
        }

        if (!user?.userId) {
            toast.error("User not found. Please log in again.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await authAPI.updatePassword({
                userId: user.userId,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                toast.success("Password updated successfully!");
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordsMatch(null);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Failed to update password";
            toast.error(errorMessage);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleMfaToggle = async () => {
        if (!user?.userId) {
            toast.error("User not found. Please log in again.");
            return;
        }

        setIsTogglingMfa(true);
        try {
            const response = await authAPI.toggleMfa({
                userId: user.userId,
                enable: !mfaEnabled
            });

            if (response.data.success) {
                setMfaEnabled(response.data.isMfaVerified);
                toast.success(response.data.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Failed to toggle MFA";
            toast.error(errorMessage);
        } finally {
            setIsTogglingMfa(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Settings</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Manage your account security and preferences
                        {isLoadingUserData && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)' }}>• Loading...</span>}
                    </p>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('password')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Lock size={18} />
                        Password
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Shield size={18} />
                        Security
                    </button>
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="premium-card"
                    style={{ padding: '2rem' }}
                >
                    {activeTab === 'password' ? (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lock size={24} />
                                Change Password
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Update your password to keep your account secure
                            </p>

                            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Current Password */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Current Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="Enter current password"
                                            required
                                            className="premium-input"
                                            style={{ width: '100%', paddingRight: '2.5rem' }}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            required
                                            className="premium-input"
                                            style={{ width: '100%', paddingRight: '2.5rem' }}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordData.newPassword && (
                                        <p style={{ fontSize: '0.75rem', color: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwordData.newPassword) ? '#4CAF50' : 'var(--text-muted)', marginTop: '0.5rem' }}>
                                            {/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwordData.newPassword) ? '✅ Strong Password' : '⚠️ Min 8 chars, A-Z, a-z, 0-9, special char'}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Confirm New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            required
                                            className="premium-input"
                                            style={{ width: '100%', paddingRight: '2.5rem' }}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => {
                                                const newConfirmPassword = e.target.value;
                                                setPasswordData({ ...passwordData, confirmPassword: newConfirmPassword });
                                                // Real-time password match check
                                                if (passwordData.newPassword && newConfirmPassword) {
                                                    setPasswordsMatch(passwordData.newPassword === newConfirmPassword);
                                                } else {
                                                    setPasswordsMatch(null);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordData.confirmPassword && (
                                        <p style={{
                                            color: passwordsMatch ? '#4CAF50' : '#ff4444',
                                            fontSize: '0.75rem',
                                            marginTop: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {passwordsMatch ? '✅ Passwords match' : '❌ Passwords do not match (case-sensitive)'}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={24} />
                                Security Settings
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Manage your account security preferences
                            </p>

                            {/* User Info & Expanded Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ padding: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '12px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                                            {(currentUserData?.name || user?.name)?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentUserData?.name || user?.name || 'User'}</h3>
                                            <p style={{ color: 'var(--text-muted)' }}>{currentUserData?.email || user?.email}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <Shield size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Username</span>
                                            </div>
                                            <p style={{ fontWeight: 600 }}>{currentUserData?.username || user?.username || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <Briefcase size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Account Role</span>
                                            </div>
                                            <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{currentUserData?.role || user?.role || 'User'}</p>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <MapPin size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Location</span>
                                            </div>
                                            <p style={{ fontWeight: 600 }}>{currentUserData?.location || (profileData?.location?.address ? profileData.location.address : 'Not set')}</p>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <Lock size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Password Status</span>
                                            </div>
                                            <p style={{ fontWeight: 600 }}>•••••••• (Set)</p>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                <CheckCircle size={16} />
                                                <span style={{ fontSize: '0.8rem' }}>Security Status</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: mfaEnabled ? '#4CAF50' : '#FF9800' }}>
                                                {mfaEnabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {mfaEnabled ? 'MFA Protected' : 'MFA Required'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Farmer Specific Details */}
                                {user?.role === 'farmer' && profileData && (
                                    <div style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Tractor size={20} />
                                            Farm Details
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Land Size</p>
                                                <p style={{ fontWeight: 600 }}>{profileData.landSize || '0'} Acres</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crops Grown</p>
                                                <p style={{ fontWeight: 600 }}>{Array.isArray(profileData.cropsGrown) ? profileData.cropsGrown.join(', ') : (profileData.cropsGrown || 'None')}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KYC Status</p>
                                                <p style={{ fontWeight: 600, color: '#4CAF50' }}>Verified</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MFA Toggle Card */}
                                <div style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                Multi-Factor Authentication (MFA)
                                            </h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                Secure your account with an extra verification layer
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleMfaToggle}
                                            disabled={isTogglingMfa}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: mfaEnabled ? '#4CAF50' : '#666',
                                                color: 'white',
                                                cursor: isTogglingMfa ? 'not-allowed' : 'pointer',
                                                fontWeight: 600,
                                                transition: 'all 0.3s',
                                                boxShadow: mfaEnabled ? '0 0 15px rgba(76, 175, 80, 0.3)' : 'none'
                                            }}
                                        >
                                            {isTogglingMfa ? '...' : (mfaEnabled ? 'Disable MFA' : 'Enable MFA')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
