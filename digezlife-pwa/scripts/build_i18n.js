const fs = require('fs');
const path = require('path');

function writeJSON(relPath, obj) {
  const fullPath = path.join(__dirname, '..', 'src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2), 'utf8');
  console.log('Written JSON:', relPath);
}

function writeJS(relPath, content) {
  const fullPath = path.join(__dirname, '..', 'src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written JS:', relPath);
}

// 1. Locales Registry
writeJS('i18n/locales.js', `
export const LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', fontClass: 'font-latin' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', fontClass: 'font-nastaliq' },
  { code: 'ur-roman', name: 'Roman Urdu', nativeName: 'Roman Urdu', dir: 'ltr', fontClass: 'font-latin' },
  { code: 'pa', name: 'Punjabi', nativeName: 'پنجابی', dir: 'rtl', fontClass: 'font-nastaliq' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', dir: 'rtl', fontClass: 'font-arabic' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', fontClass: 'font-arabic' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', fontClass: 'font-latin' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', dir: 'ltr', fontClass: 'font-devanagari' },
];
`);

// 2. English Dictionary (base)
const en = {
  app: {
    title: "DigEzLife",
    tagline: "Everyday Household OS",
    slogan: "Everyday life, organized in one place."
  },
  nav: {
    home: "Home",
    grocery: "Grocery",
    add: "Add",
    hisab: "Hisab",
    alerts: "Alerts",
    settings: "Settings",
    profile: "Profile",
    search: "Search"
  },
  greetings: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    welcome_back: "Welcome back",
    all_caught_up: "You're all caught up",
    whats_happening: "Here's what needs attention today."
  },
  home: {
    active_household: "Active Household",
    quick_actions: "Quick Actions",
    add_expense: "Expense",
    add_grocery: "Grocery",
    add_alert: "Alert",
    invite_family: "Invite Family",
    shared_grocery: "Shared Grocery List",
    view_all: "View All",
    recent_activity: "Recent Household Activity",
    pending_items: "{count} Pending",
    due_alerts: "{count} Due"
  },
  grocery: {
    title: "Grocery Lists",
    quick_add_placeholder: "Add item (e.g. Milk 2L, Eggs 1 Dozen)...",
    add_btn: "+ Add",
    share_whatsapp: "Share List via WhatsApp",
    add_detailed: "Add Detailed Item",
    no_items: "No items in this category.",
    item_name: "Item Name",
    quantity: "Quantity",
    unit: "Unit",
    category: "Category",
    categories: {
      all: "All",
      dairy: "Dairy",
      bakery: "Bakery",
      pantry: "Pantry",
      produce: "Produce",
      household: "Household",
      meat: "Meat",
      beverages: "Beverages",
      other: "Other"
    }
  },
  hisab: {
    title: "Personal Hisab",
    this_month: "This Month",
    income: "Total Income",
    expense: "Total Spending",
    remaining: "Net Remaining",
    surplus: "Surplus",
    deficit: "Deficit",
    monthly_flow: "Monthly Flow",
    record_entry: "+ Record Entry",
    record_expense: "+ Add Expense",
    record_income: "+ Add Income",
    transactions: "Transactions",
    udhaar: "Udhaar & Khata",
    money_i_owe: "Money I Owe (Payable)",
    money_owed_to_me: "Money Owed to Me (Receivable)",
    whatsapp_reminder: "WhatsApp Reminder",
    settle_paid: "Settle / Paid",
    no_transactions: "No transactions recorded this month.",
    no_debts: "No active debts or receivables."
  },
  alerts: {
    title: "Reminders & Alerts",
    active_alerts: "Active Alerts",
    set_alert: "+ Set Alert",
    due_today: "Due Today",
    upcoming: "Upcoming",
    completed: "Past / Completed",
    no_alerts: "No active reminders or alerts.",
    task_title: "Title / Task Name",
    due_date: "Due Date",
    repeat: "Repeat",
    categories: {
      bill: "Bill / Utility",
      health: "Health & Medicine",
      renewal: "Renewal (Token / License)",
      maintenance: "Maintenance & Service",
      occasion: "Birthday / Occasion",
      general: "General"
    }
  },
  universal_create: {
    title: "What would you like to record?",
    subtitle: "Choose an action below for quick entry.",
    expense_title: "Add Expense",
    expense_sub: "Log a household purchase or bill payment",
    income_title: "Add Income",
    income_sub: "Record salary, freelance, or household receipt",
    grocery_title: "Add Grocery Item",
    grocery_sub: "Add items to your shared household list",
    reminder_title: "Set Reminder Alert",
    reminder_sub: "Schedule bill due date, medicine, or renewal"
  },
  settings: {
    title: "Settings & Household",
    owner_badge: "HOUSEHOLD OWNER",
    appearance: "Appearance",
    theme_mode: "Theme Mode",
    language: "Language / زبان",
    select_language: "Select Language",
    invite_member: "Invite Family Member",
    invite_sub: "Share grocery & hisab access",
    export_backup: "Export Household Backup",
    export_sub: "Download offline JSON data file",
    subscription: "Subscription Plan",
    sign_out: "Sign Out"
  },
  auth: {
    signin_title: "Sign in to DigEzLife",
    signup_title: "Join DigEzLife",
    email_label: "Email Address",
    password_label: "Password",
    fullname_label: "Full Name",
    confirm_password_label: "Confirm Password",
    signin_btn: "Sign In",
    signup_btn: "Create Household Account",
    demo_btn: "1-Click Demo Sign In",
    dont_have_account: "Don't have an account?",
    already_have_account: "Already have an account?"
  }
};

