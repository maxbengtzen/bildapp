import React, { useState, useEffect, useCallback } from 'react';

const PDFPreviewModal = ({ 
  pdfData, 
  onClose, 
  onCreateNew, 
  saveBlob, 
  debugLog, 
  isIOS 
}) => {
  const [currentPdfBlob, setCurrentPdfBlob] = useState(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [supportsShare, setSupportsShare] = useState(false);

  useEffect(() => {
    if (!pdfData) return;

    debugLog('Showing PDF preview', { size: pdfData.size, filename: pdfData.filename });
    
    try {
      // Convert base64 to blob
      const binaryString = atob(pdfData.pdf_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setCurrentPdfBlob(blob);
      
      debugLog('PDF blob created', { blobSize: blob.size });
      
      // Check Web Share API support
      setSupportsShare(navigator.share && isIOS);
      
      // Detect browsers with poor PDF embed support
      const isEdge = /Edg/i.test(navigator.userAgent);
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
      const hasEmbedIssues = isIOS || isEdge || isSafari;
      
      debugLog('Browser detection', { isIOS, isEdge, isSafari, hasEmbedIssues });
      
      if (hasEmbedIssues) {
        debugLog('Browser with PDF embed issues detected - using fallback');
        setShowLoading(false);
        setShowFallback(true);
      } else {
        // Try to display PDF in browsers that might support it (Chrome, Firefox)
        debugLog('Attempting PDF embed in supported browser');
        setShowEmbed(true);
        
        // Set a timeout for embed loading
        const embedTimeout = setTimeout(() => {
          debugLog('PDF embed timeout - showing fallback');
          setShowLoading(false);
          setShowEmbed(false);
          setShowFallback(true);
        }, 2000);
        
        // Cleanup timeout if component unmounts
        return () => clearTimeout(embedTimeout);
      }
      
    } catch (err) {
      debugLog('ERROR: Failed to show PDF preview', { error: err.message, stack: err.stack });
      alert('Kunde inte visa PDF-förhandsvisning: ' + err.message);
    }
  }, [pdfData, debugLog, isIOS]);

  const handleEmbedLoad = useCallback(() => {
    debugLog('PDF embed loaded successfully');
    setShowLoading(false);
  }, [debugLog]);

  const handleEmbedError = useCallback(() => {
    debugLog('PDF embed failed, showing fallback');
    setShowLoading(false);
    setShowEmbed(false);
    setShowFallback(true);
  }, [debugLog]);

  const handleClose = useCallback(() => {
    debugLog('Closing PDF preview');
    onClose();
  }, [debugLog, onClose]);

  const handleShare = useCallback(async () => {
    if (!currentPdfBlob || !navigator.share) {
      debugLog('ERROR: Cannot share - no PDF blob or Web Share API not available');
      alert('Delning stöds inte i denna webbläsare');
      return;
    }
    
    try {
      debugLog('Attempting to share PDF via Web Share API');
      const file = new File([currentPdfBlob], pdfData.filename, {
        type: 'application/pdf'
      });
      
      await navigator.share({
        title: 'Gridprint PDF',
        text: `PDF med ${pdfData.image_count} bilder`,
        files: [file]
      });
      
      debugLog('PDF shared successfully');
    } catch (err) {
      debugLog('ERROR: Share failed', { error: err.message });
      if (err.name !== 'AbortError') {
        alert('Kunde inte dela PDF: ' + err.message);
      }
    }
  }, [currentPdfBlob, pdfData, debugLog]);

  const handleDownload = useCallback(() => {
    if (!currentPdfBlob) {
      debugLog('ERROR: No PDF blob available for download');
      alert('Ingen PDF tillgänglig för nedladdning');
      return;
    }
    
    debugLog('Downloading PDF');
    saveBlob(currentPdfBlob, pdfData.filename);
  }, [currentPdfBlob, pdfData, debugLog, saveBlob]);

  const handleCreateNew = useCallback(() => {
    debugLog('Creating new PDF');
    onCreateNew();
  }, [debugLog, onCreateNew]);

  if (!pdfData) return null;

  const layoutText = pdfData.grid_info?.layout === 'polaroid' ? 'Polaroid-stil' : 'Standard rutnät';
  const pdfInfo = `${pdfData.image_count} bilder • ${pdfData.grid_info?.cols}×${pdfData.grid_info?.rows} ${layoutText} • ${(pdfData.size / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-[95vw] max-w-6xl h-[90vh] max-h-screen">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">PDF Förhandsvisning</h3>
            <p className="text-sm text-base-content/70">{pdfInfo}</p>
          </div>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="bg-base-200 rounded-lg h-[60vh] mb-4 relative overflow-hidden">
          {showEmbed && currentPdfBlob && (
            <embed
              src={URL.createObjectURL(currentPdfBlob)}
              type="application/pdf"
              className="w-full h-full rounded-lg"
              onLoad={handleEmbedLoad}
              onError={handleEmbedError}
            />
          )}
          
          {showFallback && (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="text-6xl mb-4">📄</div>
                <h4 className="text-lg font-semibold text-base-content mb-2">
                  PDF Förhandsvisning
                </h4>
                <p className="text-base-content/70 mb-3">
                  {isIOS 
                    ? 'PDF kan inte visas direkt i iOS Safari'
                    : 'PDF kan inte visas i denna webbläsare'
                  }
                </p>
                <p className="text-sm text-base-content/50 mb-4">
                  PDF är redo - använd dela- eller ladda ner-knappen nedan
                </p>
                <div className="text-sm text-base-content/60 bg-base-100 rounded-lg p-3">
                  <div className="font-medium">{pdfInfo}</div>
                </div>
              </div>
            </div>
          )}
          
          {showLoading && (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {supportsShare && (
            <button 
              className="btn btn-primary flex-1" 
              onClick={handleShare}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Dela PDF
            </button>
          )}
          <button 
            className="btn btn-outline flex-1" 
            onClick={handleDownload}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Ladda ner
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={handleCreateNew}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Skapa ny
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};

export default PDFPreviewModal;