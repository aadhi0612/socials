import React, { useEffect, useState } from 'react';
import { MediaOut } from '../../types';
import { fetchMedia } from '../../api/media';
import Button from './Button';
import Card from './Card';
import { X, Image as ImageIcon, Play } from 'lucide-react';
import Badge from './Badge';

interface MediaSelectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: MediaOut[]) => void;
  selected: MediaOut[];
  token: string;
}

const TABS = [
  { key: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4 mr-1" /> },
  { key: 'videos', label: 'Videos', icon: <Play className="w-4 h-4 mr-1" /> },
];

// Patch MediaOut locally to include tags for UI state
// (Remove this if/when backend supports tags on MediaOut)
type MediaWithTags = MediaOut & { tags?: string[] };

const MediaSelectModal: React.FC<MediaSelectModalProps> = ({ open, onClose, onConfirm, selected, token }) => {
  const [media, setMedia] = useState<MediaWithTags[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(selected.map(m => m.id));
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    fetchMedia(token)
      .then(setMedia)
      .catch(err => setError(err.message || 'Failed to load media'))
      .finally(() => setLoading(false));
  }, [open, token]);

  useEffect(() => {
    setSelectedIds(selected.map(m => m.id));
  }, [selected]);

  useEffect(() => {
    if (activeTab === 'images' && media.filter(m => m.type === 'image').length === 0 && media.filter(m => m.type === 'video').length > 0) {
      setActiveTab('videos');
    }
    if (activeTab === 'videos' && media.filter(m => m.type === 'video').length === 0 && media.filter(m => m.type === 'image').length > 0) {
      setActiveTab('images');
    }
  }, [media]);

  if (!open) return null;

  const handleToggle = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  const handleConfirm = () => {
    const selectedAssets = media.filter(m => selectedIds.includes(m.id));
    onConfirm(selectedAssets);
    onClose();
  };

  const filteredMedia = tagSearch.trim()
    ? media.filter(m => (m.tags || []).some((tag: string) => tag.toLowerCase().includes(tagSearch.toLowerCase())))
    : media;
  const images = filteredMedia.filter(m => m.type === 'image');
  const videos = filteredMedia.filter(m => m.type === 'video');

  const showMedia = activeTab === 'images' ? images : videos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Media from Library</h2>
        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'images' | 'videos')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-medium focus:outline-none transition-colors
                ${activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tag search input */}
        <div className="mb-4">
          <input
            type="text"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder="Search by tag..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-900 dark:text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            {showMedia.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {showMedia.map(asset => (
                  <div
                    key={asset.id}
                    className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all
                      ${selectedIds.includes(asset.id)
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                      bg-gray-50 dark:bg-gray-800
                    `}
                    onClick={() => handleToggle(asset.id)}
                  >
                    {asset.type === 'video' ? (
                      <video src={asset.url} className="w-full h-28 object-cover" />
                    ) : (
                      <img src={asset.url} alt={asset.name} className="w-full h-28 object-cover" />
                    )}
                    <div className="p-2 text-xs truncate text-gray-900 dark:text-white bg-white/80 dark:bg-gray-900/80 w-full">
                      {asset.name}
                    </div>
                    {/* Tags row below image, above name */}
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-2 py-1 mt-1 mb-1 bg-gray-100 dark:bg-gray-800/80">
                        {asset.tags.map((tag: string) => (
                          <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    
                    {selectedIds.includes(asset.id) && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold shadow">✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No {activeTab === 'images' ? 'images' : 'videos'} found in your library.</div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>Add Selected</Button>
        </div>
      </div>
    </div>
  );
};

export default MediaSelectModal; 