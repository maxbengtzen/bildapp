# React Component Breakdown for Gridprint

## Current Frontend Analysis

### Main Structure (from index.html)
- Single-page application with complex form handling
- iOS Safari compatibility with extensive debugging
- PWA functionality with service worker
- Modal-based PDF preview system

### Proposed React Component Architecture

#### Core Layout Components
1. **App.jsx** - Main application wrapper
   - Theme provider integration
   - Global state management
   - Error boundary

2. **Header.jsx** - Application header
   - Title: "Gridprint"
   - Subtitle: "Skapa utskriftsvänliga bildrutor i PDF"

3. **MainContent.jsx** - Main content wrapper
   - Contains form and modal

#### Form Components
4. **UploadForm.jsx** - Main form container
   - Form state management
   - Submit handling
   - Step progression

5. **ProgressSteps.jsx** - Step indicator
   - Steps: Storlek, Bilder, Skapa PDF
   - Dynamic step state updates

6. **SizeSelector.jsx** - Image size selection
   - Preset badges: 3cm, 5cm, 7cm
   - Manual input toggle
   - Badge state management

7. **LayoutSelector.jsx** - Layout selection
   - Radio cards: Standard vs Polaroid
   - Visual selection feedback

8. **FileUpload.jsx** - File upload component
   - Drag and drop functionality
   - File input handling
   - Thumbnail preview
   - iOS compatibility layer

#### Modal Components
9. **PDFPreviewModal.jsx** - PDF preview and actions
   - PDF embed with fallbacks
   - iOS Safari compatibility
   - Share and download functionality

#### Custom Hooks
10. **useFileUpload.js** - File upload logic
    - File handling and validation
    - Drag and drop functionality
    - iOS compatibility checks

11. **useTheme.js** - Theme management
    - System theme detection
    - Theme switching logic

12. **usePDFPreview.js** - PDF preview logic
    - PDF blob handling
    - Browser compatibility detection
    - Share API integration

13. **useIOSCompatibility.js** - iOS-specific functionality
    - Debug logging system
    - Safari detection
    - Error handling

14. **useFormState.js** - Form state management
    - Size, layout, files state
    - Validation logic
    - Step progression

### Key Features to Preserve
- iOS Safari debugging system
- Web Share API integration
- PDF preview with fallbacks
- Service worker functionality
- PWA manifest handling
- Drag and drop with iOS alternatives
- Theme system integration
- Error handling and logging

### Technical Requirements
- React 18+ with hooks
- Tailwind CSS + DaisyUI integration
- File API compatibility
- Service Worker preservation
- Responsive design maintenance