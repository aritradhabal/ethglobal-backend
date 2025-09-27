import { GraphNode, GraphRelationship, GraphStats, QueryResult } from "./types";

export interface CreateRelationshipData {
  type: "like" | "dislike" | "split";
  sourceNodeId: string;
  targetNodeId: string;
}
export interface GetRelationships {
  sourceNodeId: string;
  type: "like" | "dislike" | "split";
}

export interface Message {
  address: string;
  content: string;
  counter: number;
}
export interface Uploaded_Profile {
  profilePictureId: string;
  name: string;
}

export interface UserData {
  address: string;
  verified: "Orb" | "Device";
  name: string;
  username: string;
  gender: "Male" | "Female";
  lookingFor: "Male" | "Female" | "Both";
  preferences: string[];
  age: number;
  city: string;
  profilePictureId: string;
  contact?: string;
  messages: Message[];
}

export interface RelationshipData {
  sourceNodeId: string;
  targetNodeId: string;
  type: "like" | "dislike" | "split";
  properties?: string;
}

export interface QueryCommand {
  command: string;
  type: string;
  result: unknown;
  success: boolean;
}

export interface CreateCommandResult {
  nodeId: string;
  type: string;
  properties: Record<string, unknown>;
  variable: string;
}

export interface MatchCommandResult {
  pattern: string;
  matchedNodes?: Array<{
    id: string;
    type: string;
    properties: Record<string, unknown>;
  }>;
  matchedRelationships?: Array<{
    id: string;
    type: string;
    sourceId: string;
    targetId: string;
    properties: Record<string, unknown>;
  }>;
  count: number;
  returnVariable: string;
}

export interface QueryAggregations {
  executedCommands?: number;
  commands?: QueryCommand[];
  timestamp?: string;
  graphStats?: GraphStats;
  error?: string;
  originalQuery?: string;
  [key: string]: unknown;
}

export interface CSVImportSettings {
  nodeColumns: string[];
  nodeTypeColumn: string;
  nodeIdColumn: string;
  relationshipMode: "none" | "sequential" | "properties";
  relationshipType: string;
  sourceColumn: string;
  targetColumn: string;
  skipFirstRow: boolean;
}

export interface CSVRowData {
  [key: string]: string | number | undefined;
}

export interface CSVParseError {
  type: string;
  code: string;
  message: string;
  row?: number;
}

export interface CSVData {
  data: CSVRowData[];
  errors: CSVParseError[];
  meta: {
    fields?: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

export interface ImportNode {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface ImportRelationship {
  type: string;
  sourceId: string;
  targetId: string;
  properties: Record<string, unknown>;
}

export interface EditorState {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  selectedNode: GraphNode | null;
  selectedRelationship: GraphRelationship | null;
  queryResult: QueryResult | null;
  isLoading: boolean;
  error: string | null;
  stats: GraphStats | null;
  savedGraphInfo: {
    blobId: string;
    timestamp: string;
    name: string;
  } | null;
}

export interface CreateForm {
  nodeType: string;
  nodeProps: string;
  relType: string;
  relProps: string;
  sourceNodeId: string;
  targetNodeId: string;
}
export interface SaveForm {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string;
}

export interface D3Node extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Link {
  source: D3Node;
  target: D3Node;
  relationship: GraphRelationship;
}

export interface TransactionParams {
  transaction: unknown;
}

export interface GraphAnalysisResult {
  centrality: Array<{
    nodeId: string;
    degree: number;
    betweenness?: number;
    closeness?: number;
    pagerank?: number;
  }>;
  components: string[][];
  pagerank: Array<{
    nodeId: string;
    degree: number;
    betweenness?: number;
    closeness?: number;
    pagerank?: number;
  }>;
  shortestPaths?: Array<{
    source: string;
    target: string;
    path: string[];
    length: number;
  }>;
}

export interface BrowsedGraph {
  id: string;
  name: string;
  description: string;
  blobId: string;
  owner: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  relationshipCount: number;
  isPublic: boolean;
  tags: string[];
  version: number;
}

export interface ShareGraphState {
  graphId: string | null;
  recipientAddress: string;
  isSharing: boolean;
}

export interface UpdateGraphState {
  graphId: string | null;
  currentMetadata: BrowsedGraph | null;
  name: string;
  description: string;
  tags: string;
  isPublic: boolean;
  isUpdating: boolean;
}

export interface DownloadFormat {
  type: "json" | "csv" | "cypher" | "graphml";
  name: string;
  description: string;
}
