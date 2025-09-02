import { useState, useCallback } from 'react';

const useFormState = () => {
  const [size, setSize] = useState(3);
  const [layout, setLayout] = useState('standard');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pdfCreationStarted, setPdfCreationStarted] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // Step progression logic
  const getStepStatus = useCallback(() => {
    return {
      size: size > 0,
      images: selectedFiles.length > 0,
      pdf: pdfCreationStarted
    };
  }, [size, selectedFiles.length, pdfCreationStarted]);

  // Size management
  const updateSize = useCallback((newSize, manual = false) => {
    setSize(newSize);
    setIsManualMode(manual);
  }, []);

  const setPresetSize = useCallback((presetSize) => {
    setSize(presetSize);
    setIsManualMode(false);
  }, []);

  const enableManualMode = useCallback(() => {
    setIsManualMode(true);
  }, []);

  // File management
  const addFiles = useCallback((newFiles) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Form submission state
  const startPdfCreation = useCallback(() => {
    setPdfCreationStarted(true);
  }, []);

  const resetPdfCreation = useCallback(() => {
    setPdfCreationStarted(false);
  }, []);

  // Reset entire form
  const resetForm = useCallback(() => {
    setSelectedFiles([]);
    setPdfCreationStarted(false);
    // Keep size and layout as user might want to create another PDF with same settings
  }, []);

  // Validation
  const isFormValid = useCallback(() => {
    return size > 0 && selectedFiles.length > 0;
  }, [size, selectedFiles.length]);

  return {
    // State
    size,
    layout,
    selectedFiles,
    pdfCreationStarted,
    isManualMode,
    
    // Computed
    stepStatus: getStepStatus(),
    isValid: isFormValid(),
    
    // Actions
    updateSize,
    setPresetSize,
    enableManualMode,
    setLayout,
    addFiles,
    removeFile,
    clearFiles,
    startPdfCreation,
    resetPdfCreation,
    resetForm
  };
};

export default useFormState;