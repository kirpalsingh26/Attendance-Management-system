import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, X, Target, Award, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { attendanceAPI } from '../api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';

const Analytics = () => {
  const { stats, attendance, fetchStats, fetchAttendance } = useData();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAttendance();
  }, []);

  const fetchDetailedStats = async (subject) => {
    setLoadingDetails(true);
    try {
      const response = await attendanceAPI.getDetailedStats(subject);
      setDetailedStats(response.data.data);
      setSelectedSubject(subject);
    } catch (error) {
      console.error('Failed to fetch detailed stats:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedSubject(null);
    setDetailedStats(null);
  };

  // Prepare data for charts
  const subjectData = stats?.subjects?.map(subject => ({
    name: subject.subject,
    attendance: parseFloat(subject.percentage),
    present: subject.present,
    absent: subject.absent
  })) || [];

  // Prepare trend data (last 30 days)
  const trendData = attendance?.slice(0, 30).reverse().map(record => {
    const totalPresent = record.records.filter(r => r.status === 'present').length;
    const totalClasses = record.records.length;
    return {
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      percentage: totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0
    };
  }) || [];

  const overallPercentage = parseFloat(stats?.overall?.percentage || 0);
  const isGood = overallPercentage >= 75;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-48 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-500/3 dark:to-cyan-500/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bottom-1/4 -left-48 bg-gradient-to-br from-purple-400/5 to-pink-400/5 dark:from-purple-500/3 dark:to-pink-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-400/3 to-violet-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-1.5 h-12 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent leading-tight tracking-tight">
              Analytics
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed ml-[26px] font-medium">
            Comprehensive insights into your attendance performance
          </p>
        </div>

        {/* 75% Requirement Banner */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl shadow-2xl backdrop-blur-sm border border-blue-400/30">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-5">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Minimum Attendance Requirement</h3>
                  <p className="text-blue-100 text-base font-medium">Each subject requires at least 75% attendance to meet academic standards</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border-2 border-white/30">
                <p className="text-5xl font-black text-white">75%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="hover:-translate-y-2 transition-all duration-300 cursor-pointer group border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center uppercase tracking-wider">
                  Overall Attendance
                  <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </p>
                <p className="text-6xl font-black text-slate-900 dark:text-white transition-transform duration-300 group-hover:scale-110">
                  {stats?.overall?.percentage || 0}%
                </p>
              </div>
              {isGood ? (
                <TrendingUp className="w-14 h-14 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
              ) : (
                <TrendingDown className="w-14 h-14 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
              )}
            </div>
            <div className="mt-5 flex items-center space-x-2">
              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                isGood ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {isGood ? 'Good Standing' : 'Needs Improvement'}
              </div>
            </div>
          </Card>

          <Card className="hover:-translate-y-2 transition-all duration-300 cursor-pointer group border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center uppercase tracking-wider">
              Total Classes Attended
              <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </p>
            <p className="text-6xl font-black text-slate-900 dark:text-white transition-transform duration-300 group-hover:scale-110">
              {stats?.overall?.present || 0}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-semibold">
              Out of {stats?.overall?.total || 0} classes
            </p>
          </Card>

          <Card className="hover:-translate-y-2 transition-all duration-300 cursor-pointer group border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center uppercase tracking-wider">
              Classes Missed
              <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </p>
            <p className="text-6xl font-black text-red-600 dark:text-red-400 transition-transform duration-300 group-hover:scale-110">
              {stats?.overall?.absent || 0}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-semibold">
              Total absences
            </p>
          </Card>
        </div>

        {/* Charts */}
        {subjectData.length > 0 ? (
          <>
            {/* Subject-wise Bar Chart */}
            <Card title="Subject-wise Attendance (%)" subtitle="Compare attendance across all subjects" className="mb-10 hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="p-8 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-inner">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="attendance" fill="url(#colorGradient)" name="Attendance %" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Attendance Trend Line Chart */}
            {trendData.length > 0 && (
              <Card title="Attendance Trend (Last 30 Days)" subtitle="Track your daily attendance performance" className="mb-10 hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="p-8 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/30 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-inner">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Daily Attendance %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Subject Details Table */}
            <Card title="Detailed Subject Statistics" subtitle="Complete breakdown of your attendance" className="border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="overflow-x-auto rounded-2xl">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="text-left py-5 px-6 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Subject</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Present</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Absent</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Classes to 75%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.subjects.map((subject, idx) => {
                      const percentage = parseFloat(subject.percentage);
                      const status = percentage >= 75 ? 'Meets Requirement' : 'Below Requirement';
                      const statusColor = percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                      const statusBg = percentage >= 75 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
                      const classesNeeded = percentage < 75 ? Math.ceil((75 * subject.total - 100 * subject.present) / (100 - 75)) : 0;
                      const rowBg = percentage < 75 ? 'bg-red-50/50 dark:bg-red-900/10' : '';

                      return (
                        <tr 
                          key={subject.subject} 
                          onClick={() => fetchDetailedStats(subject.subject)}
                          className={`border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group ${rowBg} ${percentage < 75 ? 'border-l-4 border-l-red-500' : ''} ${idx % 2 === 0 && percentage >= 75 ? 'bg-white dark:bg-gray-800' : percentage >= 75 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}
                        >
                          <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              {percentage < 75 && <span className="mr-2 text-red-500">⚠️</span>}
                              {subject.subject}
                              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→ View Details</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              {subject.present}
                            </span>
                          </td>
                          <td className="text-center py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              {subject.absent}
                            </span>
                          </td>
                          <td className="text-center py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                            {subject.total}
                          </td>
                          <td className="text-center py-4 px-6">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">{subject.percentage}%</span>
                          </td>
                          <td className="text-center py-4 px-6">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${statusBg} ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className="text-center py-4 px-6">
                            {classesNeeded > 0 ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 animate-pulse">
                                {classesNeeded} class{classesNeeded > 1 ? 'es' : ''}
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 font-bold text-xl">✓</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start marking attendance to see analytics
            </p>
          </Card>
        )}
      </div>

      {/* Detailed Analytics Modal */}
      {selectedSubject && detailedStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{selectedSubject}</h2>
                <p className="text-blue-100">Detailed Analytics & Insights</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Attendance</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{detailedStats.overview.percentage}%</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl border border-green-200 dark:border-green-700">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Present</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{detailedStats.overview.present}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-2xl border border-red-200 dark:border-red-700">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Absent</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{detailedStats.overview.absent}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-2xl border border-purple-200 dark:border-purple-700">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Total Classes</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{detailedStats.overview.total}</p>
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Longest Streak</p>
                      <p className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">{detailedStats.overview.longestStreak}</p>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">Consecutive classes attended</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Current Streak</p>
                      <p className="text-4xl font-bold text-cyan-900 dark:text-cyan-100">{detailedStats.overview.currentStreak}</p>
                    </div>
                  </div>
                  <p className="text-xs text-cyan-700 dark:text-cyan-400">Keep it going!</p>
                </div>
              </div>

              {/* Target Achievement */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Classes Needed to Reach Target</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: '75%', value: detailedStats.targets.for75, color: 'yellow' },
                    { label: '80%', value: detailedStats.targets.for80, color: 'green' },
                    { label: '85%', value: detailedStats.targets.for85, color: 'blue' },
                    { label: '90%', value: detailedStats.targets.for90, color: 'purple' }
                  ].map(target => (
                    <div key={target.label} className={`bg-${target.color}-100 dark:bg-${target.color}-900/30 p-4 rounded-xl border border-${target.color}-200 dark:border-${target.color}-700`}>
                      <p className={`text-sm font-semibold text-${target.color}-700 dark:text-${target.color}-300 mb-1`}>{target.label}</p>
                      <p className={`text-2xl font-bold text-${target.color}-900 dark:text-${target.color}-100`}>
                        {target.value === 0 ? '✓ Achieved' : `${target.value} classes`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend */}
              {detailedStats.monthlyTrend.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={detailedStats.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="percentage" stroke="#8B5CF6" strokeWidth={3} name="Attendance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Pattern */}
              {detailedStats.weeklyPattern.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weekly Attendance Pattern</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={detailedStats.weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="percentage" fill="#3B82F6" name="Attendance %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Records */}
              {detailedStats.recentRecords.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Attendance Records</h3>
                  <div className="space-y-2">
                    {detailedStats.recentRecords.map((record, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{record.day}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
