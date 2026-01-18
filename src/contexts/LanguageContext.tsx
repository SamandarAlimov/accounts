import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "en" | "uz" | "ru" | "tr" | "ar" | "ko" | "ja";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "common.continue": "Continue",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.remove": "Remove",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.next": "Next",
    "common.finish": "Finish",
    "common.verify": "Verify",
    "common.required": "Required",
    "common.optional": "Optional",
    
    // Auth
    "auth.signin": "Sign in",
    "auth.signup": "Sign up",
    "auth.signout": "Sign out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.createAccount": "Create account",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.dontHaveAccount": "Don't have an account?",
    
    // Account Types
    "account.personal": "Personal Account",
    "account.kids": "Kids Account",
    "account.business": "Business Account",
    "account.personalDesc": "For individual use with full access to all Alsamos services",
    "account.kidsDesc": "Parent-supervised account with safety controls",
    "account.businessDesc": "For organizations with team management features",
    
    // Dashboard
    "dashboard.home": "Home",
    "dashboard.personalInfo": "Personal Info",
    "dashboard.security": "Security",
    "dashboard.devices": "Devices",
    "dashboard.dataPrivacy": "Data & Privacy",
    "dashboard.peopleSharing": "People & Sharing",
    "dashboard.payments": "Payments",
    "dashboard.connectedApps": "Connected Apps",
    "dashboard.passwordManager": "Password Manager",
    "dashboard.developerAccess": "Developer Access",
    "dashboard.recoveryCenter": "Recovery Center",
    
    // Kids Account
    "kids.title": "Create Kids Account",
    "kids.subtitle": "Set up a safe, parent-supervised account",
    "kids.parentVerify": "Parent Verification",
    "kids.childInfo": "Child Information",
    "kids.safetySettings": "Safety Settings",
    "kids.deviceLink": "Device Linking",
    "kids.firstName": "Child's First Name",
    "kids.lastName": "Child's Last Name",
    "kids.age": "Child's Age",
    "kids.username": "Choose Username",
    "kids.screenTime": "Screen Time Limit",
    "kids.contentFilter": "Content Filter Level",
    "kids.appRestrictions": "App Restrictions",
    "kids.sleepMode": "Sleep Mode",
    "kids.parentApproval": "Require Parent Approval",
    
    // Business Account
    "business.title": "Create Business Account",
    "business.subtitle": "Set up your organization on Alsamos",
    "business.companyInfo": "Company Information",
    "business.adminSetup": "Admin Setup",
    "business.domainVerify": "Domain Verification",
    "business.teamSetup": "Team Setup",
    "business.companyName": "Company Name",
    "business.companyType": "Company Type",
    "business.companySize": "Company Size",
    "business.industry": "Industry",
    "business.country": "Country",
    "business.website": "Company Website",
    "business.adminEmail": "Admin Email",
    "business.adminName": "Admin Name",
    "business.domain": "Company Domain",
    "business.verifyDns": "Verify via DNS",
    "business.verifyFile": "Verify via File Upload",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  uz: {
    // Common
    "common.continue": "Davom etish",
    "common.back": "Orqaga",
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.add": "Qo'shish",
    "common.remove": "Olib tashlash",
    "common.search": "Qidirish",
    "common.loading": "Yuklanmoqda...",
    "common.error": "Xato",
    "common.success": "Muvaffaqiyat",
    "common.next": "Keyingi",
    "common.finish": "Tugatish",
    "common.verify": "Tasdiqlash",
    "common.required": "Majburiy",
    "common.optional": "Ixtiyoriy",
    
    // Auth
    "auth.signin": "Kirish",
    "auth.signup": "Ro'yxatdan o'tish",
    "auth.signout": "Chiqish",
    "auth.email": "Elektron pochta",
    "auth.password": "Parol",
    "auth.confirmPassword": "Parolni tasdiqlang",
    "auth.forgotPassword": "Parolni unutdingizmi?",
    "auth.createAccount": "Hisob yaratish",
    "auth.alreadyHaveAccount": "Hisobingiz bormi?",
    "auth.dontHaveAccount": "Hisobingiz yo'qmi?",
    
    // Account Types
    "account.personal": "Shaxsiy hisob",
    "account.kids": "Bolalar hisobi",
    "account.business": "Biznes hisob",
    "account.personalDesc": "Barcha Alsamos xizmatlariga to'liq kirish huquqi",
    "account.kidsDesc": "Ota-ona nazoratidagi xavfsiz hisob",
    "account.businessDesc": "Jamoa boshqaruvi bilan tashkilotlar uchun",
    
    // Dashboard
    "dashboard.home": "Bosh sahifa",
    "dashboard.personalInfo": "Shaxsiy ma'lumotlar",
    "dashboard.security": "Xavfsizlik",
    "dashboard.devices": "Qurilmalar",
    "dashboard.dataPrivacy": "Ma'lumotlar va maxfiylik",
    "dashboard.peopleSharing": "Odamlar va ulashish",
    "dashboard.payments": "To'lovlar",
    "dashboard.connectedApps": "Ulangan ilovalar",
    "dashboard.passwordManager": "Parol menejeri",
    "dashboard.developerAccess": "Dasturchi kirishi",
    "dashboard.recoveryCenter": "Tiklash markazi",
    
    // Kids Account
    "kids.title": "Bolalar hisobi yaratish",
    "kids.subtitle": "Xavfsiz, ota-ona nazoratidagi hisob",
    "kids.parentVerify": "Ota-ona tasdiqlashi",
    "kids.childInfo": "Bola ma'lumotlari",
    "kids.safetySettings": "Xavfsizlik sozlamalari",
    "kids.deviceLink": "Qurilma ulash",
    "kids.firstName": "Bolaning ismi",
    "kids.lastName": "Bolaning familiyasi",
    "kids.age": "Bolaning yoshi",
    "kids.username": "Foydalanuvchi nomini tanlang",
    "kids.screenTime": "Ekran vaqti chegarasi",
    "kids.contentFilter": "Kontent filtri darajasi",
    "kids.appRestrictions": "Ilova cheklovlari",
    "kids.sleepMode": "Uyqu rejimi",
    "kids.parentApproval": "Ota-ona roziligi talab qilinadi",
    
    // Business Account
    "business.title": "Biznes hisob yaratish",
    "business.subtitle": "Tashkilotingizni Alsamos'da sozlang",
    "business.companyInfo": "Kompaniya ma'lumotlari",
    "business.adminSetup": "Administrator sozlash",
    "business.domainVerify": "Domen tasdiqlash",
    "business.teamSetup": "Jamoa sozlash",
    "business.companyName": "Kompaniya nomi",
    "business.companyType": "Kompaniya turi",
    "business.companySize": "Kompaniya hajmi",
    "business.industry": "Sanoat",
    "business.country": "Mamlakat",
    "business.website": "Kompaniya veb-sayti",
    "business.adminEmail": "Administrator email",
    "business.adminName": "Administrator ismi",
    "business.domain": "Kompaniya domeni",
    "business.verifyDns": "DNS orqali tasdiqlash",
    "business.verifyFile": "Fayl yuklash orqali tasdiqlash",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  ru: {
    // Common
    "common.continue": "Продолжить",
    "common.back": "Назад",
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.add": "Добавить",
    "common.remove": "Убрать",
    "common.search": "Поиск",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успех",
    "common.next": "Далее",
    "common.finish": "Завершить",
    "common.verify": "Подтвердить",
    "common.required": "Обязательно",
    "common.optional": "Необязательно",
    
    // Auth
    "auth.signin": "Войти",
    "auth.signup": "Регистрация",
    "auth.signout": "Выйти",
    "auth.email": "Эл. почта",
    "auth.password": "Пароль",
    "auth.confirmPassword": "Подтвердите пароль",
    "auth.forgotPassword": "Забыли пароль?",
    "auth.createAccount": "Создать аккаунт",
    "auth.alreadyHaveAccount": "Уже есть аккаунт?",
    "auth.dontHaveAccount": "Нет аккаунта?",
    
    // Account Types
    "account.personal": "Личный аккаунт",
    "account.kids": "Детский аккаунт",
    "account.business": "Бизнес аккаунт",
    "account.personalDesc": "Полный доступ ко всем сервисам Alsamos",
    "account.kidsDesc": "Безопасный аккаунт под контролем родителей",
    "account.businessDesc": "Для организаций с управлением командой",
    
    // Dashboard
    "dashboard.home": "Главная",
    "dashboard.personalInfo": "Личные данные",
    "dashboard.security": "Безопасность",
    "dashboard.devices": "Устройства",
    "dashboard.dataPrivacy": "Данные и конфиденциальность",
    "dashboard.peopleSharing": "Люди и доступ",
    "dashboard.payments": "Платежи",
    "dashboard.connectedApps": "Подключенные приложения",
    "dashboard.passwordManager": "Менеджер паролей",
    "dashboard.developerAccess": "Доступ разработчика",
    "dashboard.recoveryCenter": "Центр восстановления",
    
    // Kids Account
    "kids.title": "Создать детский аккаунт",
    "kids.subtitle": "Безопасный аккаунт под контролем родителей",
    "kids.parentVerify": "Подтверждение родителя",
    "kids.childInfo": "Информация о ребенке",
    "kids.safetySettings": "Настройки безопасности",
    "kids.deviceLink": "Привязка устройства",
    "kids.firstName": "Имя ребенка",
    "kids.lastName": "Фамилия ребенка",
    "kids.age": "Возраст ребенка",
    "kids.username": "Выберите имя пользователя",
    "kids.screenTime": "Лимит экранного времени",
    "kids.contentFilter": "Уровень фильтра контента",
    "kids.appRestrictions": "Ограничения приложений",
    "kids.sleepMode": "Режим сна",
    "kids.parentApproval": "Требуется одобрение родителя",
    
    // Business Account
    "business.title": "Создать бизнес аккаунт",
    "business.subtitle": "Настройте вашу организацию в Alsamos",
    "business.companyInfo": "Информация о компании",
    "business.adminSetup": "Настройка администратора",
    "business.domainVerify": "Подтверждение домена",
    "business.teamSetup": "Настройка команды",
    "business.companyName": "Название компании",
    "business.companyType": "Тип компании",
    "business.companySize": "Размер компании",
    "business.industry": "Отрасль",
    "business.country": "Страна",
    "business.website": "Сайт компании",
    "business.adminEmail": "Email администратора",
    "business.adminName": "Имя администратора",
    "business.domain": "Домен компании",
    "business.verifyDns": "Подтвердить через DNS",
    "business.verifyFile": "Подтвердить через файл",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  tr: {
    // Common
    "common.continue": "Devam",
    "common.back": "Geri",
    "common.save": "Kaydet",
    "common.cancel": "İptal",
    "common.delete": "Sil",
    "common.edit": "Düzenle",
    "common.add": "Ekle",
    "common.remove": "Kaldır",
    "common.search": "Ara",
    "common.loading": "Yükleniyor...",
    "common.error": "Hata",
    "common.success": "Başarılı",
    "common.next": "Sonraki",
    "common.finish": "Bitir",
    "common.verify": "Doğrula",
    "common.required": "Zorunlu",
    "common.optional": "İsteğe bağlı",
    
    // Auth
    "auth.signin": "Giriş yap",
    "auth.signup": "Kayıt ol",
    "auth.signout": "Çıkış yap",
    "auth.email": "E-posta",
    "auth.password": "Şifre",
    "auth.confirmPassword": "Şifreyi onayla",
    "auth.forgotPassword": "Şifremi unuttum",
    "auth.createAccount": "Hesap oluştur",
    "auth.alreadyHaveAccount": "Zaten hesabınız var mı?",
    "auth.dontHaveAccount": "Hesabınız yok mu?",
    
    // Account Types
    "account.personal": "Kişisel Hesap",
    "account.kids": "Çocuk Hesabı",
    "account.business": "İşletme Hesabı",
    "account.personalDesc": "Tüm Alsamos hizmetlerine tam erişim",
    "account.kidsDesc": "Ebeveyn denetimli güvenli hesap",
    "account.businessDesc": "Ekip yönetimi özellikleriyle kuruluşlar için",
    
    // Dashboard
    "dashboard.home": "Ana Sayfa",
    "dashboard.personalInfo": "Kişisel Bilgiler",
    "dashboard.security": "Güvenlik",
    "dashboard.devices": "Cihazlar",
    "dashboard.dataPrivacy": "Veri ve Gizlilik",
    "dashboard.peopleSharing": "Kişiler ve Paylaşım",
    "dashboard.payments": "Ödemeler",
    "dashboard.connectedApps": "Bağlı Uygulamalar",
    "dashboard.passwordManager": "Şifre Yöneticisi",
    "dashboard.developerAccess": "Geliştirici Erişimi",
    "dashboard.recoveryCenter": "Kurtarma Merkezi",
    
    // Kids Account
    "kids.title": "Çocuk Hesabı Oluştur",
    "kids.subtitle": "Güvenli, ebeveyn denetimli hesap",
    "kids.parentVerify": "Ebeveyn Doğrulaması",
    "kids.childInfo": "Çocuk Bilgileri",
    "kids.safetySettings": "Güvenlik Ayarları",
    "kids.deviceLink": "Cihaz Bağlama",
    "kids.firstName": "Çocuğun Adı",
    "kids.lastName": "Çocuğun Soyadı",
    "kids.age": "Çocuğun Yaşı",
    "kids.username": "Kullanıcı Adı Seç",
    "kids.screenTime": "Ekran Süresi Limiti",
    "kids.contentFilter": "İçerik Filtre Seviyesi",
    "kids.appRestrictions": "Uygulama Kısıtlamaları",
    "kids.sleepMode": "Uyku Modu",
    "kids.parentApproval": "Ebeveyn Onayı Gerekli",
    
    // Business Account
    "business.title": "İşletme Hesabı Oluştur",
    "business.subtitle": "Kuruluşunuzu Alsamos'ta kurun",
    "business.companyInfo": "Şirket Bilgileri",
    "business.adminSetup": "Yönetici Kurulumu",
    "business.domainVerify": "Alan Adı Doğrulama",
    "business.teamSetup": "Ekip Kurulumu",
    "business.companyName": "Şirket Adı",
    "business.companyType": "Şirket Türü",
    "business.companySize": "Şirket Büyüklüğü",
    "business.industry": "Sektör",
    "business.country": "Ülke",
    "business.website": "Şirket Web Sitesi",
    "business.adminEmail": "Yönetici E-postası",
    "business.adminName": "Yönetici Adı",
    "business.domain": "Şirket Alan Adı",
    "business.verifyDns": "DNS ile Doğrula",
    "business.verifyFile": "Dosya ile Doğrula",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  ar: {
    // Common
    "common.continue": "متابعة",
    "common.back": "رجوع",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.remove": "إزالة",
    "common.search": "بحث",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجاح",
    "common.next": "التالي",
    "common.finish": "إنهاء",
    "common.verify": "تحقق",
    "common.required": "مطلوب",
    "common.optional": "اختياري",
    
    // Auth
    "auth.signin": "تسجيل الدخول",
    "auth.signup": "إنشاء حساب",
    "auth.signout": "تسجيل الخروج",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.createAccount": "إنشاء حساب",
    "auth.alreadyHaveAccount": "لديك حساب بالفعل؟",
    "auth.dontHaveAccount": "ليس لديك حساب؟",
    
    // Account Types
    "account.personal": "حساب شخصي",
    "account.kids": "حساب الأطفال",
    "account.business": "حساب الأعمال",
    "account.personalDesc": "وصول كامل لجميع خدمات Alsamos",
    "account.kidsDesc": "حساب آمن تحت إشراف الوالدين",
    "account.businessDesc": "للمؤسسات مع ميزات إدارة الفريق",
    
    // Dashboard
    "dashboard.home": "الرئيسية",
    "dashboard.personalInfo": "المعلومات الشخصية",
    "dashboard.security": "الأمان",
    "dashboard.devices": "الأجهزة",
    "dashboard.dataPrivacy": "البيانات والخصوصية",
    "dashboard.peopleSharing": "الأشخاص والمشاركة",
    "dashboard.payments": "المدفوعات",
    "dashboard.connectedApps": "التطبيقات المتصلة",
    "dashboard.passwordManager": "مدير كلمات المرور",
    "dashboard.developerAccess": "وصول المطور",
    "dashboard.recoveryCenter": "مركز الاسترداد",
    
    // Kids Account
    "kids.title": "إنشاء حساب للأطفال",
    "kids.subtitle": "حساب آمن تحت إشراف الوالدين",
    "kids.parentVerify": "التحقق من الوالدين",
    "kids.childInfo": "معلومات الطفل",
    "kids.safetySettings": "إعدادات السلامة",
    "kids.deviceLink": "ربط الجهاز",
    "kids.firstName": "اسم الطفل الأول",
    "kids.lastName": "اسم عائلة الطفل",
    "kids.age": "عمر الطفل",
    "kids.username": "اختر اسم المستخدم",
    "kids.screenTime": "حد وقت الشاشة",
    "kids.contentFilter": "مستوى فلتر المحتوى",
    "kids.appRestrictions": "قيود التطبيقات",
    "kids.sleepMode": "وضع النوم",
    "kids.parentApproval": "يتطلب موافقة الوالدين",
    
    // Business Account
    "business.title": "إنشاء حساب أعمال",
    "business.subtitle": "قم بإعداد مؤسستك على Alsamos",
    "business.companyInfo": "معلومات الشركة",
    "business.adminSetup": "إعداد المسؤول",
    "business.domainVerify": "التحقق من النطاق",
    "business.teamSetup": "إعداد الفريق",
    "business.companyName": "اسم الشركة",
    "business.companyType": "نوع الشركة",
    "business.companySize": "حجم الشركة",
    "business.industry": "الصناعة",
    "business.country": "البلد",
    "business.website": "موقع الشركة",
    "business.adminEmail": "بريد المسؤول",
    "business.adminName": "اسم المسؤول",
    "business.domain": "نطاق الشركة",
    "business.verifyDns": "التحقق عبر DNS",
    "business.verifyFile": "التحقق عبر ملف",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  ko: {
    // Common
    "common.continue": "계속",
    "common.back": "뒤로",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.delete": "삭제",
    "common.edit": "편집",
    "common.add": "추가",
    "common.remove": "제거",
    "common.search": "검색",
    "common.loading": "로딩 중...",
    "common.error": "오류",
    "common.success": "성공",
    "common.next": "다음",
    "common.finish": "완료",
    "common.verify": "확인",
    "common.required": "필수",
    "common.optional": "선택사항",
    
    // Auth
    "auth.signin": "로그인",
    "auth.signup": "가입하기",
    "auth.signout": "로그아웃",
    "auth.email": "이메일",
    "auth.password": "비밀번호",
    "auth.confirmPassword": "비밀번호 확인",
    "auth.forgotPassword": "비밀번호를 잊으셨나요?",
    "auth.createAccount": "계정 만들기",
    "auth.alreadyHaveAccount": "이미 계정이 있으신가요?",
    "auth.dontHaveAccount": "계정이 없으신가요?",
    
    // Account Types
    "account.personal": "개인 계정",
    "account.kids": "어린이 계정",
    "account.business": "비즈니스 계정",
    "account.personalDesc": "모든 Alsamos 서비스에 대한 전체 액세스",
    "account.kidsDesc": "부모 감독 하에 안전한 계정",
    "account.businessDesc": "팀 관리 기능이 있는 조직용",
    
    // Dashboard
    "dashboard.home": "홈",
    "dashboard.personalInfo": "개인 정보",
    "dashboard.security": "보안",
    "dashboard.devices": "기기",
    "dashboard.dataPrivacy": "데이터 및 개인정보",
    "dashboard.peopleSharing": "사람 및 공유",
    "dashboard.payments": "결제",
    "dashboard.connectedApps": "연결된 앱",
    "dashboard.passwordManager": "비밀번호 관리자",
    "dashboard.developerAccess": "개발자 액세스",
    "dashboard.recoveryCenter": "복구 센터",
    
    // Kids Account
    "kids.title": "어린이 계정 만들기",
    "kids.subtitle": "안전한 부모 감독 계정",
    "kids.parentVerify": "부모 확인",
    "kids.childInfo": "자녀 정보",
    "kids.safetySettings": "안전 설정",
    "kids.deviceLink": "기기 연결",
    "kids.firstName": "자녀 이름",
    "kids.lastName": "자녀 성",
    "kids.age": "자녀 나이",
    "kids.username": "사용자 이름 선택",
    "kids.screenTime": "화면 시간 제한",
    "kids.contentFilter": "콘텐츠 필터 수준",
    "kids.appRestrictions": "앱 제한",
    "kids.sleepMode": "수면 모드",
    "kids.parentApproval": "부모 승인 필요",
    
    // Business Account
    "business.title": "비즈니스 계정 만들기",
    "business.subtitle": "Alsamos에서 조직 설정",
    "business.companyInfo": "회사 정보",
    "business.adminSetup": "관리자 설정",
    "business.domainVerify": "도메인 확인",
    "business.teamSetup": "팀 설정",
    "business.companyName": "회사명",
    "business.companyType": "회사 유형",
    "business.companySize": "회사 규모",
    "business.industry": "업종",
    "business.country": "국가",
    "business.website": "회사 웹사이트",
    "business.adminEmail": "관리자 이메일",
    "business.adminName": "관리자 이름",
    "business.domain": "회사 도메인",
    "business.verifyDns": "DNS로 확인",
    "business.verifyFile": "파일로 확인",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
  ja: {
    // Common
    "common.continue": "続ける",
    "common.back": "戻る",
    "common.save": "保存",
    "common.cancel": "キャンセル",
    "common.delete": "削除",
    "common.edit": "編集",
    "common.add": "追加",
    "common.remove": "削除",
    "common.search": "検索",
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.next": "次へ",
    "common.finish": "完了",
    "common.verify": "確認",
    "common.required": "必須",
    "common.optional": "任意",
    
    // Auth
    "auth.signin": "ログイン",
    "auth.signup": "登録",
    "auth.signout": "ログアウト",
    "auth.email": "メール",
    "auth.password": "パスワード",
    "auth.confirmPassword": "パスワード確認",
    "auth.forgotPassword": "パスワードをお忘れですか？",
    "auth.createAccount": "アカウント作成",
    "auth.alreadyHaveAccount": "すでにアカウントをお持ちですか？",
    "auth.dontHaveAccount": "アカウントをお持ちでないですか？",
    
    // Account Types
    "account.personal": "個人アカウント",
    "account.kids": "キッズアカウント",
    "account.business": "ビジネスアカウント",
    "account.personalDesc": "すべてのAlsamosサービスへのフルアクセス",
    "account.kidsDesc": "保護者監視付きの安全なアカウント",
    "account.businessDesc": "チーム管理機能付きの組織向け",
    
    // Dashboard
    "dashboard.home": "ホーム",
    "dashboard.personalInfo": "個人情報",
    "dashboard.security": "セキュリティ",
    "dashboard.devices": "デバイス",
    "dashboard.dataPrivacy": "データとプライバシー",
    "dashboard.peopleSharing": "人と共有",
    "dashboard.payments": "支払い",
    "dashboard.connectedApps": "接続済みアプリ",
    "dashboard.passwordManager": "パスワードマネージャー",
    "dashboard.developerAccess": "開発者アクセス",
    "dashboard.recoveryCenter": "リカバリーセンター",
    
    // Kids Account
    "kids.title": "キッズアカウント作成",
    "kids.subtitle": "安全な保護者監視アカウント",
    "kids.parentVerify": "保護者確認",
    "kids.childInfo": "お子様の情報",
    "kids.safetySettings": "安全設定",
    "kids.deviceLink": "デバイスリンク",
    "kids.firstName": "お子様の名",
    "kids.lastName": "お子様の姓",
    "kids.age": "お子様の年齢",
    "kids.username": "ユーザー名を選択",
    "kids.screenTime": "画面時間制限",
    "kids.contentFilter": "コンテンツフィルターレベル",
    "kids.appRestrictions": "アプリ制限",
    "kids.sleepMode": "スリープモード",
    "kids.parentApproval": "保護者の承認が必要",
    
    // Business Account
    "business.title": "ビジネスアカウント作成",
    "business.subtitle": "Alsamosで組織を設定",
    "business.companyInfo": "会社情報",
    "business.adminSetup": "管理者設定",
    "business.domainVerify": "ドメイン確認",
    "business.teamSetup": "チーム設定",
    "business.companyName": "会社名",
    "business.companyType": "会社タイプ",
    "business.companySize": "会社規模",
    "business.industry": "業種",
    "business.country": "国",
    "business.website": "会社ウェブサイト",
    "business.adminEmail": "管理者メール",
    "business.adminName": "管理者名",
    "business.domain": "会社ドメイン",
    "business.verifyDns": "DNSで確認",
    "business.verifyFile": "ファイルで確認",
    
    // Languages
    "lang.en": "English",
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
    "lang.tr": "Türkçe",
    "lang.ar": "العربية",
    "lang.ko": "한국어",
    "lang.ja": "日本語",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("alsamos-language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("alsamos-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "uz", name: "Uzbek", nativeName: "O'zbekcha" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
];