writeJSON('i18n/locales/en.json', en);

// 3. Urdu (Nastaliq)
const ur = {
  app: {
    title: "ڈیجی ایز لائف",
    tagline: "گھریلو ڈیجیٹل سسٹم",
    slogan: "روزمرہ کی زندگی، ایک آسان جگہ پر۔"
  },
  nav: {
    home: "ہوم",
    grocery: "سودا سلف",
    add: "نیا اندراج",
    hisab: "حساب کتاب",
    alerts: "یاد دہانیاں",
    settings: "ترتیبات",
    profile: "پروفائل",
    search: "تلاش"
  },
  greetings: {
    morning: "صبح بخیر",
    afternoon: "دوپہر بخیر",
    evening: "شام بخیر",
    welcome_back: "خوش آمدید",
    all_caught_up: "سب کام مکمل ہیں",
    whats_happening: "آج کے اہم کام اور تفصیلات:"
  },
  home: {
    active_household: "فعال گھرانہ",
    quick_actions: "فوری اقدامات",
    add_expense: "خرچ",
    add_grocery: "سودا سلف",
    add_alert: "یاد دہانی",
    invite_family: "اہل خانہ کو شامل کریں",
    shared_grocery: "مشترکہ سودا سلف لسٹ",
    view_all: "تمام دیکھیں",
    recent_activity: "گھر کی حالیہ سرگرمیاں",
    pending_items: "{count} اشیاء باقی",
    due_alerts: "{count} واجب الادا"
  },
  grocery: {
    title: "سودا سلف لسٹیں",
    quick_add_placeholder: "سودا لکھیں (مثلاً دودھ 2 لیٹر، انڈے 1 درجن)...",
    add_btn: "+ شامل کریں",
    share_whatsapp: "واٹس ایپ پر لسٹ شیئر کریں",
    add_detailed: "تفصیلی آئٹم درج کریں",
    no_items: "اس کیٹیگری میں کوئی آئٹم نہیں ہے۔",
    item_name: "چیز کا نام",
    quantity: "مقدار",
    unit: "پیمائش",
    category: "کیٹیگری",
    categories: {
      all: "تمام",
      dairy: "ڈیری اور دودھ",
      bakery: "بیکری",
      pantry: "راشن و گروسری",
      produce: "سبزی و پھل",
      household: "گھریلو سامان",
      meat: "گوشت و چکن",
      beverages: "مشروبات",
      other: "دیگر"
    }
  },
  hisab: {
    title: "ذاتی حساب کتاب",
    this_month: "موجودہ مہینہ",
    income: "کل آمدن",
    expense: "کل اخراجات",
    remaining: "بچت / بقایا",
    surplus: "بچت",
    deficit: "خسارہ",
    monthly_flow: "ماہانہ تفصیل",
    record_entry: "+ نیا اندراج",
    record_expense: "+ خرچہ درج کریں",
    record_income: "+ آمدن درج کریں",
    transactions: "لین دین",
    udhaar: "ادھار و کھاتہ",
    money_i_owe: "جو پیسے میں نے دینے ہیں",
    money_owed_to_me: "جو پیسے مجھے ملنے ہیں",
    whatsapp_reminder: "واٹس ایپ یاد دہانی بھیجیں",
    settle_paid: "حساب بے باق کریں",
    no_transactions: "اس ماہ کوئی خرچ یا آمدن درج نہیں ہوئی۔",
    no_debts: "کوئی ادھار یا کھاتہ باقی نہیں ہے۔"
  },
  alerts: {
    title: "یاد دہانیاں اور بلز",
    active_alerts: "فعال یاد دہانیاں",
    set_alert: "+ یاد دہانی لگائیں",
    due_today: "آج واجب الادا",
    upcoming: "آئندہ",
    completed: "مکمل شدہ",
    no_alerts: "کوئی فعال یاد دہانی نہیں ہے۔",
    task_title: "عنوان / کام کا نام",
    due_date: "آخری تاریخ",
    repeat: "تکرار",
    categories: {
      bill: "بل و یوٹیلیٹی",
      health: "صحت و ادویات",
      renewal: "تجدید (ٹوکن / لائسنس)",
      maintenance: "مرمت و سروس",
      occasion: "سالگرہ / تقریب",
      general: "عام"
    }
  },
  universal_create: {
    title: "آپ کیا درج کرنا چاہتے ہیں؟",
    subtitle: "فوری اندراج کے لیے نیچے دیے گئے آپشنز میں سے منتخب کریں۔",
    expense_title: "خرچہ درج کریں",
    expense_sub: "گھریلو خریداری یا بل کی ادائیگی لکھیں",
    income_title: "آمدن درج کریں",
    income_sub: "تنخواہ یا رقم کی وصولی لکھیں",
    grocery_title: "سودا سلف درج کریں",
    grocery_sub: "مشترکہ لسٹ میں نئی چیزیں شامل کریں",
    reminder_title: "یاد دہانی لگائیں",
    reminder_sub: "بل کی آخری تاریخ یا دوا کا وقت مقرر کریں"
  },
  settings: {
    title: "ترتیبات اور گھرانہ",
    owner_badge: "گھر کا سربراہ",
    appearance: "ظاہری شکل",
    theme_mode: "تھیم کا موڈ",
    language: "زبان / Language",
    select_language: "زبان منتخب کریں",
    invite_member: "اہل خانہ کو مدعو کریں",
    invite_sub: "سودا سلف اور حساب میں شامل کریں",
    export_backup: "ڈیٹا بیک اپ ڈاؤن لوڈ کریں",
    export_sub: "آف لائن JSON فائل محفوظ کریں",
    subscription: "سبسکرپشن پلان",
    sign_out: "لاگ آؤٹ کریں"
  },
  auth: {
    signin_title: "ڈیجی ایز لائف میں سائن ان کریں",
    signup_title: "ڈیجی ایز لائف میں شامل ہوں",
    email_label: "ای میل ایڈریس",
    password_label: "پاس ورڈ",
    fullname_label: "پورا نام",
    confirm_password_label: "پاس ورڈ کی تصدیق",
    signin_btn: "سائن ان کریں",
    signup_btn: "نیا گھرانہ بنائیں",
    demo_btn: "ایک کلک ڈیمو سائن ان",
    dont_have_account: "کیا آپ کا اکاؤنٹ نہیں ہے؟",
    already_have_account: "پہلے سے اکاؤنٹ موجود ہے؟"
  }
};

