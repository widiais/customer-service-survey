export const defaultQuestionTemplate = [
  // Step 1: Basic Info
  {
    id: 'basic_name',
    text: 'Nama Lengkap',
    type: 'text',
    category: 'Basic Info',
    step: 1,
    required: true,
    isActive: true
  },
  {
    id: 'basic_gender',
    text: 'Jenis Kelamin',
    type: 'multiple_choice',
    category: 'Basic Info',
    step: 1,
    options: ['Laki-laki', 'Perempuan'],
    required: true,
    isActive: true
  },
  {
    id: 'basic_phone',
    text: 'Nomor WhatsApp',
    type: 'text',
    category: 'Basic Info',
    step: 1,
    required: true,
    isActive: true
  },
  {
    id: 'basic_membership',
    text: 'Bersedia menjadi member?',
    type: 'multiple_choice',
    category: 'Basic Info',
    step: 1,
    options: ['Ya', 'Tidak'],
    required: true,
    isActive: true
  },
  {
    id: 'basic_promo',
    text: 'Menerima informasi promo?',
    type: 'multiple_choice',
    category: 'Basic Info',
    step: 1,
    options: ['Ya', 'Tidak'],
    required: true,
    isActive: true
  },

  // Step 2: Membership Details (conditional)
  {
    id: 'member_age',
    text: 'Usia',
    type: 'multiple_choice',
    category: 'Membership Details',
    step: 2,
    options: ['17-25 tahun', '26-35 tahun', '36-45 tahun', '46-55 tahun', '55+ tahun'],
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },
  {
    id: 'member_profession',
    text: 'Profesi',
    type: 'multiple_choice',
    category: 'Membership Details',
    step: 2,
    options: ['Pelajar/Mahasiswa', 'Karyawan Swasta', 'PNS', 'Wiraswasta', 'Ibu Rumah Tangga', 'Lainnya'],
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },
  {
    id: 'member_income',
    text: 'Perkiraan Penghasilan',
    type: 'multiple_choice',
    category: 'Membership Details',
    step: 2,
    options: ['< 3 juta', '3-5 juta', '5-10 juta', '10-15 juta', '> 15 juta'],
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },
  {
    id: 'member_activities',
    text: 'Kegiatan Sehari-hari',
    type: 'text',
    category: 'Membership Details',
    step: 2,
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },
  {
    id: 'member_hobbies',
    text: 'Hobi',
    type: 'text',
    category: 'Membership Details',
    step: 2,
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },
  {
    id: 'member_social_media',
    text: 'Media sosial yang paling sering digunakan',
    type: 'multiple_choice',
    category: 'Membership Details',
    step: 2,
    options: ['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'YouTube', 'WhatsApp', 'Telegram'],
    required: false,
    isActive: true,
    conditional: 'basic_membership=Ya'
  },

  // Step 3: Customer Behavior
  {
    id: 'behavior_time',
    text: 'Lebih sering membeli makanan di waktu',
    type: 'multiple_choice',
    category: 'Customer Behavior',
    step: 3,
    options: ['Pagi', 'Siang', 'Sore', 'Malam'],
    required: true,
    isActive: true
  },
  {
    id: 'behavior_ordering',
    text: 'Lebih sering memesan via',
    type: 'multiple_choice',
    category: 'Customer Behavior',
    step: 3,
    options: ['Datang Langsung', 'Go Food', 'Grab Food', 'Shopee Food'],
    required: true,
    isActive: true
  },
  {
    id: 'behavior_favorite_menu',
    text: 'Menu Favorit (boleh sebutkan merek)',
    type: 'text',
    category: 'Customer Behavior',
    step: 3,
    required: true,
    isActive: true
  },
  {
    id: 'behavior_loyalty',
    text: 'Faktor loyal terhadap brand (boleh sebutkan merek)',
    type: 'text',
    category: 'Customer Behavior',
    step: 3,
    required: true,
    isActive: true
  },
  {
    id: 'behavior_recommendation',
    text: 'Pernah merekomendasikan tempat/resto ke orang lain?',
    type: 'multiple_choice',
    category: 'Customer Behavior',
    step: 3,
    options: ['Ya', 'Tidak'],
    required: true,
    isActive: true
  },

  // Step 4: Pain Points
  {
    id: 'pain_dining',
    text: 'Kendala yang sering dijumpai saat makan di restoran',
    type: 'text',
    category: 'Pain Points',
    step: 4,
    required: true,
    isActive: true
  },
  {
    id: 'pain_ordering',
    text: 'Hal yang membuat kecewa saat order makanan',
    type: 'text',
    category: 'Pain Points',
    step: 4,
    required: true,
    isActive: true
  },
  {
    id: 'pain_trial',
    text: 'Hal yang membuat ragu mencoba produk baru',
    type: 'text',
    category: 'Pain Points',
    step: 4,
    required: true,
    isActive: true
  },

  // Step 5: Suggestions
  {
    id: 'suggestion_expectations',
    text: 'Harapan terhadap Labbaik Chicken',
    type: 'text',
    category: 'Suggestions',
    step: 5,
    required: true,
    isActive: true
  },
  {
    id: 'suggestion_promos',
    text: 'Promo/program yang diharapkan',
    type: 'text',
    category: 'Suggestions',
    step: 5,
    required: true,
    isActive: true
  },
  {
    id: 'suggestion_content',
    text: 'Konten media sosial yang disukai',
    type: 'text',
    category: 'Suggestions',
    step: 5,
    required: true,
    isActive: true
  }
];

export const createDefaultQuestionsForStore = async (storeId: string) => {
  // Function to create default questions for a store
  return defaultQuestionTemplate.map(question => ({
    ...question,
    storeId,
    createdAt: new Date().toISOString()
  }));
};