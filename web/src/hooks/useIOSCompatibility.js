import { useState, useEffect, useCallback } from 'react';

const useIOSCompatibility = () => {
  const [debugLogs, setDebugLogs] = useState([]);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iosDetected = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    setIsIOS(iosDetected);
  }, []);

  const debugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      userAgent: navigator.userAgent
    };
    
    setDebugLogs(prev => [...prev, logEntry]);
    console.log(`[DEBUG ${timestamp}] ${message}`, data || '');
    
    // iOS debug alerts removed - keeping console logging only
  }, [isIOS]);

  useEffect(() => {
    debugLog('App initialized', { isIOS, userAgent: navigator.userAgent });

    // Global error handlers for iOS debugging
    const handleError = (e) => {
      debugLog('ERROR: JavaScript error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error?.toString()
      });
    };

    const handleUnhandledRejection = (e) => {
      // Filter out common harmless promise rejections
      const reason = e.reason?.toString() || '';
      
      // Skip service worker related rejections that are expected
      if (reason.includes('quota') ||
          reason.includes('ServiceWorker') ||
          reason.includes('cache') ||
          reason.includes('AbortError') ||
          reason.includes('NetworkError')) {
        console.debug('Ignoring harmless promise rejection:', reason);
        return;
      }
      
      // Only log unexpected promise rejections
      debugLog('ERROR: Unhandled promise rejection', {
        reason: reason,
        promise: e.promise
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [debugLog, isIOS]);

  // iOS-specific blob saving function
  const saveBlob = useCallback((blob, filename) => {
    debugLog('saveBlob called', { blobSize: blob.size, blobType: blob.type, filename, isIOS });
    
    try {
      const url = URL.createObjectURL(blob);
      debugLog('Object URL created', { url: url.substring(0, 50) + '...' });
      
      if (isIOS) {
        debugLog('Using iOS fallback - opening in new tab');
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          debugLog('ERROR: Failed to open new window - popup blocked?');
          alert('Popup blockerad? PDF skapad men kunde inte öppnas automatiskt.');
        } else {
          debugLog('New window opened successfully');
        }
        setTimeout(() => {
          URL.revokeObjectURL(url);
          debugLog('Object URL revoked after timeout');
        }, 10_000);
        return;
      }
      
      debugLog('Using standard download method');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      debugLog('Standard download completed');
    } catch (err) {
      debugLog('ERROR: saveBlob failed', { error: err.message, stack: err.stack });
      alert('Kunde inte spara PDF: ' + err.message);
    }
  }, [isIOS, debugLog]);

  return {
    isIOS,
    debugLog,
    debugLogs,
    saveBlob
  };
};

export default useIOSCompatibility;