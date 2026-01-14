const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Test credentials
const user1 = {
  email: 'testuser1@test.com',
  password: 'Test123456',
  username: 'testuser1'
};

const user2 = {
  email: 'testuser2@test.com',
  password: 'Test123456',
  username: 'testuser2'
};

let user1Token = '';
let user2Token = '';
let shareId = '';

// Helper function to register/login
async function loginOrRegister(user) {
  try {
    // Try login first
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    console.log(`✅ Logged in as ${user.username}`);
    return loginRes.data.token;
  } catch (error) {
    // If login fails, try register
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, user);
      console.log(`✅ Registered new user ${user.username}`);
      return registerRes.data.token;
    } catch (regError) {
      console.error(`❌ Failed to login/register ${user.username}:`, regError.response?.data?.message || regError.message);
      throw regError;
    }
  }
}

// Step 1: Create a timetable for user1
async function createTimetable(token) {
  try {
    const timetableData = {
      name: 'Test Timetable',
      semester: '4th Semester',
      academicYear: '2025-2026',
      subjects: [
        {
          name: 'Database Management',
          code: 'CS401',
          type: 'Lecture',
          color: '#3B82F6',
          teacher: 'Prof. Smith',
          room: 'Room 101'
        },
        {
          name: 'Operating Systems',
          code: 'CS402',
          type: 'Lecture',
          color: '#10B981',
          teacher: 'Dr. Johnson',
          room: 'Room 102'
        }
      ],
      schedule: [
        {
          day: 'Monday',
          periods: [
            {
              subject: 'Database Management',
              startTime: '09:00',
              endTime: '10:00',
              teacher: 'Prof. Smith',
              room: 'Room 101'
            }
          ]
        },
        {
          day: 'Tuesday',
          periods: [
            {
              subject: 'Operating Systems',
              startTime: '10:00',
              endTime: '11:00',
              teacher: 'Dr. Johnson',
              room: 'Room 102'
            }
          ]
        }
      ]
    };

    const response = await axios.post(`${API_URL}/timetable`, timetableData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Created timetable for user1');
    return response.data.timetable;
  } catch (error) {
    console.error('❌ Failed to create timetable:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Step 2: Generate share link
async function generateShareLink(token) {
  try {
    const response = await axios.post(`${API_URL}/timetable/share`, 
      { permissions: 'import' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Generated share link');
    console.log('📎 Share URL:', response.data.shareUrl);
    console.log('🔑 Share ID:', response.data.shareId);
    return response.data.shareId;
  } catch (error) {
    console.error('❌ Failed to generate share link:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Step 3: Preview shared timetable
async function previewSharedTimetable(shareId, token) {
  try {
    const response = await axios.get(`${API_URL}/timetable/share/${shareId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Retrieved shared timetable preview');
    console.log('📋 Timetable name:', response.data.sharedTimetable.timetableData.name);
    console.log('📚 Subjects:', response.data.sharedTimetable.timetableData.subjects.length);
    console.log('📅 Schedule days:', response.data.sharedTimetable.timetableData.schedule.length);
    return response.data.sharedTimetable;
  } catch (error) {
    console.error('❌ Failed to preview shared timetable:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Step 4: Import shared timetable as user2
async function importSharedTimetable(shareId, token) {
  try {
    const response = await axios.post(`${API_URL}/timetable/share/${shareId}/import`, {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Successfully imported timetable to user2');
    console.log('📋 Imported timetable:', response.data.timetable.name);
    return response.data.timetable;
  } catch (error) {
    console.error('❌ Failed to import timetable:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Step 5: Verify user2 has the timetable
async function verifyTimetable(token) {
  try {
    const response = await axios.get(`${API_URL}/timetable`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Verified user2 timetable');
    console.log('📋 Timetable name:', response.data.timetable.name);
    console.log('📚 Subjects count:', response.data.timetable.subjects.length);
    console.log('📅 Schedule days:', response.data.timetable.schedule.length);
    return response.data.timetable;
  } catch (error) {
    console.error('❌ Failed to verify timetable:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Main test flow
async function runTest() {
  console.log('\n🧪 Starting Share Timetable Test\n');
  console.log('═'.repeat(50));

  try {
    // Step 1: Setup users
    console.log('\n📝 Step 1: Setting up test users...');
    user1Token = await loginOrRegister(user1);
    user2Token = await loginOrRegister(user2);

    // Step 2: Create timetable for user1
    console.log('\n📝 Step 2: Creating timetable for user1...');
    await createTimetable(user1Token);

    // Step 3: Generate share link
    console.log('\n📝 Step 3: Generating share link...');
    shareId = await generateShareLink(user1Token);

    // Step 4: Preview shared timetable as user2
    console.log('\n📝 Step 4: Previewing shared timetable as user2...');
    await previewSharedTimetable(shareId, user2Token);

    // Step 5: Import timetable as user2
    console.log('\n📝 Step 5: Importing timetable as user2...');
    await importSharedTimetable(shareId, user2Token);

    // Step 6: Verify user2 has the timetable
    console.log('\n📝 Step 6: Verifying imported timetable...');
    await verifyTimetable(user2Token);

    console.log('\n═'.repeat(50));
    console.log('✅ ALL TESTS PASSED! Share functionality works correctly.\n');
  } catch (error) {
    console.log('\n═'.repeat(50));
    console.log('❌ TEST FAILED\n');
    process.exit(1);
  }
}

// Run the test
runTest();
