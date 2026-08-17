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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeUser, setActiveUser] = useState<{ name: string; email: string; role: string; avatar: string }>({
    name: 'Petrus Haimbodi',
    email: 'petrus.haimbodi@aglgroup.com',
    role: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  });

  const [activeTab, setActiveTab] = useState<'BUS' | 'DRIVER' | 'POOL' | 'APPROVALS' | 'INSPECTION'>('BUS');
  const [role, setRole] = useState<'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN'>('EMPLOYEE');

  // State models
  const [availableSeats, setAvailableSeats] = useState(16);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);

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
              setRole(roles[nextIdx]);
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

        {/* SCREEN 1: BUS SHUTTLE (Phase 1) */}
        {activeTab === 'BUS' && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>PHASE 1 • COMPANY BUS SHUTTLE</Text>
              <Text style={styles.titleText}>HQ ➔ WMT Container Terminal</Text>
              <Text style={styles.subText}>Fixed departure window: 08:00 AM</Text>
            </View>

            {/* Shuttle Vehicle Card */}
            <View style={styles.shuttleCard}>
              <View style={styles.shuttleRow}>
                <Text style={styles.busReg}>N 142-991 WB</Text>
                <Text style={styles.cutoffBadge}>≥12h Auto-Approved</Text>
              </View>

              <View style={styles.timeBox}>
                <Text style={styles.timeText}>08:00 AM</Text>
                <Text style={styles.routeText}>AGL HQ ➔ WMT Port Terminal</Text>
              </View>

              <View style={styles.seatRow}>
                <Text style={styles.seatLabel}>Available Seats:</Text>
                <Text style={styles.seatCount}>{availableSeats} of 22 Seats Left</Text>
              </View>

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setBookingModalVisible(true)}
              >
                <Text style={styles.primaryButtonText}>Book Shuttle Seats</Text>
              </TouchableOpacity>
            </View>

            {/* My Active Bookings */}
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
          </View>
        )}

        {/* SCREEN 2: DRIVER DISPATCH CONSOLE */}
        {activeTab === 'DRIVER' && (
          <View style={styles.section}>
            <View style={styles.driverHeader}>
              <Text style={styles.driverTitle}>Driver Trip Console</Text>
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

        {/* SCREEN 3: POOL VEHICLES (Manager Fleet Booking) */}
        {activeTab === 'POOL' && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>MANAGER FLEET BOOKING</Text>
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
          </View>
        )}

        {/* SCREEN 4: MANAGER APPROVAL INBOX */}
        {activeTab === 'APPROVALS' && (
          <View style={styles.section}>
            <Text style={styles.titleText}>Manager Approval Inbox</Text>
            
            <View style={styles.myBookingsCard}>
              <Text style={styles.cardTitle}>Pending Pool Vehicle Request</Text>
              <Text style={styles.subText}>Requester: Petrus Haimbodi (Customs & Clearance)</Text>
              <Text style={styles.subText}>Purpose: On-site cargo inspection at Port of Walvis Bay</Text>
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

        {/* SCREEN 5: FLEET ADMIN RETURN INSPECTION */}
        {activeTab === 'INSPECTION' && (
          <View style={styles.section}>
            <Text style={styles.titleText}>Fleet Return Inspection</Text>
            
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

      </ScrollView>

      {/* Mobile Bottom Tab Bar (Native Mobile Navigation) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('BUS')}>
          <Text style={[styles.tabIcon, activeTab === 'BUS' && styles.tabActive]}>🚌</Text>
          <Text style={[styles.tabLabel, activeTab === 'BUS' && styles.tabActive]}>Shuttle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('DRIVER')}>
          <Text style={[styles.tabIcon, activeTab === 'DRIVER' && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'DRIVER' && styles.tabActive]}>Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('POOL')}>
          <Text style={[styles.tabIcon, activeTab === 'POOL' && styles.tabActive]}>🚗</Text>
          <Text style={[styles.tabLabel, activeTab === 'POOL' && styles.tabActive]}>Pool</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('APPROVALS')}>
          <Text style={[styles.tabIcon, activeTab === 'APPROVALS' && styles.tabActive]}>☑️</Text>
          <Text style={[styles.tabLabel, activeTab === 'APPROVALS' && styles.tabActive]}>Manager</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('INSPECTION')}>
          <Text style={[styles.tabIcon, activeTab === 'INSPECTION' && styles.tabActive]}>🛡️</Text>
          <Text style={[styles.tabLabel, activeTab === 'INSPECTION' && styles.tabActive]}>Inspect</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Shuttle Seat Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Shuttle Seat</Text>
            <Text style={styles.subText}>08:00 HQ ➔ WMT Container Terminal</Text>

            <View style={styles.seatPickerRow}>
              {[1, 2, 3, 4].map(num => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.seatNumBtn, seatsRequested === num && styles.seatNumBtnActive]}
                  onPress={() => setSeatsRequested(num)}
                >
                  <Text style={[styles.seatNumText, seatsRequested === num && styles.seatNumTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleBookShuttle}>
              <Text style={styles.primaryButtonText}>Confirm Seat #{seatsRequested}</Text>
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
    backgroundColor: NAVY,
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
    paddingBottom: 80,
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
