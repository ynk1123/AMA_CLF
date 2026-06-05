import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    campusLostAndFound: 'Campus Lost & Found',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    messages: 'Messages',
    logout: 'Logout',
    admin: 'Admin',
    view: 'View',
    
    // Landing
    welcomeTitle: 'Campus Lost and Found Portal',
    welcomeSubtitle: 'Secure. Simple. Track and recover lost items easily.',
    getStarted: 'Get Started',
    browseItems: 'Browse Items',
    features: 'Features',
    feature1Title: 'Browse Items',
    feature1Desc: 'Search through lost and found items across the campus.',
    feature2Title: 'Post Items',
    feature2Desc: 'Report lost or found items quickly and easily.',
    feature3Title: 'Secure Claims',
    feature3Desc: 'Verified claim system ensures items go to the right owners.',
    
    // Login
    loginTitle: 'Login',
    studentLogin: 'Student Login',
    adminLogin: 'Admin Login',
    studentId: 'Student ID or Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    
    // Register
    registerTitle: 'Register',
    createAccountTitle: 'Create Account',
    joinCommunity: 'Join the campus community',
    displayName: 'Display Name',
    email: 'Email',
    studentIdLabel: 'Student ID',
    
    // Browse
    browseTitle: 'Browse Lost and Found Items',
    searchFilters: 'Search and Filters',
    searchKeyword: 'Search Keyword',
    category: 'Category',
    location: 'Location',
    status: 'Status',
    all: 'All',
    itemDetails: 'Item Details',
    postedBy: 'Posted by',
    description: 'Description',
    noDescription: 'No description provided.',
    loginToClaim: 'Login to claim or post items',
    
    // Dashboard
    welcome: 'Welcome',
    postNewItem: 'Post New Item',
    items: 'Items',
    
    // Chat
    chatTitle: 'Inquiry & Chat',
    chatSubtitle: 'Ask questions about lost and found items',
    itemsList: 'Items',
    noMessagesYet: 'No messages yet. Start the conversation!',
    messagePlaceholder: 'Type a message...',
    
