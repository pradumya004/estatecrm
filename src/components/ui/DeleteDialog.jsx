// estatecrm/src/components/ui/DeleteDialog.jsx

import { X, Trash2 } from "lucide-react";

export const DeleteDialog = ({
  open,
  onClose,
  title,
  description,
  onConfirm,
  loading,
}) => {
  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            {title || "Delete Confirmation"}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {description ||
            "Are you sure you want to delete this item? This action cannot be undone."}
        </p>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};