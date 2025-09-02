import React, { useState, useCallback } from 'react';
import ProgressSteps from './ProgressSteps';
import SizeSelector from './SizeSelector';
import LayoutSelector from './LayoutSelector';
import FileUpload from './FileUpload';

const UploadForm = ({ formState, onPdfCreated, debugLog, isIOS }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    size,
    layout,
    selectedFiles,
    isManualMode,
    stepStatus,
    isValid,
    updateSize,
    setPresetSize,
    enableManualMode,
    setLayout,
    addFiles,
    startPdfCreation,
    resetPdfCreation
  } = formState;

  // Busy state helper function
  const withBusy = useCallback(async (fn) => {
    setIsSubmitting(true);
    try {
      return await fn();
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    debugLog('Form submitted', { selectedFilesCount: selectedFiles.length });
    
    if (selectedFiles.length === 0) {
      debugLog('ERROR: No files selected');
      alert('Välj bilder först');
      return;
    }

    const sizeVal = Math.max(0.1, parseFloat(size) || 5.5);
    
    debugLog('Starting PDF creation', { sizeVal, layout, filesCount: selectedFiles.length });

    await withBusy(async () => {
      try {
        // Activate step 3 when PDF creation starts
        startPdfCreation();
        
        // Build FormData directly from selectedFiles
        debugLog('Building FormData');
        const data = new FormData();
        data.append('size', String(sizeVal));
        data.append('layout', layout);
        data.append('preview', 'true'); // Enable preview mode
        
        selectedFiles.forEach((file, index) => {
          debugLog(`Adding file ${index}`, { name: file.name, type: file.type, size: file.size });
          data.append('images', file, file.name);
        });
        
        debugLog('FormData built, sending request to /upload', {
          size: sizeVal,
          layout: layout,
          preview: true,
          fileCount: selectedFiles.length
        });

        let res;
        try {
          res = await fetch('/upload', {
            method: 'POST',
            body: data
          });
          debugLog('Fetch completed', {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries())
          });
        } catch (networkErr) {
          debugLog('ERROR: Network fetch failed', { error: networkErr.message, stack: networkErr.stack });
          console.error('Fetch error:', networkErr);
          alert('Nätverksfel: ' + networkErr.message);
          return;
        }

        // Handle server response
        const contentType = res.headers.get('Content-Type') || '';
        debugLog('Response details', {
          ok: res.ok,
          status: res.status,
          contentType,
          contentLength: res.headers.get('Content-Length')
        });
        
        if (!res.ok) {
          const text = await res.text();
          debugLog('ERROR: Server error response', { status: res.status, text: text.slice(0, 500) });
          console.error('Upload failed:', res.status, text);
          alert(`Fel ${res.status}: ${text}`);
          return;
        }
        
        // Preview mode expects JSON response
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          debugLog('ERROR: Expected JSON response for preview mode', { contentType, responseText: text.slice(0, 500) });
          alert('Oväntat svar från servern: ' + text.slice(0, 200));
          return;
        }

        debugLog('Parsing JSON response');
        const jsonData = await res.json();
        debugLog('JSON response received', {
          success: jsonData.success,
          filename: jsonData.filename,
          size: jsonData.size,
          imageCount: jsonData.image_count
        });
        
        if (!jsonData.success || !jsonData.pdf_data) {
          debugLog('ERROR: Invalid response data');
          alert('Kunde inte skapa PDF: Ogiltigt svar från servern');
          return;
        }

        debugLog('PDF creation successful, showing preview');
        onPdfCreated(jsonData);
        debugLog('PDF preview shown successfully');

        // Reset creation state but keep files for potential re-creation
        resetPdfCreation();
        
      } catch (err) {
        debugLog('ERROR: Unexpected error in form submit', { error: err.message, stack: err.stack });
        throw err; // Re-throw to be caught by withBusy
      }
    });
  }, [selectedFiles, size, layout, debugLog, startPdfCreation, resetPdfCreation, withBusy, onPdfCreated]);

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="mx-auto max-w-md">
        <div className="card bg-base-200/60 backdrop-blur-md shadow-xl rounded-3xl">
          <div className="card-body space-y-5">
            {/* Progress Steps */}
            <ProgressSteps stepStatus={stepStatus} />

            {/* Size Selection */}
            <SizeSelector
              size={size}
              isManualMode={isManualMode}
              onSizeChange={updateSize}
              onPresetSelect={setPresetSize}
              onManualModeEnable={enableManualMode}
            />

            {/* Layout Selection */}
            <LayoutSelector
              layout={layout}
              onLayoutChange={setLayout}
            />

            {/* File Upload */}
            <FileUpload
              selectedFiles={selectedFiles}
              onFilesAdd={addFiles}
              debugLog={debugLog}
              isIOS={isIOS}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-2xl w-full"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Skapar...' : 'Skapa PDF'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;