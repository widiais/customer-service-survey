import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface MultipleChoiceData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  totalResponses: number;
  optionCounts: { [option: string]: number };
  optionPercentages: { [option: string]: number };
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

export class MultipleChoiceAnalyticsService {
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
   * Extract multiple choice questions from survey responses
   */
  static extractMultipleChoiceQuestions(responses: SurveyResponse[]): MultipleChoiceData[] {
    const multipleChoiceQuestionsMap = new Map<string, {
      questionText: string;
      sectionName: string;
      categoryName: string;
      optionCounts: { [option: string]: number };
    }>();

    // Process each response
    responses.forEach(response => {
      Object.entries(response.answers).forEach(([questionId, answerData]) => {
        if (answerData.questionType === 'multiple_choice' && typeof answerData.answer === 'string') {
          if (!multipleChoiceQuestionsMap.has(questionId)) {
            multipleChoiceQuestionsMap.set(questionId, {
              questionText: answerData.questionText,
              sectionName: answerData.sectionName || 'Umum',
              categoryName: answerData.categoryName || 'Umum',
              optionCounts: {}
            });
          }

          const questionData = multipleChoiceQuestionsMap.get(questionId)!;
          const answer = answerData.answer as string;
          
          // Initialize option count if not exists
          if (!questionData.optionCounts[answer]) {
            questionData.optionCounts[answer] = 0;
          }
          
          questionData.optionCounts[answer]++;
        }
      });
    });

    // Convert to MultipleChoiceData array
    const multipleChoiceData: MultipleChoiceData[] = Array.from(multipleChoiceQuestionsMap.entries()).map(([questionId, data]) => {
      const totalResponses = Object.values(data.optionCounts).reduce((sum, count) => sum + count, 0);
      
      // Calculate percentages
      const optionPercentages: { [option: string]: number } = {};
      Object.keys(data.optionCounts).forEach(option => {
        optionPercentages[option] = totalResponses > 0 
          ? Math.round((data.optionCounts[option] / totalResponses) * 100 * 100) / 100
          : 0;
      });

      return {
        questionId,
        questionText: data.questionText,
        sectionName: data.sectionName,
        categoryName: data.categoryName,
        totalResponses,
        optionCounts: data.optionCounts,
        optionPercentages
      };
    });

    return multipleChoiceData;
  }

  /**
   * Get multiple choice analytics for a specific store
   */
  static async getMultipleChoiceAnalytics(storeId: string): Promise<MultipleChoiceData[]> {
    try {
      const responses = await this.fetchSurveyResponses(storeId);
      return this.extractMultipleChoiceQuestions(responses);
    } catch (error) {
      console.error('Error getting multiple choice analytics:', error);
      throw error;
    }
  }
}
