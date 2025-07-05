import React, { useState } from 'react';
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
import { mockMediaAssets } from '../data/mockData';
import { format } from 'date-fns';

const MediaLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const filteredAssets = mockMediaAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const selectedAssetData = selectedAsset ? mockMediaAssets.find(a => a.id === selectedAsset) : null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <Button variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

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
            {viewMode === 'grid' ? (
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
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {asset.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                      )}
                      {asset.aiGenerated && (
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
                          <Button size="sm" variant="ghost" className="bg-white/90 hover:bg-white text-gray-900">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="bg-white/90 hover:bg-white text-gray-900">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(asset.size)}
                      </p>
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
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {asset.name}
                        </p>
                        {asset.aiGenerated && (
                          <Badge variant="info" className="text-xs flex-shrink-0">
                            <Zap className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{asset.type.toUpperCase()}</span>
                        <span>{formatFileSize(asset.size)}</span>
                        <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
                        <span>{format(asset.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 mt-2">
                        {asset.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {asset.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{asset.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="ghost">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
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
                      Dimensions
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAssetData.dimensions.width} × {selectedAssetData.dimensions.height}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      File Size
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatFileSize(selectedAssetData.size)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(selectedAssetData.createdAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  {selectedAssetData.campaign && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Campaign
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedAssetData.campaign}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAssetData.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add new tag..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Original
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit & Resize
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileImage className="w-4 h-4 mr-2" />
                    Create Variants
                  </Button>
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
    </div>
  );
};

export default MediaLibrary;