/**
 * The Arabic set — the same shape as lib/content.ts (`Content`), so a missing
 * string is a type error rather than an English line in an Arabic page.
 *
 * Conventions:
 * - Names stay in Latin script: the person, employers, projects, and every
 *   technology (NEXT.JS, REACT…). That is how they are written in Lebanese tech
 *   writing, and it is how Brand Atelier — the bilingual project shown here —
 *   handles them too.
 * - Months are the Levantine names used in Lebanon (شباط، أيار، تشرين…), with
 *   Western digits.
 * - Numbers that come from data are reused from the English set, so the two
 *   languages can never disagree on a figure.
 */
import { EN, type Content } from "./content"

const ROLE_MONTHS = EN.ROLES.reduce((n, r) => n + r.months, 0)

export const AR: Content = {
  IDENTITY: {
    name:     "MIKEL MRAD",
    role:     "مطوّر FRONT-END / FULL-STACK",
    tagline:  "التجارة، الواجهات، والتفاصيل بينهما.",
    location: "بيروت، لبنان",
    reach:    "بيروت ← العالم",
    availability: {
      short: "متاح للعمل الحر",
      long:  "متاح لمشاريع العمل الحر",
      note:  "مشاريع العمل الحر فقط",
    },
  },

  STATS: [
    { value: EN.STATS[0].value, suffix: "+", label: "سنوات من الإنجاز" },
    { value: EN.STATS[1].value, suffix: "+", label: "مشاريع منجزة" },
  ],

  MODULE_TITLES: {
    status:       "الحالة",
    stats:        "بالأرقام",
    experience:   "الخبرة",
    location:     "المقر",
    latest:       "الأحدث",
    "work-meta":  "أعمال\nمختارة",
    cv:           "السيرة\nالذاتية",
    "tech-count": "الأدوات",
    education:    "التعليم",
    headline:     "تواصل",
    email:        "مباشر",
    form:         "أرسل\nرسالة",
    socials:      "روابط",
  },

  EMPLOYER: {
    name:     "YORK PRESS",
    location: "بيروت، لبنان",
    span:     "2024 — الآن",
    summary:  "منصة متعددة المستأجرين لتسجيل الامتحانات. 5 دول، قاعدة شيفرة واحدة.",
  },

  ROLES: [
    {
      ...EN.ROLES[0],
      title: "مهندس واجهات أمامية وقائد فريق الموبايل",
      type:  "دوام كامل",
      from:  "شباط 2026",
      to:    "الآن",
      blurb:
        "تولّيت قيادة الواجهات الأمامية بعد قيادة مبادرات أساسية في المنصة — مسار تسجيل المدارس، فئات المراحل التعليمية، وأداة بناء لوحات التحكم. ثم تولّيت قيادة فريق الموبايل، فقُدت فريقاً من 3 مهندسين لبناء تطبيق iOS وAndroid بـ React Native / Expo، وأطلقت التحقق برمز OTP للتسجيل واستعادة كلمة المرور من طرف إلى طرف — من خدمة المصادقة المصغّرة بـ Node.js حتى شاشات التطبيق.",
    },
    {
      ...EN.ROLES[1],
      title: "مطوّر واجهات أمامية",
      type:  "دوام كامل",
      from:  "أيار 2025",
      to:    "شباط 2026",
      blurb:
        "تولّيت تسليم ميزات الواجهة الأمامية عبر المنصة. صمّمت نظام دفع متعدد البوابات بنمط Strategy يوجّه PayPal وPaymob حسب الدولة، وبنيت مساراً متكاملاً لتتبّع UTM ينسب إنفاق إعلانات Meta وGoogle عبر إعادة التوجيه بين النطاقات.",
    },
    {
      ...EN.ROLES[2],
      title: "مطوّر واجهات أمامية",
      type:  "دوام جزئي",
      from:  "تشرين الثاني 2024",
      to:    "أيار 2025",
      blurb:
        "طوّرت ميزات الواجهة الأمامية لمنصة تسجيل الامتحانات. بنيت مكوّنات React قابلة لإعادة الاستخدام، وحسّنت منطق اختيار الامتحانات حسب المجموعات، وساهمت في تطوير لوحة التحكم ومسارات المستخدم الأساسية. انتقلت بعدها إلى الدوام الكامل.",
    },
    {
      ...EN.ROLES[3],
      title: "متدرّب تطوير ويب",
      type:  "تدريب",
      from:  "تموز 2024",
      to:    "تشرين الأول 2024",
      blurb:
        "أول دور لي في الفريق الهندسي. ساهمت بميزات واجهة أمامية في بيئة الإنتاج بـ React وNext.js، وبنيت مكوّنات الواجهة وصمّمتها، وأصلحت الأخطاء عبر تجربة التسجيل.",
    },
  ],

  PROJECTS: [
    {
      ...EN.PROJECTS[0],
      subtitle: "موقع وكالة / ثنائي اللغة EN—AR",
      role:     "منصة ويب مخصّصة",
      detail: [
        "موقع تسويقي ثنائي اللغة، إنكليزي / عربي، على Next.js 16 App Router مع دعم RTL حقيقي يقلب الـ CSS فعلياً عبر Emotion cache وإضافة stylis-plugin-rtl وثيم يراعي الاتجاه.",
        "تحليلات مشروطة بموافقة المستخدم على نمط GDPR عبر GA4 وMeta Pixel وLinkedIn Insight Tag، إلى جانب مسارات SEO لخريطة الموقع وrobots والبيانات الوصفية.",
        "نموذج تواصل عبر EmailJS، وبنية مكوّنات صارمة تعتمد على styled() حصراً.",
      ],
    },
    {
      ...EN.PROJECTS[1],
      subtitle: "تجارة إلكترونية / الطلب عبر واتساب",
      role:     "مطوّر منفرد",
      detail: [
        "متجر مخصّص يتحوّل فيه الدفع إلى واتساب — يُنشأ الطلب في المتصفح ويُرسَل كرسالة منظّمة، ما يزيل تعقيد بوابات الدفع في السوق المحلي.",
        "يدير Supabase الكتالوج وسجلات الطلبات، ويتولّى Cloudflare التوزيع والتخزين المؤقت.",
      ],
    },
    {
      ...EN.PROJECTS[2],
      subtitle: "تجارة إلكترونية / SHOPIFY",
      role:     "عمل حر",
      year:     "كانون الثاني 2026",
      detail: [
        "متجر Shopify يركّز على التحويل، بقوالب Liquid وأقسام مخصّصة وتصميم متجاوب يبدأ من الهاتف.",
        "سُلِّم بالكامل كمشروع عمل حر: قوالب مخصّصة للمنتجات والمجموعات، وتحسين أداء القالب، وإعداد المتجر كاملاً.",
        "أُغلق المتجر منذ ذلك الحين — هذه اللقطات، الملتقطة في آب 2026، هي سجلّ ما بُني.",
      ],
    },
    {
      ...EN.PROJECTS[3],
      subtitle: "تجارة إلكترونية / SHOPIFY",
      role:     "شريك مؤسّس ومطوّر",
      year:     "منذ 2022",
      detail: [
        "شاركت في تأسيس المشروع وبنيت متجره المخصّص على Shopify Liquid بأقسام مصمّمة خصيصاً وصفحات منتجات متجاوبة.",
        "أتولّى المنتج والعمليات والقرارات اليومية — أدير المتجر من البداية إلى النهاية، من الكتالوج والعرض حتى إتمام الشراء.",
      ],
    },
  ],

  STACK: [
    { ...EN.STACK[0], label: "لغات البرمجة" },
    { ...EN.STACK[1], label: "أطر العمل والمكتبات" },
    { ...EN.STACK[2], label: "الأدوات والمنصات" },
    { ...EN.STACK[3], label: "قواعد البيانات" },
  ],

  TECH_COUNT: EN.TECH_COUNT,

  STATS_DETAIL: [
    { ...EN.STATS_DETAIL[0], label: "سنوات من الإنجاز", note: "NEXT.JS · REACT · TYPESCRIPT" },
    { ...EN.STATS_DETAIL[1], label: "مشاريع منجزة", note: `${EN.PROJECTS.length} منها في قسم الأعمال` },
    { value: ROLE_MONTHS, label: "شهراً في YORK PRESS", note: `${EN.ROLES.length} أدوار، من متدرّب إلى قائد` },
    { ...EN.STATS_DETAIL[3], label: "دول على المنصة", note: "قاعدة شيفرة واحدة" },
    { ...EN.STATS_DETAIL[4], label: "مهندسين بقيادتي", note: "iOS وAndroid · React Native" },
    { ...EN.STATS_DETAIL[5], label: "تقنية", note: `ضمن ${EN.STACK.length} فئات` },
  ],

  EDUCATION: [
    {
      ...EN.EDUCATION[0],
      school: "جامعة الروح القدس – الكسليك",
      place:  "الكسليك، لبنان",
      award:  "بكالوريوس في علوم الكمبيوتر",
    },
    {
      ...EN.EDUCATION[1],
      school: "مدرسة العائلة المقدسة",
      place:  "الزلقا، لبنان",
      award:  "البكالوريا اللبنانية — العلوم العامة",
    },
  ],

  UI: {
    identity: { portfolio: "ملف الأعمال — 2026", home: "الرئيسية", homeAria: "العودة إلى الرئيسية" },
    status:   { label: "الحالة", value: "متاح" },
    stats:    { label: "بالأرقام", figures: (n) => `${n} أرقام` },
    location: { label: "المقر", city: "بيروت", note: "GMT+3 · جاهز للعمل عن بُعد" },
    latest:   { label: "الأحدث", cta: "كل الأعمال" },
    experience: { label: "الخبرة", months: "أشهر" },
    workMeta: { label: "مختارة", line: "مشاريع · 2022—2026", tags: "SHOPIFY · HEADLESS · تجارة إلكترونية" },
    cv: {
      label: "السيرة الذاتية", top: "2026", bottom: "سيرة ذاتية",
      contents: "الخبرة · الأدوات · التعليم", download: "تحميل",
    },
    project: {
      label: "عمل", archivedView: "مؤرشف — عرض", views: "لقطات",
      visit: "زيارة الموقع", offline: "مؤرشف — الموقع متوقف",
    },
    toolbox:   { label: "الأدوات", technologies: "تقنية", categories: (n) => `${n} فئات` },
    education: { label: "التعليم" },
    contact: {
      label: "تواصل", headline: ["لنعمل", "معاً."],
      direct: "مباشر",
      form: "أرسل رسالة", formTag: "نموذج", sentTag: "أُرسلت",
      received: "وصلت.", reply: "سأتواصل معك قريباً.",
      name: "الاسم", email: "البريد الإلكتروني", message: "رسالتك",
      error: "حدث خطأ — راسلني مباشرة.",
      sending: "جارٍ الإرسال...", send: "أرسل الرسالة",
      github: "GITHUB", linkedin: "LINKEDIN", cv: "السيرة",
      footer: "© 2026 MikelMrad", colophon: "· NEXT.JS",
    },
    expand: "توسيع",
    close: "إغلاق",
    esc: "ESC",
    step: "للتنقّل",
    expanded: "موسّع",
    roles: (n) => `${n} أدوار`,
    tabs: { index: "الرئيسية", work: "الأعمال", stack: "الأدوات", contact: "تواصل" },
    dock: {
      hints: "اسحب · ارمِ · 1—4 · ← → · ESC",
      reset: "إعادة الترتيب", resetAria: "أعد البطاقات إلى أماكنها",
      toDesktop: "عرض تخطيط سطح المكتب", toPhone: "عرض تخطيط الهاتف",
      lang: "EN", langAria: "Switch to English",
    },
    demo: {
      tabsPhone: "اضغط على تبويب لتغيير الصفحة",
      tabsDesktop: "التبويبات تغيّر الصفحة · أو اضغط 1–4",
      open: "اضغط على بطاقة لفتحها",
      swap: "اسحبها فوق أخرى لتبديلهما",
      fling: "ارمِها بسرعة لقذفها",
      shake: "هزّ الهاتف لإعادة الترتيب",
      skip: "تخطَّ العرض", skipAria: "إغلاق العرض التوضيحي",
    },
  },
}
