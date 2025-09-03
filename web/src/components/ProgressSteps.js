import React from 'react';

const ProgressSteps = ({ stepStatus }) => {
  const steps = [
    { key: 'size', label: 'Storlek' },
    { key: 'images', label: 'Bilder' },
    { key: 'pdf', label: 'Skapa PDF' }
  ];

  return (
    <ul className="steps w-full mb-2">
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