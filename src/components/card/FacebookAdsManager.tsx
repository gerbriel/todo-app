import { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Eye,
  EyeOff,
  Facebook,
  Plus,
  Minus
} from 'lucide-react';
import type { CardRow } from '@/types/dto';

interface FacebookAdsManagerProps {
  card: CardRow;
}

type Tone = 'professional' | 'casual' | 'playful' | 'urgent' | 'informative';
type Objective = 'awareness' | 'conversion' | 'engagement' | 'traffic' | 'leads';

interface GraphicText {
  id: string;
  headlines: string[];
  descriptions: string[];
}

interface AdSet {
  id: string;
  name: string;
  graphicTexts: GraphicText[];
}

interface FacebookAdCampaign {
  id: string;
  campaignName: string;
  adSets: AdSet[];
  platform: 'facebook';
  tone: Tone;
  objective: Objective;
  targetAudience: string;
  created_at: string;
}

export default function FacebookAdsManager({ card }: FacebookAdsManagerProps) {
  const [numAdSets, setNumAdSets] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [objective, setObjective] = useState<Objective>('conversion');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaigns, setCampaigns] = useState<FacebookAdCampaign[]>([]);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGraphicText = (adSetIndex: number, graphicIndex: number): GraphicText => {
    const baseHeadlines = [
      `Transform Your ${card.title} Experience`,
      `Discover Amazing ${card.title} Solutions`,
      `Get Started with ${card.title} Today`,
      `${card.title} Made Simple`,
      `Unlock the Power of ${card.title}`
    ];

    const baseDescriptions = [
      `Experience the difference with our innovative ${card.title} solution. Join thousands of satisfied customers.`,
      `Ready to take your ${card.title} to the next level? Get started now and see results fast.`
    ];

    return {
      id: `graphic-${adSetIndex}-${graphicIndex}`,
      headlines: baseHeadlines.map(h => 
        tone === 'playful' ? `🎉 ${h}` :
        tone === 'urgent' ? `⚡ ${h} - Limited Time!` :
        tone === 'casual' ? `Hey! ${h}` : h
      ),
      descriptions: baseDescriptions.map(d => 
        tone === 'urgent' ? `${d} Don't miss out!` :
        tone === 'casual' ? `${d} It's that easy!` : d
      )
    };
  };

  const generateAdSet = (index: number): AdSet => {
    const graphicTexts: GraphicText[] = [];
    for (let i = 0; i < 3; i++) {
      graphicTexts.push(generateGraphicText(index, i));
    }

    return {
      id: `adset-${index}`,
      name: `Ad Set ${index + 1}`,
      graphicTexts
    };
  };

  const generateFacebookCampaign = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const adSets: AdSet[] = [];
      for (let i = 0; i < numAdSets; i++) {
        adSets.push(generateAdSet(i));
      }

      const newCampaign: FacebookAdCampaign = {
        id: `campaign-${Date.now()}`,
        campaignName: campaignName || `${card.title} Campaign`,
        adSets,
        platform: 'facebook',
        tone,
        objective,
        targetAudience,
        created_at: new Date().toISOString()
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setExpandedCampaign(newCampaign.id);
      setIsGenerating(false);
    }, 2000); // Simulate API call
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here if needed
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Facebook className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Facebook Ads Campaign Generator
        </h3>
      </div>

      {/* Campaign Configuration */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Campaign Setup</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder={`${card.title} Campaign`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Number of Ad Sets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Ad Sets
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setNumAdSets(Math.max(1, numAdSets - 1))}
                className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={numAdSets}
                onChange={(e) => setNumAdSets(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
              />
              <button
                onClick={() => setNumAdSets(Math.min(10, numAdSets + 1))}
                className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
              Campaign Objective
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
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., 25-35 professionals interested in technology"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateFacebookCampaign}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isGenerating ? 'Generating Campaign...' : 'Generate Facebook Campaign'}</span>
        </button>
      </div>

      {/* Generated Campaigns */}
      {campaigns.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Generated Campaigns</h4>
          
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Campaign Header */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{campaign.campaignName}</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {campaign.adSets.length} Ad Sets • {campaign.tone} • {campaign.objective}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedCampaign(
                      expandedCampaign === campaign.id ? null : campaign.id
                    )}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                  >
                    {expandedCampaign === campaign.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campaign Content */}
              {expandedCampaign === campaign.id && (
                <div className="p-4 space-y-6">
                  {campaign.adSets.map((adSet) => (
                    <div key={adSet.id} className="border-l-4 border-blue-500 pl-4">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-4">
                        {adSet.name}
                      </h6>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {adSet.graphicTexts.map((graphic, graphicIndex) => (
                          <div key={graphic.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Graphic Text {graphicIndex + 1}
                            </div>
                            
                            {/* Headlines */}
                            <div className="mb-4">
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Headlines (5)
                              </div>
                              <div className="space-y-2">
                                {graphic.headlines.map((headline, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded text-sm">
                                    <span className="flex-1">{headline}</span>
                                    <button
                                      onClick={() => copyToClipboard(headline)}
                                      className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Descriptions */}
                            <div>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Descriptions (2)
                              </div>
                              <div className="space-y-2">
                                {graphic.descriptions.map((description, index) => (
                                  <div key={index} className="flex items-start justify-between bg-white dark:bg-gray-700 p-2 rounded text-sm">
                                    <span className="flex-1">{description}</span>
                                    <button
                                      onClick={() => copyToClipboard(description)}
                                      className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}