export interface GetAssetsByOwnerResponse {
    jsonrpc: string;
    result: {
        total: number;
        limit: number;
        items: Asset[];
        cursor: string;
    };
    id: string;
}

export interface Asset {
    interface: string;
    id: string;
    content: AssetContent;
    authorities: Authority[];
    compression?: Compression;
    grouping?: [string, string][];
    royalty: Royalty;
    creators: Creator[];
    ownership: Ownership;
    supply?: Supply | null;
    mutable: boolean;
    burnt: boolean;
    lamports?: number;
    executable?: boolean;
    metadata_owner?: string;
    rent_epoch?: number;
    token_info?: TokenInfo;
}

export interface AssetContent {
    $schema: string;
    json_uri: string;
    files: AssetFile[];
    metadata: Metadata;
    links: Links;
}

export interface AssetFile {
    uri: string;
    mime: string;
}

export interface Metadata {
    attributes?: Array<Record<string, any>>;
    description?: string;
    name?: string;
    symbol?: string;
    token_standard?: string;
}

export interface Links {
    animation_url?: string;
    external_url?: string;
    image?: string;
}

export interface Authority {
    address: string;
    scopes: string[];
}

export interface Compression {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
}

export interface Grouping {
    group_key: string;
    group_value: string;
    verified: boolean;
}

export interface Royalty {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
}

export interface Creator {
    address: string;
    share: number;
    verified: boolean;
}

export interface Ownership {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
}

export interface Supply {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number | null;
}

export interface TokenInfo {
    supply: number;
    decimals: number;
    token_program: string;
    mint_authority: string;
    freeze_authority: string;
}

// Base pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
  cursor?: string;
}

// Base sorting parameters
export interface SortingParams {
  sortBy?: 'created' | 'updated' | 'recentAction' | 'none';
  sortDirection?: 'asc' | 'desc';
}

// Now we can extend these base interfaces for specific endpoints
export interface GetAssetsByOwnerParams extends PaginationParams, SortingParams {
  ownerAddress: string;
}

export interface GetAssetResponse {
    jsonrpc: string;
    result: AssetResult;
    id: string;
}

export interface FileInfo {
    uri: string;
    mime: string;
}

export interface Attribute {
    trait_type: string;
    value: string | number;
}

export interface Content {
    "$schema": string;
    json_uri: string;
    files: FileInfo[];
    metadata: Metadata;
    links: Links;
}

export interface AssetResult {
    interface: string;
    id: string;
    content: Content;
    authorities: Authority[];
    compression: Compression;
    grouping: Grouping[];
    royalty: Royalty;
    creators: Creator[];
    ownership: Ownership;
    supply: any;
    mutable: boolean;
    burnt: boolean;
    lamports: number;
    executable: boolean;
    metadata_owner: string;
    rent_epoch: number;
}

// Add these new types for the search parameters
export type SortByOption = "created" | "updated" | "recentAction" | "none";
export type SortDirection = "asc" | "desc";
export type ConditionType = "all" | "any";
export type InterfaceType = "V1_NFT" | "V1_PRINT" | "LEGACY_NFT" | "V2_NFT" | "FungibleAsset" | "Custom" | "Identity" | "Executable";
export type OwnerType = "single" | "token" | "multiple";
export type RoyaltyTargetType = "creators" | "fanout" | "single";

export interface GroupingPair {
  key: string;
  value: string;
}

export interface SearchAssetsParams extends PaginationParams, SortingParams {
  negate?: boolean;
  conditionType?: ConditionType;
  interface?: InterfaceType;
  ownerAddress?: string;
  ownerType?: OwnerType;
  creatorAddress?: string;
  creatorVerified?: boolean;
  authorityAddress?: string;
  grouping?: [string, string];
  delegateAddress?: string;
  frozen?: boolean;
  supply?: number;
  supplyMint?: string;
  compressed?: boolean;
  compressible?: boolean;
  royaltyTargetType?: RoyaltyTargetType;
  royaltyTarget?: string;
  royaltyAmount?: number;
  burnt?: boolean;
  jsonUri?: string;
}

export interface GetAssetProofResponse {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
}

export interface GetAssetsBatchResponse {
  jsonrpc: string;
  result: Asset[];
  id: string;
}

export interface GetAssetProofBatchResponse {
  jsonrpc: string;
  result: {
    [key: string]: GetAssetProofResponse;
  };
  id: string;
}

export interface GetAssetsByOwnerOptions {
  sortBy?: {
    sortBy: string;
    sortDirection: "asc" | "desc";
  };
  limit?: number;
  page?: number;
  before?: string;
  after?: string;
}

export interface PaginationOptions {
  sortBy?: {
    sortBy: string;
    sortDirection: "asc" | "desc";
  };
  limit?: number;
  page?: number;
  before?: string;
  after?: string;
}

export interface GetAssetsByAuthorityParams extends PaginationOptions {
  authorityAddress: string;
}

export interface GetAssetsByCreatorParams extends PaginationParams, SortingParams {
  creatorAddress: string;
  onlyVerified?: boolean;
}

export interface GetAssetsByGroupParams extends PaginationParams, SortingParams {
  groupKey: string;
  groupValue: string;
}

export interface GetAssetsResponse {
  jsonrpc: "2.0";
  result: {
    items: Asset[];
    total: number;
    limit: number;
    page: number;
  };
  id: string;
}

export interface SignatureInfo {
  signature: string;
  type: string;
}

export interface GetSignaturesForAssetParams extends PaginationParams {
  id: string;
}

export interface GetSignaturesResponse {
  jsonrpc: "2.0";
  result: {
    total: number;
    limit: number;
    before?: string;
    after?: string;
    items: [string, string][]; // [signature, type]
  };
  id: string;
}

export interface TokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
}

export interface GetTokenAccountsParams extends PaginationParams {
  owner: string;
  mint?: string;
  options?: {
    showZeroBalance?: boolean;
  };
}

export interface GetTokenAccountsResponse {
  jsonrpc: string;
  result: {
    total: number;
    limit: number;
    before: string | null;
    after: string | null;
    cursor: string | null;
    token_accounts: TokenAccount[];
  };
  id: string;
}