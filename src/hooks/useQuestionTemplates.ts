import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question, QuestionTemplate } from '@/lib/types';
import { defaultQuestionTemplate } from '@/lib/questionTemplates';

export function useQuestionTemplates() {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'questionTemplates'));
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionTemplate[];
      setTemplates(templatesData);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplate = async () => {
    try {
      const defaultTemplate: QuestionTemplate = {
        id: 'default-labbaik-survey',
        name: 'Default Labbaik Survey',
        description: 'Template survei standar untuk semua toko Labbaik Chicken',
        questions: defaultQuestionTemplate,
        createdAt: new Date().toISOString(),
        isDefault: true
      };

      await setDoc(doc(db, 'questionTemplates', 'default-labbaik-survey'), defaultTemplate);
      await fetchTemplates();
    } catch (err) {
      setError('Failed to create default template');
      console.error('Error creating default template:', err);
      throw err;
    }
  };

  const applyTemplateToStore = async (templateId: string, storeId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Create questions for the store
      const storeQuestions = template.questions.map(question => ({
        ...question,
        storeId,
        createdAt: new Date().toISOString()
      }));

      // Add each question to the store's questions collection
      for (const question of storeQuestions) {
        await addDoc(collection(db, 'questions'), question);
      }

      return storeQuestions;
    } catch (err) {
      setError('Failed to apply template to store');
      console.error('Error applying template:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createDefaultTemplate,
    applyTemplateToStore,
    refetch: fetchTemplates
  };
}