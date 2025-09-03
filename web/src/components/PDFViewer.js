import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ 
  pdfBlob, 
  debugLog, 
  className = '',
  onLoadSuccess,
  onLoadError 
}) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(null);
  const [renderTask, setRenderTask] = useState(null);

  // Load PDF document
  useEffect(() => {
    if (!pdfBlob) return;

    debugLog('Loading PDF with pdfjs-dist', { blobSize: pdfBlob.size });
    setLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        debugLog('PDF arrayBuffer created', { size: arrayBuffer.byteLength });
        
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          // Disable worker temporarily for troubleshooting
          disableWorker: false,
          isEvalSupported: false
        });

        const pdfDoc = await loadingTask.promise;
        debugLog('PDF document loaded successfully', { numPages: pdfDoc.numPages });
        
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setPageNumber(1);
        setLoading(false);
        
        // Set scale to fit container width naturally
        setScale(1.0);
        
        if (onLoadSuccess) onLoadSuccess({ numPages: pdfDoc.numPages });
        
      } catch (err) {
        debugLog('ERROR: PDF loading failed', { 
          error: err.message, 
          name: err.name,
          stack: err.stack 
        });
        setError({
          name: err.name || 'PDFLoadError',
          message: err.message || 'Failed to load PDF',
          userFriendlyMessage: 'PDF kunde inte laddas - kontrollera att filen är giltig'
        });
        setLoading(false);
        if (onLoadError) onLoadError(err);
      }
    };

    loadPDF();
  }, [pdfBlob, debugLog, onLoadSuccess, onLoadError]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;
    
    const renderPage = async () => {
      try {
        // Cancel previous render task if exists
        if (renderTask) {
          renderTask.cancel();
          setRenderTask(null);
        }

        if (cancelled) return;

        debugLog('Rendering page', { pageNumber, scale });
        
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render page
        const newRenderTask = page.render({
          canvasContext: context,
          viewport: viewport
        });
        
        setRenderTask(newRenderTask);
        
        try {
          await newRenderTask.promise;
          if (!cancelled) {
            debugLog('Page rendered successfully', { pageNumber });
            setRenderTask(null);
          }
        } catch (renderErr) {
          if (renderErr.name === 'RenderingCancelledException') {
            debugLog('Page rendering cancelled (expected)');
          } else {
            throw renderErr;
          }
        }
        
      } catch (err) {
        if (!cancelled) {
          debugLog('ERROR: Page rendering failed', {
            error: err.message,
            pageNumber
          });
        }
      }
    };

    renderPage();
    
    // Cleanup function
    return () => {
      cancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber, scale, debugLog]);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      debugLog('Navigate to previous page', { newPage: pageNumber - 1 });
    }
  }, [pageNumber, debugLog]);

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
      debugLog('Navigate to next page', { newPage: pageNumber + 1 });
    }
  }, [pageNumber, numPages, debugLog]);

  const handlePageInputChange = useCallback((e) => {
    const page = parseInt(e.target.value, 10);
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
      debugLog('Navigate to page via input', { newPage: page });
    }
  }, [numPages, debugLog]);


  // Generate pagination buttons for daisyUI pagination
  const generatePaginationButtons = useCallback(() => {
    if (!numPages || numPages <= 1) return [];
    
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    if (pageNumber > 3 && numPages > maxVisiblePages) {
      buttons.push(1);
      if (pageNumber > 4) buttons.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(1, pageNumber - 2);
    const end = Math.min(numPages, pageNumber + 2);
    
    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }
    
    // Always show last page
    if (pageNumber < numPages - 2 && numPages > maxVisiblePages) {
      if (pageNumber < numPages - 3) buttons.push('...');
      buttons.push(numPages);
    }
    
    return buttons;
  }, [pageNumber, numPages]);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-4 md:p-8 max-w-md">
          <div className="text-4xl md:text-6xl mb-4">⚠️</div>
          <h4 className="text-base md:text-lg font-semibold text-error mb-2">
            PDF kunde inte laddas
          </h4>
          <p className="text-sm md:text-base text-base-content/70 mb-4">
            {error.userFriendlyMessage || error.message || 'Ett okänt fel uppstod'}
          </p>
          <div className="text-xs md:text-sm text-base-content/50 bg-base-100 rounded-lg p-3 mb-4">
            Försök ladda ner PDF:en istället
          </div>
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-left bg-base-200 rounded p-2">
              <summary className="cursor-pointer text-base-content/60">Debug info</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {JSON.stringify({
                  name: error.name,
                  message: error.message,
                  worker: pdfjsLib.GlobalWorkerOptions.workerSrc
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-base-content/70">Laddar PDF med PDF.js...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* PDF Canvas Viewer */}
      <div className="flex-1 overflow-auto bg-base-200 rounded-lg mb-4">
        <div className="flex justify-center p-2 md:p-4">
          <canvas
            ref={canvasRef}
            className="shadow-lg rounded-lg max-w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Simple Page Navigation */}
      {numPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            {/* Previous button */}
            <button
              className="join-item btn btn-sm bg-base-200 hover:btn-primary"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              ←
            </button>
            
            {/* Current page number */}
            <span className="join-item btn btn-sm bg-base-200 text-base-content">
              {pageNumber}
            </span>
            
            {/* Next button */}
            <button
              className="join-item btn btn-sm bg-base-200 hover:btn-primary"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;