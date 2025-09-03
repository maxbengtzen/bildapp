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

  const getBadgeClasses = (layoutValue) => {
    const isSelected = layout === layoutValue;
    return `badge badge-lg cursor-pointer transition-colors p-4 h-20 flex flex-col justify-center items-center w-full text-center ${
      isSelected
        ? 'badge-primary text-primary-content'
        : 'bg-base-300 text-base-content hover:bg-base-300/80'
    }`;
  };

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text font-medium">Layout</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layoutOption) => (
          <label key={layoutOption.value} className="cursor-pointer">
            <input
              type="radio"
              name="layout"
              value={layoutOption.value}
              className="sr-only"
              checked={layout === layoutOption.value}
              onChange={(e) => onLayoutChange(e.target.value)}
            />
            <div className={getBadgeClasses(layoutOption.value)}>
              <div className="font-medium leading-tight">
                {layoutOption.title}
              </div>
              <div className="text-xs opacity-70 mt-1 leading-tight">
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