// Admin
    adminDashboard: 'Admin Dashboard',
    totalItems: 'Total Items',
    lost: 'Lost',
    found: 'Found',
    claimed: 'Claimed',
    archived: 'Archived',
    users: 'Users',
    pendingAppointments: 'Pending Appointments',
    allItems: 'All Items',
    claims: 'Claims',
    locations: 'Locations',
    appointments: 'Appointments',
    allUsers: 'All Users',
    itemId: 'ID',
    title: 'Title',
    actions: 'Actions',
    pendingClaims: 'Pending Claims',
    item: 'Item',
    claimedBy: 'Claimed By',
    answer: 'Answer',
    claimStatus: 'Status',
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
    restore: 'Restore',
    archive: 'Archive',
    hotspotLocations: 'Hotspot Locations',
    date: 'Date',
    time: 'Time',
    locationLabel: 'Location',
    
    // Status
    statusLost: 'Lost',
    statusFound: 'Found',
    statusPending: 'Pending',
    statusUnderVerification: 'Under Verification',
    statusClaimed: 'Claimed',
    statusArchived: 'Archived',
    
    // Categories
    catID: 'ID',
    catGadget: 'Gadget',
    catWallet: 'Wallet',
    catBag: 'Bag',
    catOther: 'Other',
    
    // Common
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    claimItem: 'Claim Item',
    scheduleCCTV: 'Schedule CCTV Review',
  },
  es: {
    // Navbar
    campusLostAndFound: 'Campus Lost & Found',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    dashboard: 'Panel',
    messages: 'Mensajes',
    logout: 'Cerrar Sesión',
    admin: 'Admin',
    view: 'Ver',
    
    // Landing
    welcomeTitle: 'Portal de Objetos Perdidos',
    welcomeSubtitle: 'Seguro. Simple. Rastrea y recupera objetos perdidos fácilmente.',
    getStarted: 'Comenzar',
    browseItems: 'Ver Objetos',
    features: 'Características',
    feature1Title: 'Buscar Objetos',
    feature1Desc: 'Busca objetos perdidos y encontrados en el campus.',
    feature2Title: 'Publicar Objetos',
    feature2Desc: 'Reporta objetos perdidos o encontrados rápidamente.',
    feature3Title: 'Reclamaciones Seguras',
    feature3Desc: 'Sistema verificado asegura que los objetos lleguen a sus propietarios.',
    
    // Login
    loginTitle: 'Iniciar Sesión',
    studentLogin: 'Estudiante',
    adminLogin: 'Administrador',
    studentId: 'ID o Email',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu Contraseña?',
    createAccount: 'Crear Cuenta',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    
    // Register
    registerTitle: 'Registrarse',
    createAccountTitle: 'Crear Cuenta',
    joinCommunity: 'Únete a la comunidad',
    displayName: 'Nombre',
    email: 'Email',
    studentIdLabel: 'ID de Estudiante',
    
    // Browse
    browseTitle: 'Objetos Perdidos y Encontrados',
    searchFilters: 'Búsqueda y Filtros',
    searchKeyword: 'Palabra Clave',
    category: 'Categoría',
    location: 'Ubicación',
    status: 'Estado',
    all: 'Todos',
    itemDetails: 'Detalles del Objeto',
    postedBy: 'Publicado por',
    description: 'Descripción',
    noDescription: 'Sin descripción.',
    loginToClaim: 'Inicia sesión para reclamar',
    
    // Dashboard
    welcome: 'Bienvenido',
    postNewItem: 'Publicar Objeto',
    items: 'Objetos',
    
    // Chat
    chatTitle: 'Consulta y Chat',
    chatSubtitle: 'Haz preguntas sobre objetos perdidos',
    itemsList: 'Objetos',
    noMessagesYet: 'Sin mensajes aún. ¡Comienza la conversación!',
    messagePlaceholder: 'Escribe un mensaje...',
    
    // Admin
    adminDashboard: 'Panel de Admin',
    totalItems: 'Total de Objetos',
    lost: 'Perdidos',
    found: 'Encontrados',
    claimed: 'Reclamados',
    archived: 'Archivados',
    users: 'Usuarios',
    pendingAppointments: 'Citas Pendientes',
    allItems: 'Todos los Objetos',
    claims: 'Reclamaciones',
    locations: 'Ubicaciones',
    appointments: 'Citas',
    allUsers: 'Todos los Usuarios',
    itemId: 'ID',
    title: 'Título',
    actions: 'Acciones',
    pendingClaims: 'Reclamaciones Pendientes',
    item: 'Objeto',
    claimedBy: 'Reclamado Por',
    answer: 'Respuesta',
claimStatus: 'Estado',
    approve: 'Aprobar',
    reject: 'Rechazar',
    delete: 'Eliminar',
    restore: 'Restaurar',
    archive: 'Archivar',
    hotspotLocations: 'Ubicaciones de Riesgo',
    date: 'Fecha',
    time: 'Hora',
    locationLabel: 'Ubicación',
    
    // Status
    statusLost: 'Perdido',
    statusFound: 'Encontrado',
    statusPending: 'Pendiente',
    statusUnderVerification: 'En Verificación',
    statusClaimed: 'Reclamado',
    statusArchived: 'Archivado',
    
    // Categories
    catID: 'ID',
    catGadget: 'Electrónico',
    catWallet: 'Billetera',
    catBag: 'Bolsa',
    catOther: 'Otro',
    
    // Common
    submit: 'Enviar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    claimItem: 'Reclamar Objeto',
    scheduleCCTV: 'Solicitar Revisión CCTV',
  },
  fr: {
    // Navbar
    campusLostAndFound: 'Campus Objets Perdus',
    login: 'Connexion',
    register: "S'inscrire",
    dashboard: 'Tableau de Bord',
    messages: 'Messages',
    logout: 'Déconnexion',
    admin: 'Admin',
    view: 'Voir',
    
    // Landing
    welcomeTitle: 'Portail Objets Perdus',
    welcomeSubtitle: 'Sécurisé. Simple. Retrouver vos objets facilement.',
    getStarted: 'Commencer',
    browseItems: 'Voir les Objets',
    features: 'Fonctionnalités',
    feature1Title: 'Parcourir',
    feature1Desc: 'Recherchez les objets perdus sur le campus.',
    feature2Title: 'Publier',
    feature2Desc: 'Signalez rapidement les objets perdus.',
    feature3Title: 'Réclamations Sécurisées',
    feature3Desc: 'Système vérifié garantit les bons propriétaires.',
    
    // Login
    loginTitle: 'Connexion',
    studentLogin: 'Étudiant',
    adminLogin: 'Administrateur',
    studentId: 'ID ou Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    createAccount: 'Créer un Compte',
    alreadyHaveAccount: 'Déjà un compte?',
    
    // Register
    registerTitle: "S'inscrire",
    createAccountTitle: 'Créer un Compte',
    joinCommunity: 'Rejoignez la communauté',
    displayName: 'Nom',
    email: 'Email',
    studentIdLabel: "ID Étudiant",
    
    // Browse
    browseTitle: 'Objets Perdus et Trouvés',
    searchFilters: 'Recherche et Filtres',
    searchKeyword: 'Mot Clé',
    category: 'Catégorie',
    location: 'Lieu',
    status: 'Statut',
    all: 'Tous',
    itemDetails: 'Détails',
    postedBy: 'Posté par',
    description: 'Description',
    noDescription: 'Pas de description.',
    loginToClaim: 'Connectez-vous pour réclammer',
    
    // Dashboard
    welcome: 'Bienvenue',
    postNewItem: 'Publier un Objet',
    items: 'Objets',
    
    // Chat
    chatTitle: 'Questions et Chat',
    chatSubtitle: 'Posez des questions sur les objets',
    itemsList: 'Objets',
    noMessagesYet: 'Pas de messages. Commencez!',
    messagePlaceholder: 'Tapez un message...',
    
    // Admin
    adminDashboard: 'Admin',
    totalItems: 'Total Objets',
    lost: 'Perdus',
    found: 'Trouvés',
    claimed: 'Réclamés',
    archived: 'Archivés',
    users: 'Utilisateurs',
    pendingAppointments: 'Rendez-vous en Attente',
    allItems: 'Tous les Objets',
    claims: 'Réclamations',
    locations: 'Lieux',
    appointments: 'Rendez-vous',
    allUsers: 'Tous les Utilisateurs',
    itemId: 'ID',
    title: 'Titre',
    actions: 'Actions',
    pendingClaims: 'Réclamations en Attente',
    item: 'Objet',
    claimedBy: 'Réclamé Par',
    answer: 'Réponse',
claimStatus: 'Statut',
    approve: 'Approuver',
    reject: 'Rejeter',
    delete: 'Supprimer',
    restore: 'Restaurer',
    archive: 'Archiver',
    hotspotLocations: 'Lieux à Risque',
    date: 'Date',
    time: 'Heure',
    locationLabel: 'Lieu',
    
    // Status
    statusLost: 'Perdu',
    statusFound: 'Trouvé',
    statusPending: 'En Attente',
    statusUnderVerification: 'En Vérification',
    statusClaimed: 'Réclamé',
    statusArchived: 'Archivé',
    
    // Categories
    catID: 'Pièce',
    catGadget: 'Appareil',
    catWallet: 'Portefeuille',
    catBag: 'Sac',
    catOther: 'Autre',
    
    // Common
    submit: 'Soumettre',
    cancel: 'Annuler',
    close: 'Fermer',
    save: 'Sauvegarder',
    edit: 'Modifier',
    search: 'Rechercher',
    filter: 'Filtrer',
    claimItem: "Réclamer l'Objet",
    scheduleCCTV: 'Demander CCTV',
  },
  zh: {
    // Navbar
    campusLostAndFound: '校园失物招领',
    login: '登录',
    register: '注册',
    dashboard: '控制面板',
    messages: '消息',
    logout: '退出',
    admin: '管理',
    view: '查看',
    
    // Landing
    welcomeTitle: '校园���物���领系统',
    welcomeSubtitle: '安全. 简单. 轻松找回丢失物品.',
    getStarted: '开始',
    browseItems: '浏览物品',
    features: '功能',
    feature1Title: '浏览物品',
    feature1Desc: '搜索校园内丢失和拾取的物品.',
    feature2Title: '发布物品',
    feature2Desc: '快速报告丢失或拾取的物品.',
feature3Title: '安全认领',
    feature3Desc: '验证系统确保物品归还给正确的所有者.',
    
    // Login
    loginTitle: '登录',
    studentLogin: '学生登录',
    adminLogin: '管理员登录',
    studentId: '学号或邮箱',
    password: '密码',
    forgotPassword: '忘记密码?',
    createAccount: '创建账户',
    alreadyHaveAccount: '已有账户?',
    
    // Register
    registerTitle: '注册',
    createAccountTitle: '创建账户',
    joinCommunity: '加入校园社区',
    displayName: '显示名称',
    email: '邮箱',
    studentIdLabel: '学号',
    
    // Browse
    browseTitle: '浏览失物招领',
    searchFilters: '搜索和筛选',
    searchKeyword: '关键词',
    category: '类别',
    location: '地点',
    status: '状态',
    all: '全部',
    itemDetails: '物品详情',
    postedBy: '发布者',
    description: '描述',
    noDescription: '无描述.',
    loginToClaim: '登录以认领物品',
    
    // Dashboard
    welcome: '欢迎',
    postNewItem: '发布物品',
    items: '物品',
    
    // Chat
    chatTitle: '咨询与聊天',
    chatSubtitle: '咨询失物招领问题',
    itemsList: '物品',
    noMessagesYet: '暂无消息. 开始对话!',
    messagePlaceholder: '输入消息...',
    
    // Admin
    adminDashboard: '管理面板',
    totalItems: '总物品数',
    lost: '丢失',
    found: '拾取',
    claimed: '已认领',
    archived: '已归档',
    users: '用户',
    pendingAppointments: '待处理预约',
    allItems: '所有物品',
    claims: '认领申请',
    locations: '地点',
    appointments: '预约',
    allUsers: '所有用户',
    itemId: '编号',
    title: '标题',
    actions: '操作',
    pendingClaims: '待处理认领',
    item: '物品',
    claimedBy: '认领人',
    answer: '回答',
    claimStatus: '状态',
approve: '批准',
    reject: '拒绝',
    delete: '删除',
    restore: '恢复',
    archive: '归档',
    hotspotLocations: '热点地点',
    date: '日期',
    time: '时间',
    locationLabel: '地点',
    
    // Status
    statusLost: '丢失',
    statusFound: '拾取',
    statusPending: '待处理',
    statusUnderVerification: '审核中',
    statusClaimed: '已认领',
    statusArchived: '已归档',
    
    // Categories
    catID: '证件',
    catGadget: '电子设备',
    catWallet: '钱包',
    catBag: '背包',
    catOther: '其他',
    
// Common
    submit: '提交',
    cancel: '取消',
    close: '关闭',
    save: '保存',
    edit: '编辑',
    search: '搜索',
    filter: '筛选',
    claimItem: '认领物品',
    scheduleCCTV: '申请查看监控',
  },
  ar: {
    // Navbar
    campusLostAndFound: 'المفقودات والم找到了',
    login: 'تسجيل الدخول',
    register: 'تسجيل',
    dashboard: 'لوحة التحكم',
    messages: 'الرسائل',
    logout: 'تسجيل الخروج',
    admin: 'مدير',
    view: 'عرض',
    
    // Landing
    welcomeTitle: 'بوابة المفقودات والم找到了',
    welcomeSubtitle: 'آمن. بسيط. تتبع واسترد العناصر المفقودة بسهولة.',
    getStarted: 'ابدأ',
    browseItems: 'تصفح العناصر',
    features: 'الميزات',
    feature1Title: 'تصفح العناصر',
    feature1Desc: 'ابحث عن العناصر المفقودة والم找到了 في الحرم الجامعي.',
    feature2Title: 'نشر العناصر',
    feature2Desc: 'أبلغ عن العناصر المفقودة أو الموجودة بسرعة.',
    feature3Title: 'المطالبات الآمنة',
    feature3Desc: 'نظام التحقق يضمن وصول العناصر لأصحابها الشرعيين.',
    
    // Login
    loginTitle: 'تسجيل الدخول',
    studentLogin: 'تسجيل الطالب',
    adminLogin: 'تسجيل المدير',
    studentId: 'رقم الطالب أو البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
    
    // Register
    registerTitle: 'تسجيل',
    createAccountTitle: 'إنشاء حساب',
    joinCommunity: 'انضم إلى المجتمع الجامعي',
    displayName: 'اسم العرض',
    email: 'البريد الإلكتروني',
    studentIdLabel: 'رقم الطالب',
    
    // Browse
    browseTitle: 'تصفح المفقودات والم找到了',
    searchFilters: 'البحث والفلاتر',
    searchKeyword: 'كلمة البحث',
    category: 'الفئة',
    location: 'الموقع',
    status: 'الحالة',
    all: 'الكل',
    itemDetails: 'تفاصيل العنصر',
    postedBy: 'نشر بواسطة',
    description: 'الوصف',
    noDescription: 'لا يوجد وصف.',
    loginToClaim: 'سجل الدخول للمطالبة',
    
    // Dashboard
    welcome: 'مرحبا',
    postNewItem: 'نشر عنصر جديد',
    items: 'العناصر',
    
    // Chat
    chatTitle: 'الاستفسار والدردشة',
    chatSubtitle: 'اسأل عن الأسئلة حول المفقودات',
    itemsList: 'العناصر',
    noMessagesYet: 'لا توجد رسائل بعد. ابدأ المحادثة!',
    messagePlaceholder: 'اكتب رسالة...',
    
    // Admin
    adminDashboard: 'لوحة المدير',
    totalItems: 'إجمالي العناصر',
    lost: 'مفقود',
    found: 'موجود',
    claimed: 'مطلوب',
    archived: 'مؤرشف',
    users: 'المستخدمون',
    pendingAppointments: 'المواعيد المعلقة',
    allItems: 'جميع العناصر',
    claims: 'المطالبات',
    locations: 'المواقع',
    appointments: 'المواعيد',
    allUsers: 'جميع المستخدمين',
    itemId: 'المعرف',
    title: 'العنوان',
    actions: 'الإجراءات',
    pendingClaims: 'المطالبات المعلقة',
    item: 'العنصر',
    claimedBy: 'مطلوب بواسطة',
    answer: 'الإجابة',
claimStatus: 'الحالة',
    approve: 'موافقة',
    reject: 'رفض',
    delete: 'حذف',
    restore: 'استعادة',
    archive: 'أرشفة',
    hotspotLocations: 'المواقع الساخنة',
    date: 'التاريخ',
    time: 'الوقت',
    locationLabel: 'الموقع',
    
    // Status
    statusLost: 'مفقود',
    statusFound: 'موجود',
    statusPending: 'معلق',
    statusUnderVerification: 'قيد التحقق',
    statusClaimed: 'مطلوب',
    statusArchived: 'مؤرشف',
    
    // Categories
    catID: 'هوية',
    catGadget: 'إلكتروني',
    catWallet: 'محفظة',
    catBag: 'حقيبة',
    catOther: 'أخرى',
    
    // Common
    submit: 'إرسال',
    cancel: 'إلغاء',
    close: 'إغلاق',
    save: 'حفظ',
    edit: 'تعديل',
    search: 'بحث',
    filter: 'فلتر',
    claimItem: 'مطالبة العنصر',
    scheduleCCTV: 'جدولة مراجعة الكاميرات',
  },
  fa: {
    // Navbar
    campusLostAndFound: 'گمشده‌ها و پیدا شده‌های محوطه دانشگاه',
    login: 'ورود',
    register: 'ثبت نام',
    dashboard: 'پیشخوان',
    messages: 'پیام‌ها',
    logout: 'خروج',
    admin: 'مدیر',
    view: 'مشاهده',
    
    // Landing
    welcomeTitle: 'پرتال گمشده‌ها و پیدا شده‌ها',
    welcomeSubtitle: 'ایمن. ساده. ردیابی و بازیابی آسان اشیا گمشده.',
    getStarted: 'شروع کنید',
    browseItems: 'مشاهده موارد',
    features: 'ویژگی‌ها',
    feature1Title: 'مشاهده موارد',
    feature1Desc: 'جستجوی اشیای گمشده و پیدا شده در محوطه دانشگاه.',
feature2Title: 'ثبت مورد',
    feature2Desc: 'به سرعت گزارش اشیای گمشده یا پیدا شده را ثبت کنید.',
    feature3Title: 'ادعاهای امن',
    feature3Desc: 'سیستم تأیید تضمین می‌کند که موارد به صاحبان واقعی می‌رسد.',
    
    // Login
    loginTitle: 'ورود',
    studentLogin: 'ورود دانشجو',
    adminLogin: 'ورود مدیر',
    studentId: 'شماره دانشجویی یا ایمیل',
    password: 'رمز عبور',
    forgotPassword: 'رمز عبور را فراموش کردید؟',
    createAccount: 'ایجاد حساب',
    alreadyHaveAccount: 'آیا حساب دارید؟',
    
    // Register
    registerTitle: 'ثبت نام',
    createAccountTitle: 'ایجاد حساب',
    joinCommunity: 'به جامعه دانشگاهی بپیوندید',
    displayName: 'نام نمایشی',
    email: 'ایمیل',
    studentIdLabel: 'شماره دانشجویی',
    
    // Browse
    browseTitle: 'مشاهده گمشده‌ها و پیدا شده‌ها',
    searchFilters: 'جستجو و فیلترها',
    searchKeyword: 'کلمه کلیدی',
    category: 'دسته',
    location: 'محل',
    status: 'وضعیت',
    all: 'همه',
    itemDetails: 'جزئیات مورد',
    postedBy: 'ثبت شده توسط',
    description: 'توضیحات',
    noDescription: 'توضیحی داده نشده.',
    loginToClaim: 'برای ادعا کردن وارد شوید',
    
    // Dashboard
    welcome: 'خوش آمدید',
    postNewItem: 'ثبت مورد جدید',
    items: 'موارد',
    
    // Chat
    chatTitle: 'پرسش و گفتگو',
    chatSubtitle: 'درباره موارد گمشده سوال کنید',
    itemsList: 'موارد',
    noMessagesYet: 'پیامی نیست. مکالمه را شروع کنید!',
    messagePlaceholder: 'پیام تایپ کنید...',
    
    // Admin
    adminDashboard: 'پیشخوان مدیر',
    totalItems: 'کل موارد',
    lost: 'گمشده',
    found: 'پیدا شده',
    claimed: 'ادعا شده',
    archived: 'آرشیو شده',
    users: 'کاربران',
    pendingAppointments: 'قرارهای در انتظار',
    allItems: 'همه موارد',
    claims: 'ادعاها',
    locations: 'محل‌ها',
    appointments: 'قراردادها',
    allUsers: 'همه کاربران',
    itemId: 'شناسه',
    title: 'عنوان',
    actions: 'عملیات',
    pendingClaims: 'ادعاهای در انتظار',
    item: 'مورد',
    claimedBy: 'ادعا شده توسط',
    answer: 'پاسخ',
    claimStatus: 'وضعیت',
approve: 'تأیید',
    reject: 'رد',
    delete: 'حذف',
    restore: 'بازگردانی',
    archive: 'آرشیو',
    hotspotLocations: 'محل‌های پرمخاطره',
    date: 'تاریخ',
    time: 'زمان',
    locationLabel: 'محل',
    
    // Status
    statusLost: 'گمشده',
    statusFound: 'پیدا شده',
    statusPending: 'در انتظار',
    statusUnderVerification: 'در حال تأیید',
    statusClaimed: 'ادعا شده',
    statusArchived: 'آرشیو شده',
    
    // Categories
    catID: 'شناسه',
    catGadget: 'دستگاه',
    catWallet: 'کیف پول',
    catBag: 'کیف',
    catOther: 'دیگر',
    
    // Common
    submit: 'ارسال',
    cancel: 'لغو',
    close: 'بستن',
    save: 'ذخیره',
    edit: 'ویرایش',
    search: 'جستجو',
    filter: 'فیلتر',
    claimItem: 'ادعای مورد',
    scheduleCCTV: 'درخواست بررسی دوربین',
  },
  ja: {
    // Navbar
    campusLostAndFound: 'キャンパス落とし物',
    login: 'ログイン',
    register: '登録',
    dashboard: 'ダッシュボード',
    messages: 'メッセージ',
    logout: 'ログアウト',
    admin: '管理者',
    view: '表示',
    
    // Landing
    welcomeTitle: '落とし物ポータル',
    welcomeSubtitle: '安全。簡単。落とし物を簡単に追跡・回収。',
    getStarted: '始める',
    browseItems: '物品を閲覧',
    features: '機能',
    feature1Title: '物品を閲覧',
    feature1Desc: 'キャンパス内の落とし物と拾得物を検索。',
    feature2Title: '物品を投稿',
    feature2Desc: '落とし物・拾得物を報告。',
    feature3Title: '安全な請求',
    feature3Desc: '確認システムが物品を適切な所有者へ返すことを保証。',
    
    // Login
    loginTitle: 'ログイン',
    studentLogin: '学生ログイン',
    adminLogin: '管理者ログイン',
    studentId: '学生番号またはメール',
    password: 'パスワード',
    forgotPassword: 'パスワードを忘れた場合',
    createAccount: 'アカウント作成',
    alreadyHaveAccount: 'アカウントをお持ちですか？',
    
    // Register
    registerTitle: '登録',
    createAccountTitle: 'アカウント作成',
    joinCommunity: 'キャンパスコミュニティに参加',
    displayName: '表示名',
    email: 'メール',
    studentIdLabel: '学生番号',
    
    // Browse
    browseTitle: '落とし物・拾得物を閲覧',
    searchFilters: '検索とフィルター',
    searchKeyword: 'キーワード',
    category: 'カテゴリー',
    location: '場所',
    status: 'ステータス',
    all: 'すべて',
    itemDetails: '物品詳細',
    postedBy: '投稿者',
    description: '説明',
    noDescription: '説明なし。',
    loginToClaim: 'ログインして請求',
    
    // Dashboard
    welcome: 'ようこそ',
    postNewItem: '新しい物品を投稿',
    items: '物品',
    
    // Chat
    chatTitle: 'お問い合わせ・チャット',
    chatSubtitle: '落とし物について質問',
    itemsList: '物品',
    noMessagesYet: 'メッセージはありません。会話を始めましょう！',
    messagePlaceholder: 'メッセージを入力...',
    
    // Admin
    adminDashboard: '管理者ダッシュボード',
    totalItems: '総物品数',
    lost: '落とし物',
    found: '拾得物',
    claimed: '請求済み',
    archived: 'アーカイブ済み',
    users: 'ユーザー',
    pendingAppointments: '保留中の予約',
    allItems: 'すべての物品',
    claims: '請求',
    locations: '場所',
    appointments: '予約',
    allUsers: 'すべてのユーザー',
    itemId: 'ID',
    title: 'タイトル',
    actions: 'アクション',
    pendingClaims: '保留中の請求',
    item: '物品',
    claimedBy: '請求者',
    answer: '回答',
    claimStatus: 'ステータス',
approve: '承認',
    reject: '拒否',
    delete: '削除',
    restore: '復元',
    archive: 'アーカイブ',
    hotspotLocations: '危険場所',
    date: '日付',
    time: '時間',
    locationLabel: '場所',
    
    // Status
    statusLost: '落とし物',
    statusFound: '拾得物',
    statusPending: '保留中',
    statusUnderVerification: '確認中',
    statusClaimed: '請求済み',
    statusArchived: 'アーカイブ済み',
    
    // Categories
    catID: '.ID',
    catGadget: '電子機器',
    catWallet: '財布',
    catBag: 'バッグ',
    catOther: 'その他',
    
    // Common
    submit: '送信',
    cancel: 'キャンセル',
    close: '閉じる',
    save: '保存',
    edit: '編集',
    search: '検索',
    filter: 'フィルター',
    claimItem: '物品を請求',
    scheduleCCTV: '監視カメラ確認を予約',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
