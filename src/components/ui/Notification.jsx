// estatecrm/src/components/ui/Notification.jsx

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000); // Auto-hide after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: "bg-green-100 border-green-200 text-green-700",
    error: "bg-red-100 border-red-200 text-red-700",
    info: "bg-blue-100 border-blue-200 text-blue-700",
  };

  const iconStyles = {
    success: <CheckCircle2 className="w-5 h-5 mr-2" />,
    error: <AlertCircle className="w-5 h-5 mr-2" />,
    info: <Info className="w-5 h-5 mr-2" />,
  };

  return (
    <div
      className={`p-4 rounded-lg border flex items-center mb-4 ${typeStyles[type]}`}
    >
      {iconStyles[type]}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
