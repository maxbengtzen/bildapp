import React from 'react';

const SizeSelector = ({ 
  size, 
  isManualMode, 
  onSizeChange, 
  onPresetSelect, 
  onManualModeEnable 
}) => {
  const presetSizes = [3, 5, 7];

  const handlePresetClick = (presetSize) => {
    onPresetSelect(presetSize);
    
    // Add subtle feedback animation
    const badge = document.querySelector(`[data-size="${presetSize}"]`);
    if (badge) {
      badge.style.transform = 'scale(0.95)';
      setTimeout(() => {
        badge.style.transform = '';
      }, 100);
    }
  };

  const handleManualClick = () => {
    onManualModeEnable();
    
    // Add subtle feedback animation
    const manualBadge = document.querySelector('.manual-badge');
    if (manualBadge) {
      manualBadge.style.transform = 'scale(0.95)';
      setTimeout(() => {
        manualBadge.style.transform = '';
      }, 100);
    }
    
    // Focus on input after a brief delay
    setTimeout(() => {
      const input = document.getElementById('size');
      if (input) input.focus();
    }, 100);
  };

  const getBadgeClasses = (presetSize) => {
    const isActive = Math.abs(size - presetSize) < 0.01 && !isManualMode;
    return `badge badge-lg cursor-pointer preset-badge w-full ${
      isActive
        ? 'badge-primary'
        : 'bg-base-300 text-base-content/70'
    }`;
  };

  const getManualBadgeClasses = () => {
    const isActive = isManualMode || !presetSizes.some(preset => Math.abs(size - preset) < 0.01);
    return `badge badge-lg cursor-pointer manual-badge w-full ${
      isActive
        ? 'badge-primary'
        : 'bg-base-300 text-base-content/70'
    }`;
  };

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text font-medium">Bildstorlek (cm)</span>
      </div>
      
      {/* Unified badge system for all devices */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {presetSizes.map((presetSize) => (
          <button
            key={presetSize}
            type="button"
            className={getBadgeClasses(presetSize)}
            data-size={presetSize}
            onClick={() => handlePresetClick(presetSize)}
          >
            {presetSize} cm
          </button>
        ))}
        <button
          type="button"
          className={getManualBadgeClasses()}
          onClick={handleManualClick}
        >
          Manuell
        </button>
      </div>
      
      {/* Number input (hidden by default, shown when manual is selected) */}
      <label
        className={`input input-bordered flex items-center gap-2 ${
          isManualMode || !presetSizes.some(preset => Math.abs(size - preset) < 0.01) ? '' : 'hidden'
        }`}
        id="manualInput"
      >
        <input
          id="size"
          name="size"
          className="grow"
          type="number"
          step="0.1"
          value={size}
          onChange={(e) => onSizeChange(parseFloat(e.target.value) || 0)}
          placeholder="3"
          aria-describedby="cellSizeHelp"
        />
        <span className="opacity-60">cm</span>
      </label>
    </div>
  );
};

export default SizeSelector;