writeJSON('i18n/locales/ur.json', ur);

// 4. Roman Urdu
const urRoman = {
  app: {
    title: "DigEzLife",
    tagline: "Gharelu Digital System",
    slogan: "Rozmarrah ki zindagi, aik aasan jagah par."
  },
  nav: {
    home: "Home",
    grocery: "Sauda Salf",
    add: "Add",
    hisab: "Hisab",
    alerts: "Alerts",
    settings: "Settings",
    profile: "Profile",
    search: "Search"
  },
  greetings: {
    morning: "Subah Bakhair",
    afternoon: "Dopehar Bakhair",
    evening: "Shaam Bakhair",
    welcome_back: "Khush Amdeed",
    all_caught_up: "Sab kaam mukammal hain",
    whats_happening: "Aaj ke zaroori kaam aur hisab:"
  },
  home: {
    active_household: "Active Gharana",
    quick_actions: "Quick Actions",
    add_expense: "Kharcha",
    add_grocery: "Sauda",
    add_alert: "Reminder",
    invite_family: "Family ko Invite karein",
    shared_grocery: "Ghar ki Sauda List",
    view_all: "Sab Dekhein",
    recent_activity: "Ghar ki Haal Ki Activity",
    pending_items: "{count} Items Baqi",
    due_alerts: "{count} Alerts"
  },
  grocery: {
    title: "Sauda Salf Lists",
    quick_add_placeholder: "Sauda likhein (e.g. Doodh 2L, Anday 1 Dozen)...",
    add_btn: "+ Add",
    share_whatsapp: "WhatsApp par List Bheinjein",
    add_detailed: "Detail se Add Karein",
    no_items: "Is category mein koi item nahi.",
    item_name: "Item ka Naam",
    quantity: "Miqdaar",
    unit: "Unit",
    category: "Category",
    categories: {
      all: "Sab",
      dairy: "Dairy / Doodh",
      bakery: "Bakery",
      pantry: "Ration / Pantry",
      produce: "Sabzi & Phal",
      household: "Ghar ka Samaan",
      meat: "Gosht / Chicken",
      beverages: "Drinks",
      other: "Deegar"
    }
  },
  hisab: {
    title: "Aapka Hisab Kitab",
    this_month: "Is Mahine ka Hisab",
    income: "Kul Aamdan",
    expense: "Kul Kharcha",
    remaining: "Baqaya / Bachat",
    surplus: "Bachat",
    deficit: "Khasara",
    monthly_flow: "Mahana Flow",
    record_entry: "+ Entry Dalein",
    record_expense: "+ Kharcha Likhein",
    record_income: "+ Aamdan Likhein",
    transactions: "Transactions",
    udhaar: "Udhaar & Khata",
    money_i_owe: "Jo Paise Mene Dene Hain",
    money_owed_to_me: "Jo Paise Mujhe Milne Hain",
    whatsapp_reminder: "WhatsApp Reminder Bheinjein",
    settle_paid: "Hisaab Be-baaq Karein",
    no_transactions: "Is mahine koi entry nahi.",
    no_debts: "Koi udhaar baqi nahi."
  },
  alerts: {
    title: "Reminders & Alerts",
    active_alerts: "Active Alerts",
    set_alert: "+ Alert Lagayein",
    due_today: "Aaj ki Tareekh",
    upcoming: "Aane Walay",
    completed: "Mukammal",
    no_alerts: "Koi alert nahi.",
    task_title: "Task ka Naam",
    due_date: "Akhri Tareekh",
    repeat: "Repeat",
    categories: {
      bill: "Bills & Utilities",
      health: "Sehat & Dawai",
      renewal: "Renewal (Token / License)",
      maintenance: "Ghar ki Maintenance",
      occasion: "Birthday / Function",
      general: "General"
    }
  },
  universal_create: {
    title: "Aap kya record karna chahte hain?",
    subtitle: "Neeche diye gaye options mein se select karein:",
    expense_title: "Kharcha Likhein",
    expense_sub: "Gharelu khareedari ya bill payment",
    income_title: "Aamdan Dalein",
    income_sub: "Tankhwah ya raqam ki wasooli",
    grocery_title: "Sauda Dalein",
    grocery_sub: "Ghar ki shared grocery list mein item dalein",
    reminder_title: "Reminder Lagayein",
    reminder_sub: "Bill ki tareekh ya dawai ka alert"
  },
  settings: {
    title: "Settings & Gharana",
    owner_badge: "GHAR KA SARBARAH",
    appearance: "Appearance",
    theme_mode: "Theme Mode",
    language: "Zaban / Language",
    select_language: "Zaban Select Karein",
    invite_member: "Ghar walon ko Invite karein",
    invite_sub: "Grocery aur hisab access share karein",
    export_backup: "Backup Download Karein",
    export_sub: "Offline JSON file mehfooz karein",
    subscription: "Subscription Plan",
    sign_out: "Sign Out"
  },
  auth: {
    signin_title: "DigEzLife mein Sign In karein",
    signup_title: "DigEzLife Join karein",
    email_label: "Email Address",
    password_label: "Password",
    fullname_label: "Pura Naam",
    confirm_password_label: "Confirm Password",
    signin_btn: "Sign In",
    signup_btn: "Naya Gharana Banayein",
    demo_btn: "1-Click Demo Sign In",
    dont_have_account: "Account nahi hai?",
    already_have_account: "Pehle se account hai?"
  }
};

