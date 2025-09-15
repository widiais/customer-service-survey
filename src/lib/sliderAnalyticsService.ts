import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface SliderData {
  questionId: string;
  questionText: string;
  sectionName: string;
  categoryName: string;
  values: number[]; // raw slider values (1-10)
  average: number;
  totalResponses: number;
  distribution: { value: number; count: number; percentage: number }[]; // 1..10
}

export interface SurveyResponse {
  id: string;
  answers: Record<string, {
    questionText: string;
    questionType: 'text' | 'rating' | 'multiple_choice' | 'checklist' | 'slider';
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

export class SliderAnalyticsService {
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
      console.error('Error fetching survey responses (slider):', error);
      throw error;
    }
  }

  static extractSliderQuestions(responses: SurveyResponse[]): SliderData[] {
    const sliderMap = new Map<string, {
      questionText: string;
      sectionName: string;
      categoryName: string;
      values: number[];
    }>();

    responses.forEach(response => {
      Object.entries(response.answers).forEach(([questionId, answerData]) => {
        if (answerData.questionType === 'slider' && typeof answerData.answer === 'number') {
          if (!sliderMap.has(questionId)) {
            sliderMap.set(questionId, {
              questionText: answerData.questionText,
              sectionName: answerData.sectionName || 'Umum',
              categoryName: answerData.categoryName || 'Umum',
              values: []
            });
          }
          const data = sliderMap.get(questionId)!;
          data.values.push(answerData.answer);
        }
      });
    });

    const sliderData: SliderData[] = Array.from(sliderMap.entries()).map(([questionId, data]) => {
      const values = data.values;
      const totalResponses = values.length;
      const average = totalResponses > 0 ? values.reduce((s, v) => s + v, 0) / totalResponses : 0;

      const distribution = Array.from({ length: 10 }, (_, i) => i + 1).map(value => {
        const count = values.filter(v => v === value).length;
        const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
        return { value, count, percentage };
      });

      return {
        questionId,
        questionText: data.questionText,
        sectionName: data.sectionName,
        categoryName: data.categoryName,
        values,
        average,
        totalResponses,
        distribution
      };
    });

    return sliderData;
  }

  static async getSliderAnalytics(storeId: string): Promise<SliderData[]> {
    const responses = await this.fetchSurveyResponses(storeId);
    return this.extractSliderQuestions(responses);
  }
}


