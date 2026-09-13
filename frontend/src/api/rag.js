import api from './axios';

export const getSubjects = async () => {
  const response = await api.get('/subjects/');
  return response.data;
};

export const getTopics = async (subjectId) => {
  const response = await api.get(`/subjects/${subjectId}/topics/`);
  return response.data;
};

export const getDocuments = async (params = {}) => {
  const response = await api.get('/subjects/admin/documents/', { params });
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/subjects/admin/documents/', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/subjects/admin/documents/${id}/`);
  return response.data;
};

export const generateQuestionsFromRAG = async (topicId, difficulty = 'all', count = 3, query = '') => {
  const response = await api.post('/subjects/admin/documents/generate-questions/', {
    topic_id: topicId,
    difficulty,
    count,
    query,
  });
  return response.data;
};

