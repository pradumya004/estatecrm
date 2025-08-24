// estatecrm/src/components/ui/Card.jsx

import { createElement } from "react";

const Card = ({
  title,
  children,
  icon,
  color = "text-gray-900",
  className = "",
}) => (
  <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
    <div className="flex items-center space-x-2 mb-4">
      {icon && createElement(icon, { className: `w-5 h-5 ${color}` })}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);
