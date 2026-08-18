import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  User, 
  Briefcase, 
  Bus, 
  ShieldCheck, 
  Settings, 
  Check, 
  X, 
  MapPin, 
  Zap, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Save, 
  LayoutDashboard, 
  ClipboardList, 
  Car, 
  DoorOpen
} from 'lucide-react-native';

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
  const [role, setRole] = useState<'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN' | 'SUPER_ADMIN'>('EMPLOYEE');
  const [showDropdown, setShowDropdown] = useState(false);

  // Strict Role Permissions
  const isTabAllowed = (tab: 'RIDER' | 'DRIVER' | 'MANAGER' | 'INSPECTOR' | 'ADMIN') => {
    if (role === 'SUPER_ADMIN') return true;
    if (role === 'DRIVER') return tab === 'DRIVER';
    if (role === 'MANAGER') return tab === 'MANAGER' || tab === 'RIDER';
    if (role === 'FLEET_ADMIN') return tab === 'INSPECTOR' || tab === 'RIDER';
    if (role === 'EMPLOYEE') return tab === 'RIDER';
    return tab === 'RIDER';
  };

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
  const [approval1Done, setApproval1Done] = useState<'none' | 'approved' | 'rejected'>('none');

  // Inspector Gate State — Vehicle Queue & Inspection Modal
  const [activeInspectVehicle, setActiveInspectVehicle] = useState<string | null>(null);
  const [inspOdometer, setInspOdometer] = useState('49045');
  const [inspFuel, setInspFuel] = useState('85');
  const [inspNotes, setInspNotes] = useState('');
  const [inspDecision, setInspDecision] = useState<'PASSED' | 'FAILED' | 'REQUIRES_ATTENTION'>('PASSED');
  const [completedInspections, setCompletedInspections] = useState<Array<{ id: string; vehicle: string; reg: string; odometer: string; fuel: string; result: string }>>([]);

  // Admin Business Rules Editable State
  const [ruleCutoffHours, setRuleCutoffHours] = useState('12');
  const [ruleAutoApprove, setRuleAutoApprove] = useState(true);
  const [ruleMaxSeats, setRuleMaxSeats] = useState('4');
  const [ruleDriverTimeout, setRuleDriverTimeout] = useState('15');
  const [ruleBookingWindow, setRuleBookingWindow] = useState('7');
  const [ruleInspectorThreshold, setRuleInspectorThreshold] = useState('500');

  const handleMobileLogin = (empName?: string, empEmail?: string, empRole?: string, empAvatar?: string) => {
    const targetRole = (empRole || 'EMPLOYEE') as 'EMPLOYEE' | 'DRIVER' | 'MANAGER' | 'FLEET_ADMIN' | 'SUPER_ADMIN';
    setActiveUser({
      name: empName || 'Petrus Haimbodi',
      email: empEmail || (emailInput || 'petrus.haimbodi@aglgroup.com'),
      role: targetRole,
      avatar: empAvatar || 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    });
    setRole(targetRole);

    // Route only to the authorized role's primary screen
    if (targetRole === 'DRIVER') {
      setActiveTab('DRIVER');
    } else if (targetRole === 'MANAGER') {
      setActiveTab('MANAGER');
    } else if (targetRole === 'FLEET_ADMIN') {
      setActiveTab('INSPECTOR');
    } else if (targetRole === 'SUPER_ADMIN') {
      setActiveTab('ADMIN');
    } else {
      setActiveTab('RIDER');
    }

    setIsAuthenticated(true);
    Alert.alert('Signed In', `Signed in as ${empName || 'Petrus'} (${targetRole.replace('_', ' ')}).`);
  };

  const handleBookShuttle = (time: string = '08:00 AM') => {
    if (availableSeats < 1) {
      Alert.alert('Seats Unavailable', 'Not enough seats remaining on this shuttle.');
      return;
    }

    setAvailableSeats(prev => prev - 1);
    setMyBookings(prev => [`${time} Departure (Seat ${selectedSeatNumber})`, ...prev]);
    setBookingModalVisible(false);
    Alert.alert('Success', `Shuttle seat #${selectedSeatNumber} reserved! Status: AUTO_APPROVED.`);
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
              <Image 
                source={require('./assets/agloggo.png')} 
                style={styles.authLogoImage} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.authTitle}>AGL Transport Hub</Text>
            <Text style={styles.authSubtitle}>Namibia • Walvis Bay Mobile</Text>
            <View style={styles.authBadge}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Lock size={12} color={GOLD} /><Text style={styles.authBadgeText}>Microsoft Entra ID Protected</Text></View>
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
                onPress={() => handleMobileLogin('Petrus Haimbodi', 'petrus.haimbodi@aglgroup.com', 'EMPLOYEE', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200')}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><User size={13} color="#FFF" /><Text style={styles.personaChipText}>Petrus (Rider)</Text></View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Klaus Schneider', 'manager.logistics@aglgroup.com', 'MANAGER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200')}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Briefcase size={13} color="#FFF" /><Text style={styles.personaChipText}>Klaus (Manager)</Text></View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Johannes Nangolo', 'driver.bus1@aglgroup.com', 'DRIVER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200')}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Bus size={13} color="#FFF" /><Text style={styles.personaChipText}>Johannes (Driver)</Text></View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Maria Amadhila', 'fleet.admin@aglgroup.com', 'FLEET_ADMIN', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200')}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><ShieldCheck size={13} color="#FFF" /><Text style={styles.personaChipText}>Maria (Inspector)</Text></View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.personaChip}
                onPress={() => handleMobileLogin('Senzo Shinga', 'admin.namibia@aglgroup.com', 'SUPER_ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Settings size={13} color="#FFF" /><Text style={styles.personaChipText}>Senzo (Admin)</Text></View>
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

      {/* Mobile Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Image 
              source={require('./assets/agloggo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>AGL Transport Hub</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Lock size={10} color={GOLD} /><Text style={styles.headerSub}>Microsoft Entra ID • Walvis Bay</Text></View>
          </View>
        </View>

        {/* User Profile Avatar & Dropdown Trigger */}
        <TouchableOpacity 
          style={styles.avatarDropdownBtn}
          onPress={() => setShowDropdown(true)}
        >
          <Image 
            source={{ uri: activeUser.avatar }} 
            style={styles.userAvatarImg} 
          />
          <Text style={styles.dropdownChevron}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* User Persona Dropdown Modal Menu */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenuBox}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderTitle}>SWITCH PERSONA / TEST ROLE</Text>
              <Text style={styles.dropdownHeaderSub}>Select corporate user account</Text>
            </View>

            {/* Persona 1: Rider (Petrus) */}
            <TouchableOpacity 
              style={[styles.dropdownItem, activeUser.name === 'Petrus Haimbodi' && styles.dropdownItemActive]}
              onPress={() => {
                handleMobileLogin('Petrus Haimbodi', 'petrus.haimbodi@aglgroup.com', 'EMPLOYEE', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200');
                setActiveTab('RIDER');
                setShowDropdown(false);
              }}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200' }} style={styles.itemAvatar} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemNameText}>Petrus Haimbodi</Text>
                <Text style={styles.itemRoleText}>EMPLOYEE • Rider</Text>
              </View>
              {activeUser.name === 'Petrus Haimbodi' && <Check size={16} color={TURQUOISE} />}
            </TouchableOpacity>

            {/* Persona 2: Manager (Klaus) */}
            <TouchableOpacity 
              style={[styles.dropdownItem, activeUser.name === 'Klaus Schneider' && styles.dropdownItemActive]}
              onPress={() => {
                handleMobileLogin('Klaus Schneider', 'manager.logistics@aglgroup.com', 'MANAGER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200');
                setActiveTab('MANAGER');
                setShowDropdown(false);
              }}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' }} style={styles.itemAvatar} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemNameText}>Klaus Schneider</Text>
                <Text style={styles.itemRoleText}>MANAGER • Logistics Lead</Text>
              </View>
              {activeUser.name === 'Klaus Schneider' && <Check size={16} color={TURQUOISE} />}
            </TouchableOpacity>

            {/* Persona 3: Driver (Johannes) */}
            <TouchableOpacity 
              style={[styles.dropdownItem, activeUser.name === 'Johannes Nangolo' && styles.dropdownItemActive]}
              onPress={() => {
                handleMobileLogin('Johannes Nangolo', 'driver.bus1@aglgroup.com', 'DRIVER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200');
                setActiveTab('DRIVER');
                setShowDropdown(false);
              }}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }} style={styles.itemAvatar} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemNameText}>Johannes Nangolo</Text>
                <Text style={styles.itemRoleText}>DRIVER • Shuttle Bus 01</Text>
              </View>
              {activeUser.name === 'Johannes Nangolo' && <Check size={16} color={TURQUOISE} />}
            </TouchableOpacity>

            {/* Persona 4: Inspector (Maria) */}
            <TouchableOpacity 
              style={[styles.dropdownItem, activeUser.name === 'Maria Amadhila' && styles.dropdownItemActive]}
              onPress={() => {
                handleMobileLogin('Maria Amadhila', 'fleet.admin@aglgroup.com', 'FLEET_ADMIN', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200');
                setActiveTab('INSPECTOR');
                setShowDropdown(false);
              }}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }} style={styles.itemAvatar} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemNameText}>Maria Amadhila</Text>
                <Text style={styles.itemRoleText}>FLEET ADMIN • Inspector</Text>
              </View>
              {activeUser.name === 'Maria Amadhila' && <Check size={16} color={TURQUOISE} />}
            </TouchableOpacity>

            {/* Persona 5: Admin (Senzo) */}
            <TouchableOpacity 
              style={[styles.dropdownItem, activeUser.name === 'Senzo Shinga' && styles.dropdownItemActive]}
              onPress={() => {
                handleMobileLogin('Senzo Shinga', 'admin.namibia@aglgroup.com', 'SUPER_ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
                setActiveTab('ADMIN');
                setShowDropdown(false);
              }}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }} style={styles.itemAvatar} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemNameText}>Senzo Shinga</Text>
                <Text style={styles.itemRoleText}>SUPER ADMIN • Operations</Text>
              </View>
              {activeUser.name === 'Senzo Shinga' && <Check size={16} color={TURQUOISE} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dropdownSignOutBtn}
              onPress={() => {
                setShowDropdown(false);
                setIsAuthenticated(false);
                Alert.alert('Signed Out', 'You have been signed out of your Microsoft Entra ID session.');
              }}
            >
              <Text style={styles.dropdownSignOutText}>Sign Out (Microsoft Session)</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Native Screen Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* SCREEN 1: RIDER PORTAL */}
        {activeTab === 'RIDER' && (
          <View style={styles.section}>
            {/* Dark Navy Hero Welcome Banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroBadgeRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><MapPin size={12} color={TURQUOISE} /><Text style={styles.heroBadge}>AGL Employee Rider Portal • Walvis Bay</Text></View>
              </View>
              <Text style={styles.heroGreeting}>Hello, {activeUser.name.split(' ')[0]}!</Text>
              <Text style={styles.heroSubText}>
                Reserve shuttle bus seats with visual seat selection and track active trips in real time.
              </Text>
            </View>

            {/* Live Current Trips Banner */}
            <View style={styles.liveTripsCard}>
              <View style={styles.liveTripsTitleRow}>
                <Zap size={14} color={GOLD} />
                <Text style={styles.liveTripsTitle}>LIVE TRIPS IN PROGRESS</Text>
              </View>

              <View style={styles.liveTripItem}>
                <View>
                  <Text style={styles.liveStatusBadge}>{tripStatus}</Text>
                  <Text style={styles.liveShuttleName}>Shuttle #N142-991WB</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.liveDepTime}>Dep: 08:00 AM</Text>
                  <Text style={styles.liveSeatsLeft}>{availableSeats} Seats Left</Text>
                </View>
              </View>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color={NAVY} /><Text style={styles.selectSeatBtnText}>Select Seat & Book</Text></View>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color={NAVY} /><Text style={styles.selectSeatBtnText}>Select Seat & Book</Text></View>
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
              <View style={{ gap: 12 }}>
                {[
                  { time: '08:00', route: 'AGL HQ ➔ WMT Container Terminal', seats: availableSeats, total: 22, status: tripStatus },
                  { time: '09:00', route: 'WMT Container Terminal ➔ AGL HQ', seats: 20, total: 22, status: 'SCHEDULED' },
                  { time: '10:00', route: 'AGL HQ ➔ Namibia Customs & Excise Office', seats: 18, total: 22, status: 'SCHEDULED' },
                  { time: '11:00', route: 'Namibia Customs Office ➔ AGL HQ', seats: 22, total: 22, status: 'SCHEDULED' },
                  { time: 'Tomorrow 08:00', route: 'AGL HQ ➔ WMT Container Terminal', seats: 14, total: 22, status: 'SCHEDULED' },
                ].map((trip, i) => (
                  <View key={i} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeaderRow}>
                      <Text style={styles.scheduledPill}>{trip.status}</Text>
                      <Text style={styles.noticeWindowText}>Toyota Coaster • N 142-991 WB</Text>
                    </View>
                    <Text style={styles.scheduleTimeTitle}>{trip.time} Departure</Text>
                    <Text style={styles.scheduleRouteSub}>{trip.route}</Text>
                    <View style={styles.seatsRow}>
                      <Text style={styles.seatsLabel}>Seats Remaining:</Text>
                      <Text style={styles.seatsValue}>{trip.seats} / {trip.total}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SCREEN 2: DRIVER CONSOLE */}
        {activeTab === 'DRIVER' && (
          <View style={styles.section}>
            {/* Header Banner */}
            <View style={styles.driverHeroBanner}>
              <Text style={styles.driverHeroBadge}>DRIVER COMMAND CONSOLE • AGL FLEET</Text>
              <Text style={styles.driverTitle}>Driver Console: Johannes Nangolo</Text>
              <Text style={styles.driverSub}>Assigned Bus: Toyota Coaster Executive Bus (N 142-991 WB)</Text>
            </View>

            {/* Trip Assignment Offer Banner */}
            {hasTripAssignmentOffer && (
              <View style={styles.offerCard}>
                <View style={styles.offerHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.offerBadge}>NEW TRIP ASSIGNMENT OFFERED</Text>
                  </View>
                  <Text style={styles.offerTime}>Attempt #1</Text>
                </View>

                <View style={styles.offerDetailsGrid}>
                  <View>
                    <Text style={styles.offerDetailLabel}>ROUTE</Text>
                    <Text style={styles.offerRoute}>AGL HQ ➔ WMT Port</Text>
                  </View>
                  <View>
                    <Text style={styles.offerDetailLabel}>DEPARTURE TIME</Text>
                    <Text style={styles.offerRoute}>08:00</Text>
                  </View>
                  <View>
                    <Text style={styles.offerDetailLabel}>ASSIGNED BUS</Text>
                    <Text style={styles.offerRoute}>N 142-991 WB</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.approveBtn, { flex: 1 }]}
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

            {/* Active Trips & Controlled State Action Controls */}
            <Text style={styles.tripsListTitle}>Active Trips & Controlled State Action Controls</Text>

            {/* Trip 1 */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={styles.statusPill}>{tripStatus}</Text>
                <Text style={styles.tripTimeBadge}>08:00 Departure</Text>
              </View>
              <Text style={styles.tripRouteText}>AGL HQ ➔ Walvis Bay Container Terminal</Text>

              <View style={styles.actionButtonContainer}>
                {tripStatus === 'SCHEDULED' && (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F59E0B' }]} onPress={() => setTripStatus('BOARDING')}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color="#FFF" /><Text style={styles.primaryButtonText}>START BOARDING</Text></View>
                  </TouchableOpacity>
                )}
                {tripStatus === 'BOARDING' && (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#0D9488' }]} onPress={() => setTripStatus('EN_ROUTE')}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Play size={14} color="#FFF" /><Text style={styles.primaryButtonText}>DEPART / START TRIP</Text></View>
                  </TouchableOpacity>
                )}
                {tripStatus === 'EN_ROUTE' && (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: NAVY }]} onPress={() => setTripStatus('ARRIVED')}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><MapPin size={14} color="#FFF" /><Text style={styles.primaryButtonText}>ARRIVED AT DESTINATION</Text></View>
                  </TouchableOpacity>
                )}
                {tripStatus === 'ARRIVED' && (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#0F172A' }]} onPress={() => setTripStatus('EMPTYING')}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><DoorOpen size={14} color="#FFF" /><Text style={styles.primaryButtonText}>EMPTY BUS / PASSENGERS DEPARKED</Text></View>
                  </TouchableOpacity>
                )}
                {tripStatus === 'EMPTYING' && (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#059669' }]} onPress={() => setTripStatus('COMPLETED')}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="#FFF" /><Text style={styles.primaryButtonText}>COMPLETE TRIP & LOG REPORT</Text></View>
                  </TouchableOpacity>
                )}
                {tripStatus === 'COMPLETED' && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="#10B981" /><Text style={styles.completedTripText}>Trip Completed & Logged</Text></View>
                )}
              </View>

              {/* Passenger Manifest */}
              <View style={styles.manifestCard}>
                <Text style={styles.manifestTitle}>DIGITAL PASSENGER MANIFEST CHECK-IN (2 BOOKINGS)</Text>
                {[
                  { name: 'Petrus Haimbodi', dept: 'Customs & Clearance', seat: 'Seat 01' },
                  { name: 'Selma Shikongo', dept: 'Logistics Ops', seat: 'Seat 03' },
                ].map((p, i) => {
                  const isChecked = checkedPassengers[p.name];
                  return (
                    <View key={i} style={styles.manifestItem}>
                      <TouchableOpacity
                        style={[styles.checkbox, isChecked && styles.checkboxActive]}
                        onPress={() => setCheckedPassengers(prev => ({ ...prev, [p.name]: !prev[p.name] }))}
                      >
                        {isChecked ? <Check size={12} color="#FFF" /> : null}
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

            {/* Trip 2 */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={styles.statusPill}>SCHEDULED</Text>
                <Text style={styles.tripTimeBadge}>09:00 Departure</Text>
              </View>
              <Text style={styles.tripRouteText}>WMT Container Terminal ➔ AGL HQ</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F59E0B', marginTop: 10 }]} onPress={() => Alert.alert('Trip Started', 'Trip 2 boarding started.')}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color="#FFF" /><Text style={styles.primaryButtonText}>START BOARDING</Text></View>
              </TouchableOpacity>
              <View style={[styles.manifestCard, { marginTop: 10 }]}>
                <Text style={styles.manifestTitle}>DIGITAL PASSENGER MANIFEST CHECK-IN (0 BOOKINGS)</Text>
                <Text style={styles.emptyText}>No confirmed passengers on this trip yet.</Text>
              </View>
            </View>

            {/* Trip 3 */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={styles.statusPill}>SCHEDULED</Text>
                <Text style={styles.tripTimeBadge}>10:00 Departure</Text>
              </View>
              <Text style={styles.tripRouteText}>AGL HQ ➔ Namibia Customs & Excise Office</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F59E0B', marginTop: 10 }]} onPress={() => Alert.alert('Trip Started', 'Trip 3 boarding started.')}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color="#FFF" /><Text style={styles.primaryButtonText}>START BOARDING</Text></View>
              </TouchableOpacity>
              <View style={[styles.manifestCard, { marginTop: 10 }]}>
                <Text style={styles.manifestTitle}>DIGITAL PASSENGER MANIFEST CHECK-IN (0 BOOKINGS)</Text>
                <Text style={styles.emptyText}>No confirmed passengers on this trip yet.</Text>
              </View>
            </View>

            {/* Trip 4 */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={styles.statusPill}>SCHEDULED</Text>
                <Text style={styles.tripTimeBadge}>11:00 Departure</Text>
              </View>
              <Text style={styles.tripRouteText}>Namibia Customs Office ➔ AGL HQ</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F59E0B', marginTop: 10 }]} onPress={() => Alert.alert('Trip Started', 'Trip 4 boarding started.')}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color="#FFF" /><Text style={styles.primaryButtonText}>START BOARDING</Text></View>
              </TouchableOpacity>
              <View style={[styles.manifestCard, { marginTop: 10 }]}>
                <Text style={styles.manifestTitle}>DIGITAL PASSENGER MANIFEST CHECK-IN (0 BOOKINGS)</Text>
                <Text style={styles.emptyText}>No confirmed passengers on this trip yet.</Text>
              </View>
            </View>

            {/* Trip 5 (Tomorrow) */}
            <View style={styles.tripControlCard}>
              <View style={styles.tripStatusHeader}>
                <Text style={[styles.statusPill, { backgroundColor: '#CBD5E1', color: '#64748B' }]}>SCHEDULED</Text>
                <Text style={styles.tripTimeBadge}>Tomorrow 08:00</Text>
              </View>
              <Text style={styles.tripRouteText}>AGL HQ ➔ WMT Container Terminal</Text>
              <Text style={[styles.emptyText, { marginTop: 6, color: '#94A3B8' }]}>Trip starts tomorrow — no actions available yet.</Text>
            </View>
          </View>
        )}

        {/* SCREEN 3: MANAGER HUB */}
        {activeTab === 'MANAGER' && (
          <View style={styles.section}>
            {/* Header Banner */}
            <View style={styles.driverHeroBanner}>
              <Text style={styles.driverHeroBadge}>MANAGER CONTROL HUB • WALVIS BAY FLEET</Text>
              <Text style={styles.driverTitle}>Manager Console: Klaus Schneider</Text>
              <Text style={styles.driverSub}>Approve team transport requests & reserve company pool vehicles.</Text>
            </View>

            {/* Pending Approvals Inbox */}
            <Text style={styles.tripsListTitle}>Pending Approval Requests</Text>
            {approval1Done === 'none' ? (
              <View style={styles.offerCard}>
                <View style={styles.offerHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.pulseDot, { backgroundColor: GOLD }]} />
                    <Text style={[styles.offerBadge, { color: NAVY, backgroundColor: 'rgba(238, 213, 142, 0.2)', borderColor: GOLD, borderWidth: 1 }]}>PENDING MANAGER APPROVAL</Text>
                  </View>
                  <Text style={styles.offerTime}>pool-req-1</Text>
                </View>

                <View style={styles.offerDetailsGrid}>
                  <View>
                    <Text style={styles.offerDetailLabel}>REQUESTER</Text>
                    <Text style={styles.offerRoute}>Petrus Haimbodi</Text>
                    <Text style={[styles.offerSub, { color: '#64748B', marginTop: 0 }]}>Customs & Clearance Dept.</Text>
                  </View>
                  <View>
                    <Text style={styles.offerDetailLabel}>PURPOSE</Text>
                    <Text style={[styles.offerRoute, { color: '#1E1B4B', fontSize: 12 }]}>On-site audit and cargo inspection at Customs Depot</Text>
                  </View>
                  <View>
                    <Text style={styles.offerDetailLabel}>VEHICLE REQUESTED</Text>
                    <Text style={styles.offerRoute}>Toyota Hilux 4x4</Text>
                    <Text style={[styles.offerSub, { color: '#64748B', marginTop: 0 }]}>N 882-102 WB • Tomorrow 09:00–17:00</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.approveBtn, { flex: 1 }]}
                    onPress={() => {
                      setApproval1Done('approved');
                      Alert.alert('Approved!', 'Vehicle reserved and locked in calendar.');
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Check size={14} color="#FFF" /><Text style={styles.btnText}>Approve & Reserve</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => {
                      setApproval1Done('rejected');
                      Alert.alert('Declined', 'Request declined and requester notified.');
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><X size={14} color="#FFF" /><Text style={styles.btnText}>Decline</Text></View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.manifestCard, { marginBottom: 14 }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: approval1Done === 'approved' ? '#059669' : '#DC2626', textAlign: 'center' }}>
                  {approval1Done === 'approved' ? 'Request Approved — Vehicle Reserved' : 'Request Declined'}
                </Text>
              </View>
            )}

            {/* Pool Fleet Vehicles */}
            <Text style={styles.tripsListTitle}>Available Pool Fleet Vehicles</Text>

            {/* Car 1: Toyota Hilux */}
            <View style={styles.poolCarCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' }}
                style={styles.carImage}
              />
              <View style={styles.carInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carTitle}>Toyota Hilux Double Cab 4x4</Text>
                    <Text style={styles.carReg}>N 882-102 WB • 5 Seats • Diesel • 48,900 KM</Text>
                  </View>
                  <Text style={[styles.scheduledPill, { backgroundColor: '#059669' }]}>AVAILABLE</Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setPoolModalVisible(true)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Calendar size={14} color="#FFF" /><Text style={styles.primaryButtonText}>Book for Business Trip</Text></View>
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

            {/* Car 2: VW Polo Vivo */}
            <View style={[styles.poolCarCard, { marginTop: 14 }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600' }}
                style={styles.carImage}
              />
              <View style={styles.carInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carTitle}>Volkswagen Polo Vivo Sedan</Text>
                    <Text style={styles.carReg}>N 554-331 WB • 5 Seats • Petrol • 18,400 KM</Text>
                  </View>
                  <Text style={[styles.scheduledPill, { backgroundColor: '#059669' }]}>AVAILABLE</Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => Alert.alert('Book VW Polo', 'Submit a request for the VW Polo Vivo sedan.')}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Calendar size={14} color="#FFF" /><Text style={styles.primaryButtonText}>Book for Business Trip</Text></View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SCREEN 4: INSPECTOR GATE */}
        {activeTab === 'INSPECTOR' && (
          <View style={styles.section}>
            {/* Header Banner */}
            <View style={styles.driverHeroBanner}>
              <Text style={styles.driverHeroBadge}>VEHICLE QUALITY CONTROL • INSPECTOR CONSOLE</Text>
              <Text style={styles.driverTitle}>Inspector Portal: Maria Amadhila</Text>
              <Text style={styles.driverSub}>Perform post-return inspections & enforce vehicle availability quality gates.</Text>
            </View>

            {/* Success notification */}
            {completedInspections.length > 0 && (
              <View style={[styles.manifestCard, { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }]}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#065F46' }}>
                  Inspection Completed for {completedInspections[0].reg}! Result: {completedInspections[0].result}.
                </Text>
              </View>
            )}

            {/* Vehicle Post-Return Inspection Queue */}
            <Text style={styles.tripsListTitle}>Vehicle Post-Return Inspection Queue</Text>

            {[
              { id: 'veh-bus-1', make: 'Toyota', model: 'Coaster Executive Bus', reg: 'N 142-991 WB', mileage: '34,200', fuel: 'Diesel', status: 'AVAILABLE', statusColor: '#059669' },
              { id: 'veh-pool-1', make: 'Toyota', model: 'Hilux Double Cab 4x4', reg: 'N 882-102 WB', mileage: '48,900', fuel: 'Diesel', status: 'AVAILABLE', statusColor: '#059669' },
              { id: 'veh-pool-2', make: 'Volkswagen', model: 'Polo Vivo Sedan', reg: 'N 554-331 WB', mileage: '18,400', fuel: 'Petrol', status: 'AVAILABLE', statusColor: '#059669' },
            ].map((v) => (
              <View key={v.id} style={styles.tripControlCard}>
                <View style={styles.tripStatusHeader}>
                  <Text style={styles.passengerDept}>Fleet #{v.reg}</Text>
                  <Text style={[styles.statusPill, { backgroundColor: v.statusColor }]}>{v.status}</Text>
                </View>
                <Text style={[styles.tripRouteText, { fontSize: 14, marginBottom: 4 }]}>{v.make} {v.model}</Text>
                <Text style={styles.passengerDept}>Odometer: {v.mileage} km • {v.fuel}</Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setActiveInspectVehicle(v.id);
                    setInspOdometer(v.mileage.replace(',', ''));
                    setInspDecision('PASSED');
                    setInspNotes('');
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><ShieldCheck size={14} color="#FFF" /><Text style={styles.primaryButtonText}>Perform Inspection</Text></View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Completed Inspection Audit Log */}
            <Text style={styles.tripsListTitle}>Completed Inspection Audit Logs</Text>
            <View style={styles.tripControlCard}>
              {completedInspections.length === 0 ? (
                <Text style={styles.emptyText}>No inspections completed yet. Perform an inspection above.</Text>
              ) : (
                completedInspections.map((insp) => (
                  <View key={insp.id} style={[styles.manifestItem, { paddingVertical: 10 }]}>
                    <View style={styles.passengerInfo}>
                      <Text style={styles.passengerName}>Post-Return Inspection #{insp.id.slice(0, 6)}</Text>
                      <Text style={styles.passengerDept}>Odometer: {insp.odometer} km • Fuel: {insp.fuel}% • {insp.vehicle}</Text>
                    </View>
                    <Text style={[styles.statusPill, { backgroundColor: insp.result === 'PASSED' ? '#059669' : insp.result === 'FAILED' ? '#DC2626' : '#D97706', fontSize: 9 }]}>
                      {insp.result}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* INSPECTION MODAL */}
        {activeInspectVehicle && (
          <Modal visible={true} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
                  <View>
                    <Text style={styles.modalTitle}>Vehicle Post-Return Inspection</Text>
                    <Text style={styles.passengerDept}>
                      {['veh-bus-1', 'veh-pool-1', 'veh-pool-2'].indexOf(activeInspectVehicle) === 0 ? 'Toyota Coaster Executive Bus (N 142-991 WB)'
                        : ['veh-bus-1', 'veh-pool-1', 'veh-pool-2'].indexOf(activeInspectVehicle) === 1 ? 'Toyota Hilux Double Cab (N 882-102 WB)'
                        : 'Volkswagen Polo Vivo (N 554-331 WB)'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveInspectVehicle(null)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <X size={16} color="#64748B" />
                      <Text style={{ color: '#64748B', fontWeight: 'bold', fontSize: 13 }}>Close</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Odometer & Fuel inputs */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.offerDetailLabel}>ODOMETER READING (KM)</Text>
                      <TextInput
                        style={[styles.inputField, { marginTop: 4 }]}
                        value={inspOdometer}
                        onChangeText={setInspOdometer}
                        keyboardType="numeric"
                        placeholder="e.g. 49045"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.offerDetailLabel}>FUEL LEVEL (%)</Text>
                      <TextInput
                        style={[styles.inputField, { marginTop: 4 }]}
                        value={inspFuel}
                        onChangeText={setInspFuel}
                        keyboardType="numeric"
                        placeholder="e.g. 85"
                      />
                    </View>
                  </View>

                  {/* Inspection Gate Decision */}
                  <Text style={[styles.offerDetailLabel, { marginBottom: 6 }]}>INSPECTION GATE DECISION</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {(['PASSED', 'FAILED', 'REQUIRES_ATTENTION'] as const).map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[
                          { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
                          inspDecision === d
                            ? { backgroundColor: d === 'PASSED' ? '#059669' : d === 'FAILED' ? '#DC2626' : '#D97706', borderColor: 'transparent' }
                            : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                        ]}
                        onPress={() => setInspDecision(d)}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '900', color: inspDecision === d ? '#FFF' : '#64748B' }}>
                          {d === 'PASSED' ? 'PASSED' : d === 'FAILED' ? 'FAILED' : 'ATTENTION'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Damage Notes */}
                  <Text style={[styles.offerDetailLabel, { marginBottom: 4 }]}>DAMAGE & INSPECTION NOTES</Text>
                  <TextInput
                    style={[styles.inputField, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                    value={inspNotes}
                    onChangeText={setInspNotes}
                    placeholder="Record any exterior scratches, tire condition, or interior cleanliness notes..."
                    multiline
                  />

                  {/* Submit / Cancel */}
                  <View style={[styles.buttonRow, { marginTop: 16 }]}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E2E8F0' }]}
                      onPress={() => setActiveInspectVehicle(null)}
                    >
                      <Text style={{ color: '#64748B', fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => {
                        const vehicleNames: Record<string, { name: string; reg: string }> = {
                          'veh-bus-1': { name: 'Toyota Coaster', reg: 'N 142-991 WB' },
                          'veh-pool-1': { name: 'Toyota Hilux', reg: 'N 882-102 WB' },
                          'veh-pool-2': { name: 'VW Polo Vivo', reg: 'N 554-331 WB' },
                        };
                        const v = vehicleNames[activeInspectVehicle];
                        setCompletedInspections(prev => [{ id: `insp-${Date.now()}`, vehicle: v.name, reg: v.reg, odometer: inspOdometer, fuel: inspFuel, result: inspDecision }, ...prev]);
                        setActiveInspectVehicle(null);
                        Alert.alert(
                          'Inspection Submitted',
                          `${v.name} (${v.reg})\nResult: ${inspDecision}\nVehicle set to: ${inspDecision === 'PASSED' ? 'AVAILABLE' : 'UNDER_MAINTENANCE'}`
                        );
                      }}
                    >
                      <Text style={styles.btnText}>Submit Inspection</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* SCREEN 5: ADMIN & BUSINESS RULES */}
        {activeTab === 'ADMIN' && (
          <View style={styles.section}>
            {/* Header Banner */}
            <View style={[styles.driverHeroBanner, { backgroundColor: '#0F172A' }]}>
              <Text style={styles.driverHeroBadge}>ADMIN PORTAL • SYSTEM CONTROL</Text>
              <Text style={styles.driverTitle}>Business Rules & Transport Config</Text>
              <Text style={styles.driverSub}>Configure fleet-wide transport rules applied across all bookings.</Text>
            </View>

            <Text style={styles.tripsListTitle}>Configurable Fleet Rules</Text>

            {/* Rule 1: Cutoff Window */}
            <View style={styles.tripControlCard}>
              <Text style={styles.passengerName}>Booking Cutoff Window (Hours)</Text>
              <Text style={styles.passengerDept}>Minimum hours notice required before trip departure</Text>
              <View style={[styles.seatsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleCutoffHours(String(Math.max(1, parseInt(ruleCutoffHours) - 1)))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scheduleTimeTitle, { textAlign: 'center', minWidth: 60 }]}>{ruleCutoffHours}h</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginLeft: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleCutoffHours(String(parseInt(ruleCutoffHours) + 1))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rule 2: Auto-Approve Toggle */}
            <View style={styles.tripControlCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.passengerName}>Auto-Approve Shuttle Bookings</Text>
                  <Text style={styles.passengerDept}>Bookings made before cutoff window are automatically approved</Text>
                </View>
                <TouchableOpacity
                  style={[styles.statusPill, { backgroundColor: ruleAutoApprove ? '#059669' : '#DC2626', paddingHorizontal: 14, paddingVertical: 8 }]}
                  onPress={() => setRuleAutoApprove(prev => !prev)}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>{ruleAutoApprove ? 'ENABLED' : 'DISABLED'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rule 3: Max Seats Per Employee */}
            <View style={styles.tripControlCard}>
              <Text style={styles.passengerName}>Max Seats Per Employee</Text>
              <Text style={styles.passengerDept}>Maximum seats an employee can book per shuttle trip</Text>
              <View style={[styles.seatsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleMaxSeats(String(Math.max(1, parseInt(ruleMaxSeats) - 1)))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scheduleTimeTitle, { textAlign: 'center', minWidth: 60 }]}>{ruleMaxSeats} seats</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginLeft: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleMaxSeats(String(parseInt(ruleMaxSeats) + 1))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rule 4: Driver Acceptance Timeout */}
            <View style={styles.tripControlCard}>
              <Text style={styles.passengerName}>Driver Acceptance Timeout (Minutes)</Text>
              <Text style={styles.passengerDept}>Time before system auto-reassigns trip to next available driver</Text>
              <View style={[styles.seatsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleDriverTimeout(String(Math.max(5, parseInt(ruleDriverTimeout) - 5)))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scheduleTimeTitle, { textAlign: 'center', minWidth: 60 }]}>{ruleDriverTimeout} min</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginLeft: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleDriverTimeout(String(parseInt(ruleDriverTimeout) + 5))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rule 5: Booking Window */}
            <View style={styles.tripControlCard}>
              <Text style={styles.passengerName}>Advance Booking Window (Days)</Text>
              <Text style={styles.passengerDept}>How many days ahead employees can book shuttle seats</Text>
              <View style={[styles.seatsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleBookingWindow(String(Math.max(1, parseInt(ruleBookingWindow) - 1)))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scheduleTimeTitle, { textAlign: 'center', minWidth: 60 }]}>{ruleBookingWindow} days</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginLeft: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleBookingWindow(String(parseInt(ruleBookingWindow) + 1))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rule 6: Inspector KM Threshold */}
            <View style={styles.tripControlCard}>
              <Text style={styles.passengerName}>Inspection Trigger KM Threshold</Text>
              <Text style={styles.passengerDept}>Pool vehicles trigger mandatory inspection after this mileage</Text>
              <View style={[styles.seatsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleInspectorThreshold(String(Math.max(100, parseInt(ruleInspectorThreshold) - 100)))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scheduleTimeTitle, { textAlign: 'center', minWidth: 70 }]}>{ruleInspectorThreshold} KM</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginLeft: 8, paddingVertical: 10, backgroundColor: '#E2E8F0' }]}
                  onPress={() => setRuleInspectorThreshold(String(parseInt(ruleInspectorThreshold) + 100))}
                >
                  <Text style={[styles.primaryButtonText, { color: NAVY }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { paddingVertical: 16, borderRadius: 16, marginTop: 4 }]}
              onPress={() => Alert.alert('Rules Saved', `Business rules updated across AGL fleet system!\n\n• Cutoff: ${ruleCutoffHours}h\n• Auto-Approve: ${ruleAutoApprove ? 'ON' : 'OFF'}\n• Max Seats: ${ruleMaxSeats}\n• Driver Timeout: ${ruleDriverTimeout} min\n• Booking Window: ${ruleBookingWindow} days\n• Inspection Trigger: ${ruleInspectorThreshold} KM`)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Save size={14} color="#FFF" /><Text style={styles.primaryButtonText}>Save All Rule Configurations</Text></View>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Mobile Bottom Tab Bar (Role-Filtered Navigation Bar) */}
      <View style={styles.tabBar}>
        {isTabAllowed('RIDER') && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('RIDER')}>
            <LayoutDashboard size={20} color={activeTab === 'RIDER' ? GOLD : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'RIDER' && styles.tabActive]}>Rider Portal</Text>
          </TouchableOpacity>
        )}

        {isTabAllowed('DRIVER') && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('DRIVER')}>
            <ClipboardList size={20} color={activeTab === 'DRIVER' ? GOLD : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'DRIVER' && styles.tabActive]}>Driver Console</Text>
          </TouchableOpacity>
        )}

        {isTabAllowed('MANAGER') && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('MANAGER')}>
            <Briefcase size={20} color={activeTab === 'MANAGER' ? GOLD : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'MANAGER' && styles.tabActive]}>Manager Hub</Text>
          </TouchableOpacity>
        )}

        {isTabAllowed('INSPECTOR') && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('INSPECTOR')}>
            <ShieldCheck size={20} color={activeTab === 'INSPECTOR' ? GOLD : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'INSPECTOR' && styles.tabActive]}>Inspector Gate</Text>
          </TouchableOpacity>
        )}

        {isTabAllowed('ADMIN') && (
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('ADMIN')}>
            <Settings size={20} color={activeTab === 'ADMIN' ? GOLD : '#94A3B8'} />
            <Text style={[styles.tabLabel, activeTab === 'ADMIN' && styles.tabActive]}>Admin & Rules</Text>
          </TouchableOpacity>
        )}
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Bus size={14} color={NAVY} /><Text style={styles.driverCabText}>FRONT • DRIVER CAB</Text></View>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GOLD,
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
  avatarDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25467A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(238, 213, 142, 0.4)',
  },
  userAvatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD,
  },
  dropdownChevron: {
    color: GOLD,
    fontSize: 10,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  dropdownMenuBox: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dropdownHeader: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  dropdownHeaderTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 0.5,
  },
  dropdownHeaderSub: {
    fontSize: 10,
    color: '#64748B',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 2,
  },
  dropdownItemActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  itemAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  itemTextCol: {
    flex: 1,
  },
  itemNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: NAVY,
  },
  itemRoleText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B45309',
  },
  dropdownSignOutBtn: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  dropdownSignOutText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EF4444',
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
    marginBottom: 10,
    elevation: 4,
  },
  liveTripsCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  liveTripsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveSpinIcon: {
    fontSize: 14,
    color: '#D97706',
  },
  liveTripsTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  liveTripItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  liveStatusBadge: {
    backgroundColor: '#D97706',
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  liveShuttleName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAVY,
  },
  liveDepTime: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  liveSeatsLeft: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
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
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: GOLD,
    overflow: 'hidden',
    padding: 4,
  },
  authLogoImage: {
    width: '100%',
    height: '100%',
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
  offerSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    marginBottom: 4,
  },
  offerRoute: {
    fontSize: 14,
    fontWeight: '900',
    color: '#78350F',
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
  driverHeroBanner: {
    backgroundColor: NAVY,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  driverHeroBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tripsListTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: NAVY,
    marginBottom: 12,
  },
  tripTimeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offerDetailsGrid: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
    gap: 8,
  },
  offerDetailLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  manifestTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});


