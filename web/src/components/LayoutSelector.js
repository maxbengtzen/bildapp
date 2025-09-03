import React from 'react';

const LayoutSelector = ({ layout, onLayoutChange }) => {
  const layouts = [
    {
      value: 'standard',
      title: 'Standard',
      description: 'Rutnät utan ramar'
    },
    {
      value: 'polaroid',
      title: 'Polaroid',
      description: 'Vita ramar + skrivplats'
    }
  ];

  const getCardClasses = (layoutValue) => {
    const isSelected = layout === layoutValue;
    return `layout-card card bg-base-100 border-2 transition-colors p-4 text-center h-full flex flex-col justify-center ${
      isSelected 
        ? 'border-primary bg-primary/5' 
        : 'border-base-300 hover:border-primary/50'
    }`;
  };

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text font-medium">Layout</span>
      </div>
      <div className="flex gap-3 items-stretch">
        {layouts.map((layoutOption) => (
          <label key={layoutOption.value} className="cursor-pointer flex-1">
            <input
              type="radio"
              name="layout"
              value={layoutOption.value}
              className="hidden layout-radio"
              checked={layout === layoutOption.value}
              onChange={(e) => onLayoutChange(e.target.value)}
            />
            <div className={getCardClasses(layoutOption.value)}>
              <div className="font-medium text-base-content">
                {layoutOption.title}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {layoutOption.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;