export interface UserPermissions {
  subject: boolean;
  survey: {
    results: boolean;
    analytics: boolean;
    grafik: boolean;
  };
  questions: {
    create: boolean;
    groups: boolean;
    categories: boolean;
    collection: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'staff';
  name: string;
  permissions?: UserPermissions;
  isActive: boolean;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  area: string;
  phone: string;
  email: string;
  manager: string;
  isActive: boolean;
  createdAt: string;
  questionGroupIds?: string[];
  createdBy: string; // User ID of creator
  managers: string[]; // Array of User IDs who can manage this store
  logoUrl?: string; // URL logo store
}

export interface CustomerInfo {
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  agreeToMembership: boolean;
  agreeToPromo: boolean;
}

export interface MembershipDetails {
  age: string;
  profession: string;
  incomeRange: string;
  dailyActivities: string;
  hobbies: string;
  preferredSocialMedia: string;
}

export interface CustomerBehavior {
  preferredTimeToBuy: 'Pagi' | 'Siang' | 'Sore' | 'Malam';
  orderingMethod: 'Datang Langsung' | 'Go Food' | 'Grab Food' | 'Shopee Food';
  favoriteMenu: string;
  loyaltyFactors: string;
  hasRecommendedBrand: boolean;
}

export interface PainPoints {
  diningProblems: string;
  orderingDisappointments: string;
  productTrialConcerns: string;
}

export interface Suggestions {
  expectationsForUs: string;
  expectedPromos: string;
  preferredSocialMediaContent: string;
}

export interface Questionnaire {
  id: string;
  storeId: string;
  submittedAt: Date;
  customerInfo: CustomerInfo;
  membershipDetails?: MembershipDetails;
  customerBehavior: CustomerBehavior;
  painPoints: PainPoints;
  suggestions: Suggestions;
}

// Add this export
export type QuestionType = 'text' | 'rating' | 'multiple_choice' | 'checklist';

export interface ChecklistLimits {
  minSelections?: number;
  maxSelections?: number; // undefined means unlimited
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType; // Use the exported type
  options?: string[];
  checklistLimits?: ChecklistLimits; // Only for checklist type
  categoryId: string;
  isActive: boolean;
  createdAt: string;
}

// New interfaces for the restructured system
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface QuestionGroup {
  id: string;
  name: string;
  description?: string;
  questionIds: string[]; // Array of question IDs
  mandatoryQuestionIds?: string[]; // Array of mandatory question IDs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hapus atau komentari interface QuestionTemplate jika tidak diperlukan lagi
// export interface QuestionTemplate {
//   id: string;
//   name: string;
//   description: string;
//   questions: Question[];
//   createdAt: string;
//   isDefault?: boolean;
// }