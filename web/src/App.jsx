import React, { useState } from 'react';
import useIOSCompatibility from './hooks/useIOSCompatibility';
import useFormState from './hooks/useFormState';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import PDFPreviewModal from './components/PDFPreviewModal';
import Footer from './components/Footer';

function App() {
  const { isIOS, debugLog, saveBlob } = useIOSCompatibility();
  const formState = useFormState();
  
  const [pdfPreviewData, setPdfPreviewData] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handlePdfCreated = (pdfData) => {
    debugLog('PDF created successfully', { 
      size: pdfData.size, 
      filename: pdfData.filename 
    });
    setPdfPreviewData(pdfData);
    setShowPdfModal(true);
    formState.resetPdfCreation();
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setPdfPreviewData(null);
  };

  const handleCreateNewPdf = () => {
    debugLog('Creating new PDF');
    handleClosePdfModal();
    formState.resetForm();
  };

  return (
    <div className="min-h-dvh bg-base-100">
      <Header />
      
      <main className="px-5">
        <UploadForm 
          formState={formState}
          onPdfCreated={handlePdfCreated}
          debugLog={debugLog}
          isIOS={isIOS}
        />
        
        {showPdfModal && pdfPreviewData && (
          <PDFPreviewModal
            pdfData={pdfPreviewData}
            onClose={handleClosePdfModal}
            onCreateNew={handleCreateNewPdf}
            saveBlob={saveBlob}
            debugLog={debugLog}
            isIOS={isIOS}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;