writeJSON('i18n/locales/ur-roman.json', urRoman);

// 5. Punjabi (pa) starter
writeJSON('i18n/locales/pa.json', { ...ur, app: { title: "ڈیجی ایز لائف", tagline: "گھریلو نظام", slogan: "روز دی زندگی، اکو تھاں تے۔" } });

// 6. Pashto (ps) starter
writeJSON('i18n/locales/ps.json', { ...ur, app: { title: "ډیجی ایز لایف", tagline: "د کور نظام", slogan: "د هرې ورځې ژوند، په یوه اسانه ځای کې." } });

// 7. Arabic (ar) starter
writeJSON('i18n/locales/ar.json', { ...en, app: { title: "ديج إيز لايف", tagline: "نظام إدارة المنزل", slogan: "حياتك اليومية منظمة في مكان واحد." } });

// 8. French (fr) starter
writeJSON('i18n/locales/fr.json', { ...en, app: { title: "DigEzLife", tagline: "Système Digital Familial", slogan: "La vie quotidienne, organisée en un seul endroit." } });

// 9. Nepali (ne) starter
writeJSON('i18n/locales/ne.json', { ...en, app: { title: "DigEzLife", tagline: "दैनिक घरेलु प्रणाली", slogan: "दैनिक जीवन, एकै ठाउँमा व्यवस्थित।" } });

