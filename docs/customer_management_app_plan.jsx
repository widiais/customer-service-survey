// Customer Management App Planning Document
// Stack: Next.js 15 (App Router), Firebase (Firestore, Auth, Hosting, Functions)

/**
 * ====== 1. USER ROLES ======
 * - Admin (Login Required)
 * - Staff (Optional, if delegated)
 * - Customer (No login needed to fill out questionnaire)
 */

/**
 * ====== 2. DATA STRUCTURE ======
 * - Stores (Collection)
 *   - id
 *   - name
 *   - address
 *   - city
 *   - region (e.g. Regional 1, 2, 3)
 *   - area
 *   - createdBy (Admin UID)
 *   - questionnaires (Subcollection)
 *     - id
 *     - submittedAt
 *     - customerInfo: {
 *         name
 *         gender
 *         phone
 *         agreeToMembership (boolean)
 *         agreeToPromo (boolean)
 *       }
 *     - membershipDetails: {
 *         age
 *         profession
 *         incomeRange
 *         dailyActivities
 *         hobbies
 *         preferredSocialMedia
 *       } (optional, only if agreeToMembership is true)
 *     - customerBehavior: {
 *         preferredTimeToBuy (Pagi, Siang, Sore, Malam)
 *         orderingMethod (Datang Langsung, Go Food, Grab Food, Shopee Food)
 *         favoriteMenu (text)
 *         loyaltyFactors (text)
 *         hasRecommendedBrand (boolean)
 *       }
 *     - painPoints: {
 *         diningProblems (text)
 *         orderingDisappointments (text)
 *         productTrialConcerns (text)
 *       }
 *     - suggestions: {
 *         expectationsForUs (text)
 *         expectedPromos (text)
 *         preferredSocialMediaContent (text)
 *       }
 *
 * - Questions (Collection)
 *   - id
 *   - text
 *   - type (rating/text/multiple_choice)
 *   - options (for multiple_choice)
 */

/**
 * ====== 3. FEATURES ======
 *
 * === Admin Panel ===
 * - [ ] Login Authentication
 * - [ ] Store Management CRUD (city, region, area)
 * - [ ] Questionnaire Results Dashboard
 *     - [ ] Filter by Region / City / Store
 *     - [ ] View average score per question
 *     - [ ] View submission count per store
 *     - [ ] Chart: Store Scores by Region/City (Bar/Line)
 * - [ ] Manage Questions (CRUD)
 *
 * === Customer Side (No Login) ===
 * - [ ] Direct Access via Link or QR Code (e.g. /survey/[storeId])
 * - [ ] Questionnaire Form (5-step conditional form)
 *     - Step 1: Basic Info
 *       - Nama, Jenis Kelamin, Nomor WhatsApp
 *       - Checklist: Bersedia menjadi member, Menerima informasi promo
 *     - Step 2: Kesediaan Member (hanya jika setuju jadi member)
 *       - Usia, Profesi, Perkiraan Penghasilan, Kegiatan Sehari-hari, Hobi, Medsos yang paling sering digunakan
 *     - Step 3: Customer Behavior
 *       - Lebih sering membeli makanan di waktu: Pagi / Siang / Sore / Malam
 *       - Lebih sering memesan via: Datang Langsung / Go Food / Grab Food / Shopee Food
 *       - Menu Favorit (boleh sebutkan merek)
 *       - Faktor loyal terhadap brand (boleh sebutkan merek)
 *       - Pernah merekomendasikan tempat/resto ke orang lain? (Ya/Tidak)
 *     - Step 4: Pain Points
 *       - Kendala yang sering dijumpai saat makan di restoran
 *       - Hal yang membuat kecewa saat order makanan
 *       - Hal yang membuat ragu mencoba produk baru
 *     - Step 5: Saran & Harapan
 *       - Harapan terhadap Labbaik Chicken
 *       - Promo/program yang diharapkan
 *       - Konten media sosial yang disukai
 *     - Submit anonymously (no login required)
 */

/**
 * ====== 4. FIREBASE SETUP ======
 * - Firestore
 * - Firebase Auth (Admin only)
 * - Firebase Hosting
 * - Firebase Functions (optional: for generating aggregate scores)
 */

/**
 * ====== 5. FRONTEND STRUCTURE (Next.js 15) ======
 *
 * /dashboard (Admin Panel)
 *   /stores (Store Management)
 *   /questionnaires (Analytics & Responses)
 *   /questions (Question Bank CRUD)
 *
 * /survey
 *   /[storeId] (Customer Questionnaire Page – accessed via link or QR code)
 *     - step1 (Basic Info)
 *     - step2 (Membership Details - conditional)
 *     - step3 (Customer Behavior)
 *     - step4 (Pain Points)
 *     - step5 (Suggestions)
 *
 * /api (for server actions and Firebase integration)
 */

/**
 * ====== 6. FUTURE FEATURES ======
 * - Export results to Excel
 * - Email notifications on new submissions
 * - Benchmark score per region
 * - User feedback sentiment analysis
 */
