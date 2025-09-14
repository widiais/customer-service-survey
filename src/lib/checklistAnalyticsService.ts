import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface ChecklistData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  options: string[];
  responses: string[][]; // Array of selected options for each response
  totalResponses: number;
  optionCounts: { [option: string]: number };
  optionPercentages: { [option: string]: number };
  checklistLimits?: {
    minSelections?: number;
    maxSelections?: number;
  };
}

export interface SurveyResponse {
  id: string;
  answers: Record<string, {
    questionText: string;
    questionType: 'text' | 'rating' | 'multiple_choice' | 'checklist';
    answer: string | number | string[];
    sectionName?: string;
    categoryName?: string;
  }>;
  questionGroupsOrder?: Array<{
    groupId: string;
    groupName: string;
    order: number;
    questionIds: string[];
  }>;
}

export class ChecklistAnalyticsService {
  /**
   * Fetch all survey responses for a specific store
   */
  static async fetchSurveyResponses(storeId: string): Promise<SurveyResponse[]> {
    try {
      const responsesRef = collection(db, `stores/${storeId}/responses`);
      const responsesQuery = query(responsesRef, orderBy('submittedAt', 'desc'));
      const responsesSnapshot = await getDocs(responsesQuery);

      const responses: SurveyResponse[] = [];
      responsesSnapshot.forEach((doc) => {
        const data = doc.data();
        responses.push({
          id: doc.id,
          answers: data.answers || {},
          questionGroupsOrder: data.questionGroupsOrder || []
        });
      });

      return responses;
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      throw error;
    }
  }

  /**
   * Extract checklist questions from survey responses
   */
  static extractChecklistQuestions(responses: SurveyResponse[]): ChecklistData[] {
    const checklistQuestionsMap = new Map<string, {
      questionText: string;
      sectionName: string;
      categoryName: string;
      options: string[];
      responses: string[][];
      checklistLimits?: {
        minSelections?: number;
        maxSelections?: number;
      };
    }>();

    // Process each response
    responses.forEach(response => {
      Object.entries(response.answers).forEach(([questionId, answerData]) => {
        if (answerData.questionType === 'checklist') {
          if (!checklistQuestionsMap.has(questionId)) {
            checklistQuestionsMap.set(questionId, {
              questionText: answerData.questionText,
              sectionName: answerData.sectionName || 'Umum',
              categoryName: answerData.categoryName || 'Umum',
              options: [],
              responses: [],
              checklistLimits: undefined
            });
          }

          const questionData = checklistQuestionsMap.get(questionId)!;
          
          // Convert answer to array of strings
          let selectedOptions: string[] = [];
          if (Array.isArray(answerData.answer)) {
            selectedOptions = answerData.answer as string[];
          } else if (typeof answerData.answer === 'string') {
            selectedOptions = [answerData.answer];
          }

          questionData.responses.push(selectedOptions);
        }
      });
    });

    // Convert to ChecklistData array
    const checklistData: ChecklistData[] = Array.from(checklistQuestionsMap.entries()).map(([questionId, data]) => {
      const totalResponses = data.responses.length;
      
      // Get all unique options from all responses
      const allOptions = new Set<string>();
      data.responses.forEach(response => {
        response.forEach(option => allOptions.add(option));
      });
      const options = Array.from(allOptions);

      // Count occurrences of each option
      const optionCounts: { [option: string]: number } = {};
      const optionPercentages: { [option: string]: number } = {};
      
      options.forEach(option => {
        const count = data.responses.filter(response => response.includes(option)).length;
        optionCounts[option] = count;
        optionPercentages[option] = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
      });

      return {
        questionId,
        questionText: data.questionText,
        sectionName: data.sectionName,
        categoryName: data.categoryName,
        options,
        responses: data.responses,
        totalResponses,
        optionCounts,
        optionPercentages,
        checklistLimits: data.checklistLimits
      };
    });

    return checklistData;
  }

  /**
   * Get checklist analytics for a specific store
   */
  static async getChecklistAnalytics(storeId: string): Promise<ChecklistData[]> {
    try {
      const responses = await this.fetchSurveyResponses(storeId);
      return this.extractChecklistQuestions(responses);
    } catch (error) {
      console.error('Error getting checklist analytics:', error);
      throw error;
    }
  }

  /**
   * Get overall checklist analytics across all stores
   */
  static async getOverallChecklistAnalytics(storeIds: string[]): Promise<ChecklistData[]> {
    try {
      const allResponses: SurveyResponse[] = [];
      
      // Fetch responses from all stores
      const storePromises = storeIds.map(storeId => this.fetchSurveyResponses(storeId));
      const storeResponses = await Promise.all(storePromises);
      
      // Flatten all responses
      storeResponses.forEach(responses => {
        allResponses.push(...responses);
      });

      return this.extractChecklistQuestions(allResponses);
    } catch (error) {
      console.error('Error getting overall checklist analytics:', error);
      throw error;
    }
  }

  /**
   * Filter checklist data by section or category
   */
  static filterChecklistData(
    checklistData: ChecklistData[], 
    filters: {
      sectionName?: string;
      categoryName?: string;
      minResponses?: number;
    }
  ): ChecklistData[] {
    return checklistData.filter(data => {
      if (filters.sectionName && data.sectionName !== filters.sectionName) {
        return false;
      }
      if (filters.categoryName && data.categoryName !== filters.categoryName) {
        return false;
      }
      if (filters.minResponses && data.totalResponses < filters.minResponses) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get checklist summary statistics
   */
  static getChecklistSummary(checklistData: ChecklistData[]): {
    totalQuestions: number;
    totalResponses: number;
    mostPopularOption: { questionId: string; option: string; count: number } | null;
    leastPopularOption: { questionId: string; option: string; count: number } | null;
  } {
    if (checklistData.length === 0) {
      return {
        totalQuestions: 0,
        totalResponses: 0,
        mostPopularOption: null,
        leastPopularOption: null
      };
    }

    const totalQuestions = checklistData.length;
    const totalResponses = checklistData.reduce((sum, data) => sum + data.totalResponses, 0);
    
    // Find most and least popular options across all questions
    let mostPopular = { questionId: '', option: '', count: 0 };
    let leastPopular = { questionId: '', option: '', count: Infinity };

    checklistData.forEach(data => {
      Object.entries(data.optionCounts).forEach(([option, count]) => {
        if (count > mostPopular.count) {
          mostPopular = { questionId: data.questionId, option, count };
        }
        if (count < leastPopular.count) {
          leastPopular = { questionId: data.questionId, option, count };
        }
      });
    });

    return {
      totalQuestions,
      totalResponses,
      mostPopularOption: mostPopular.count > 0 ? mostPopular : null,
      leastPopularOption: leastPopular.count < Infinity ? leastPopular : null
    };
  }
}
