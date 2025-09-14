import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface RatingData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  ratings: number[];
  averageRating: number;
  totalResponses: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

export interface SurveyResponse {
  id: string;
  answers: Record<string, {
    questionText: string;
    questionType: 'text' | 'rating' | 'multiple_choice';
    answer: string | number;
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

export class RatingAnalyticsService {
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
   * Extract rating questions from survey responses
   */
  static extractRatingQuestions(responses: SurveyResponse[]): RatingData[] {
    const ratingQuestionsMap = new Map<string, {
      questionText: string;
      sectionName: string;
      categoryName: string;
      ratings: number[];
    }>();

    // Process each response
    responses.forEach(response => {
      Object.entries(response.answers).forEach(([questionId, answerData]) => {
        if (answerData.questionType === 'rating' && typeof answerData.answer === 'number') {
          if (!ratingQuestionsMap.has(questionId)) {
            ratingQuestionsMap.set(questionId, {
              questionText: answerData.questionText,
              sectionName: answerData.sectionName || 'Umum',
              categoryName: answerData.categoryName || 'Umum',
              ratings: []
            });
          }

          const questionData = ratingQuestionsMap.get(questionId)!;
          questionData.ratings.push(answerData.answer);
        }
      });
    });

    // Convert to RatingData array
    const ratingData: RatingData[] = Array.from(ratingQuestionsMap.entries()).map(([questionId, data]) => {
      const ratings = data.ratings;
      const totalResponses = ratings.length;
      const averageRating = totalResponses > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / totalResponses : 0;

      // Create distribution (1-5 stars)
      const distribution = [1, 2, 3, 4, 5].map(rating => {
        const count = ratings.filter(r => r === rating).length;
        const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
        return { rating, count, percentage };
      });

      return {
        questionId,
        questionText: data.questionText,
        sectionName: data.sectionName,
        categoryName: data.categoryName,
        ratings,
        averageRating,
        totalResponses,
        distribution
      };
    });

    return ratingData;
  }

  /**
   * Get rating analytics for a specific store
   */
  static async getRatingAnalytics(storeId: string): Promise<RatingData[]> {
    try {
      const responses = await this.fetchSurveyResponses(storeId);
      return this.extractRatingQuestions(responses);
    } catch (error) {
      console.error('Error getting rating analytics:', error);
      throw error;
    }
  }

  /**
   * Get overall rating statistics across all stores
   */
  static async getOverallRatingAnalytics(storeIds: string[]): Promise<RatingData[]> {
    try {
      const allResponses: SurveyResponse[] = [];
      
      // Fetch responses from all stores
      const storePromises = storeIds.map(storeId => this.fetchSurveyResponses(storeId));
      const storeResponses = await Promise.all(storePromises);
      
      // Flatten all responses
      storeResponses.forEach(responses => {
        allResponses.push(...responses);
      });

      return this.extractRatingQuestions(allResponses);
    } catch (error) {
      console.error('Error getting overall rating analytics:', error);
      throw error;
    }
  }

  /**
   * Filter rating data by section or category
   */
  static filterRatingData(
    ratingData: RatingData[], 
    filters: {
      sectionName?: string;
      categoryName?: string;
      minResponses?: number;
    }
  ): RatingData[] {
    return ratingData.filter(data => {
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
   * Get rating summary statistics
   */
  static getRatingSummary(ratingData: RatingData[]): {
    totalQuestions: number;
    totalResponses: number;
    averageRating: number;
    highestRatedQuestion: RatingData | null;
    lowestRatedQuestion: RatingData | null;
  } {
    if (ratingData.length === 0) {
      return {
        totalQuestions: 0,
        totalResponses: 0,
        averageRating: 0,
        highestRatedQuestion: null,
        lowestRatedQuestion: null
      };
    }

    const totalQuestions = ratingData.length;
    const totalResponses = ratingData.reduce((sum, data) => sum + data.totalResponses, 0);
    const averageRating = ratingData.reduce((sum, data) => sum + data.averageRating, 0) / totalQuestions;
    
    const highestRatedQuestion = ratingData.reduce((highest, current) => 
      current.averageRating > highest.averageRating ? current : highest
    );
    
    const lowestRatedQuestion = ratingData.reduce((lowest, current) => 
      current.averageRating < lowest.averageRating ? current : lowest
    );

    return {
      totalQuestions,
      totalResponses,
      averageRating,
      highestRatedQuestion,
      lowestRatedQuestion
    };
  }
}
