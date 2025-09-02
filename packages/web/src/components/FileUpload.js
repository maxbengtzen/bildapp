import React, { useRef, useCallback } from 'react';

const FileUpload = ({ 
  selectedFiles, 
  onFilesAdd, 
  debugLog, 
  isIOS 
}) => {
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    debugLog('File input change event triggered', {
      filesLength: files?.length,
      isIOS
    });
    
    // iOS Safari can sometimes have issues with FileList, so add extra checks
    const fileArray = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          fileArray.push(file);
        }
      }
    }
    
    debugLog('Files extracted from input', { extractedCount: fileArray.length });
    handleNewFiles(fileArray);
  }, [debugLog, isIOS]);

  const handleNewFiles = useCallback((files) => {
    try {
      debugLog('handleNewFiles called', {
        filesCount: files.length,
        fileTypes: files.map(f => f.type),
        fileSizes: files.map(f => f.size),
        fileNames: files.map(f => f.name)
      });
      
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      debugLog('Filtered image files', {
        originalCount: files.length,
        imageCount: imageFiles.length,
        rejectedFiles: files.filter(f => !f.type.startsWith('image/')).map(f => ({ name: f.name, type: f.type }))
      });
      
      if (imageFiles.length > 0) {
        onFilesAdd(imageFiles);
        debugLog('Files added successfully', { totalSelected: selectedFiles.length + imageFiles.length });
      }
      
    } catch (err) {
      debugLog('ERROR: File handling failed', { error: err.message, stack: err.stack });
      console.error('File handling error:', err);
      alert('Kunde inte lägga till filerna: ' + err.message);
    }
  }, [debugLog, selectedFiles.length, onFilesAdd]);

  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isIOS) {
      e.currentTarget.classList.add('bg-base-200/60');
    }
  }, [isIOS]);

  const handleDragLeave = useCallback((e) => {
    if (!isIOS) {
      e.currentTarget.classList.remove('bg-base-200/60');
    }
  }, [isIOS]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!isIOS) {
      e.currentTarget.classList.remove('bg-base-200/60');
      const files = Array.from(e.dataTransfer.files);
      handleNewFiles(files);
    }
  }, [isIOS, handleNewFiles]);

  const handleLabelClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // iOS Safari often has issues with drag and drop, so add extra safety
  const dragAndDropProps = !isIOS ? {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  } : {};

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text font-medium">Bilder</span>
      </div>
      <label 
        className="border-2 border-dashed rounded-2xl p-6 h-32 text-center cursor-pointer hover:bg-base-200 transition flex flex-col justify-center"
        onClick={handleLabelClick}
        {...dragAndDropProps}
      >
        <div className="text-base-content/70">
          <span className="font-medium">Lägg till bilder</span> eller släpp dem här
        </div>
        <div className="text-xs opacity-70 mt-1">
          PNG/JPG/HEIC/HEIF • flera filer stöds
        </div>
        <input
          ref={fileInputRef}
          id="fileInput"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </label>
      {/* File count display */}
      <div className="text-xs text-base-content/70 mt-1" id="imageCount">
        {selectedFiles.length} bilder valda
      </div>
    </div>
  );
};

export default FileUpload;