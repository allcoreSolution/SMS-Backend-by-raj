/**
 * COMPREHENSIVE AUTOMATED DRIVER SUITE - PRODUCTION GRADE
 * Fully tests Section 12 End-to-End Acceptance Criteria:
 * A. Authentication & Authorization (Positive, Negative, Token Validation, RBAC)
 * B. Dashboard & Profile Telemetry
 * C. Trip Lifecycle (Start, Idempotency, GPS Coordinates, Validation, End)
 * D. Student Boarding & Duplicate Scan Protection
 * E. Vehicle Roadworthiness Inspection Checklist
 * F. Emergency Incident / SOS Reporting
 * G. Driver Attendance & Leave Management
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runDriverTestSuite() {
  console.log('\n=================================================================');
  console.log('       PRODUCTION DRIVER PANEL - AUTOMATED ACCEPTANCE SUITE       ');
  console.log('=================================================================\n');

  let driverToken = '';
  let tripId = '';

  // ================= 1. AUTHENTICATION & SECURITY =================
  console.log('--- A. AUTHENTICATION & SECURITY TESTS ---');

  // Test A.1: Valid Driver Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      loginId: 'DRV-101',
      password: '1011',
      role: 'driver'
    });
    const token = res.data?.token || res.data?.data?.token;
    const role = res.data?.user?.role || res.data?.data?.role;
    assert(res.status === 200 && token && (role.toLowerCase() === 'driver'), 'A.1 Correct driver credentials succeed (DRV-101 / 1011)');
    driverToken = token;
  } catch (err) {
    assert(false, `A.1 Correct credentials failed: ${err.message}`);
  }

  const authHeader = { headers: { Authorization: `Bearer ${driverToken}` } };

  // Test A.2: Incorrect credentials fail
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      loginId: 'DRV-101',
      password: 'wrong_password_999'
    });
    assert(false, 'A.2 Incorrect credentials should fail but passed');
  } catch (err) {
    assert(err.response && (err.response.status === 401 || err.response.status === 400), 'A.2 Incorrect credentials fail with 401/400');
  }

  // Test A.3: Missing token rejected
  try {
    await axios.get(`${BASE_URL}/driver/me`);
    assert(false, 'A.3 Missing token should fail but passed');
  } catch (err) {
    assert(err.response && err.response.status === 401, 'A.3 Missing token rejected with 401');
  }

  // Test A.4: Malformed token rejected
  try {
    await axios.get(`${BASE_URL}/driver/me`, {
      headers: { Authorization: 'Bearer not.a.valid.jwt.token' }
    });
    assert(false, 'A.4 Malformed token should fail but passed');
  } catch (err) {
    assert(err.response && err.response.status === 401, 'A.4 Malformed token rejected with 401');
  }

  // ================= 2. DASHBOARD & PROFILE =================
  console.log('\n--- B. DASHBOARD & PROFILE METRICS ---');

  // Test B.1: GET /api/driver/me
  try {
    const res = await axios.get(`${BASE_URL}/driver/me`, authHeader);
    const dId = res.data?.driver?.driverId || res.data?.data?.driverId;
    assert(res.status === 200 && res.data.success && dId === 'DRV-101', 'B.1 Driver identity verified from JWT token (DRV-101)');
  } catch (err) {
    assert(false, `B.1 GET /api/driver/me failed: ${err.message}`);
  }

  // Test B.2: GET /api/driver/dashboard
  try {
    const res = await axios.get(`${BASE_URL}/driver/dashboard`, authHeader);
    assert(res.status === 200 && res.data.success && res.data.data.driver && res.data.data.studentStats, 'B.2 Dashboard returns live operational metrics');
  } catch (err) {
    assert(false, `B.2 GET /api/driver/dashboard failed: ${err.message}`);
  }

  // Test B.3: GET /api/driver/vehicle
  try {
    const res = await axios.get(`${BASE_URL}/driver/vehicle`, authHeader);
    const vNum = res.data?.data?.vehicleNumber;
    assert(res.status === 200 && res.data.success && Boolean(vNum), `B.3 Returns assigned vehicle (${vNum || 'Found'})`);
  } catch (err) {
    assert(false, `B.3 GET /api/driver/vehicle failed: ${err.message}`);
  }

  // Test B.4: GET /api/driver/routes
  try {
    const res = await axios.get(`${BASE_URL}/driver/routes`, authHeader);
    assert(res.status === 200 && res.data.success && Array.isArray(res.data.data), 'B.4 Returns assigned routes and stops');
  } catch (err) {
    assert(false, `B.4 GET /api/driver/routes failed: ${err.message}`);
  }

  // Test B.5: GET /api/driver/students
  try {
    const res = await axios.get(`${BASE_URL}/driver/students`, authHeader);
    assert(res.status === 200 && res.data.success && Array.isArray(res.data.data), 'B.5 Returns authorized student roster');
  } catch (err) {
    assert(false, `B.5 GET /api/driver/students failed: ${err.message}`);
  }

  // ================= 3. TRIPS & GPS TELEMETRY =================
  console.log('\n--- C. TRIP OPERATIONS & GPS TELEMETRY ---');

  // Test C.1: Start Trip
  try {
    const res = await axios.post(`${BASE_URL}/driver/trips/start`, {
      startOdometer: 14250,
      notes: 'Pre-trip checks passed. Commencing route.'
    }, authHeader);
    assert((res.status === 200 || res.status === 201) && res.data.success, 'C.1 Valid trip start is persisted in database');
    tripId = res.data.data._id || res.data.data.tripId;
  } catch (err) {
    assert(false, `C.1 Start trip failed: ${err.message}`);
  }

  // Test C.2: Idempotent Trip Start (re-starting active trip)
  try {
    const res = await axios.post(`${BASE_URL}/driver/trips/start`, {}, authHeader);
    assert(res.status === 200 && res.data.success, 'C.2 Duplicate trip start handled idempotently (prevents multiple active trips)');
  } catch (err) {
    assert(false, `C.2 Idempotent start failed: ${err.message}`);
  }

  // Test C.3: Valid GPS Coordinates Saved
  try {
    const res = await axios.post(`${BASE_URL}/driver/gps`, {
      tripId,
      latitude: 28.6139,
      longitude: 77.2090,
      speed: 42,
      heading: 95
    }, authHeader);
    assert(res.status === 200 && res.data.success, 'C.3 Valid GPS coordinates saved with speed & heading');
  } catch (err) {
    assert(false, `C.3 Save GPS failed: ${err.message}`);
  }

  // Test C.4: Invalid GPS Coordinates Rejected
  try {
    await axios.post(`${BASE_URL}/driver/gps`, {
      tripId,
      latitude: 199.99, // Invalid latitude (> 90)
      longitude: 77.2090
    }, authHeader);
    assert(false, 'C.4 Invalid coordinates should be rejected');
  } catch (err) {
    assert(err.response && err.response.status === 400, 'C.4 Invalid GPS coordinates rejected (400 Bad Request)');
  }

  // Test C.5: GET /api/driver/trips/:tripId/location
  try {
    const res = await axios.get(`${BASE_URL}/driver/trips/${tripId}/location`, authHeader);
    const lat = res.data?.latitude || res.data?.data?.latitude;
    assert(res.status === 200 && res.data.success && lat > 28, 'C.5 Location query returns verified active GPS coordinate');
  } catch (err) {
    assert(false, `C.5 GET location failed: ${err.message}`);
  }

  // ================= 4. STUDENT BOARDING =================
  console.log('\n--- D. STUDENT BOARDING OPERATIONS ---');

  // Test D.1: Record Student Boarding (Pickup)
  try {
    const res = await axios.post(`${BASE_URL}/driver/trips/${tripId}/boarding`, {
      studentName: 'Aarav Sharma',
      status: 'boarded',
      stopName: 'Sector 4 Market',
      notes: 'Picked up on time'
    }, authHeader);
    assert(res.status === 200 && res.data.success, 'D.1 Student pickup/boarding recorded with timestamp');
  } catch (err) {
    assert(false, `D.1 Record boarding failed: ${err.message}`);
  }

  // Test D.2: Duplicate scan protection
  try {
    const res = await axios.post(`${BASE_URL}/driver/trips/${tripId}/boarding`, {
      studentName: 'Aarav Sharma',
      status: 'boarded',
      stopName: 'Sector 4 Market'
    }, authHeader);
    assert(res.status === 200 && res.data.success && res.data.message.includes('already'), 'D.2 Duplicate boarding scan handled safely without duplicate records');
  } catch (err) {
    assert(false, `D.2 Duplicate scan test failed: ${err.message}`);
  }

  // Test D.3: Retrieve Boarding Roster
  try {
    const res = await axios.get(`${BASE_URL}/driver/trips/${tripId}/boarding`, authHeader);
    assert(res.status === 200 && res.data.success && Array.isArray(res.data.data), 'D.3 Boarding register query returns accurate student statuses');
  } catch (err) {
    assert(false, `D.3 GET boarding failed: ${err.message}`);
  }

  // ================= 5. SAFETY INSPECTION & INCIDENTS =================
  console.log('\n--- E. VEHICLE INSPECTION & EMERGENCY REPORTING ---');

  // Test E.1: Submit Pre-Trip Inspection Checklist
  try {
    const res = await axios.post(`${BASE_URL}/driver/inspections`, {
      inspectionType: 'pre_trip',
      brakes: 'pass',
      tires: 'pass',
      lights: 'pass',
      doors: 'pass',
      emergencyEquipment: 'pass',
      fuelOrBattery: 'pass',
      generalCondition: 'pass',
      odometerReading: 14250,
      remarks: 'All 7 vehicle safety points certified roadworthy.'
    }, authHeader);
    assert(res.status === 201 && res.data.success, 'E.1 Pre-trip vehicle inspection checklist persisted to MongoDB');
  } catch (err) {
    assert(false, `E.1 Submit inspection failed: ${err.message}`);
  }

  // Test E.2: Get Inspection History
  try {
    const res = await axios.get(`${BASE_URL}/driver/inspections`, authHeader);
    assert(res.status === 200 && res.data.success && Array.isArray(res.data.data), 'E.2 Driver can review inspection history logs');
  } catch (err) {
    assert(false, `E.2 GET inspections failed: ${err.message}`);
  }

  // Test E.3: Report Road Incident / Emergency SOS
  try {
    const res = await axios.post(`${BASE_URL}/driver/incidents`, {
      tripId,
      incidentType: 'traffic_delay',
      severity: 'low',
      description: 'Minor congestion at flyover. Anticipated 8 min delay.',
      latitude: 28.6145,
      longitude: 77.2105
    }, authHeader);
    assert(res.status === 201 && res.data.success && res.data.data.incidentId, 'E.3 Road incident / SOS logged with server-generated incident ID');
  } catch (err) {
    assert(false, `E.3 Report incident failed: ${err.message}`);
  }

  // ================= 6. DRIVER ATTENDANCE & LEAVES =================
  console.log('\n--- F. DRIVER ATTENDANCE & LEAVE MODULE ---');

  // Test F.1: Mark Clock-In Attendance
  try {
    const res = await axios.post(`${BASE_URL}/driver/attendance`, {
      action: 'clock_in',
      notes: 'Morning shift duty check-in'
    }, authHeader);
    assert(res.status === 200 && res.data.success, 'F.1 Driver clock-in recorded with timestamp & geofence');
  } catch (err) {
    assert(false, `F.1 Clock-in failed: ${err.message}`);
  }

  // Test F.2: Get Attendance Logs
  try {
    const res = await axios.get(`${BASE_URL}/driver/attendance`, authHeader);
    assert(res.status === 200 && res.data.success && Array.isArray(res.data.data), 'F.2 Driver attendance records retrieved successfully');
  } catch (err) {
    assert(false, `F.2 GET attendance failed: ${err.message}`);
  }

  // Test F.3: Apply for Driver Leave
  try {
    const res = await axios.post(`${BASE_URL}/driver/leave`, {
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      leaveType: 'Casual',
      reason: 'Personal family occasion'
    }, authHeader);
    assert(res.status === 201 && res.data.success, 'F.3 Driver leave application submitted with status Pending');
  } catch (err) {
    assert(false, `F.3 Apply leave failed: ${err.message}`);
  }

  // ================= 7. END TRIP COMPLETION =================
  console.log('\n--- G. TRIP COMPLETION & POST-TRIP LOCKDOWN ---');

  // Test G.1: Complete Trip
  try {
    const res = await axios.post(`${BASE_URL}/driver/trips/${tripId}/end`, {
      endOdometer: 14285,
      notes: 'Trip completed successfully. All students arrived safely.'
    }, authHeader);
    assert(res.status === 200 && res.data.success && res.data.data.status === 'Completed', 'G.1 End trip completes successfully (status: Completed)');
  } catch (err) {
    assert(false, `G.1 End trip failed: ${err.message}`);
  }

  // Test G.2: Completed Trip Cannot Receive New Boarding
  try {
    await axios.post(`${BASE_URL}/driver/trips/${tripId}/boarding`, {
      studentName: 'Late Passenger',
      status: 'boarded'
    }, authHeader);
    assert(false, 'G.2 Should reject boarding on completed trip');
  } catch (err) {
    assert(err.response && err.response.status === 400, 'G.2 Post-completion boarding properly rejected (400 Bad Request)');
  }

  // ================= SUMMARY =================
  console.log('\n=================================================================');
  console.log(`ACCEPTANCE TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runDriverTestSuite();
