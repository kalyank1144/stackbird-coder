import type { ProviderInfo } from '~/types/model';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { classNames } from '~/utils/classNames';

// Fuzzy search utilities
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[str2.length][str1.length];
};

const fuzzyMatch = (query: string, text: string): { score: number; matches: boolean } => {
  if (!query) {
    return { score: 0, matches: true };
  }

  if (!text) {
    return { score: 0, matches: false };
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact substring match gets highest score
  if (textLower.includes(queryLower)) {
    return { score: 100 - (textLower.indexOf(queryLower) / textLower.length) * 20, matches: true };
  }

  // Fuzzy match with reasonable threshold
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLen = Math.max(queryLower.length, textLower.length);
  const similarity = 1 - distance / maxLen;

  return {
    score: similarity > 0.6 ? similarity * 80 : 0,
    matches: similarity > 0.6,
  };
};

const highlightText = (text: string, query: string): string => {
  if (!query) {
    return text;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 text-current">$1</mark>');
};

const formatContextSize = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }

  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }

  return tokens.toString();
};

interface ModelSelectorProps {
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  modelList: ModelInfo[];
  providerList: ProviderInfo[];
  apiKeys: Record<string, string>;
  modelLoading?: string;
}

// Helper function to determine if a model is likely free
const isModelLikelyFree = (model: ModelInfo, providerName?: string): boolean => {
  // OpenRouter models with zero pricing in the label
  if (providerName === 'OpenRouter' && model.label.includes('in:$0.00') && model.label.includes('out:$0.00')) {
    return true;
  }

  // Models with "free" in the name or label
  if (model.name.toLowerCase().includes('free') || model.label.toLowerCase().includes('free')) {
    return true;
  }

  return false;
};

