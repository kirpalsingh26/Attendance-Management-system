import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, BarChart3, TrendingUp, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';

const Dashboard = () => {
  const { timetable, stats, fetchTimetable, fetchStats } = useData();
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Lecture', 'Practical'

  useEffect(() => {
    fetchTimetable();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[32rem] h-[32rem] -top-48 -right-48 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[32rem] h-[32rem] top-1/2 -left-48 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-[28rem] h-[28rem] bottom-0 right-1/3 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-lg"></div>
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl leading-relaxed ml-8 font-medium">
            Overview of your attendance and statistics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<CheckSquare className="w-8 h-8 text-blue-600" />}
            title="Overall Attendance"
            value={stats?.overall?.percentage ? `${stats.overall.percentage}%` : '0%'}
            subtitle={`${stats?.overall?.present || 0} / ${stats?.overall?.total || 0} classes`}
            color="blue"
            warning={parseFloat(stats?.overall?.percentage || 0) < 75}
            requirement="75% Required"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            title="Classes Attended"
            value={stats?.overall?.present || 0}
            subtitle="Total present"
            color="green"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8 text-purple-600" />}
            title="Total Classes"
            value={stats?.overall?.total || 0}
            subtitle="All recorded"
            color="purple"
          />
          <StatCard
            icon={<BarChart3 className="w-8 h-8 text-orange-600" />}
            title="Subjects"
            value={timetable?.subjects?.length || 0}
            subtitle="In timetable"
            color="orange"
          />
        </div>

        {/* Subject Filter Buttons */}
        {stats?.subjects && stats.subjects.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="inline-flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50 gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                  typeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md'
                }`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setTypeFilter('Lecture')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                  typeFilter === 'Lecture'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md'
                }`}
              >
                Lectures
              </button>
              <button
                onClick={() => setTypeFilter('Practical')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                  typeFilter === 'Practical'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-md'
                }`}
              >
                Practicals
              </button>
            </div>
          </div>
        )}

        {/* Subject-wise Attendance */}
        {stats?.subjects && stats.subjects.length > 0 ? (
          <Card title="Subject-wise Attendance" className="mb-8">
            <div className="space-y-4">
              {stats.subjects
                .filter((subject) => {
                  if (typeFilter === 'all') return true;
                  // Get subject details from timetable to check type
                  const timetableSubject = timetable?.subjects?.find(
                    (s) => s.name === subject.subject
                  );
                  return timetableSubject?.type === typeFilter;
                })
                .map((subject) => (
                  <SubjectProgress key={subject.subject} data={subject} />
                ))}
            </div>
          </Card>
        ) : (
          <Card className="mb-8 text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Attendance Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your timetable and marking attendance
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/timetable"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Timetable</span>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <QuickActionCard
            to="/attendance"
            icon={<CheckSquare className="w-12 h-12 text-blue-600" />}
            title="Mark Attendance"
            description="Mark today's attendance quickly"
          />
          <QuickActionCard
            to="/timetable"
            icon={<Calendar className="w-12 h-12 text-purple-600" />}
            title="View Timetable"
            description="Check your class schedule"
          />
          <QuickActionCard
            to="/analytics"
            icon={<BarChart3 className="w-12 h-12 text-green-600" />}
            title="View Analytics"
            description="Detailed attendance insights"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color, warning, requirement }) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 hover:border-blue-300/70 dark:hover:border-blue-700/50 hover:from-blue-500/20 hover:to-blue-600/10',
    green: 'from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 hover:border-green-300/70 dark:hover:border-green-700/50 hover:from-green-500/20 hover:to-green-600/10',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 hover:border-purple-300/70 dark:hover:border-purple-700/50 hover:from-purple-500/20 hover:to-purple-600/10',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300/70 dark:hover:border-orange-700/50 hover:from-orange-500/20 hover:to-orange-600/10'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border-2 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6 group cursor-pointer ${warning ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center">
            {title}
            <span className="ml-2 w-1.5 h-1.5 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </p>
          <p className={`text-5xl sm:text-6xl font-black mb-1 transition-transform duration-300 group-hover:scale-105 ${warning ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          {requirement && (
            <div className={`mt-2 inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${warning ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
              {warning ? '⚠️ Below ' : '✓ '}{requirement}
            </div>
          )}
        </div>
        <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">{icon}</div>
      </div>
    </div>
  );
};

const SubjectProgress = ({ data }) => {
  const percentage = parseFloat(data.percentage);
  const color = percentage >= 75 ? 'bg-green-600' : percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600';
  const bgColor = percentage >= 75 ? 'bg-green-50 dark:bg-green-900/10' : percentage >= 60 ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-red-50 dark:bg-red-900/10';
  const borderColor = percentage < 75 ? 'border-2 border-red-300 dark:border-red-700' : '';
  
  // Calculate classes needed to reach 75%
  const classesNeeded = percentage < 75 ? Math.ceil((75 * data.total - 100 * data.present) / (100 - 75)) : 0;

  return (
    <div className={`p-5 rounded-2xl ${bgColor} ${borderColor} transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg backdrop-blur-sm`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${color}`}></span>
          {data.subject}
          {percentage < 75 && (
            <span className="ml-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
              Below 75%
            </span>
          )}
        </span>
        <span className="text-sm font-black text-slate-900 dark:text-white px-4 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md backdrop-blur-sm">
          {data.percentage}% ({data.present}/{data.total})
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3.5 overflow-hidden relative shadow-inner">
        {/* 75% threshold line */}
        <div className="absolute left-[75%] top-0 w-0.5 h-3.5 bg-slate-900 dark:bg-white z-10 shadow-lg"></div>
        <div
          className={`${color} h-3.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden shadow-md`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>
      {classesNeeded > 0 && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 flex items-center">
          <span className="mr-1">⚠️</span>
          Attend next {classesNeeded} class{classesNeeded > 1 ? 'es' : ''} to reach 75%
        </p>
      )}
    </div>
  );
};

const QuickActionCard = ({ to, icon, title, description }) => {
  return (
    <Link to={to} className="group block">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-6 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
            {icon}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
          <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Go to {title}
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
