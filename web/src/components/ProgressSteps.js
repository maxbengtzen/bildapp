import React, { useEffect, useRef } from 'react';

const ProgressSteps = ({ stepStatus }) => {
  const stepsRef = useRef(null);
  
  const steps = [
    { key: 'size', label: 'Storlek' },
    { key: 'images', label: 'Bilder' },
    { key: 'pdf', label: 'Skapa PDF' }
  ];

  useEffect(() => {
    // Debug: Log steps container dimensions
    if (stepsRef.current) {
      const rect = stepsRef.current.getBoundingClientRect();
      const parentRect = stepsRef.current.parentElement?.getBoundingClientRect();
      console.log('DEBUG: ProgressSteps dimensions', {
        stepsWidth: rect.width,
        stepsScrollWidth: stepsRef.current.scrollWidth,
        parentWidth: parentRect?.width,
        isOverflowing: stepsRef.current.scrollWidth > rect.width,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      });
    }
  }, []);

  return (
    <ul ref={stepsRef} className="steps w-full mb-2">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={`step ${stepStatus[step.key] ? 'step-primary' : ''}`}
          data-content={index + 1}
        >
          {step.label}
        </li>
      ))}
    </ul>
  );
};

export default ProgressSteps;