export const ModelSelector = ({
  model,
  setModel,
  provider,
  setProvider,
  modelList,
  providerList,
  modelLoading,
}: ModelSelectorProps) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [debouncedModelSearchQuery, setDebouncedModelSearchQuery] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [focusedModelIndex, setFocusedModelIndex] = useState(-1);
  const modelSearchInputRef = useRef<HTMLInputElement>(null);
  const modelOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [debouncedProviderSearchQuery, setDebouncedProviderSearchQuery] = useState('');
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [focusedProviderIndex, setFocusedProviderIndex] = useState(-1);
  const providerSearchInputRef = useRef<HTMLInputElement>(null);
  const providerOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const [showFreeModelsOnly, setShowFreeModelsOnly] = useState(false);

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedModelSearchQuery(modelSearchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [modelSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProviderSearchQuery(providerSearchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [providerSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
      }

      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
        setProviderSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = useMemo(() => {
    const baseModels = [...modelList].filter((e) => e.provider === provider?.name && e.name);

    return baseModels
      .filter((model) => {
        // Apply free models filter
        if (showFreeModelsOnly && !isModelLikelyFree(model, provider?.name)) {
          return false;
        }

        return true;
      })
      .map((model) => {
        // Calculate search scores for fuzzy matching
        const labelMatch = fuzzyMatch(debouncedModelSearchQuery, model.label);
        const nameMatch = fuzzyMatch(debouncedModelSearchQuery, model.name);
        const contextMatch = fuzzyMatch(debouncedModelSearchQuery, formatContextSize(model.maxTokenAllowed));

        const bestScore = Math.max(labelMatch.score, nameMatch.score, contextMatch.score);
        const matches = labelMatch.matches || nameMatch.matches || contextMatch.matches || !debouncedModelSearchQuery; // Show all if no query

        return {
          ...model,
          searchScore: bestScore,
          searchMatches: matches,
          highlightedLabel: highlightText(model.label, debouncedModelSearchQuery),
          highlightedName: highlightText(model.name, debouncedModelSearchQuery),
        };
      })
      .filter((model) => model.searchMatches)
      .sort((a, b) => {
        // Sort by search score (highest first), then by label
        if (debouncedModelSearchQuery) {
          return b.searchScore - a.searchScore;
        }

        return a.label.localeCompare(b.label);
      });
  }, [modelList, provider?.name, showFreeModelsOnly, debouncedModelSearchQuery]);

  const filteredProviders = useMemo(() => {
    if (!debouncedProviderSearchQuery) {
      return providerList;
    }

    return providerList
      .map((provider) => {
        const match = fuzzyMatch(debouncedProviderSearchQuery, provider.name);
        return {
          ...provider,
          searchScore: match.score,
          searchMatches: match.matches,
          highlightedName: highlightText(provider.name, debouncedProviderSearchQuery),
        };
      })
      .filter((provider) => provider.searchMatches)
      .sort((a, b) => b.searchScore - a.searchScore);
  }, [providerList, debouncedProviderSearchQuery]);

  // Reset free models filter when provider changes
  useEffect(() => {
    setShowFreeModelsOnly(false);
  }, [provider?.name]);

  useEffect(() => {
    setFocusedModelIndex(-1);
  }, [debouncedModelSearchQuery, isModelDropdownOpen, showFreeModelsOnly]);

  useEffect(() => {
    setFocusedProviderIndex(-1);
  }, [debouncedProviderSearchQuery, isProviderDropdownOpen]);

  // Clear search functions
  const clearModelSearch = useCallback(() => {
    setModelSearchQuery('');
    setDebouncedModelSearchQuery('');

    if (modelSearchInputRef.current) {
      modelSearchInputRef.current.focus();
    }
  }, []);

  const clearProviderSearch = useCallback(() => {
    setProviderSearchQuery('');
    setDebouncedProviderSearchQuery('');

    if (providerSearchInputRef.current) {
      providerSearchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isModelDropdownOpen && modelSearchInputRef.current) {
      modelSearchInputRef.current.focus();
    }
  }, [isModelDropdownOpen]);

  useEffect(() => {
    if (isProviderDropdownOpen && providerSearchInputRef.current) {
      providerSearchInputRef.current.focus();
    }
  }, [isProviderDropdownOpen]);

  const handleModelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isModelDropdownOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev + 1 >= filteredModels.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev - 1 < 0 ? filteredModels.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();

        if (focusedModelIndex >= 0 && focusedModelIndex < filteredModels.length) {
          const selectedModel = filteredModels[focusedModelIndex];
          setModel?.(selectedModel.name);
          setIsModelDropdownOpen(false);
          setModelSearchQuery('');
          setDebouncedModelSearchQuery('');
        }

        break;
      case 'Escape':
        e.preventDefault();
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
        setDebouncedModelSearchQuery('');
        break;
      case 'Tab':
        if (!e.shiftKey && focusedModelIndex === filteredModels.length - 1) {
          setIsModelDropdownOpen(false);
        }

        break;
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          clearModelSearch();
        }

        break;
    }
  };

  const handleProviderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isProviderDropdownOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedProviderIndex((prev) => (prev + 1 >= filteredProviders.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedProviderIndex((prev) => (prev - 1 < 0 ? filteredProviders.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();

        if (focusedProviderIndex >= 0 && focusedProviderIndex < filteredProviders.length) {
          const selectedProvider = filteredProviders[focusedProviderIndex];

          if (setProvider) {
            setProvider(selectedProvider);

            const firstModel = modelList.find((m) => m.provider === selectedProvider.name);

            if (firstModel && setModel) {
              setModel(firstModel.name);
            }
          }

          setIsProviderDropdownOpen(false);
          setProviderSearchQuery('');
          setDebouncedProviderSearchQuery('');
        }

        break;
      case 'Escape':
        e.preventDefault();
        setIsProviderDropdownOpen(false);
        setProviderSearchQuery('');
        setDebouncedProviderSearchQuery('');
        break;
      case 'Tab':
        if (!e.shiftKey && focusedProviderIndex === filteredProviders.length - 1) {
          setIsProviderDropdownOpen(false);
        }

        break;
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          clearProviderSearch();
        }

        break;
    }
  };

  useEffect(() => {
    if (focusedModelIndex >= 0 && modelOptionsRef.current[focusedModelIndex]) {
      modelOptionsRef.current[focusedModelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedModelIndex]);

  useEffect(() => {
    if (focusedProviderIndex >= 0 && providerOptionsRef.current[focusedProviderIndex]) {
      providerOptionsRef.current[focusedProviderIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedProviderIndex]);

  useEffect(() => {
    if (providerList.length === 0) {
      return;
    }

    if (provider && !providerList.some((p) => p.name === provider.name)) {
      const firstEnabledProvider = providerList[0];
      setProvider?.(firstEnabledProvider);

      const firstModel = modelList.find((m) => m.provider === firstEnabledProvider.name);

      if (firstModel) {
        setModel?.(firstModel.name);
      }
    }
  }, [providerList, provider, setProvider, modelList, setModel]);

  if (providerList.length === 0) {
    return (
      <div className="mb-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300">
        <p className="text-center text-sm">
          No providers are currently enabled. Please enable at least one provider in the settings to start using the
          chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-col sm:flex-row mb-2">
      {/* Provider Combobox */}
      <div className="relative flex w-full" onKeyDown={handleProviderKeyDown} ref={providerDropdownRef}>
        <div
          className={classNames(
            'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50',
            'bg-white/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500/50',
            'transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
            isProviderDropdownOpen ? 'ring-2 ring-purple-500/50' : undefined,
          )}
          onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsProviderDropdownOpen(!isProviderDropdownOpen);
            }
          }}
          role="combobox"
          aria-expanded={isProviderDropdownOpen}
          aria-controls="provider-listbox"
          aria-haspopup="listbox"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-medium">{provider?.name || 'Select provider'}</div>
            <div
              className={classNames(
                'i-ph:caret-down w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform',
                isProviderDropdownOpen ? 'rotate-180' : undefined,
              )}
            />
          </div>
        </div>

        {isProviderDropdownOpen && (
          <div
            className="absolute top-full z-20 w-full mt-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-slate-950/50"
            role="listbox"
            id="provider-listbox"
          >
            <div className="px-2 pb-2">
              <div className="relative">
                <input
                  ref={providerSearchInputRef}
                  type="text"
                  value={providerSearchQuery}
                  onChange={(e) => setProviderSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  className={classNames(
                    'w-full pl-8 pr-8 py-2 rounded-lg text-sm',
                    'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50',
                    'text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                    'transition-all',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  role="searchbox"
                  aria-label="Search providers"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <span className="i-ph:magnifying-glass text-slate-400 dark:text-slate-500" />
                </div>
                {providerSearchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearProviderSearch();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <span className="i-ph:x text-slate-400 dark:text-slate-500 text-xs" />
                  </button>
                )}
              </div>
            </div>

            <div
              className={classNames(
                'max-h-60 overflow-y-auto',
                '[&::-webkit-scrollbar]:w-1.5',
                '[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-track]:bg-transparent',
              )}
            >
              {filteredProviders.length === 0 ? (
                <div className="px-3 py-3 text-sm">
                  <div className="text-slate-400 dark:text-slate-500 mb-1">
                    {debouncedProviderSearchQuery
                      ? `No providers match "${debouncedProviderSearchQuery}"`
                      : 'No providers found'}
                  </div>
                </div>
              ) : (
                filteredProviders.map((providerOption, index) => (
                  <div
                    ref={(el) => (providerOptionsRef.current[index] = el)}
                    key={providerOption.name}
                    role="option"
                    aria-selected={provider?.name === providerOption.name}
                    className={classNames(
                      'px-3 py-2.5 text-sm cursor-pointer',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      'text-slate-700 dark:text-slate-200',
                      'outline-none transition-colors',
                      provider?.name === providerOption.name
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : undefined,
                      focusedProviderIndex === index ? 'ring-1 ring-inset ring-purple-500/50' : undefined,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (setProvider) {
                        setProvider(providerOption);

                        const firstModel = modelList.find((m) => m.provider === providerOption.name);

                        if (firstModel && setModel) {
                          setModel(firstModel.name);
                        }
                      }

                      setIsProviderDropdownOpen(false);
                      setProviderSearchQuery('');
                      setDebouncedProviderSearchQuery('');
                    }}
                    tabIndex={focusedProviderIndex === index ? 0 : -1}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: (providerOption as any).highlightedName || providerOption.name,
                        }}
                      />
                      {provider?.name === providerOption.name && (
                        <span className="i-ph:check text-purple-500 text-sm" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Model Combobox */}
      <div className="relative flex w-full min-w-[70%]" onKeyDown={handleModelKeyDown} ref={modelDropdownRef}>
        <div
          className={classNames(
            'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50',
            'bg-white/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500/50',
            'transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
            isModelDropdownOpen ? 'ring-2 ring-purple-500/50' : undefined,
          )}
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsModelDropdownOpen(!isModelDropdownOpen);
            }
          }}
          role="combobox"
          aria-expanded={isModelDropdownOpen}
          aria-controls="model-listbox"
          aria-haspopup="listbox"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-medium">
              {modelList.find((m) => m.name === model)?.label || 'Select model'}
            </div>
            <div
              className={classNames(
                'i-ph:caret-down w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform',
                isModelDropdownOpen ? 'rotate-180' : undefined,
              )}
            />
          </div>
        </div>

        {isModelDropdownOpen && (
          <div
            className="absolute top-full z-10 w-full mt-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-slate-950/50"
            role="listbox"
            id="model-listbox"
          >
            <div className="px-2 pb-2 space-y-2">
              {/* Free Models Filter Toggle - Only show for OpenRouter */}
              {provider?.name === 'OpenRouter' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFreeModelsOnly(!showFreeModelsOnly);
                    }}
                    className={classNames(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      showFreeModelsOnly
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
                    )}
                  >
                    <span className="i-ph:gift text-xs" />
                    Free models only
                  </button>
                  {showFreeModelsOnly && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {filteredModels.length} free model{filteredModels.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Search Result Count */}
              {debouncedModelSearchQuery && filteredModels.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                  {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
                  {filteredModels.length > 5 && ' (showing best matches)'}
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <input
                  ref={modelSearchInputRef}
                  type="text"
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className={classNames(
                    'w-full pl-8 pr-8 py-2 rounded-lg text-sm',
                    'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50',
                    'text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                    'transition-all',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  role="searchbox"
                  aria-label="Search models"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <span className="i-ph:magnifying-glass text-slate-400 dark:text-slate-500" />
                </div>
                {modelSearchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearModelSearch();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <span className="i-ph:x text-slate-400 dark:text-slate-500 text-xs" />
                  </button>
                )}
              </div>
            </div>

            <div
              className={classNames(
                'max-h-60 overflow-y-auto',
                '[&::-webkit-scrollbar]:w-1.5',
                '[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-track]:bg-transparent',
              )}
            >
              {modelLoading === 'all' || modelLoading === provider?.name ? (
                <div className="px-3 py-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="i-ph:spinner animate-spin" />
                    Loading models...
                  </div>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="px-3 py-3 text-sm">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">
                    {debouncedModelSearchQuery
                      ? `No models match "${debouncedModelSearchQuery}"${showFreeModelsOnly ? ' (free only)' : ''}`
                      : showFreeModelsOnly
                        ? 'No free models available'
                        : 'No models available'}
                  </div>
                  {debouncedModelSearchQuery && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Try searching for model names, context sizes (e.g., "128k", "1M"), or capabilities
                    </div>
                  )}
                  {showFreeModelsOnly && !debouncedModelSearchQuery && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Try disabling the "Free models only" filter to see all available models
                    </div>
                  )}
                </div>
              ) : (
                filteredModels.map((modelOption, index) => (
                  <div
                    ref={(el) => (modelOptionsRef.current[index] = el)}
                    key={modelOption.name}
                    role="option"
                    aria-selected={model === modelOption.name}
                    className={classNames(
                      'px-3 py-2.5 text-sm cursor-pointer',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      'text-slate-700 dark:text-slate-200',
                      'outline-none transition-colors',
                      model === modelOption.name ? 'bg-purple-50 dark:bg-purple-500/10' : undefined,
                      focusedModelIndex === index ? 'ring-1 ring-inset ring-purple-500/50' : undefined,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModel?.(modelOption.name);
                      setIsModelDropdownOpen(false);
                      setModelSearchQuery('');
                      setDebouncedModelSearchQuery('');
                    }}
                    tabIndex={focusedModelIndex === index ? 0 : -1}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: (modelOption as any).highlightedLabel || modelOption.label,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatContextSize(modelOption.maxTokenAllowed)} tokens
                          </span>
                          {debouncedModelSearchQuery && (modelOption as any).searchScore > 70 && (
                            <span className="text-xs text-green-500 font-medium">
                              {(modelOption as any).searchScore.toFixed(0)}% match
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        {isModelLikelyFree(modelOption, provider?.name) && (
                          <span className="i-ph:gift text-xs text-purple-400" title="Free model" />
                        )}
                        {model === modelOption.name && (
                          <span className="i-ph:check text-sm text-purple-500" title="Selected" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
