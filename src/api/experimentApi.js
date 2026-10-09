import api from './axios';

// Get all experiments with optional labId filter
export const getExperiments = async (labId) => {
  const params = labId ? { labId } : {};
  const response = await api.get('/experiments', { params });
  return response.data;
};

// Get single experiment with procedure steps, required components, and formulas
export const getExperimentById = async (id) => {
  const response = await api.get(`/experiments/${id}`);
  return response.data;
};

// Create a new curriculum experiment
export const createExperiment = async (expData) => {
  const response = await api.post('/experiments', expData);
  return response.data;
};

// Update experiment basic information
export const updateExperiment = async (id, expData) => {
  const response = await api.put(`/experiments/${id}`, expData);
  return response.data;
};

// Delete an experiment
export const deleteExperiment = async (id) => {
  const response = await api.delete(`/experiments/${id}`);
  return response.data;
};

// Add a procedure step to an experiment
export const addStep = async (experimentId, stepData) => {
  const response = await api.post(`/experiments/${experimentId}/steps`, stepData);
  return response.data;
};

// Delete a step
export const deleteStep = async (stepId) => {
  const response = await api.delete(`/experiments/steps/${stepId}`);
  return response.data;
};

// Add required component to an experiment
export const addComponentRequirement = async (experimentId, compData) => {
  const response = await api.post(`/experiments/${experimentId}/components`, compData);
  return response.data;
};

// Delete component requirement
export const deleteComponentRequirement = async (id) => {
  const response = await api.delete(`/experiments/components/${id}`);
  return response.data;
};

// Add formula to an experiment
export const addFormula = async (experimentId, formulaData) => {
  const response = await api.post(`/experiments/${experimentId}/formulas`, formulaData);
  return response.data;
};

// Delete formula
export const deleteFormula = async (formulaId) => {
  const response = await api.delete(`/experiments/formulas/${formulaId}`);
  return response.data;
};
