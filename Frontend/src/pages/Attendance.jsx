import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Check, X, Calendar as CalendarIcon, Clock, User, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';

const Attendance = () => {
  const { timetable, markAttendance, loading, fetchTimetable } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [success, setSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedDay = format(selectedDate, 'EEEE');

  // Convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours, 10);
    const min = minutes.padStart(2, '0'); // Ensure minutes are always 2 digits
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hour = hour % 12;
    if (hour === 0) hour = 12;
    
    return `${hour}:${min} ${ampm}`;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding days for the start of the month
    const startDay = monthStart.getDay();
    const paddingDays = Array(startDay).fill(null);
    
    return [...paddingDays, ...days];
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  // Fetch timetable when component mounts
  useEffect(() => {
    console.log('Attendance page mounted, fetching timetable...');
    handleRefreshTimetable();
  }, []);

  // Function to refresh timetable data
  const handleRefreshTimetable = async () => {
    setIsRefreshing(true);
    console.log('Refreshing timetable data from database...');
    try {
      await fetchTimetable();
      console.log('Timetable data refreshed successfully');
      setSuccess('Timetable refreshed! Updated schedule loaded.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error refreshing timetable:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Log timetable changes
  useEffect(() => {
    if (timetable) {
      console.log('Timetable loaded in Attendance page:', timetable);
      console.log('Available days in schedule:', timetable.schedule?.map(s => s.day));
      console.log('Subjects:', timetable.subjects?.map(s => s.name));
      
      // Check if any day has periods
      const totalPeriods = timetable.schedule?.reduce((sum, day) => sum + (day.periods?.length || 0), 0) || 0;
      console.log('Total periods across all days:', totalPeriods);
      
      if (totalPeriods === 0) {
        console.warn('⚠️ Timetable has no periods scheduled! Please add periods to your timetable.');
      }
    } else {
      console.log('No timetable found in Attendance page');
    }
  }, [timetable]);

  const todaySchedule = timetable?.schedule?.find(s => s.day === selectedDay);
  
  // Log schedule lookup
  useEffect(() => {
    console.log('Looking for schedule on:', selectedDay);
    console.log('Found schedule:', todaySchedule);
    
    // Log first period timing specifically
    if (todaySchedule && todaySchedule.periods.length > 0) {
      const firstPeriod = todaySchedule.periods[0];
      console.log('🔍 FIRST PERIOD DEBUG:');
      console.log('  - Raw startTime:', firstPeriod.startTime);
      console.log('  - Raw endTime:', firstPeriod.endTime);
      console.log('  - Formatted startTime:', formatTime12Hour(firstPeriod.startTime));
      console.log('  - Formatted endTime:', formatTime12Hour(firstPeriod.endTime));
      console.log('  - Subject:', firstPeriod.subject);
    }
  }, [selectedDay, todaySchedule]);

  const toggleAttendance = (subject, period) => {
    const key = `${subject}-${period}`;
    const currentStatus = attendance[key];
    
    if (currentStatus === 'present') {
      setAttendance({ ...attendance, [key]: 'absent' });
    } else {
      setAttendance({ ...attendance, [key]: 'present' });
    }
  };

  const handleSave = async () => {
    if (!todaySchedule || todaySchedule.periods.length === 0) {
      return;
    }

    const records = todaySchedule.periods.map((period, index) => {
      const key = `${period.subject}-${index}`;
      return {
        subject: period.subject,
        status: attendance[key] || 'absent',
        period: `${period.startTime} - ${period.endTime}`,
        notes: ''
      };
    });

    const result = await markAttendance({
      date: format(selectedDate, 'yyyy-MM-dd'),
      day: selectedDay,
      records
    });

    if (result.success) {
      setSuccess('Attendance marked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (!timetable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 top-1/4 -right-48 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 bottom-1/4 -left-48 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Card className="text-center py-16 hover:shadow-2xl transition-all duration-300">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-30"></div>
              <CalendarIcon className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto relative" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              No Timetable Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please create a timetable first to mark attendance
            </p>
            <Button onClick={() => window.location.href = '/timetable'}>
              Create Timetable
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-1.5 h-12 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
              <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent leading-tight tracking-tight">
                Attendance
              </h1>
            </div>
            <button
              onClick={handleRefreshTimetable}
              disabled={isRefreshing}
              className="group flex items-center space-x-2 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Timetable"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed ml-[26px] font-medium">
            Track your presence with precision and style
          </p>
        </div>

        {success && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl animate-slide-in shadow-xl backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg ml-4">{success}</span>
            </div>
          </div>
        )}

        {/* Date Selector with Calendar */}
        <div className="mb-8 relative">
          <Card className="hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Calendar Picker */}
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center uppercase tracking-wide">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Select Date
                </label>
                
                {/* Calendar Toggle Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-md hover:shadow-xl font-semibold text-lg text-left flex items-center justify-between group"
                  >
                    <span className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>{format(selectedDate, 'MMMM dd, yyyy')}</span>
                    </span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Selected Day Display */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
                <div className="relative flex items-center space-x-5 px-10 py-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-3xl border-2 border-blue-200/50 dark:border-blue-700/50 shadow-xl backdrop-blur-sm">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-2xl">
                      <CalendarIcon className="w-10 h-10 text-white relative" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Selected Day</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">{selectedDay}</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Calendar Dropdown - Outside Card */}
          {showCalendar && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm" 
                onClick={() => setShowCalendar(false)}
              />
              
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 z-[9999] backdrop-blur-xl">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-3 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square rounded-xl font-semibold transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl scale-105 ring-4 ring-blue-500/20'
                            : isToday
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-500 shadow-md'
                            : isCurrentMonth
                            ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white hover:scale-105 hover:shadow-md'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Select Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleDateSelect(new Date())}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all hover:scale-105 active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Attendance Grid */}
        {todaySchedule && todaySchedule.periods.length > 0 ? (
          <>
            <Card title={`Schedule for ${selectedDay}`} className="mb-8 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="space-y-4">
                {todaySchedule.periods.map((period, index) => {
                  const key = `${period.subject}-${index}`;
                  const status = attendance[key];
                  const subjectColor = timetable.subjects.find(s => s.name === period.subject)?.color || '#3B82F6';

                  return (
                    <div
                      key={index}
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white dark:bg-slate-800/50 rounded-2xl border-l-[6px] border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-sm"
                      style={{ borderLeftColor: subjectColor }}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/0 to-transparent group-hover:via-slate-50/50 dark:group-hover:via-slate-700/20 rounded-2xl transition-all duration-500"></div>
                      
                      {/* Glowing effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${subjectColor}10, transparent)`,
                        }}
                      ></div>

                      <div className="flex items-start space-x-5 flex-1 relative z-10 mb-4 sm:mb-0">
                        {/* Subject color indicator */}
                        <div
                          className="w-1.5 h-20 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300 flex-shrink-0"
                          style={{ 
                            backgroundColor: subjectColor,
                            boxShadow: `0 8px 30px -8px ${subjectColor}80`
                          }}
                        ></div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Subject name */}
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 break-words">
                            {period.subject}
                          </h4>
                          
                          {/* Period details */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Time */}
                            <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3.5 py-1.5 rounded-lg font-semibold text-sm border border-blue-200/50 dark:border-blue-800/30 transition-all hover:shadow-md">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              {formatTime12Hour(period.startTime)} - {formatTime12Hour(period.endTime)}
                            </span>
                            
                            {/* Teacher */}
                            {period.teacher && (
                              <span className="inline-flex items-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3.5 py-1.5 rounded-lg font-semibold text-sm border border-purple-200/50 dark:border-purple-800/30 transition-all hover:shadow-md">
                                <User className="w-3.5 h-3.5 mr-1.5" />
                                {period.teacher}
                              </span>
                            )}
                            
                            {/* Room */}
                            {period.room && (
                              <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-lg font-semibold text-sm border border-emerald-200/50 dark:border-emerald-800/30 transition-all hover:shadow-md">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {period.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attendance buttons */}
                      <div className="flex space-x-3 relative z-10 self-end sm:self-center">
                        <button
                          onClick={() => toggleAttendance(period.subject, index)}
                          className={`group/btn relative p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                            status === 'present'
                              ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/30 scale-105 ring-2 ring-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-xl hover:ring-2 hover:ring-emerald-500/20'
                          }`}
                          title="Mark Present"
                        >
                          <Check className={`w-6 h-6 transition-transform ${status === 'present' ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                          {status === 'present' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            const key = `${period.subject}-${index}`;
                            setAttendance({ ...attendance, [key]: 'absent' });
                          }}
                          className={`group/btn relative p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                            status === 'absent'
                              ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/30 scale-105 ring-2 ring-red-500/20'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-xl hover:ring-2 hover:ring-red-500/20'
                          }`}
                          title="Mark Absent"
                        >
                          <X className={`w-6 h-6 transition-transform ${status === 'absent' ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                          {status === 'absent' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <Card className="text-center py-16 hover:shadow-2xl transition-all duration-300">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full blur-2xl opacity-20"></div>
              <CalendarIcon className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto relative animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              No Classes on {selectedDay}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a different date or update your timetable
            </p>
            <Button onClick={() => window.location.href = '/timetable'} variant="primary">
              Update Timetable
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Attendance;
