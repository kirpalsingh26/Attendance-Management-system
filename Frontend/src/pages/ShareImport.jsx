import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Download, Eye, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { timetableAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';

const ShareImport = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [sharedData, setSharedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadSharedTimetable();
  }, [shareId, user]);

  const loadSharedTimetable = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await timetableAPI.getSharedTimetable(shareId);
      setSharedData(response.data.sharedTimetable);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shared timetable. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!window.confirm('This will replace your current timetable. Do you want to continue?')) {
      return;
    }

    setImporting(true);
    setError('');
    
    try {
      await timetableAPI.importSharedTimetable(shareId);
      setSuccess('Timetable imported successfully!');
      
      setTimeout(() => {
        navigate('/timetable');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import timetable');
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading shared timetable...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sharedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Link Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-xl">
            <Share2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Shared Timetable
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Preview and import this timetable to your account
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          </div>
        )}

        {error && sharedData && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl animate-slide-in">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {sharedData && (
          <>
            {/* Owner Info & Stats */}
            <Card className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Shared By
                  </h3>
                  <div className="space-y-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Name:</span> {sharedData.owner.username}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Email:</span> {sharedData.owner.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Link Info
                  </h3>
                  <div className="space-y-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Views:</span> {sharedData.viewCount}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Imports:</span> {sharedData.importCount}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="font-bold">Expires:</span> 
                      <span className="ml-2">{formatDate(sharedData.expiresAt)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {sharedData.isOwner && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                  <div className="flex items-center text-blue-700 dark:text-blue-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <p className="font-medium">This is your own timetable. You cannot import it.</p>
                  </div>
                </div>
              )}

              {sharedData.alreadyImported && !sharedData.isOwner && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
                  <div className="flex items-center text-yellow-700 dark:text-yellow-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <p className="font-medium">You have already imported this timetable.</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Timetable Preview */}
            <Card>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {sharedData.timetableData.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {sharedData.timetableData.semester && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Semester</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {sharedData.timetableData.semester}
                    </p>
                  </div>
                )}
                {sharedData.timetableData.academicYear && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Academic Year</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {sharedData.timetableData.academicYear}
                    </p>
                  </div>
                )}
              </div>

              {/* Subjects */}
              {sharedData.timetableData.subjects && sharedData.timetableData.subjects.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Subjects ({sharedData.timetableData.subjects.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sharedData.timetableData.subjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">{subject.name}</p>
                        {subject.code && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Code: {subject.code}
                          </p>
                        )}
                        {subject.teacher && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Teacher: {subject.teacher}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              {sharedData.timetableData.schedule && sharedData.timetableData.schedule.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Weekly Schedule
                  </h4>
                  <div className="space-y-4">
                    {sharedData.timetableData.schedule.map((daySchedule, index) => (
                      <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2">
                          <h5 className="font-bold text-slate-900 dark:text-white">{daySchedule.day}</h5>
                        </div>
                        <div className="p-4 space-y-2">
                          {daySchedule.periods && daySchedule.periods.length > 0 ? (
                            daySchedule.periods.map((period, pIndex) => (
                              <div 
                                key={pIndex}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                              >
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{period.subject}</p>
                                  {period.teacher && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{period.teacher}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {period.startTime} - {period.endTime}
                                  </p>
                                  {period.room && (
                                    <p className="text-xs text-slate-500 dark:text-slate-500">Room: {period.room}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 dark:text-slate-500 text-sm italic">No classes scheduled</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Button */}
              {!sharedData.isOwner && sharedData.permissions === 'import' && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleImport}
                    disabled={importing || sharedData.alreadyImported}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {importing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Import This Timetable
                      </>
                    )}
                  </Button>
                </div>
              )}

              {sharedData.permissions === 'view' && !sharedData.isOwner && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
                  <div className="flex items-center text-yellow-700 dark:text-yellow-400">
                    <Eye className="w-5 h-5 mr-2" />
                    <p className="font-medium">This timetable is view-only and cannot be imported.</p>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareImport;
