export interface LoginRequest {
  teamCode: string;
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserDTO;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: {
    LEVE: number;
    MODERADO: number;
    GRAVE: number;
    CRITICO: number;
  };
  generatedAt: string;
}

export interface SectorRef {
  id: string;
  name: string;
  sectorCode: string;
}

export interface TropelDTO {
  id: string;
  name: string;
  species: string;
  vitalState: string;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorRef;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface TropelRef {
  id: string;
  name: string;
  species: string;
}

export interface SignalDTO {
  id: string;
  signalType: string;
  severity: string;
  status: string;
  rawContent: string;
  tropel: TropelRef;
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedResponse {
  items: SignalDTO[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SectorDTO {
  id: string;
  sectorCode: string;
  name: string;
  climate: string;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorListResponse {
  items: SectorDTO[];
}

export interface StageMetrics {
  stability: number;
  energy: number;
  alerts: number;
}

export interface StoryStageDTO {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: string;
  metrics: StageMetrics;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorRef2 {
  id: string;
  name: string;
  climate: string;
}

export interface SectorStoryResponse {
  sector: SectorRef2;
  stages: StoryStageDTO[];
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details: Record<string, unknown>;
}
