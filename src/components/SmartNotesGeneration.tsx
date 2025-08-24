import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Users,
  Target,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import {
  getRecommendedMode,
  getModeComparison,
  startEnrichProcess,
  startGenerateProcess,
  getEnrichmentStatus,
  getSmartNotes,
  getDifyStatus,
  regenerateSmartNotes,
  listTemplates,
  SessionEnhanced,
  ModeRecommendation,
  ModeComparison,
  EnrichmentStatusResponse,
  SmartNotesResponse,
  TemplateRead
} from '../lib/api';

interface SmartNotesGenerationProps {
  session: SessionEnhanced;
  onNotesGenerated?: (notes: SmartNotesResponse) => void;
}

type GenerationState = 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';

const SmartNotesGeneration: React.FC<SmartNotesGenerationProps> = ({ 
  session, 
  onNotesGenerated 
}) => {
  const [state, setState] = useState<GenerationState>('idle');
  const [recommendation, setRecommendation] = useState<ModeRecommendation | null>(null);
  const [comparison, setComparison] = useState<ModeComparison | null>(null);
  const [currentMode, setCurrentMode] = useState<'enrich' | 'generate' | null>(null);
  const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatusResponse | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<SmartNotesResponse | null>(null);
  const [templates, setTemplates] = useState<TemplateRead[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [difyStatus, setDifyStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [session.id]);

  const loadInitialData = async () => {
    try {
      const [difyRes, templatesRes] = await Promise.all([
        getDifyStatus(),
        listTemplates()
      ]);
      
      setDifyStatus(difyRes);
      setTemplates(templatesRes);

      // Only get recommendation if session has content
      if (session.has_transcript || session.has_user_notes) {
        setState('analyzing');
        const [recRes, compRes] = await Promise.all([
          getRecommendedMode(session.id),
          getModeComparison(session.id)
        ]);
        setRecommendation(recRes);
        setComparison(compRes);
        setState('idle');
      }

      // Check if there are existing smart notes
      if (session.enrichment_status === 'completed') {
        const notesRes = await getSmartNotes(session.id);
        setGeneratedNotes(notesRes);
        setState('completed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setState('error');
    }
  };

  const startGeneration = async (mode: 'enrich' | 'generate') => {
    try {
      setState('generating');
      setCurrentMode(mode);
      setError(null);

      const request = {
        template_id: selectedTemplate || undefined,
        options: {
          include_evidence: true,
          language: session.language || 'zh-CN',
          generate_summary: true
        }
      };

      const response = mode === 'enrich' 
        ? await startEnrichProcess(session.id, request)
        : await startGenerateProcess(session.id, request);

      // Start polling for status
      pollEnrichmentStatus(response.enrichment_id);
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setState('error');
    }
  };

  const pollEnrichmentStatus = async (enrichmentId: string) => {
    try {
      const status = await getEnrichmentStatus(session.id, enrichmentId);
      setEnrichmentStatus(status);

      if (status.status === 'completed') {
        const notes = await getSmartNotes(session.id);
        setGeneratedNotes(notes);
        setState('completed');
        onNotesGenerated?.(notes);
      } else if (status.status === 'failed') {
        setError(status.error_message || 'Generation failed');
        setState('error');
      } else {
        // Continue polling
        setTimeout(() => pollEnrichmentStatus(enrichmentId), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check status');
      setState('error');
    }
  };

  const handleRegenerate = async () => {
    if (!currentMode) return;
    
    try {
      setIsRegenerating(true);
      const response = await regenerateSmartNotes(
        session.id, 
        currentMode, 
        selectedTemplate || undefined
      );
      
      // Reset state and start polling
      setState('generating');
      setError(null);
      setEnrichmentStatus(null);
      pollEnrichmentStatus(response.enrichment_id);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getProgressColor = (progress: number = 0) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (!difyStatus?.dify_configured) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">智能笔记功能未配置</h3>
          <p className="text-gray-400 text-sm">
            请联系管理员配置 Dify AI 服务以启用智能笔记生成功能
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Smart Mode Recommendation */}
      {recommendation && comparison && state !== 'generating' && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">智能模式推荐</h3>
          </div>

          {recommendation.recommended_mode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <div className="font-medium text-white">
                      推荐使用 {recommendation.recommended_mode === 'enrich' ? 'Enrich 模式' : 'Generate 模式'}
                    </div>
                    <div className={`text-sm ${getConfidenceColor(recommendation.confidence)}`}>
                      置信度: {(recommendation.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startGeneration(recommendation.recommended_mode as 'enrich' | 'generate')}
                  disabled={state === 'generating'}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  使用推荐模式
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">推荐原因:</h4>
                <ul className="space-y-1">
                  {recommendation.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mode Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-white">Enrich 模式</h5>
                    <div className="text-sm text-gray-400">
                      评分: {(recommendation.mode_comparison.enrich.score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-green-400 mb-1">优势:</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {recommendation.mode_comparison.enrich.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    {recommendation.mode_comparison.enrich.cons.length > 0 && (
                      <div>
                        <div className="text-xs text-orange-400 mb-1">劣势:</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {recommendation.mode_comparison.enrich.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-white">Generate 模式</h5>
                    <div className="text-sm text-gray-400">
                      评分: {(recommendation.mode_comparison.generate.score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-green-400 mb-1">优势:</div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {recommendation.mode_comparison.generate.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    {recommendation.mode_comparison.generate.cons.length > 0 && (
                      <div>
                        <div className="text-xs text-orange-400 mb-1">劣势:</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {recommendation.mode_comparison.generate.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-gray-400">暂无足够内容进行智能推荐，请先上传音频或添加用户笔记</p>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode Selection */}
      {!recommendation && state !== 'generating' && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">选择生成模式</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Enrich Mode */}
            <div className="p-4 border border-white/10 rounded-lg hover:border-teal-500/30 transition-colors cursor-pointer group"
                 onClick={() => startGeneration('enrich')}>
              <div className="flex items-center mb-3">
                <div className="p-2 bg-teal-500/20 rounded-lg mr-3">
                  <FileText className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Enrich 模式</h4>
                  <p className="text-xs text-gray-400">基于用户笔记的智能扩充</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                保留您的原始想法，结合转写内容进行智能扩充和优化
              </p>
              <div className="text-xs text-gray-400">
                适用于：已有会议笔记、希望保留个人观点
              </div>
            </div>

            {/* Generate Mode */}
            <div className="p-4 border border-white/10 rounded-lg hover:border-blue-500/30 transition-colors cursor-pointer group"
                 onClick={() => startGeneration('generate')}>
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Generate 模式</h4>
                  <p className="text-xs text-gray-400">基于转写稿的完全智能生成</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                基于会议转写稿，完全由 AI 生成结构化的会议总结
              </p>
              <div className="text-xs text-gray-400">
                适用于：没有会议笔记、希望获得完整结构化总结
              </div>
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                选择笔记模板 (可选)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="">默认模板</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id} className="bg-gray-800">
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Generation Progress */}
      {state === 'generating' && enrichmentStatus && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-400 mr-2 animate-spin" />
              <h3 className="text-lg font-semibold text-white">
                正在生成智能笔记 ({currentMode === 'enrich' ? 'Enrich' : 'Generate'} 模式)
              </h3>
            </div>
            {generatedNotes && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重新生成
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(enrichmentStatus.progress)}`}
                style={{ width: `${enrichmentStatus.progress || 0}%` }}
              ></div>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">处理时间: </span>
                <span className="text-white">{enrichmentStatus.processing_time || 0}s</span>
              </div>
              <div>
                <span className="text-gray-400">已生成段落: </span>
                <span className="text-white">{enrichmentStatus.created_sections_count || 0}</span>
              </div>
            </div>

            {/* Preview */}
            {enrichmentStatus.final_markdown_preview && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-sm text-gray-400 mb-2">生成预览:</div>
                <div className="text-sm text-gray-300 line-clamp-3">
                  {enrichmentStatus.final_markdown_preview}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Results */}
      {state === 'completed' && generatedNotes && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">智能笔记生成完成</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重新生成
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-400">生成模式: </span>
              <span className="text-white">{generatedNotes.generation_type === 'enrich' ? 'Enrich' : 'Generate'}</span>
            </div>
            <div>
              <span className="text-gray-400">段落数量: </span>
              <span className="text-white">{generatedNotes.sections.length}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="text-sm text-emerald-400 mb-2">✅ 生成成功</div>
            <div className="text-sm text-gray-300">
              已生成 {generatedNotes.sections.length} 个结构化段落，可在会议详情页面查看完整内容
            </div>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {state === 'analyzing' && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-center py-8">
            <TrendingUp className="w-8 h-8 text-blue-400 mr-3 animate-pulse" />
            <span className="text-white">正在分析会议内容，生成智能推荐...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotesGeneration;
