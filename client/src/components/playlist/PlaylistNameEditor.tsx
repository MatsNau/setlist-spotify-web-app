import { useState } from 'react';
import { Edit2, Save } from 'lucide-react';

interface PlaylistNameEditorProps {
  name: string;
  onChange: (name: string) => void;
}

export const PlaylistNameEditor = ({ name, onChange }: PlaylistNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(name);
    setIsEditing(false);
  };

  return (
    <div className="mb-4 md:mb-6">
      <label className="text-xs md:text-sm text-gray-400 mb-2 block">Playlist Name</label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 bg-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm md:text-base truncate flex-1">{name}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};