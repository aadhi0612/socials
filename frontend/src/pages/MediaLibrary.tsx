import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Upload, 
  Download, 
  Edit3, 
  Tag, 
  Calendar,
  FileImage,
  Play,
  Zap
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { fetchMedia, addMedia, deleteMedia, getPresignedUploadUrl, generateAIImage, updateMedia } from '../api/media';
import { MediaOut } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Patch MediaOut type locally to include tags for UI state
// (Remove this if/when backend supports tags)
type MediaOutWithTags = MediaOut & { tags?: string[] };

const MediaLibrary: React.FC = () => {
  const { token } = useAuth();
  const [media, setMedia] = useState<MediaOutWithTags[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sessionId] = useState(() => uuidv4());
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renamingAsset, setRenamingAsset] = useState<MediaOut | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMedia(token)
      .then(setMedia)
      .catch(err => setError(err.message || 'Failed to load media'))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredAssets = media.filter(asset => {
    const matchesSearch = (asset.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const selectedAssetData = selectedAsset ? media.find(a => a.id === selectedAsset) : null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload Media Handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url, s3_key } = await getPresignedUploadUrl(sessionId, file.name, file.type);
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      const s3Url = `https://${bucket}.s3.amazonaws.com/${s3_key}`;
      const newMedia = await addMedia({ url: s3Url, type: file.type.startsWith('image') ? 'image' : 'video', name: file.name }, token);
      setMedia([newMedia, ...media]);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // AI Generate Handler
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !token) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await generateAIImage(aiPrompt);
      
      // The backend now returns the complete media object
      if (!data.url) {
        setAiError('AI did not return an image URL.');
        setAiLoading(false);
        return;
      }
      
      // Create media object with all the data from backend
      const newMedia = await addMedia({
        url: data.url,
        type: data.type || 'image',
        name: data.name || 'AI Generated Image',
        description: data.description || aiPrompt,
        prompt: data.prompt || aiPrompt,
        ai_generated: data.ai_generated || true
      }, token);
      
      setMedia([newMedia, ...media]);
      setAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Add a helper for downloading files
  const downloadFile = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  // Handler for opening rename modal
  const handleEditClick = (asset: MediaOut) => {
    setRenamingAsset(asset);
    setRenameValue(asset.name || '');
    setRenameModalOpen(true);
    setRenameError(null);
  };

  // Handler for renaming asset (frontend only, unless backend supports update)
  const handleRename = async () => {
    if (!renamingAsset || !renameValue.trim()) return;
    // If backend supports update, call it here. For now, update UI only.
    setMedia(media.map(m => m.id === renamingAsset.id ? { ...m, name: renameValue } : m));
    setRenameModalOpen(false);
  };

  // Add tag to selected asset
  const handleAddTag = async () => {
    if (!selectedAssetData || !tagInput.trim() || !selectedAssetData.id) return;
    const id: string = selectedAssetData.id;
    const tag = tagInput.trim();
    const updatedTags = [...((selectedAssetData as MediaOutWithTags).tags || []), tag];
    setMedia(media.map(m => m.id === id ? { ...m, tags: updatedTags } : m));
    setTagInput('');
    if (!token) return;
    await updateMedia(id, { tags: updatedTags }, token);
  };

  // Remove tag from selected asset
  const handleRemoveTag = async (tag: string) => {
    if (!selectedAssetData || !selectedAssetData.id) return;
    const id: string = selectedAssetData.id;
    const updatedTags = ((selectedAssetData as MediaOutWithTags).tags || []).filter((t: string) => t !== tag);
    setMedia(media.map(m => m.id === id ? { ...m, tags: updatedTags } : m));
    if (!token) return;
    await updateMedia(id, { tags: updatedTags }, token);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your digital assets and media files.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setAiModalOpen(true)}>
            <Zap className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={handleUploadClick} loading={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{uploadError}</p>
        </div>
      )}

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setAiModalOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate AI Image</h2>
            <input
              type="text"
              className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Describe the image you want..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
            {aiError && <div className="text-red-500 text-sm mb-2">{aiError}</div>}
            <Button className="w-full" onClick={handleAIGenerate} loading={aiLoading} disabled={aiLoading || !aiPrompt.trim()}>
              <Zap className="w-4 h-4 mr-2" /> Generate
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assets, tags, campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {[
                { key: 'all', label: 'All' },
                { key: 'image', label: 'Images' },
                { key: 'video', label: 'Videos' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Asset Grid/List */}
        <div className="lg:col-span-3">
          <Card padding={false}>
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No media was uploaded.
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedAsset === asset.id
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                      {asset.type === 'video' ? (
                        <video src={asset.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {asset.ai_generated && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="info" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2" onClick={(e) => { e.stopPropagation(); handleEditClick(asset); }}>
                            <Edit3 className="w-5 h-5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2" onClick={(e) => { e.stopPropagation(); downloadFile(asset.url, asset.name || 'media'); }}>
                            <Download className="w-5 h-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!token) return;
                              await deleteMedia(asset.id, token);
                              setMedia(media.filter(m => m.id !== asset.id));
                              if (selectedAsset === asset.id) setSelectedAsset(null);
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {asset.name}
                      </p>
                      {(asset.tags && asset.tags.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {asset.tags.map((tag: string) => (
                            <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                      selectedAsset === asset.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      {asset.type === 'video' ? (
                        <video src={asset.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {asset.name}
                        </p>
                        {asset.ai_generated && (
                          <Badge variant="info" className="text-xs flex-shrink-0">
                            <Zap className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      {(asset.tags && asset.tags.length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {asset.tags.map((tag: string) => (
                            <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {asset.type.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {asset.created_at ? format(new Date(asset.created_at), 'MMM d, yyyy') : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="ghost" className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2" onClick={(e) => { e.stopPropagation(); handleEditClick(asset); }}>
                        <Edit3 className="w-5 h-5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2" onClick={(e) => { e.stopPropagation(); downloadFile(asset.url, asset.name || 'media'); }}>
                        <Download className="w-5 h-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!bg-gray-900/80 hover:!bg-gray-900 text-white shadow-lg rounded-full p-2"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!token) return;
                          await deleteMedia(asset.id, token);
                          setMedia(media.filter(m => m.id !== asset.id));
                          if (selectedAsset === asset.id) setSelectedAsset(null);
                        }}
                      >
                        <span className="sr-only">Delete</span>
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Asset Details Panel */}
        <div className="space-y-6">
          {selectedAssetData ? (
            <>
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Asset Details
                </h3>
                
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={selectedAssetData.url}
                    alt={selectedAssetData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      File Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAssetData.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAssetData.created_at ? format(new Date(selectedAssetData.created_at), 'MMM d, yyyy h:mm a') : ''}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(selectedAssetData as MediaOutWithTags).tags?.map((tag: string) => (
                    <Badge key={tag} variant="default" className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button className="ml-1 text-xs text-red-500 hover:text-red-700" onClick={() => handleRemoveTag(tag)}>&times;</button>
                    </Badge>
                  ))}
                </div>
                <div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Add new tag..."
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-12">
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Asset Selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click on an asset to view details and editing options.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setRenameModalOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Rename Asset</h2>
            <input
              type="text"
              className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              disabled={false}
            />
            {renameError && <div className="text-red-500 text-sm mb-2">{renameError}</div>}
            <Button className="w-full" onClick={handleRename} disabled={!renameValue.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;