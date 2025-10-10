import { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  Check, 
  Edit3, 
  RefreshCw, 
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Search,
  Music,
  FileText
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateAdCopyForCard, 
  updateAdCopy, 
  deleteAdCopy, 
  approveAdCopy 
} from '@/api/cards';
import type { CardRow } from '@/types/dto';

interface AIAdCopyManagerProps {
  card: CardRow;
}

type Platform = 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'custom';
type Tone = 'professional' | 'casual' | 'playful' | 'urgent' | 'informative';
type Objective = 'awareness' | 'conversion' | 'engagement' | 'traffic' | 'leads';

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case 'facebook':
      return <Facebook className="w-4 h-4" />;
    case 'instagram':
      return <Instagram className="w-4 h-4" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" />;
    case 'google':
      return <Search className="w-4 h-4" />;
    case 'tiktok':
      return <Music className="w-4 h-4" />;
    case 'custom':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  linkedin: 'bg-blue-700',
  twitter: 'bg-sky-500',
  google: 'bg-red-500',
  tiktok: 'bg-black',
  custom: 'bg-gray-500'
};

export default function AIAdCopyManager({ card }: AIAdCopyManagerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [tone, setTone] = useState<Tone>('professional');
  const [objective, setObjective] = useState<Objective>('conversion');
  const [targetAudience, setTargetAudience] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [expandedCopies, setExpandedCopies] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const generateAdCopyMutation = useMutation({
    mutationFn: () => generateAdCopyForCard(card.id, selectedPlatform, {
      targetAudience: targetAudience || undefined,
      tone,
      objective
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    },
    onError: (error) => {
      console.error('Failed to generate ad copy:', error);
      alert('Failed to generate ad copy. Please try again.');
    }
  });

  const updateAdCopyMutation = useMutation({
    mutationFn: ({ adCopyId, updates }: { adCopyId: string; updates: any }) =>
      updateAdCopy(card.id, adCopyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
      setEditingId(null);
      setEditValues({});
    }
  });

  const deleteAdCopyMutation = useMutation({
    mutationFn: (adCopyId: string) => deleteAdCopy(card.id, adCopyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const approveAdCopyMutation = useMutation({
    mutationFn: (adCopyId: string) => approveAdCopy(card.id, adCopyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', card.board_id] });
    }
  });

  const handleEdit = (adCopy: any) => {
    setEditingId(adCopy.id);
    setEditValues({
      graphics_copy: adCopy.graphics_copy,
      subheadline: adCopy.subheadline,
      description: adCopy.description,
      primary_text: adCopy.primary_text
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateAdCopyMutation.mutate({
        adCopyId: editingId,
        updates: editValues
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const toggleExpanded = (adCopyId: string) => {
    const newExpanded = new Set(expandedCopies);
    if (newExpanded.has(adCopyId)) {
      newExpanded.delete(adCopyId);
    } else {
      newExpanded.add(adCopyId);
    }
    setExpandedCopies(newExpanded);
  };

  const adCopies = card.ad_copies || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Ad Copy Generator
        </h3>
      </div>

      {/* Generation Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="google">Google Ads</option>
              <option value="tiktok">TikTok</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="playful">Playful</option>
              <option value="urgent">Urgent</option>
              <option value="informative">Informative</option>
            </select>
          </div>

          {/* Objective Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objective
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as Objective)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="awareness">Brand Awareness</option>
              <option value="conversion">Conversion</option>
              <option value="engagement">Engagement</option>
              <option value="traffic">Traffic</option>
              <option value="leads">Lead Generation</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., 25-35 professionals"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => generateAdCopyMutation.mutate()}
          disabled={generateAdCopyMutation.isPending}
          className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {generateAdCopyMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>
            {generateAdCopyMutation.isPending ? 'Generating...' : 'Generate Ad Copy'}
          </span>
        </button>
      </div>

      {/* Generated Ad Copies */}
      {adCopies.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Generated Ad Copies ({adCopies.length})
          </h4>
          
          {adCopies.map((adCopy) => {
            const isExpanded = expandedCopies.has(adCopy.id);
            const isEditing = editingId === adCopy.id;
            
            return (
              <div
                key={adCopy.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${PLATFORM_COLORS[adCopy.platform]}`}>
                      <span className="mr-1">{getPlatformIcon(adCopy.platform)}</span> {adCopy.title}
                    </span>
                    {adCopy.is_approved && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpanded(adCopy.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => handleEdit(adCopy)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {!adCopy.is_approved && (
                          <button
                            onClick={() => approveAdCopyMutation.mutate(adCopy.id)}
                            className="p-1 text-green-500 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteAdCopyMutation.mutate(adCopy.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div className="space-y-4">
                    {/* Graphics Copy */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Graphics Copy
                        </label>
                        <button
                          onClick={() => copyToClipboard(isEditing ? editValues.graphics_copy : adCopy.graphics_copy)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValues.graphics_copy}
                          onChange={(e) => setEditValues({...editValues, graphics_copy: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono">
                          {adCopy.graphics_copy}
                        </p>
                      )}
                    </div>

                    {/* Subheadline */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subheadline
                        </label>
                        <button
                          onClick={() => copyToClipboard(isEditing ? editValues.subheadline : adCopy.subheadline)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValues.subheadline}
                          onChange={(e) => setEditValues({...editValues, subheadline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {adCopy.subheadline}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <button
                          onClick={() => copyToClipboard(isEditing ? editValues.description : adCopy.description)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editValues.description}
                          onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {adCopy.description}
                        </p>
                      )}
                    </div>

                    {/* Primary Text */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Primary Text
                        </label>
                        <button
                          onClick={() => copyToClipboard(isEditing ? editValues.primary_text : adCopy.primary_text)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={editValues.primary_text}
                          onChange={(e) => setEditValues({...editValues, primary_text: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {adCopy.primary_text}
                        </p>
                      )}
                    </div>

                    {/* Edit Actions */}
                    {isEditing && (
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={updateAdCopyMutation.isPending}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      Generated {new Date(adCopy.generated_at).toLocaleString()}
                      {adCopy.ai_model_used && ` • ${adCopy.ai_model_used}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {adCopies.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No ad copies generated yet.</p>
          <p className="text-sm">Use the generator above to create AI-powered ad copy!</p>
        </div>
      )}
    </div>
  );
}