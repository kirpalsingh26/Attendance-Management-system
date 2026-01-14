import { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, X, Target, Award, Zap, BarChart3, AlertCircle, CheckCircle2, Clock, CalendarRange, Activity, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { attendanceAPI, timetableAPI } from '../api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';

const Analytics = () => {
  const { stats, attendance, timetable, fetchStats, fetchAttendance, fetchTimetable } = useData();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [semesterStats, setSemesterStats] = useState(null);
  const [loadingSemester, setLoadingSemester] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showSemesterAnalysis, setShowSemesterAnalysis] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [savingDates, setSavingDates] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchStats();
    fetchAttendance();
    
    // Load semester dates from timetable if available
    if (timetable?.semesterStartDate && timetable?.semesterEndDate) {
      const startDate = new Date(timetable.semesterStartDate).toISOString().split('T')[0];
      const endDate = new Date(timetable.semesterEndDate).toISOString().split('T')[0];
      setDateRange({ startDate, endDate });
      // Load semester stats with timetable dates
      loadSemesterStats({ startDate, endDate });
    } else {
      // Load all available data
      loadSemesterStats();
    }
  }, [timetable]);

  const loadSemesterStats = async (customRange = null) => {
    setLoadingSemester(true);
    try {
      const params = customRange || dateRange;
      const response = await attendanceAPI.getSemesterStats(
        params.startDate && params.endDate ? params : {}
      );
      console.log('📊 Semester stats response:', response.data);
      
      // Backend returns data in response.data.stats
      if (response.data.success) {
        const stats = response.data.stats;
        console.log('✅ Stats received:', stats);
        
        // Check if there's any data
        if (stats && (stats.monthlyTrends?.length > 0 || stats.summary?.totalDays > 0)) {
          setSemesterStats(stats);
          console.log('✅ Semester stats loaded successfully');
        } else {
          console.warn('⚠️ No attendance data found for semester analysis');
          setSemesterStats(null);
        }
      } else {
        console.warn('⚠️ Response not successful:', response.data);
        setSemesterStats(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch semester stats:', error);
      console.error('Error details:', error.response?.data);
      setSemesterStats(null);
    } finally {
      setLoadingSemester(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
  };

  const applySemesterFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      loadSemesterStats(dateRange);
    }
  };

  const saveSemesterDates = async () => {
    if (!timetable?._id || !dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setSavingDates(true);
    try {
      await timetableAPI.update(timetable._id, {
        semesterStartDate: new Date(dateRange.startDate),
        semesterEndDate: new Date(dateRange.endDate)
      });
      
      // Refresh timetable data from context
      await fetchTimetable();
      
      setEditingDates(false);
      alert('✅ Semester dates saved successfully!');
      loadSemesterStats(dateRange);
    } catch (error) {
      console.error('Failed to save semester dates:', error);
      alert('❌ Failed to save semester dates. Please try again.');
    } finally {
      setSavingDates(false);
    }
  };

  // Scroll to modal when it opens
  useEffect(() => {
    if (selectedSubject && detailedStats && modalRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedSubject, detailedStats]);

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
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center space-x-5 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent leading-tight tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live performance insights and trends
              </p>
            </div>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="relative overflow-hidden hover:-translate-y-3 transition-all duration-500 cursor-pointer group border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 flex items-center uppercase tracking-wider">
                    Overall Attendance
                    <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                  </p>
                  <p className="text-7xl font-black bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110">
                    {stats?.overall?.percentage || 0}%
                  </p>
                </div>
                <div className="relative">
                  <div className={'absolute inset-0 ' + (isGood ? 'bg-green-400' : 'bg-red-400') + ' rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity'}></div>
                  {isGood ? (
                    <TrendingUp className="relative w-16 h-16 text-green-500 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  ) : (
                    <TrendingDown className="relative w-16 h-16 text-red-500 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-2">
                <div className={isGood ? 'px-5 py-2.5 rounded-xl text-sm font-bold border-2 shadow-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:bg-gradient-to-r dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:border-green-700' : 'px-5 py-2.5 rounded-xl text-sm font-bold border-2 shadow-lg bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 dark:bg-gradient-to-r dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 dark:border-red-700'}>
                  {isGood ? '✓ Good Standing' : '⚠ Needs Improvement'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden hover:-translate-y-3 transition-all duration-500 cursor-pointer group border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center uppercase tracking-wider">
                  Total Classes Attended
                  <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                </p>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
              </div>
              <p className="text-7xl font-black bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110">
                {stats?.overall?.present || 0}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ 
                      width: stats?.overall?.present && stats?.overall?.total 
                        ? Math.round((stats.overall.present / stats.overall.total) * 100) + '%' 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-semibold">
                Out of <span className="text-slate-900 dark:text-white font-bold">{stats?.overall?.total || 0}</span> classes
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden hover:-translate-y-3 transition-all duration-500 cursor-pointer group border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center uppercase tracking-wider">
                  Classes Missed
                  <span className="ml-2 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                </p>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-20 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
              </div>
              <p className="text-7xl font-black bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 dark:from-red-400 dark:via-rose-400 dark:to-pink-400 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110">
                {stats?.overall?.absent || 0}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000" 
                    style={{ 
                      width: stats?.overall?.absent && stats?.overall?.total 
                        ? Math.round((stats.overall.absent / stats.overall.total) * 100) + '%' 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-semibold">
                <span className="text-red-600 dark:text-red-400 font-bold">
                  {stats?.overall?.absent && stats?.overall?.total 
                    ? Math.round((stats.overall.absent / stats.overall.total) * 100) 
                    : 0}%
                </span> absence rate
              </p>
            </div>
          </Card>
        </div>

        {/* Semester-based Analysis Section */}
        <Card className="mb-12 hover:shadow-3xl transition-all duration-500 border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm group">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                  <CalendarRange className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Semester Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {timetable?.semester || 'Current Semester'} - {timetable?.academicYear || new Date().getFullYear()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSemesterAnalysis(!showSemesterAnalysis)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {showSemesterAnalysis ? 'Hide Analysis' : 'Show Full Analysis'}
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border-2 border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider">Semester Duration</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {timetable?.semesterStartDate && timetable?.semesterEndDate ? (
                    <span>✓ Saved: {new Date(timetable.semesterStartDate).toLocaleDateString()} - {new Date(timetable.semesterEndDate).toLocaleDateString()}</span>
                  ) : (
                    <span>⚠ No semester dates configured. Set dates below for accurate analysis.</span>
                  )}
                </p>
              </div>
              {!editingDates && timetable?._id && (
                <button
                  onClick={() => setEditingDates(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {timetable?.semesterStartDate ? 'Edit Dates' : 'Set Dates'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={applySemesterFilter}
                disabled={!dateRange.startDate || !dateRange.endDate}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                Apply Filter
              </button>
              {editingDates && (
                <button
                  onClick={saveSemesterDates}
                  disabled={!dateRange.startDate || !dateRange.endDate || savingDates}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingDates ? 'Saving...' : 'Save to Timetable'}
                </button>
              )}
              {editingDates && (
                <button
                  onClick={() => {
                    setEditingDates(false);
                    // Reset to saved dates
                    if (timetable?.semesterStartDate && timetable?.semesterEndDate) {
                      const startDate = new Date(timetable.semesterStartDate).toISOString().split('T')[0];
                      const endDate = new Date(timetable.semesterEndDate).toISOString().split('T')[0];
                      setDateRange({ startDate, endDate });
                    }
                  }}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </button>
              )}
              {!editingDates && (
                <button
                  onClick={() => {
                    setDateRange({ startDate: '', endDate: '' });
                    loadSemesterStats();
                  }}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {loadingSemester ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading semester analytics...</p>
            </div>
          ) : semesterStats ? (
            <>
              {/* Semester Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase">Total Days</p>
                    <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                  <p className="text-5xl font-black text-blue-900 dark:text-blue-100">{semesterStats.summary.totalDays}</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase">Avg Attendance</p>
                    <Activity className="w-8 h-8 text-emerald-500 opacity-50" />
                  </div>
                  <p className="text-5xl font-black text-emerald-900 dark:text-emerald-100">{semesterStats.summary.averageAttendance}%</p>
                </div>
                
                <div className={`p-6 rounded-xl border-2 ${
                  semesterStats.summary.trend === 'good' 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800'
                    : semesterStats.summary.trend === 'warning'
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-sm font-bold uppercase ${
                      semesterStats.summary.trend === 'good' 
                        ? 'text-green-700 dark:text-green-300'
                        : semesterStats.summary.trend === 'warning'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>Status</p>
                    {semesterStats.summary.trend === 'good' ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-amber-500 opacity-50" />
                    )}
                  </div>
                  <p className={`text-2xl font-black ${
                    semesterStats.summary.trend === 'good' 
                      ? 'text-green-900 dark:text-green-100'
                      : semesterStats.summary.trend === 'warning'
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {semesterStats.summary.trend === 'good' ? 'Excellent' : semesterStats.summary.trend === 'warning' ? 'At Risk' : 'Critical'}
                  </p>
                </div>
              </div>

              {showSemesterAnalysis && (
                <>
                  {/* Monthly Trends Chart */}
                  {semesterStats.monthlyTrends.length > 0 && (
                    <div className="mb-8 p-8 bg-gradient-to-br from-purple-50/70 via-pink-50/50 to-rose-50/50 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-rose-950/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/50">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                        Monthly Attendance Trends
                      </h4>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={semesterStats.monthlyTrends}>
                          <defs>
                            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#475569"
                            tick={{ fill: '#475569', fontWeight: 600 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            stroke="#475569"
                            tick={{ fill: '#475569', fontWeight: 600 }}
                            label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.98)',
                              border: '2px solid #8B5CF6',
                              borderRadius: '12px',
                              boxShadow: '0 10px 40px -12px rgba(0, 0, 0, 0.25)',
                              padding: '12px 16px'
                            }}
                          />
                          <Legend />
                          <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} label="Required 75%" />
                          <Area 
                            type="monotone" 
                            dataKey="percentage" 
                            fill="url(#monthlyGradient)" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            name="Attendance %"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="percentage" 
                            stroke="#8B5CF6" 
                            strokeWidth={3} 
                            dot={{ fill: '#8B5CF6', r: 6 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Subject Progress Over Time */}
                  {semesterStats.subjectProgress.length > 0 && (
                    <div className="p-8 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-cyan-50/50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-cyan-950/20 rounded-2xl border-2 border-indigo-200/50 dark:border-indigo-800/50">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                        Subject-wise Progress Throughout Semester
                      </h4>
                      <div className="space-y-6">
                        {semesterStats.subjectProgress.map((subject, idx) => (
                          <div key={idx} className="p-6 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                            <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{subject.subject}</h5>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={subject.months}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#475569"
                                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                />
                                <YAxis 
                                  domain={[0, 100]}
                                  stroke="#475569"
                                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    border: '2px solid #6366F1',
                                    borderRadius: '12px',
                                    padding: '8px 12px'
                                  }}
                                />
                                <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="5 5" />
                                <Line 
                                  type="monotone" 
                                  dataKey="percentage" 
                                  stroke="#6366F1" 
                                  strokeWidth={3} 
                                  dot={{ fill: '#6366F1', r: 5 }}
                                  name="Attendance %"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
              <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Attendance Data Yet</h4>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">Start marking daily attendance to see semester analysis!</p>
              <div className="text-sm text-slate-500 dark:text-slate-500">
                <p>📅 Go to Attendance page to mark your first attendance</p>
                <p>📊 Analysis will appear automatically once you have data</p>
              </div>
            </div>
          )}
        </Card>

        {/* Charts */}
        {subjectData.length > 0 ? (
          <>
            {/* Subject-wise Bar Chart */}
            <Card className="mb-12 hover:shadow-3xl transition-all duration-500 border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Subject-wise Attendance</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium ml-12">Compare performance across all subjects</p>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-inner backdrop-blur-sm">
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={subjectData} margin={{ top: 25, right: 35, left: 5, bottom: 25 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                        <stop offset="40%" stopColor="#6366F1" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.85} />
                      </linearGradient>
                      <filter id="shadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                        <feOffset dx="0" dy="5" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#475569"
                      tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                      label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fill: '#1e293b', fontWeight: 800, fontSize: 14 } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.99)',
                        border: '3px solid #818cf8',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '16px 20px',
                        fontWeight: 700
                      }}
                      cursor={{ fill: 'rgba(99, 102, 241, 0.15)', radius: 10 }}
                      labelStyle={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: '10px' }}
                      itemStyle={{ color: '#6366f1', fontSize: 14 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '25px', fontWeight: 700, fontSize: 14 }}
                      iconType="circle"
                      iconSize={16}
                    />
                    <ReferenceLine 
                      y={75} 
                      stroke="#f59e0b" 
                      strokeWidth={4} 
                      strokeDasharray="10 5"
                      label={{ 
                        value: '75% Required', 
                        position: 'insideTopRight', 
                        fill: '#ea580c', 
                        fontWeight: 800,
                        fontSize: 14,
                        style: { textShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                      }}
                      filter="url(#glow)"
                    />
                    <Bar 
                      dataKey="attendance" 
                      fill="url(#colorGradient)" 
                      name="Attendance %" 
                      radius={[12, 12, 0, 0]}
                      filter="url(#shadow)"
                      maxBarSize={70}
                      animationDuration={1000}
                      animationBegin={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Subject-wise Combined Chart */}
            <Card className="mb-12 hover:shadow-3xl transition-all duration-500 border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Subject-wise Attendance Overview</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium ml-12">Compare present and absent classes across all subjects</p>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/50 shadow-inner backdrop-blur-sm">
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={subjectData} margin={{ top: 25, right: 35, left: 5, bottom: 25 }} barGap={8}>
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="50%" stopColor="#059669" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#047857" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                        <stop offset="50%" stopColor="#DC2626" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.9} />
                      </linearGradient>
                      <filter id="barShadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                        <feOffset dx="0" dy="5" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                    />
                    <YAxis 
                      stroke="#475569"
                      tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
                      tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                      label={{ value: 'Number of Classes', angle: -90, position: 'insideLeft', style: { fill: '#1e293b', fontWeight: 800, fontSize: 14 } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.99)',
                        border: '3px solid #a78bfa',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '16px 20px',
                        fontWeight: 700
                      }}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.15)', radius: 10 }}
                      labelStyle={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: '10px' }}
                      itemStyle={{ fontSize: 14 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '25px', fontWeight: 700, fontSize: 14 }}
                      iconType="circle"
                      iconSize={16}
                    />
                    <Bar 
                      dataKey="present" 
                      fill="url(#presentGradient)" 
                      name="Classes Attended" 
                      radius={[12, 12, 0, 0]}
                      filter="url(#barShadow)"
                      maxBarSize={50}
                      animationDuration={1000}
                      animationBegin={0}
                    />
                    <Bar 
                      dataKey="absent" 
                      fill="url(#absentGradient)" 
                      name="Classes Missed" 
                      radius={[12, 12, 0, 0]}
                      filter="url(#barShadow)"
                      maxBarSize={50}
                      animationDuration={1000}
                      animationBegin={200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Attendance Trend Line Chart */}
            {trendData.length > 0 && (
              <Card className="mb-12 hover:shadow-3xl transition-all duration-500 border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Trend</h3>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">Last 30 Days</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium ml-12">Track your daily performance over time</p>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-inner backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                          <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.9} />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.1} />
                        </linearGradient>
                        <filter id="lineShadow">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                          <feOffset dx="0" dy="3" result="offsetblur" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5" />
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <filter id="dotGlow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#475569"
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                        angle={-35}
                        textAnchor="end"
                        height={75}
                        tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#475569"
                        tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
                        tickLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 3 }}
                        label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fill: '#1e293b', fontWeight: 800, fontSize: 14 } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.99)',
                          border: '3px solid #6ee7b7',
                          borderRadius: '20px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          padding: '16px 20px',
                          fontWeight: 700
                        }}
                        cursor={{ stroke: '#10B981', strokeWidth: 3, strokeDasharray: '5 5' }}
                        labelStyle={{ color: '#0f172a', fontWeight: 800, fontSize: 15, marginBottom: '10px' }}
                        itemStyle={{ color: '#059669', fontSize: 14 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '25px', fontWeight: 700, fontSize: 14 }}
                        iconType="circle"
                        iconSize={16}
                      />
                      <ReferenceLine 
                        y={75} 
                        stroke="#f59e0b" 
                        strokeWidth={4} 
                        strokeDasharray="10 5"
                        label={{ 
                          value: '75% Target', 
                          position: 'insideTopRight', 
                          fill: '#ea580c', 
                          fontWeight: 800,
                          fontSize: 14,
                          style: { textShadow: '0 2px 4px rgba(0,0,0,0.1)' }
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="none"
                        fill="url(#areaGradient)"
                        animationDuration={1500}
                      />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="url(#lineGradient)"
                        strokeWidth={5}
                        dot={{ fill: '#10B981', r: 7, strokeWidth: 3, stroke: '#fff', filter: 'url(#dotGlow)' }}
                        activeDot={{ r: 10, strokeWidth: 4, fill: '#059669', stroke: '#fff', filter: 'url(#dotGlow)' }}
                        name="Daily Attendance %"
                        filter="url(#lineShadow)"
                        animationDuration={1500}
                        animationBegin={0}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Subject Details Table */}
            <Card className="border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Detailed Subject Statistics</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium ml-12">Complete breakdown of your attendance record</p>
                </div>
              </div>
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
                      const borderClass = percentage < 75 ? 'border-l-4 border-l-red-500' : '';
                      const stripingClass = idx % 2 === 0 && percentage >= 75 ? 'bg-white dark:bg-gray-800' : percentage >= 75 ? 'bg-gray-50/50 dark:bg-gray-800/30' : '';
                      const rowClassName = 'border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group ' + rowBg + ' ' + borderClass + ' ' + stripingClass;

                      return (
                        <tr
                          key={subject.subject}
                          onClick={() => fetchDetailedStats(subject.subject)}
                          className={rowClassName}
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
                            <span className={'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ' + statusBg + ' ' + statusColor}>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center py-8 px-4">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl flex justify-between items-center z-50 shadow-xl">
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
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">75%</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {detailedStats.targets.for75 === 0 ? '✓ Achieved' : detailedStats.targets.for75 + ' classes'}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-700">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">80%</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {detailedStats.targets.for80 === 0 ? '✓ Achieved' : detailedStats.targets.for80 + ' classes'}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">85%</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {detailedStats.targets.for85 === 0 ? '✓ Achieved' : detailedStats.targets.for85 + ' classes'}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">90%</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {detailedStats.targets.for90 === 0 ? '✓ Achieved' : detailedStats.targets.for90 + ' classes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Trend */}
              {detailedStats.monthlyTrend.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Monthly Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={detailedStats.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="modalLineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 700 } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '2px solid #c4b5fd',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                        itemStyle={{ color: '#8B5CF6', fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '16px', fontWeight: 600 }} />
                      <ReferenceLine 
                        y={75} 
                        stroke="#ef4444" 
                        strokeWidth={2.5} 
                        strokeDasharray="6 4"
                        label={{ value: '75% Target', position: 'right', fill: '#ef4444', fontWeight: 700, fontSize: 12 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#8B5CF6" 
                        strokeWidth={4} 
                        name="Attendance %"
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#7C3AED' }}
                        fill="url(#modalLineGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Pattern */}
              {detailedStats.weeklyPattern.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Weekly Attendance Pattern
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={detailedStats.weeklyPattern} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="modalBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7} />
                        </linearGradient>
                        <filter id="barShadow">
                          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 700 } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '2px solid #bfdbfe',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                        itemStyle={{ color: '#3B82F6', fontWeight: 600 }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '16px', fontWeight: 600 }} />
                      <ReferenceLine 
                        y={75} 
                        stroke="#ef4444" 
                        strokeWidth={2.5} 
                        strokeDasharray="6 4"
                        label={{ value: '75% Target', position: 'right', fill: '#ef4444', fontWeight: 700, fontSize: 12 }}
                      />
                      <Bar 
                        dataKey="percentage" 
                        fill="url(#modalBarGradient)" 
                        name="Attendance %" 
                        radius={[12, 12, 0, 0]}
                        filter="url(#barShadow)"
                        maxBarSize={80}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Records */}
              {detailedStats.recentRecords.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Attendance Records</h3>
                  <div className="space-y-2">
                    {detailedStats.recentRecords.map((record, idx) => {
                      const statusDotClass = 'w-3 h-3 rounded-full ' + (record.status === 'present' ? 'bg-green-500' : 'bg-red-500');
                      const statusBadgeClass = record.status === 'present'
                        ? 'px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
                      
                      return (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className={statusDotClass}></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{record.day}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={statusBadgeClass}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;