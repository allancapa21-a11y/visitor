/* ===== City Councilor Visitor E-Logbook - Data & Auth Layer ===== */

// ---------- SAMPLE STAFF / USER DATA ----------
const USERS = [
  { id: 1, username: "admin", password: "admin123", fullName: "Juan Dela Cruz", role: "admin", status: "active" },
  { id: 2, username: "maria", password: "staff123", fullName: "Maria Santos", role: "staff", status: "active" },
  { id: 3, username: "pedro", password: "staff123", fullName: "Pedro Reyes", role: "staff", status: "active" },
  { id: 4, username: "ana", password: "staff123", fullName: "Ana Garcia", role: "staff", status: "inactive" },
];

// ---------- SAMPLE VISITOR DATA ----------
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

const VISITORS = [
  { id: 1, firstName: "Roberto", lastName: "Mendoza", address: "Brgy. San Isidro, Legazpi City", contactNumber: "09171234567", purpose: "Inquiry", date: today, timeIn: "08:30", timeOut: "09:15", loggedBy: 2 },
  { id: 2, firstName: "Carmela", lastName: "Villanueva", address: "Brgy. Sagpon, Legazpi City", contactNumber: "09189876543", purpose: "Request", date: today, timeIn: "09:00", timeOut: "10:00", loggedBy: 2 },
  { id: 3, firstName: "Eduardo", lastName: "Bautista", address: "Brgy. Bonot, Legazpi City", contactNumber: "09201112233", purpose: "Complaint", date: today, timeIn: "10:15", timeOut: "", loggedBy: 3 },
  { id: 4, firstName: "Lorna", lastName: "Aquino", address: "Brgy. Rawis, Legazpi City", contactNumber: "09334455667", purpose: "Follow-up", date: today, timeIn: "11:00", timeOut: "11:30", loggedBy: 2 },
  { id: 5, firstName: "Alfredo", lastName: "Ramos", address: "Brgy. Taysan, Legazpi City", contactNumber: "09221234567", purpose: "Courtesy Call", date: yesterday, timeIn: "08:00", timeOut: "08:45", loggedBy: 3 },
  { id: 6, firstName: "Gloria", lastName: "Santos", address: "Brgy. Centro, Legazpi City", contactNumber: "09157654321", purpose: "Inquiry", date: yesterday, timeIn: "09:30", timeOut: "10:00", loggedBy: 2 },
  { id: 7, firstName: "Ricardo", lastName: "Torres", address: "Brgy. Penaranda, Legazpi City", contactNumber: "09281239876", purpose: "Request", date: twoDaysAgo, timeIn: "14:00", timeOut: "14:45", loggedBy: 3 },
  { id: 8, firstName: "Teresa", lastName: "Flores", address: "Brgy. Bitano, Legazpi City", contactNumber: "09461234568", purpose: "Other", date: twoDaysAgo, timeIn: "15:00", timeOut: "15:30", loggedBy: 2 },
];

// ---------- DATA STORE (simulates a database in memory + sessionStorage) ----------
const DataStore = {
  _users: [...USERS],
  _visitors: [...VISITORS],
  _nextUserId: USERS.length + 1,
  _nextVisitorId: VISITORS.length + 1,

  init() {
    const savedUsers = sessionStorage.getItem("elogbook_users");
    const savedVisitors = sessionStorage.getItem("elogbook_visitors");
    if (savedUsers) this._users = JSON.parse(savedUsers);
    if (savedVisitors) this._visitors = JSON.parse(savedVisitors);
    this._nextUserId = Math.max(...this._users.map(u => u.id)) + 1;
    this._nextVisitorId = this._visitors.length ? Math.max(...this._visitors.map(v => v.id)) + 1 : 1;
  },

  _save() {
    sessionStorage.setItem("elogbook_users", JSON.stringify(this._users));
    sessionStorage.setItem("elogbook_visitors", JSON.stringify(this._visitors));
  },

  // ---- Users ----
  getUsers() { return [...this._users]; },
  getUserById(id) { return this._users.find(u => u.id === id); },
  addUser(user) {
    user.id = this._nextUserId++;
    this._users.push(user);
    this._save();
    return user;
  },
  updateUser(id, data) {
    const idx = this._users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this._users[idx] = { ...this._users[idx], ...data };
    this._save();
    return this._users[idx];
  },
  deleteUser(id) {
    this._users = this._users.filter(u => u.id !== id);
    this._save();
  },

  // ---- Visitors ----
  getVisitors() { return [...this._visitors]; },
  getVisitorById(id) { return this._visitors.find(v => v.id === id); },
  addVisitor(visitor) {
    visitor.id = this._nextVisitorId++;
    this._visitors.push(visitor);
    this._save();
    return visitor;
  },
  updateVisitor(id, data) {
    const idx = this._visitors.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this._visitors[idx] = { ...this._visitors[idx], ...data };
    this._save();
    return this._visitors[idx];
  },
  deleteVisitor(id) {
    this._visitors = this._visitors.filter(v => v.id !== id);
    this._save();
  },

  // ---- Queries ----
  getVisitorsToday() {
    const t = new Date().toISOString().split("T")[0];
    return this._visitors.filter(v => v.date === t);
  },
  getVisitorsByDate(date) {
    return this._visitors.filter(v => v.date === date);
  },
  getVisitorsByDateRange(from, to) {
    return this._visitors.filter(v => v.date >= from && v.date <= to);
  },
  getVisitorsByStaff(staffId) {
    return this._visitors.filter(v => v.loggedBy === staffId);
  },
  getVisitorsTodayByStaff(staffId) {
    const t = new Date().toISOString().split("T")[0];
    return this._visitors.filter(v => v.date === t && v.loggedBy === staffId);
  },
  getStaffUsers() {
    return this._users.filter(u => u.role === "staff");
  },
  getTotalVisitorsThisMonth() {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return this._visitors.filter(v => {
      const d = new Date(v.date);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }
};

// ---------- AUTH ----------
const Auth = {
  login(username, password) {
    const user = DataStore.getUsers().find(
      u => u.username === username && u.password === password
    );
    if (!user) return { success: false, error: "Invalid username or password." };
    if (user.status === "inactive") return { success: false, error: "Account is inactive. Contact the administrator." };
    sessionStorage.setItem("elogbook_session", JSON.stringify(user));
    return { success: true, user };
  },
  logout() {
    sessionStorage.removeItem("elogbook_session");
  },
  getCurrentUser() {
    const s = sessionStorage.getItem("elogbook_session");
    return s ? JSON.parse(s) : null;
  },
  isLoggedIn() {
    return !!this.getCurrentUser();
  },
  requireAuth(role) {
    const user = this.getCurrentUser();
    if (!user) { window.location.href = "/login.html"; return null; }
    if (role && user.role !== role) { window.location.href = "/login.html"; return null; }
    return user;
  }
};

// ---------- HELPERS ----------
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "---";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function getPurposeBadgeClass(purpose) {
  const map = {
    "Inquiry": "badge-inquiry",
    "Complaint": "badge-complaint",
    "Request": "badge-request",
    "Follow-up": "badge-follow-up",
    "Courtesy Call": "badge-courtesy-call",
    "Other": "badge-other",
  };
  return map[purpose] || "badge-other";
}

function showToast(message, type) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const iconSvg = type === "success"
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b9f6f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  const toast = document.createElement("div");
  toast.className = `toast-custom ${type}`;
  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// SVG icon helpers
const Icons = {
  building: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  userPlus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  printer: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  logout: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  alertTriangle: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  clipboard: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
  barChart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
};

// Initialize data store on page load
DataStore.init();
