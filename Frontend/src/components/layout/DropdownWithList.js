import React, { useState } from 'react';

const DropdownWithList = ({ title, children, Icon }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center space-x-2 px-2 py-2 bg-transparent text-black font-semibold rounded cursor-pointer relative z-20 hover:underline">
        {Icon && <Icon className="text-xl" />}
        <label className="cursor-pointer">{title}</label>
      </div>

      {open && (
        <>
          <div className="absolute left-0 top-full w-80 h-4"></div>

          <div className="absolute left-0 mt-2 w-80 max-h-[66vh] overflow-y-auto bg-white border rounded shadow-lg z-10">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default DropdownWithList;