// 10. src/i18n/index.js Engine
writeJS('i18n/index.js', `
import { LOCALES } from './locales.js';
import { readLocal, writeLocal } from '../services/storage.js';

import en from './locales/en.json';
import ur from './locales/ur.json';
import urRoman from './locales/ur-roman.json';
import pa from './locales/pa.json';
import ps from './locales/ps.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import ne from './locales/ne.json';

const dictionaries = {
  en,
  ur,
  'ur-roman': urRoman,
  pa,
  ps,
  ar,
  fr,
  ne,
};

let currentLocale = readLocal('digezlife_locale', 'en');

export function getLocale() {
  return currentLocale;
}

export function getLocaleMeta(code = currentLocale) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}

export function setLocale(code) {
  if (!dictionaries[code]) {
    code = 'en';
  }
  currentLocale = code;
  writeLocal('digezlife_locale', code);

  const meta = getLocaleMeta(code);
  const root = document.documentElement;

  // Apply RTL or LTR
  root.setAttribute('dir', meta.dir || 'ltr');
  root.setAttribute('lang', code);

  // Apply font class
  root.classList.remove('font-nastaliq', 'font-arabic', 'font-devanagari', 'font-latin');
  if (meta.fontClass) {
    root.classList.add(meta.fontClass);
  }

  // Dispatch event for UI reactivity
  document.dispatchEvent(new CustomEvent('locale:changed', { detail: { locale: code, meta } }));
}

/**
 * Translate key with fallback and parameter interpolation.
 * Usage: t('home.pending_items', { count: 3 })
 */
export function t(keyPath, params = {}) {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  let val = resolveKey(dict, keyPath);

  if (!val && currentLocale !== 'en') {
    val = resolveKey(dictionaries.en, keyPath);
  }

  if (!val) return keyPath;

  // Interpolation
  if (typeof val === 'string' && params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replace(new RegExp(\`\\\\{\\\\s*\${k}\\\\s*\\\\}\`, 'g'), v);
    });
  }

  return val;
}

function resolveKey(obj, pathStr) {
  if (!obj) return null;
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return null;
    }
  }
  return curr;
}

// Initialize on load
if (typeof document !== 'undefined') {
  setLocale(currentLocale);
}
`);

console.log('Step 1: Extensible Multilingual Framework Written Successfully');

