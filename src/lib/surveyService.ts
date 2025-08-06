import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Store } from '@/lib/types';
import { StoreAccessService } from '@/lib/storeAccessService';

export interface SurveyResponse {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone?: string;
  answers: Record<string, unknown>;
  createdAt: string;
  [key: string]: unknown;
}

export class SurveyService {
  /**
   * Check if user can delete survey responses for a store
   */
  static canDeleteSurveyResponse(user: User | null, store: Store): boolean {
    if (!user || !user.isActive) return false;
    
    // Super admin can delete any survey response
    if (user.role === 'super_admin') return true;
    
    // Store managers can delete responses for their stores
    return StoreAccessService.canManageStore(user, store);
  }

  /**
   * Get all survey responses for accessible stores
   */
  static async getSurveyResponses(user: User | null, stores: Store[]): Promise<SurveyResponse[]> {
    if (!user) return [];
    
    try {
      const accessibleStores = StoreAccessService.filterAccessibleStores(user, stores);
      const accessibleStoreIds = accessibleStores.map(store => store.id);
      
      if (accessibleStoreIds.length === 0) return [];
      
      const querySnapshot = await getDocs(collection(db, 'survey_responses'));
      const responses = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SurveyResponse))
        .filter(response => accessibleStoreIds.includes(response.storeId));
      
      return responses;
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      throw new Error('Failed to fetch survey responses');
    }
  }

  /**
   * Get survey responses for a specific store
   */
  static async getSurveyResponsesByStore(storeId: string): Promise<SurveyResponse[]> {
    try {
      const q = query(
        collection(db, 'survey_responses'), 
        where('storeId', '==', storeId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SurveyResponse));
    } catch (error) {
      console.error('Error fetching survey responses by store:', error);
      throw new Error('Failed to fetch survey responses');
    }
  }

  /**
   * Delete a survey response
   * @param responsePath - Full path to the document (e.g., 'stores/storeId/responses/responseId')
   */
  static async deleteSurveyResponse(responsePath: string): Promise<void> {
    try {
      await deleteDoc(doc(db, responsePath));
    } catch (error) {
      console.error('Error deleting survey response:', error);
      throw new Error('Failed to delete survey response');
    }
  }

  /**
   * Delete multiple survey responses
   */
  static async deleteSurveyResponses(responseIds: string[]): Promise<void> {
    try {
      const deletePromises = responseIds.map(id => 
        deleteDoc(doc(db, 'survey_responses', id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting survey responses:', error);
      throw new Error('Failed to delete survey responses');
    }
  }

  /**
   * Delete all survey responses for a store
   */
  static async deleteAllSurveyResponsesByStore(storeId: string): Promise<void> {
    try {
      const responses = await this.getSurveyResponsesByStore(storeId);
      const responseIds = responses.map(response => response.id);
      
      if (responseIds.length > 0) {
        await this.deleteSurveyResponses(responseIds);
      }
    } catch (error) {
      console.error('Error deleting all survey responses by store:', error);
      throw new Error('Failed to delete all survey responses for store');
    }
  }
}