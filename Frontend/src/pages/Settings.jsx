import { useState } from 'react';
import { User, Lock, Palette, LogOut, Share2, Copy, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, timetableAPI } from '../api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    semesterStartDate: user?.semesterStartDate ? new Date(user.semesterStartDate).toISOString().split('T')[0] : '',
    semesterEndDate: user?.semesterEndDate ? new Date(user.semesterEndDate).toISOString().split('T')[0] : ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Share Timetable state
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');
  const [shareError, setShareError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [importLink, setImportLink] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const handleGenerateShareLink = async () => {
    setShareLoading(true);
    setShareError('');
    setShareSuccess('');

    try {
      const response = await timetableAPI.generateShareLink({ permissions: 'import' });
      const fullShareUrl = `${window.location.origin}/share/${response.data.shareId}`;
      
      setGeneratedLink(fullShareUrl);
      setShareSuccess('Share link generated successfully!');
      
      // Auto-copy to clipboard
      await navigator.clipboard.writeText(fullShareUrl);
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to generate share link. Make sure you have a timetable created first.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setShareSuccess('Link copied to clipboard!');
      setTimeout(() => setShareSuccess(''), 2000);
    } catch (err) {
      setShareError('Failed to copy link');
    }
  };

  const handleImportTimetable = async () => {
    if (!importLink.trim()) {
      setShareError('Please enter a share link');
      return;
    }

    // Extract shareId from the link
    const shareIdMatch = importLink.match(/\/share\/([^/?]+)/);
    if (!shareIdMatch) {
      setShareError('Invalid share link format');
      return;
    }

    const shareId = shareIdMatch[1];

    if (!window.confirm('This will replace your current timetable. Do you want to continue?')) {
      return;
    }

    setImportLoading(true);
    setShareError('');
    
    try {
      await timetableAPI.importSharedTimetable(shareId);
      setShareSuccess('Timetable imported successfully!');
      setImportLink('');
      
      setTimeout(() => {
        window.location.href = '/timetable';
      }, 1500);
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to import timetable. The link may be invalid or expired.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await userAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[32rem] h-[32rem] -top-48 -right-48 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[32rem] h-[32rem] top-1/2 -left-48 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-[28rem] h-[28rem] bottom-0 right-1/3 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl leading-relaxed ml-8 font-medium">
            Manage your account preferences and settings
          </p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {shareSuccess && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {shareSuccess}
            </div>
          </div>
        )}

        {shareError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {shareError}
            </div>
          </div>
        )}

        {/* Share Timetable Section */}
        <Card 
          title="Share Timetable" 
          subtitle="Generate and share your timetable with others" 
          className="mb-6 hover:shadow-2xl transition-all duration-300 animate-scale-in backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl overflow-hidden"
        >
          <div className="space-y-8">
            {/* Generate Link Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 p-6 rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mr-3">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Generate Share Link</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Create a unique link to share your timetable</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={handleGenerateShareLink}
                    disabled={shareLoading}
                    className="w-full relative overflow-hidden group shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 py-4 text-lg"
                  >
                    <span className="relative z-10 flex items-center justify-center font-bold">
                      {shareLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Link...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                          Generate Share Link
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Generated Link Display */}
                  {generatedLink && (
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border-3 border-green-300 dark:border-green-600 shadow-lg animate-scale-in">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-600 rounded-xl mr-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-green-800 dark:text-green-300 text-lg">Link Generated Successfully!</p>
                            <p className="text-sm text-green-700 dark:text-green-400">Share this link with anyone</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-inner">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-transparent text-sm font-mono text-slate-900 dark:text-white outline-none"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center"
                        >
                          <Copy className="w-5 h-5 mr-2" />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider with OR */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-400 font-black text-lg rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-md">
                  OR
                </span>
              </div>
            </div>

            {/* Import Link Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 p-6 rounded-3xl border-2 border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mr-3">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Import Timetable</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Paste a share link to import a timetable</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Paste Share Link Below
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={importLink}
                        onChange={(e) => setImportLink(e.target.value)}
                        placeholder="https://yourapp.com/share/..."
                        className="w-full px-5 py-4 pr-12 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono text-sm shadow-inner"
                      />
                      {importLink && (
                        <button
                          onClick={() => setImportLink('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleImportTimetable}
                    disabled={importLoading || !importLink.trim()}
                    className="w-full relative overflow-hidden group shadow-xl hover:shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center font-bold">
                      {importLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Importing Timetable...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6 mr-2 group-hover:translate-y-1 transition-transform" />
                          Import Timetable
                        </>
                      )}
                    </span>
                  </Button>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-inner">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-600 rounded-lg mr-3 shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-bold mb-2 text-base">📋 How it works:</p>
                        <ul className="space-y-2 ml-2">
                          <li className="flex items-start">
                            <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">1.</span>
                            <span>Generate a link to share your timetable with others</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">2.</span>
                            <span>Send the link to friends or classmates via email, message, etc.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">3.</span>
                            <span>They paste the link here to import your timetable</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-orange-600 dark:text-orange-400 font-bold mr-2">⚠️</span>
                            <span className="font-semibold text-orange-700 dark:text-orange-400">Importing will replace their current timetable</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <Card title="Profile Settings" subtitle="Update your profile information" className="mb-6 hover:shadow-2xl transition-all duration-300 animate-scale-in backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="transition-all duration-300 hover:translate-x-1">
              <Input
                label="Username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                icon={<User className="w-5 h-5 text-gray-400" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transition-all duration-300 hover:translate-x-1">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Semester Start Date
                </label>
                <input
                  type="date"
                  value={profileData.semesterStartDate}
                  onChange={(e) => setProfileData({ ...profileData, semesterStartDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                  When does your semester begin?
                </p>
              </div>

              <div className="transition-all duration-300 hover:translate-x-1">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Semester End Date
                </label>
                <input
                  type="date"
                  value={profileData.semesterEndDate}
                  onChange={(e) => setProfileData({ ...profileData, semesterEndDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                  When does your semester end?
                </p>
              </div>
            </div>

            {profileData.semesterStartDate && profileData.semesterEndDate && (
              <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50 animate-fade-in">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-600 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-blue-800 dark:text-blue-300">
                      Semester Duration: {Math.ceil((new Date(profileData.semesterEndDate) - new Date(profileData.semesterStartDate)) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <p className="text-blue-700 dark:text-blue-400 text-xs mt-0.5">
                      This helps provide better attendance analytics and insights
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-l-4 border-blue-500 shadow-inner">
              <p className="text-sm text-slate-800 dark:text-slate-200 font-bold flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <strong>Email:</strong> <span className="ml-2">{user?.email}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-7">
                Email cannot be changed for security reasons
              </p>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="relative overflow-hidden group shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center font-bold">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Profile
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Button>
          </form>
        </Card>

        {/* Password Settings */}
        {user?.authProvider === 'local' && (
          <Card title="Change Password" subtitle="Update your password" className="mb-6 hover:shadow-2xl transition-all duration-300 animate-scale-in backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl" style={{animationDelay: '0.1s'}}>
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="transition-all duration-300 hover:translate-x-1">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  required
                />
              </div>

              <div className="transition-all duration-300 hover:translate-x-1">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  required
                />
                {passwordData.newPassword && (
                  <div className="mt-3 animate-fade-in">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-500 shadow-md ${
                            passwordData.newPassword.length < 6 ? 'bg-red-500 w-1/3' :
                            passwordData.newPassword.length < 10 ? 'bg-yellow-500 w-2/3' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${
                        passwordData.newPassword.length < 6 ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' :
                        passwordData.newPassword.length < 10 ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                      }`}>
                        {passwordData.newPassword.length < 6 ? 'Weak' :
                         passwordData.newPassword.length < 10 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="transition-all duration-300 hover:translate-x-1">
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  required
                />
                {passwordData.confirmPassword && passwordData.newPassword && (
                  <p className={`mt-2 text-xs flex items-center animate-fade-in ${
                    passwordData.newPassword === passwordData.confirmPassword 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                className="relative overflow-hidden group shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center font-bold">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Change Password
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Button>
            </form>
          </Card>
        )}

        {/* Account Info */}
        <Card title="Account Information" subtitle="Your account details" className="hover:shadow-2xl transition-all duration-300 animate-scale-in backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-3xl" style={{animationDelay: '0.3s'}}>
          <div className="space-y-4">
            <div className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-800 dark:text-slate-200 font-bold text-base">Account Type</span>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg capitalize">
                {user?.authProvider}
              </span>
            </div>
            <div className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2zM5.5 8.25a.75.75 0 01.75-.75h2a.75.75 0 010 1.5h-2a.75.75 0 01-.75-.75zm0 2.5a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-800 dark:text-slate-200 font-bold text-base">User ID</span>
              </div>
              <span className="font-mono text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-inner font-bold">
                {user?.id}
              </span>
            </div>
          </div>
        </Card>

        {/* Logout Section */}
        <Card title="Danger Zone" subtitle="Irreversible actions" className="hover:shadow-2xl mt-6 transition-all duration-300 animate-scale-in backdrop-blur-sm border-2 border-red-200/50 dark:border-red-700/50 shadow-xl rounded-3xl" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200/50 dark:border-red-700/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">Logout</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Sign out of your account
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
