import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Calendar as CalendarIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// Helper function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours, 10);
  const min = minutes.padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12;
  if (hour === 0) hour = 12;
  
  return `${hour}:${min} ${period}`;
};

// College class timings - 1 hour each for Lectures, 8:30 AM to 4:30 PM
// Recess: 11:30 AM to 12:30 PM
const LECTURE_TIMINGS = [
  { startTime: '08:30', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:30' },
  // RECESS: 11:30 - 12:30
  { startTime: '12:30', endTime: '13:30' },
  { startTime: '13:30', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:30' }
];

// Practical class timings - 2 hours each
const PRACTICAL_TIMINGS = [
  { startTime: '08:30', endTime: '10:30' },
  { startTime: '10:30', endTime: '12:30' }, // Ends at recess
  // RECESS: 11:30 - 12:30 (but practical continues if started at 10:30)
  { startTime: '12:30', endTime: '14:30' },
  { startTime: '14:30', endTime: '16:30' }
];

const TimetableCreator = () => {
  const { timetable, saveTimetable, loading, fetchTimetable } = useData();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: 'My Timetable',
    semester: '',
    academicYear: '',
    subjects: [],
    schedule: DAYS.map(day => ({ day, periods: [] }))
  });

  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    type: 'Lecture', 
    color: COLORS[0],
    classTime: '',
    teacher: '',
    room: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch timetable on component mount
  useEffect(() => {
    console.log('Timetable page mounted, fetching timetable...');
    fetchTimetable();
  }, []);

  // Update formData when timetable is loaded from API or saved
  useEffect(() => {
    if (timetable) {
      console.log('Timetable loaded in Timetable page:', timetable);
      console.log('Subjects from timetable:', JSON.stringify(timetable.subjects, null, 2));
      setFormData({
        name: timetable.name || 'My Timetable',
        semester: timetable.semester || '',
        academicYear: timetable.academicYear || '',
        subjects: timetable.subjects || [],
        schedule: timetable.schedule || DAYS.map(day => ({ day, periods: [] }))
      });
      console.log('FormData updated with timetable');
    } else {
      console.log('No timetable found in context');
    }
  }, [timetable]);

  const addSubject = () => {
    if (!newSubject.name) {
      setError('Please enter subject name');
      return;
    }

    if (formData.subjects.find(s => s.name === newSubject.name)) {
      setError('Subject already exists');
      return;
    }

    setFormData({
      ...formData,
      subjects: [...formData.subjects, { ...newSubject }]
    });
    setNewSubject({ 
      name: '', 
      type: 'Lecture', 
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      classTime: '',
      teacher: '',
      room: ''
    });
    setError('');
  };

  const removeSubject = (subjectName) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s.name !== subjectName),
      schedule: formData.schedule.map(day => ({
        ...day,
        periods: day.periods.filter(p => p.subject !== subjectName)
      }))
    });
    setError('');
  };

  const addPeriod = (dayIndex) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex].periods.push({
      subject: formData.subjects[0]?.name || '',
      startTime: '09:00',
      endTime: '10:00',
      teacher: '',
      room: ''
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updatePeriod = (dayIndex, periodIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex].periods[periodIndex][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removePeriod = (dayIndex, periodIndex) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex].periods.splice(periodIndex, 1);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSave = async () => {
    if (formData.subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setError('');
    console.log('Saving timetable with data:', JSON.stringify(formData, null, 2));
    const result = await saveTimetable(formData);
    
    if (result.success) {
      setSuccess('Timetable saved successfully!');
      console.log('Save completed, timetable should now have all data');
      // Don't redirect, stay on page to verify data persists
    } else {
      setError(result.message);
    }
  };

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
              Timetable
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed ml-[26px] font-medium">
            Organize your schedule with precision and clarity
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:via-rose-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl animate-slide-in shadow-xl backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-700 dark:text-red-300 font-semibold text-lg ml-4">{error}</span>
            </div>
          </div>
        )}

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

        {/* Add Subject */}
        <div className="relative mb-10 group">
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-15 group-hover:opacity-25 transition-all duration-700"></div>
          
          <Card title="Add Subjects" subtitle="Create your subjects with unique colors for visual identification" className="relative border-2 border-blue-300/60 dark:border-blue-600/60 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
            
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10 rounded-2xl p-8 mb-6 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-xl backdrop-blur-sm">
              {/* Enhanced decorative elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-2xl -z-0 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/5 to-cyan-400/5 rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
            
            <div className="relative z-10 space-y-6">
              {/* Subject Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-md"></div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Subject Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 flex items-center justify-center shadow-sm border border-purple-200/50 dark:border-purple-800/30">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span>Subject Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                      placeholder="e.g., Mathematics"
                      className="shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-800/30">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span>Class Type</span>
                    </label>
                    <select
                      value={newSubject.type}
                      onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md font-medium h-[46px]"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Practical">Practical</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-900/20 flex items-center justify-center shadow-sm border border-pink-200/50 dark:border-pink-800/30">
                        <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <span>Color Tag</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
                      <div className="relative flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 group-hover:border-pink-400 dark:group-hover:border-pink-500 transition-all duration-300 shadow-sm hover:shadow-md h-[46px]">
                        <input
                          type="color"
                          value={newSubject.color}
                          onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <div className="flex-1 flex items-center justify-end gap-3">
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {newSubject.color}
                          </span>
                          <div 
                            className="w-8 h-8 rounded-lg shadow-lg border-2 border-white dark:border-slate-700"
                            style={{ backgroundColor: newSubject.color }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Details Section */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-md"></div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Class Details</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">(Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span>Class Time</span>
                    </label>
                    <select
                      value={newSubject.classTime}
                      onChange={(e) => setNewSubject({ ...newSubject, classTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <option value="">Select Time Slot</option>
                      {newSubject.type === 'Practical' ? (
                        <>
                          <optgroup label="Practical Slots (2 Hours)">
                            {PRACTICAL_TIMINGS.map((slot, idx) => (
                              <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)} (2 hrs)
                              </option>
                            ))}
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="Morning Classes (1 Hour)">
                            {LECTURE_TIMINGS.slice(0, 3).map((slot, idx) => (
                              <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Break Time" disabled>
                            <option disabled>11:30 AM - 12:30 PM (Recess)</option>
                          </optgroup>
                          <optgroup label="Afternoon Classes (1 Hour)">
                            {LECTURE_TIMINGS.slice(3).map((slot, idx) => (
                              <option key={idx + 3} value={`${slot.startTime}-${slot.endTime}`}>
                                {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span>Teacher Name</span>
                    </label>
                    <Input
                      value={newSubject.teacher}
                      onChange={(e) => setNewSubject({ ...newSubject, teacher: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                      placeholder="e.g., Dr. Smith"
                      className="shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span>Room Number</span>
                    </label>
                    <Input
                      value={newSubject.room}
                      onChange={(e) => setNewSubject({ ...newSubject, room: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                      placeholder="e.g., 101"
                      className="shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={addSubject}
                  className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-90 relative z-10" />
                  <span className="relative z-10">Add Subject</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.subjects.map((subject) => {
              console.log('Rendering subject card:', subject);
              return (
              <div
                key={subject.name}
                className="group relative p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] backdrop-blur-sm"
                style={{
                  borderLeftWidth: '6px',
                  borderLeftColor: subject.color
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 shadow-lg border-2 border-white dark:border-slate-700"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-slate-900 dark:text-white truncate mb-1">
                        {subject.name}
                      </p>
                      {subject.type && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30">
                          {subject.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSubject(subject.name)}
                    className="flex-shrink-0 ml-2 p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"
                    title="Remove subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {subject.classTime ? (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{subject.classTime}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-400 dark:text-gray-500 italic text-xs">No time set</span>
                    </div>
                  )}
                  {subject.teacher ? (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{subject.teacher}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-400 dark:text-gray-500 italic text-xs">No teacher assigned</span>
                    </div>
                  )}
                  {subject.room ? (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Room {subject.room}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-400 dark:text-gray-500 italic text-xs">No room assigned</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            {formData.subjects.length === 0 && (
              <div className="col-span-full text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                <Plus className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">No subjects added yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Add your first subject to get started</p>
              </div>
            )}
          </div>
        </Card>
        </div>

        {/* Schedule */}
        {formData.subjects.length > 0 && (
          <Card title="Weekly Schedule" subtitle="Organize your classes by day and time slot" className="mb-10 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="space-y-6">
              {formData.schedule.map((daySchedule, dayIndex) => (
                <div key={daySchedule.day} className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-md"></div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                        {daySchedule.day}
                      </h4>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                        {daySchedule.periods.length} {daySchedule.periods.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                    <Button
                      onClick={() => addPeriod(dayIndex)}
                      variant="primary"
                      size="sm"
                      disabled={formData.subjects.length === 0}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Period
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {daySchedule.periods.map((period, periodIndex) => {
                      const subjectColor = formData.subjects.find(s => s.name === period.subject)?.color || '#3B82F6';
                      const subjectType = formData.subjects.find(s => s.name === period.subject)?.type || 'Lecture';
                      const isPractical = subjectType === 'Practical';
                      const timings = isPractical ? PRACTICAL_TIMINGS : LECTURE_TIMINGS;
                      
                      return (
                        <div
                          key={periodIndex}
                          className="relative group p-5 bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{ borderLeftColor: subjectColor }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* 0: Class Time - Time Slot */}
                            <div className="md:col-span-3">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Time Slot {isPractical && <span className="text-purple-600">(2 hrs)</span>}
                              </label>
                              <select
                                value={`${period.startTime}-${period.endTime}`}
                                onChange={(e) => {
                                  const [start, end] = e.target.value.split('-');
                                  updatePeriod(dayIndex, periodIndex, 'startTime', start);
                                  updatePeriod(dayIndex, periodIndex, 'endTime', end);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                              >
                                {isPractical ? (
                                  <optgroup label="Practical Slots (2 Hours)">
                                    {timings.map((slot, idx) => (
                                      <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                        {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                      </option>
                                    ))}
                                  </optgroup>
                                ) : (
                                  <>
                                    <optgroup label="Morning Classes">
                                      {timings.slice(0, 3).map((slot, idx) => (
                                        <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                          {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Recess" disabled>
                                      <option disabled>11:30 AM - 12:30 PM (Recess)</option>
                                    </optgroup>
                                    <optgroup label="Afternoon Classes">
                                      {timings.slice(3).map((slot, idx) => (
                                        <option key={idx + 3} value={`${slot.startTime}-${slot.endTime}`}>
                                          {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                        </option>
                                      ))}
                                    </optgroup>
                                  </>
                                )}
                              </select>
                            </div>
                            {/* 1: Subject Name */}
                            <div className="md:col-span-3">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Subject Name</label>
                              <select
                                value={period.subject}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'subject', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                style={{
                                  borderLeftWidth: '4px',
                                  borderLeftColor: subjectColor
                                }}
                              >
                                {formData.subjects.map(s => (
                                  <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                            {/* 2: Teacher Name */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Teacher Name</label>
                              <select
                                value={period.teacher}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'teacher', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                              >
                                <option value="">Select Teacher</option>
                                {[...new Set(formData.subjects.map(s => s.teacher).filter(t => t))].map(teacher => (
                                  <option key={teacher} value={teacher}>{teacher}</option>
                                ))}
                              </select>
                            </div>
                            {/* 3: Class */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Class</label>
                              <select
                                value={period.room}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'room', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                              >
                                <option value="">Select Room</option>
                                {[...new Set(formData.subjects.map(s => s.room).filter(r => r))].map(room => (
                                  <option key={room} value={room}>{room}</option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2 flex items-end justify-center">
                              <button
                                onClick={() => removePeriod(dayIndex, periodIndex)}
                                className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                title="Remove period"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {daySchedule.periods.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                        <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No periods scheduled for {daySchedule.day}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 sticky bottom-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={loading || formData.subjects.length === 0}
            className="w-full sm:w-auto"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Timetable'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimetableCreator;
