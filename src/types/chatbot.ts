export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
  timestamp: Date;
  model?: string;
  isStreaming?: boolean;
  images?: string[];
}

export interface ChatbotState {
  messages: Message[];
  isLoading: boolean;
  currentModelIndex: number;
  error: string | null;
  isStreaming: boolean;
  editingMessageId: string | null;
  isEditing: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }[];
}

export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  isFree: boolean;
}

export interface PortfolioContext {
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    period: {
      start: string;
      end: string;
    };
    description: string;
    technologies: string[];
    current?: boolean;
  }>;
  profiles: Array<{
    quote: string;
    name: string;
    designation: string;
  }>;
  cvDownload: {
    url: string;
    label: string;
  };
  music?: Array<{
    title: string;
    artist: string;
    album: string;
    genre?: string;
  }>;
  gallery?: Array<{
    title: string;
    location: string;
    date: string;
  }>;
  techStack?: {
    totalCategories: number;
    categories: Array<{
      name: string;
      description: string;
      technologiesCount: number;
      technologies: string[];
    }>;
  };
  certificates?: {
    totalCertificates: number;
  };
}

export interface ChatHistory {
  messages: Message[];
  lastUpdated: number;
}

export interface SendMessageParams {
  content: string;
  images?: string[];
  onStream?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}
