export interface BingSearchResponse {
  _type: string;
  instrumentation: BingInstrumentation;
  readLink: string;
  webSearchUrl: string;
  queryContext: BingQueryContext;
  totalEstimatedMatches: number;
  nextOffset: number;
  currentOffset: number;
  value: BingSearchValue[];
  pivotSuggestions: PivotSuggestion[];
  relatedSearches: RelatedSearch[];
}

export interface BingInstrumentation {
  _type: string;
}

export interface BingQueryContext {
  originalQuery: string;
  alterationDisplayQuery: string;
  alterationOverrideQuery: string;
  alterationMethod: string;
  alterationType: string;
}

export interface BingSearchValue {
  webSearchUrl: string;
  name: string;
  thumbnailUrl: string;
  datePublished: string;
  isFamilyFriendly: boolean;
  contentUrl: string;
  hostPageUrl: string;
  contentSize: string;
  encodingFormat: string;
  hostPageDisplayUrl: string;
  width: number;
  height: number;
  hostPageDiscoveredDate: string;
  thumbnail: Thumbnail;
  imageInsightsToken: string;
  insightsMetadata: InsightsMetadata;
  imageId: string;
  accentColor: string;
  hostPageFavIconUrl?: string;
  hostPageDomainFriendlyName?: string;
}

export interface Thumbnail {
  width: number;
  height: number;
}

export interface InsightsMetadata {
  pagesIncludingCount: number;
  availableSizesCount: number;
  videoObject?: VideoObject;
  recipeSourcesCount?: number;
}

export interface VideoObject {
  creator?: Creator;
  duration?: string;
  embedHtml?: string;
  allowHttpsEmbed: boolean;
  videoId: string;
  allowMobileEmbed: boolean;
}

export interface Creator {
  name: string;
}

export interface PivotSuggestion {
  pivot: string;
  suggestions: any[];
}

export interface RelatedSearch {
  text: string;
  displayText: string;
  webSearchUrl: string;
  searchLink: string;
  thumbnail: Thumbnail2;
}

export interface Thumbnail2 {
  thumbnailUrl: string;
}
