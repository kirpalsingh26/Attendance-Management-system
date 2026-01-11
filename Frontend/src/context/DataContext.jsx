import { createContext, useContext, useState, useEffect } from 'react';
import { timetableAPI, attendanceAPI } from '../api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTimetable();
      fetchAttendance();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchTimetable = async () => {
    try {
      console.log('Fetching timetable...');
      const response = await timetableAPI.get();
      console.log('Timetable response:', response.data);
      setTimetable(response.data.timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAll();
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await attendanceAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const saveTimetable = async (data) => {
    try {
      setLoading(true);
      console.log('Saving timetable:', data);
      const response = await timetableAPI.create(data);
      console.log('Save response:', response.data);
      setTimetable(response.data.timetable);
      // Refetch to ensure we have the latest data
      await fetchTimetable();
      return { success: true };
    } catch (error) {
      console.error('Error saving timetable:', error);
      console.error('Error details:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to save timetable' 
      };
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (data) => {
    try {
      setLoading(true);
      const response = await attendanceAPI.create(data);
      await fetchAttendance();
      await fetchStats();
      return { success: true, data: response.data.attendance };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to mark attendance' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    timetable,
    attendance,
    stats,
    loading,
    fetchTimetable,
    fetchAttendance,
    fetchStats,
    saveTimetable,
    markAttendance
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
