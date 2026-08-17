import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  Modal, 
  TextInput,
  Alert
} from 'react-native';

// AGL Design System Palette
const NAVY = '#1C355E';
const GOLD = '#EED58E';
const TURQUOISE = '#2DD4BF';
const GRAY_BG = '#F8FAFC';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeUser, setActiveUser] = useState<{ name: string; email: string; role: string; avatar: string }>({
    name: 'Petrus Haimbodi',
    email: 'petrus.haimbodi@aglgroup.com',
    role: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  });

  const [activeTab, setActiveTab] = useState<'RIDER' | 'DRIVER' | 'MANAGER' | 'INSPECTOR' | 'ADMIN'>('RIDER');
  const [role, setRole] = useState<'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN'>('EMPLOYEE');

  // State models
  const [availableSeats, setAvailableSeats] = useState(16);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState('01');
  const [riderFilter, setRiderFilter] = useState<'UPCOMING' | 'MY_TRIPS' | 'ALL'>('UPCOMING');

  // Driver Controlled Trip State Machine
  const [tripStatus, setTripStatus] = useState<'SCHEDULED' | 'BOARDING' | 'EN_ROUTE' | 'ARRIVED' | 'EMPTYING' | 'COMPLETED'>('SCHEDULED');
  const [hasTripAssignmentOffer, setHasTripAssignmentOffer] = useState(true);
  const [checkedPassengers, setCheckedPassengers] = useState<Record<string, boolean>>({});

  // Pool State & Manager Booking
  const [poolRequested, setPoolRequested] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);
  const [vehicleReturned, setVehicleReturned] = useState(false);
  const [inspectionPassed, setInspectionPassed] = useState(false);

  // Manager Pool Booking Modal State
  const [poolModalVisible, setPoolModalVisible] = useState(false);
  const [poolPurpose, setPoolPurpose] = useState('');
  const [poolStartDateTime, setPoolStartDateTime] = useState('2026-08-18 08:00');
  const [poolEndDateTime, setPoolEndDateTime] = useState('2026-08-18 17:00');

  const handleMobileLogin = (empName?: string, empEmail?: string, empRole?: string, empAvatar?: string) => {
    setActiveUser({
      name: empName || 'Petrus Haimbodi',
      email: empEmail || (emailInput || 'petrus.haimbodi@aglgroup.com'),
      role: empRole || 'EMPLOYEE',
      avatar: empAvatar || 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    });
    if (empRole) {
      setRole(empRole as any);
    }
    setIsAuthenticated(true);
    Alert.alert('Signed In', `Welcome back, ${empName || 'Petrus'}! Signed in via Microsoft Entra ID.`);
  };

  const handleBookShuttle = () => {
    if (availableSeats < seatsRequested) {
      Alert.alert('Seats Unavailable', 'Not enough seats remaining on this shuttle.');
      return;
    }

    setAvailableSeats(prev => prev - seatsRequested);
    setMyBookings(prev => [`08:00 HQ -> WMT (${seatsRequested} seats)`, ...prev]);
    setBookingModalVisible(false);
    Alert.alert('Success', 'Shuttle seat reserved! Status: AUTO_APPROVED (≥12h notice).');
  };

  // MOBILE AUTHENTICATION SCREEN (Sign In / Sign Up)
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor={NAVY} />

        <ScrollView contentContainerStyle={styles.authScroll}>
          {/* Brand Banner Header */}
          <View style={styles.authHeader}>
            <View style={styles.authLogoBox}>
              <Text style={styles.authLogoText}>AGL</Text>
            </View>
            <Text style={styles.authTitle}>AGL Transport Hub</Text>
            <Text style={styles.authSubtitle}>Namibia • Walvis Bay Mobile</Text>
            <View style={styles.authBadge}>
              <Text style={styles.authBadgeText}>🔒 Microsoft Entra ID Protected</Text>
            </View>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            {/* Tab Switcher: Sign In vs Sign Up */}
            <View style={styles.authTabRow}>
              <TouchableOpacity 
                style={[styles.authTabBtn, authMode === 'SIGN_IN' && styles.authTabBtnActive]}
                onPress={() => setAuthMode('SIGN_IN')}
              >
                <Text style={[styles.authTabText, authMode === 'SIGN_IN' && styles.authTabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.authTabBtn, authMode === 'SIGN_UP' && styles.authTabBtnActive]}
                onPress={() => setAuthMode('SIGN_UP')}
              >
                <Text style={[styles.authTabText, authMode === 'SIGN_UP' && styles.authTabTextActive]}>Sign Up (Rider)</Text>
              </TouchableOpacity>
            </View>

            {/* Microsoft Entra ID Primary Button */}
            <TouchableOpacity 
              style={styles.msAuthBtn}
              onPress={() => handleMobileLogin('Petrus Haimbodi', 'petrus.haimbodi@aglgroup.com', 'EMPLOYEE')}
            >
              <Text style={styles.msAuthBtnText}>Sign In with Microsoft Entra ID</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR LOGIN WITH CREDENTIALS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Input Form */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Corporate Email Address</Text>
              <TextInput
                style={styles.inputField}
                placeholder="name@aglgroup.com"
                placeholderTextColor="#94A3B8"
                value={emailInput}
                onChangeText={setEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.inputField}
                placeholder="••••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={passwordInput}
                onChangeText={setPasswordInput}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitAuthBtn}
              onPress={() => handleMobileLogin()}
            >
              <Text style={styles.submitAuthBtnText}>
                {authMode === 'SIGN_IN' ? 'Sign In to Account' : 'Register New Rider Account'}
              </Text>
            </TouchableOpacity>

            {/* Quick Mobile Persona Login Options */}
            <Text style={styles.quickPersonaTitle}>QUICK PERSONA LOGIN (MOBILE TEST)</Text>
            <View style={styles.personaGrid}>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Petrus Haimbodi', 'petrus.haimbodi@aglgroup.com', 'EMPLOYEE')}
              >
                <Text style={styles.personaChipText}>🧑‍💼 Petrus (Rider)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Klaus Schneider', 'manager.logistics@aglgroup.com', 'MANAGER')}
              >
                <Text style={styles.personaChipText}>👔 Klaus (Manager)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Johannes Nangolo', 'driver.bus1@aglgroup.com', 'DRIVER')}
              >
                <Text style={styles.personaChipText}>🚌 Johannes (Driver)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Senzo Shinga', 'admin.namibia@aglgroup.com', 'SUPER_ADMIN')}
              >
                <Text style={styles.personaChipText}>⚙️ Senzo (Admin)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      {/* Mobile Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AGL</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AGL Transport Hub</Text>
            <Text style={styles.headerSub}>🔒 Microsoft Entra ID • Walvis Bay</Text>
          </View>
        </View>

        {/* Emulator Role Switcher Pill & Sign Out */}
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.rolePill}
            onPress={() => {
              const roles: Array<'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN'> = ['EMPLOYEE', 'DRIVER', 'MANAGER', 'FLEET_ADMIN'];
              const nextIdx = (roles.indexOf(role) + 1) % roles.length;
              const nextRole = roles[nextIdx];
              setRole(nextRole);

              if (nextRole === 'EMPLOYEE') setActiveTab('RIDER');
              else if (nextRole === 'DRIVER') setActiveTab('DRIVER');
              else if (nextRole === 'MANAGER') setActiveTab('MANAGER');
              else if (nextRole === 'FLEET_ADMIN') setActiveTab('INSPECTOR');
            }}
          >
            <Text style={styles.rolePillText}>Role: {role}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => {
              setIsAuthenticated(false);
              Alert.alert('Signed Out', 'You have been signed out of your Microsoft Entra ID session.');
            }}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Native Screen Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* SCREEN 1: RIDER PORTAL */}
        {activeTab === 'RIDER' && (
          <View style={styles.section}>
            {/* Dark Navy Hero Welcome Banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroBadgeRow}>
                <Text style={styles.heroBadge}>📍 AGL Employee Rider Portal • Walvis Bay</Text>
              </View>
              <Text style={styles.heroGreeting}>Hello, {activeUser.name.split(' ')[0]}! 👋</Text>
              <Text style={styles.heroSubText}>
                Reserve shuttle bus seats with visual seat selection and track active trips in real time.
              </Text>
            </View>

            {/* Filter Navigation Pills */}
            <View style={styles.filterPillRow}>
              <TouchableOpacity 
                style={[styles.filterPill, riderFilter === 'UPCOMING' && styles.filterPillActive]}
                onPress={() => setRiderFilter('UPCOMING')}
              >
                <Text style={[styles.filterPillText, riderFilter === 'UPCOMING' && styles.filterPillTextActive]}>
                  Upcoming Bus Schedules
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterPill, riderFilter === 'MY_TRIPS' && styles.filterPillActive]}
                onPress={() => setRiderFilter('MY_TRIPS')}
              >
                <Text style={[styles.filterPillText, riderFilter === 'MY_TRIPS' && styles.filterPillTextActive]}>
                  My Trips ({myBookings.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterPill, riderFilter === 'ALL' && styles.filterPillActive]}
                onPress={() => setRiderFilter('ALL')}
              >
                <Text style={[styles.filterPillText, riderFilter === 'ALL' && styles.filterPillTextActive]}>
                  All Trips
                </Text>
              </TouchableOpacity>
            </View>

            {/* UPCOMING BUS SCHEDULES LIST */}
            {riderFilter === 'UPCOMING' && (
              <View style={{ gap: 14 }}>
                {/* Schedule Card 1: 08:00 Departure */}
                <View style={styles.scheduleCard}>
                  <View style={styles.scheduleHeaderRow}>
                    <Text style={styles.scheduledPill}>SCHEDULED</Text>
                    <Text style={styles.noticeWindowText}>12h Notice Window</Text>
                  </View>

                  <Text style={styles.scheduleTimeTitle}>08:00 Departure</Text>
                  <Text style={styles.scheduleRouteSub}>AGL HQ ➔ WMT Container Port</Text>

                  <View style={styles.seatsRow}>
                    <Text style={styles.seatsLabel}>Seats Remaining:</Text>
                    <Text style={styles.seatsValue}>{availableSeats} / 22</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.selectSeatBtn}
                    onPress={() => setBookingModalVisible(true)}
                  >
                    <Text style={styles.selectSeatBtnText}>🚌 Select Seat & Book</Text>
                  </TouchableOpacity>
                </View>

                {/* Schedule Card 2: 09:00 Departure */}
                <View style={styles.scheduleCard}>
                  <View style={styles.scheduleHeaderRow}>
                    <Text style={styles.scheduledPill}>SCHEDULED</Text>
                    <Text style={styles.noticeWindowText}>12h Notice Window</Text>
                  </View>

                  <Text style={styles.scheduleTimeTitle}>09:00 Departure</Text>
                  <Text style={styles.scheduleRouteSub}>AGL HQ ➔ WMT Container Port</Text>

                  <View style={styles.seatsRow}>
                    <Text style={styles.seatsLabel}>Seats Remaining:</Text>
                    <Text style={styles.seatsValue}>20 / 22</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.selectSeatBtn}
                    onPress={() => setBookingModalVisible(true)}
                  >
                    <Text style={styles.selectSeatBtnText}>🚌 Select Seat & Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* MY TRIPS LIST */}
            {riderFilter === 'MY_TRIPS' && (
              <View style={styles.myBookingsCard}>
                <Text style={styles.cardTitle}>My Bus Reservations ({myBookings.length})</Text>
                {myBookings.length === 0 ? (
                  <Text style={styles.emptyText}>No active shuttle seat bookings.</Text>
                ) : (
                  myBookings.map((b, idx) => (
                    <View key={idx} style={styles.bookingItem}>
                      <Text style={styles.bookingText}>{b}</Text>
                      <Text style={styles.approvedBadge}>AUTO APPROVED</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ALL TRIPS LIST */}
            {riderFilter === 'ALL' && (
              <View style={styles.myBookingsCard}>
                <Text style={styles.cardTitle}>All Scheduled Shuttles today</Text>
                <Text style={styles.subText}>• 08:00 AM Departure • Coaster N 142-991 WB (16 Seats left)</Text>
                <Text style={styles.subText}>• 09:00 AM Departure • Coaster N 882-104 WB (20 Seats left)</Text>
                <Text style={styles.subText}>• 17:00 PM Departure • Coaster N 142-991 WB (22 Seats left)</Text>
              </View>
            )}
          </View>
        )}

        {/* SCREEN 2: DRIVER CONSOLE */}
        {activeTab === 'DRIVER' && (
          <View style={styles.section}>
            <View style={styles.driverHeader}>
              <Text style={styles.driverTitle}>Driver Console</Text>
              <Text style={styles.driverSub}>Driver: Johannes Nangolo • Coaster Bus (N 142-991 WB)</Text>
            </View>

            {/* Trip Assignment Offer Banner */}
            {hasTripAssignmentOffer && (
              <View style={styles.offerCard}>
                <View style={styles.offerHeaderRow}>
                  <Text style={styles.offerBadge}>NEW TRIP OFFER</Text>
                  <Text style={styles.offerTime}>Attempt #1</Text>
                </View>

                <Text style={styles.offerRoute}>08:00 AM • AGL HQ ➔ WMT Port</Text>
                <Text style={styles.offerSub}>Vehicle: Coaster Bus (N 142-991 WB)</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.approveBtn}
                    onPress={() => {
                      setHasTripAssignmentOffer(false);
                      Alert.alert('Assignment Accepted', 'Trip confirmed! Ready for boarding.');
                    }}
                  >
                    <Text style={styles.btnText}>ACCEPT ASSIGNMENT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.rejectBtn}
                    onPress={() => {
                      setHasTripAssignmentOffer(false);
                      Alert.alert('Assignment Declined', 'Offer rejected. System dispatching to next candidate driver.');
                    }}
                  >
                    <Text style={styles.btnText}>REJECT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Active Trip Status & Controlled Action Buttons */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={styles.cardTitle}>Current Active Trip</Text>
                <Text style={styles.statusPill}>{tripStatus}</Text>
              </View>

              <Text style={styles.tripRouteText}>08:00 AM • AGL HQ ➔ Walvis Bay Container Terminal</Text>

              <View style={styles.actionButtonContainer}>
                {tripStatus === 'SCHEDULED' && (
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#F59E0B' }]}
                    onPress={() => setTripStatus('BOARDING')}
                  >
                    <Text style={styles.primaryButtonText}>START BOARDING 🚌</Text>
                  </TouchableOpacity>
                )}

                {tripStatus === 'BOARDING' && (
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#0D9488' }]}
                    onPress={() => setTripStatus('EN_ROUTE')}
                  >
                    <Text style={styles.primaryButtonText}>DEPART / START TRIP 🟢</Text>
                  </TouchableOpacity>
                )}

                {tripStatus === 'EN_ROUTE' && (
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#4F46E5' }]}
                    onPress={() => setTripStatus('ARRIVED')}
                  >
                    <Text style={styles.primaryButtonText}>ARRIVED AT DESTINATION 📍</Text>
                  </TouchableOpacity>
                )}

                {tripStatus === 'ARRIVED' && (
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#9333EA' }]}
                    onPress={() => setTripStatus('EMPTYING')}
                  >
                    <Text style={styles.primaryButtonText}>EMPTY BUS / PASSENGERS DEPARKED 🚪</Text>
                  </TouchableOpacity>
                )}

                {tripStatus === 'EMPTYING' && (
                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#059669' }]}
                    onPress={() => setTripStatus('COMPLETED')}
                  >
                    <Text style={styles.primaryButtonText}>COMPLETE TRIP & LOG REPORT ✅</Text>
                  </TouchableOpacity>
                )}

                {tripStatus === 'COMPLETED' && (
                  <Text style={styles.completedTripText}>✅ Trip Completed & Logged</Text>
                )}
              </View>
            </View>

            {/* Passenger Boarding Manifest Checklist */}
            <View style={styles.manifestCard}>
              <Text style={styles.cardTitle}>Confirmed Passenger Manifest</Text>
              
              {[
                { name: 'Petrus Haimbodi', dept: 'Customs & Clearance', seat: 'Seat 01' },
                { name: 'Selma Shikongo', dept: 'Logistics Ops', seat: 'Seat 03' }
              ].map((p, i) => {
                const isChecked = checkedPassengers[p.name];
                return (
                  <View key={i} style={styles.manifestItem}>
                    <TouchableOpacity 
                      style={[styles.checkbox, isChecked && styles.checkboxActive]}
                      onPress={() => setCheckedPassengers(prev => ({ ...prev, [p.name]: !prev[p.name] }))}
                    >
                      <Text style={styles.checkboxCheck}>{isChecked ? '✓' : ''}</Text>
                    </TouchableOpacity>

                    <View style={styles.passengerInfo}>
                      <Text style={styles.passengerName}>{p.name}</Text>
                      <Text style={styles.passengerDept}>{p.dept} • {p.seat}</Text>
                    </View>

                    <Text style={styles.boardingStatus}>{isChecked ? 'ON BOARD' : 'WAITING'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* SCREEN 3: MANAGER HUB */}
        {activeTab === 'MANAGER' && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>MANAGER HUB • FLEET & APPROVALS</Text>
              <Text style={styles.titleText}>Business Trip Pool Vehicles</Text>
            </View>

            {/* Car Card 1 */}
            <View style={styles.poolCarCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' }} 
                style={styles.carImage} 
              />
              <View style={styles.carInfo}>
                <Text style={styles.carTitle}>Toyota Hilux Double Cab 4x4</Text>
                <Text style={styles.carReg}>N 882-102 WB • 5 Seats • Diesel</Text>

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => setPoolModalVisible(true)}
                >
                  <Text style={styles.primaryButtonText}>Book Vehicle for Business Trip</Text>
                </TouchableOpacity>

                {poolRequested && (
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => {
                      setVehicleReturned(true);
                      Alert.alert('Return Declared', 'Vehicle return declared. Ready for Fleet Admin inspection.');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Declare Vehicle Return</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Manager Approvals Section */}
            <View style={[styles.myBookingsCard, { marginTop: 14 }]}>
              <Text style={styles.cardTitle}>Pending Manager Approvals</Text>
              <Text style={styles.subText}>Requester: Petrus Haimbodi (Customs & Clearance)</Text>
              <Text style={styles.subText}>Purpose: Cargo inspection at Port of Walvis Bay</Text>
              <Text style={styles.subText}>Vehicle: Toyota Hilux (N 882-102 WB)</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.approveBtn}
                  onPress={() => {
                    setManagerApproved(true);
                    Alert.alert('Approved!', 'Vehicle reserved and locked in calendar.');
                  }}
                >
                  <Text style={styles.btnText}>Approve & Reserve</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.rejectBtn}
                  onPress={() => Alert.alert('Declined', 'Request declined.')}
                >
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SCREEN 4: INSPECTOR GATE */}
        {activeTab === 'INSPECTOR' && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>INSPECTOR GATE • VEHICLE RETURN CLEARANCE</Text>
              <Text style={styles.titleText}>Return Inspection Protocol</Text>
            </View>
            
            <View style={styles.myBookingsCard}>
              <Text style={styles.cardTitle}>Clearance Protocol • N 882-102 WB</Text>
              <Text style={styles.subText}>End Odometer: 49,045 KM</Text>
              <Text style={styles.subText}>Fuel Level: 90%</Text>
              <Text style={styles.subText}>Inspection Photos: 2 Attached</Text>

              <TouchableOpacity 
                style={styles.approveBtn}
                onPress={() => {
                  setInspectionPassed(true);
                  Alert.alert('Passed!', 'Vehicle inspection cleared. Car unlocked back to AVAILABLE status.');
                }}
              >
                <Text style={styles.btnText}>Complete Inspection & Release Car</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SCREEN 5: ADMIN & BUSINESS RULES */}
        {activeTab === 'ADMIN' && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>ADMIN PORTAL • SYSTEM CONTROL</Text>
              <Text style={styles.titleText}>Business Rules & Transport Config</Text>
            </View>

            <View style={styles.myBookingsCard}>
              <Text style={styles.cardTitle}>Live Fleet Rules</Text>
              <Text style={styles.subText}>• Cutoff Window: 12 Hours Notice</Text>
              <Text style={styles.subText}>• Auto-Approve Shuttle Bookings: ENABLED</Text>
              <Text style={styles.subText}>• Max Seats Per Employee: 4 Seats</Text>
              <Text style={styles.subText}>• Driver Acceptance Timeout: 15 Mins</Text>

              <TouchableOpacity 
                style={[styles.primaryButton, { marginTop: 12 }]}
                onPress={() => Alert.alert('Rules Saved', 'Business rules updated across system!')}
              >
                <Text style={styles.primaryButtonText}>Save Rule Configurations</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Mobile Bottom Tab Bar (Expo Go Navigation Bar) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('RIDER')}>
          <Text style={[styles.tabIcon, activeTab === 'RIDER' && styles.tabActive]}>🧑‍💼</Text>
          <Text style={[styles.tabLabel, activeTab === 'RIDER' && styles.tabActive]}>Rider Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('DRIVER')}>
          <Text style={[styles.tabIcon, activeTab === 'DRIVER' && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'DRIVER' && styles.tabActive]}>Driver Console</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('MANAGER')}>
          <Text style={[styles.tabIcon, activeTab === 'MANAGER' && styles.tabActive]}>👔</Text>
          <Text style={[styles.tabLabel, activeTab === 'MANAGER' && styles.tabActive]}>Manager Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('INSPECTOR')}>
          <Text style={[styles.tabIcon, activeTab === 'INSPECTOR' && styles.tabActive]}>🛡️</Text>
          <Text style={[styles.tabLabel, activeTab === 'INSPECTOR' && styles.tabActive]}>Inspector Gate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('ADMIN')}>
          <Text style={[styles.tabIcon, activeTab === 'ADMIN' && styles.tabActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'ADMIN' && styles.tabActive]}>Admin & Rules</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Shuttle Seat Modal (Visual Seat Map) */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Visual Bus Seat Selection</Text>
            <Text style={styles.subText}>08:00 AM • HQ ➔ WMT Container Terminal (Coaster Bus)</Text>

            {/* Top-Down Bus Layout Diagram */}
            <View style={styles.busDiagramContainer}>
              <View style={styles.driverCabBox}>
                <Text style={styles.driverCabText}>🚌 FRONT • DRIVER CAB</Text>
              </View>

              <View style={styles.seatGrid}>
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((sNum) => {
                  const isBooked = sNum === '02' || sNum === '05';
                  const isSelected = selectedSeatNumber === sNum;

                  return (
                    <TouchableOpacity
                      key={sNum}
                      disabled={isBooked}
                      style={[
                        styles.seatBox,
                        isBooked && styles.seatBooked,
                        isSelected && styles.seatSelected,
                      ]}
                      onPress={() => setSelectedSeatNumber(sNum)}
                    >
                      <Text style={[
                        styles.seatBoxText,
                        isBooked && styles.seatBookedText,
                        isSelected && styles.seatSelectedText,
                      ]}>
                        {sNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Legend Row */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#94A3B8' }]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: NAVY }]} />
                  <Text style={styles.legendText}>Selected</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
                  <Text style={styles.legendText}>Booked</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => handleBookShuttle('08:00 AM')}>
              <Text style={styles.primaryButtonText}>Confirm Reservation (Seat #{selectedSeatNumber})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setBookingModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manager Pool Fleet Vehicle Reservation Modal */}
      <Modal visible={poolModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Pool Fleet Vehicle</Text>
            <Text style={styles.subText}>Toyota Hilux Double Cab 4x4 (N 882-102 WB)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Purpose / Trip Reason</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Executive Client Visit to Swakopmund"
                placeholderTextColor="#94A3B8"
                value={poolPurpose}
                onChangeText={setPoolPurpose}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date & Departure Time</Text>
              <TextInput
                style={styles.inputField}
                value={poolStartDateTime}
                onChangeText={setPoolStartDateTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date & Return Time</Text>
              <TextInput
                style={styles.inputField}
                value={poolEndDateTime}
                onChangeText={setPoolEndDateTime}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => {
                setPoolRequested(true);
                setPoolModalVisible(false);
                Alert.alert('Vehicle Reserved', 'Pool vehicle reservation request created and locked in calendar!');
              }}
            >
              <Text style={styles.primaryButtonText}>Submit Reservation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setPoolModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#25467A',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: NAVY,
    fontWeight: '900',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSub: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
  },
  rolePill: {
    backgroundColor: '#25467A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    backgroundColor: GRAY_BG,
    padding: 16,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 18,
    marginBottom: 4,
    elevation: 4,
  },
  heroBadgeRow: {
    marginBottom: 8,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    backgroundColor: '#25467A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
  },
  heroSubText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  scheduleCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledPill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noticeWindowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  scheduleTimeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NAVY,
  },
  scheduleRouteSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seatsLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  seatsValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  selectSeatBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectSeatBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  busDiagramContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  driverCabBox: {
    backgroundColor: '#CBD5E1',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  driverCabText: {
    fontSize: 10,
    fontWeight: '900',
    color: NAVY,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  seatBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatBooked: {
    backgroundColor: '#CBD5E1',
    borderColor: '#94A3B8',
  },
  seatSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  seatBoxText: {
    fontSize: 12,
    fontWeight: '800',
    color: NAVY,
  },
  seatBookedText: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  seatSelectedText: {
    color: GOLD,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  section: {
    gap: 16,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: NAVY,
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
  },
  shuttleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  shuttleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busReg: {
    fontSize: 11,
    fontWeight: '900',
    color: NAVY,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cutoffBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBox: {
    marginVertical: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '900',
    color: NAVY,
  },
  routeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seatLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  seatCount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
  },
  primaryButton: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  myBookingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: NAVY,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bookingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  approvedBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  driverHeader: {
    marginBottom: 8,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NAVY,
  },
  driverSub: {
    fontSize: 12,
    color: '#64748B',
  },
  pendingBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  pendingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B45309',
  },
  pendingDesc: {
    fontSize: 11,
    color: '#92400E',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  manifestCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  manifestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxCheck: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  passengerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  passengerDept: {
    fontSize: 10,
    color: '#64748B',
  },
  boardingStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
  },
  poolCarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  carImage: {
    width: '100%',
    height: 140,
  },
  carInfo: {
    padding: 14,
  },
  carTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: NAVY,
  },
  carReg: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  tabActive: {
    opacity: 1,
    color: NAVY,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NAVY,
  },
  seatPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  seatNumBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  seatNumBtnActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  seatNumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  seatNumTextActive: {
    color: '#FFF',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Mobile Authentication Styles
  authContainer: {
    flex: 1,
    backgroundColor: NAVY,
  },
  authScroll: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  authLogoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: GOLD,
  },
  authLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: NAVY,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  authSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD,
    marginTop: 2,
  },
  authBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  authBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: TURQUOISE,
  },
  authCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
  },
  authTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  authTabBtnActive: {
    backgroundColor: '#FFF',
    elevation: 2,
  },
  authTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  authTabTextActive: {
    color: NAVY,
    fontWeight: '800',
  },
  msAuthBtn: {
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  msAuthBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  submitAuthBtn: {
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitAuthBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickPersonaTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  personaChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  personaChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutBtnText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: 'bold',
  },
  offerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 14,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerTime: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B45309',
  },
  offerRoute: {
    fontSize: 14,
    fontWeight: '900',
    color: '#78350F',
  },
  offerSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    marginBottom: 10,
  },
  tripControlCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  tripStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripRouteText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 12,
  },
  actionButtonContainer: {
    marginTop: 4,
  },
  completedTripText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
