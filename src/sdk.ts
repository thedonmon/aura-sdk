import { CacheProvider } from "./cache";
import fetch from 'cross-fetch';
import { Asset, GetAssetProofResponse, GetAssetResponse, GetAssetsByAuthorityParams, GetAssetsByCreatorParams, GetAssetsByGroupParams, GetAssetsByOwnerParams, GetAssetsByOwnerResponse, GetAssetsResponse, GetSignaturesForAssetParams, GetSignaturesResponse, GetTokenAccountsParams, GetTokenAccountsResponse, SearchAssetsParams, Result, AuraError } from "./types";


export class Aura {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly fullUrl: string;
    private readonly cacheTTL: number;
    private readonly cacheProvider?: CacheProvider;

    /**
     * @param apiKey Your secret API key (keep it server side)
     * @param baseUrl BaseURL for Aura
     * @param options Configuration options
     * @param options.cacheTTL Cache time-to-live in milliseconds (default is 1 minute)
     * @param options.cacheProvider Optional cache provider implementation
     */
    constructor(apiKey: string, baseUrl: string = "https://mainnet-aura.metaplex.com", options?: {
        cacheTTL?: number;
        cacheProvider?: CacheProvider;
    }) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.cacheTTL = options?.cacheTTL ?? 60000;
        this.cacheProvider = options?.cacheProvider;
        this.fullUrl = `${this.baseUrl}/${this.apiKey}`;
    }

    private async makeRequest<T>(method: string, params: any): Promise<Result<T, Error>> {
        try {
            const payload = {
                jsonrpc: "2.0",
                id: 1,
                method,
                params,
            };

            const response = await fetch(this.fullUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: new Error(`HTTP error! status: ${response.status}`)
                };
            }

            const data = await response.json();

            if (AuraError.isAuraErrorResponse(data)) {
                return {
                    success: false,
                    error: new AuraError(data)
                };
            }

            return {
                success: true,
                data
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error occurred')
            };
        }
    }

    /**
     * Fetch a single asset from the Aura endpoint using the configured cache provider.
     * @param assetId The asset id (for example, the mint address)
     * @returns A promise that resolves to the GetAssetResponse.
     * @throws {AuraError} When the API returns an error response
     * @throws {Error} When there's a network or other error
     */
    async getAsset(assetId: string): Promise<Result<GetAssetResponse, Error>> {
        const cacheKey = `asset:${assetId}`;

        // Try to get from cache if a provider is configured
        if (this.cacheProvider) {
            const cachedData = await this.cacheProvider.get(cacheKey);
            if (cachedData) {
                return { success: true, data: JSON.parse(cachedData) };
            }
        }

        const result = await this.makeRequest<GetAssetResponse>("getAsset", { id: assetId });

        if (result.success && this.cacheProvider) {
            await this.cacheProvider.set(
                cacheKey,
                JSON.stringify(result.data),
                Math.floor(this.cacheTTL / 1000)
            );
        }

        return result;
    }

    /**
     * Fetch assets by owner from the Aura endpoint.
     * 
     * NOTE: We are intentionally not caching these results, because caching
     * potentially many pages of assets could quickly fill the Redis store.
     * 
     * The only required parameter is `ownerAddress`. You can optionally provide
     * pagination (`limit` and `page`) as well as sorting options:
     * - sortBy: "created", "updated", "recentAction", or "none"
     * - sortDirection: "asc" (or "desc")
     * 
     * @param params The parameters for fetching assets by owner.
     * @returns A promise that resolves to the GetAssetsByOwnerResponse.
     */
    async getAssetsByOwner(params: GetAssetsByOwnerParams): Promise<Result<GetAssetsByOwnerResponse, Error>> {
        return this.makeRequest<GetAssetsByOwnerResponse>("getAssetsByOwner", params);
    }

    /**
     * Async generator helper for paginating through assets by owner.
     * 
     * This helper iterates over the pages automatically until all assets have been fetched.
     * 
     * Example usage:
     * 
     * for await (const page of sdk.paginateAssetsByOwner({ ownerAddress: "ADDRESS_HERE", limit: 100 })) {
     *   // process page.result.items
     * }
     * 
     * @param params The parameters for fetching assets by owner (except for the page number).
     */
    async *paginateAssetsByOwner(
        params: Omit<GetAssetsByOwnerParams, "page">
    ): AsyncGenerator<Result<GetAssetsByOwnerResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.getAssetsByOwner({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (currentPage * limit >= response.data.result.total) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Search for assets using various criteria.
     * @param params Search parameters
     * @returns A promise that resolves to the search results
     */
    async searchAssets(params: SearchAssetsParams): Promise<Result<GetAssetsByOwnerResponse, Error>> {
        return this.makeRequest<GetAssetsByOwnerResponse>("searchAssets", params);
    }

    /**
     * Helper method to paginate through search results.
     * @param params Search parameters (excluding page number)
     */
    async *paginateSearchAssets(
        params: Omit<SearchAssetsParams, "page">
    ): AsyncGenerator<Result<GetAssetsByOwnerResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.searchAssets({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (currentPage * limit >= response.data.result.total) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Get proof for a compressed NFT
     * @param assetId The asset id to get proof for
     */
    async getAssetProof(assetId: string): Promise<Result<GetAssetProofResponse, Error>> {
        const cacheKey = `proof:${assetId}`;

        if (this.cacheProvider) {
            const cachedData = await this.cacheProvider.get(cacheKey);
            if (cachedData) {
                return { success: true, data: JSON.parse(cachedData) };
            }
        }

        const result = await this.makeRequest<GetAssetProofResponse>("getAssetProof", { id: assetId });

        if (result.success && this.cacheProvider) {
            await this.cacheProvider.set(
                cacheKey,
                JSON.stringify(result.data),
                Math.floor(this.cacheTTL / 1000)
            );
        }

        return result;
    }

    /**
     * Get multiple assets in a single request
     * @param assetIds Array of asset ids to fetch
     */
    async getAssetBatch(assetIds: string[]): Promise<Result<Asset[], Error>> {
        return this.makeRequest<Asset[]>("getAssetBatch", { ids: assetIds });
    }

    /**
     * Get proofs for multiple compressed NFTs in a single request
     * @param assetIds Array of asset ids to get proofs for
     */
    async getAssetProofBatch(assetIds: string[]): Promise<Result<{ [key: string]: GetAssetProofResponse }, Error>> {
        return this.makeRequest<{ [key: string]: GetAssetProofResponse }>("getAssetProofBatch", { ids: assetIds });
    }

    /**
     * Get assets by authority address
     * @param params Parameters including authority address and pagination options
     */
    async getAssetsByAuthority(params: GetAssetsByAuthorityParams): Promise<Result<GetAssetsResponse, Error>> {
        return this.makeRequest<GetAssetsResponse>("getAssetsByAuthority", params);
    }

    /**
     * Get assets by creator address
     * @param params Parameters including creator address and pagination options
     */
    async getAssetsByCreator(params: GetAssetsByCreatorParams): Promise<Result<GetAssetsResponse, Error>> {
        return this.makeRequest<GetAssetsResponse>("getAssetsByCreator", params);
    }

    /**
     * Get assets by group (e.g., collection)
     * @param params Parameters including group key, value and pagination options
     */
    async getAssetsByGroup(params: GetAssetsByGroupParams): Promise<Result<GetAssetsResponse, Error>> {
        return this.makeRequest<GetAssetsResponse>("getAssetsByGroup", params);
    }

    /**
     * Helper method to paginate through assets by authority
     * @param params Parameters excluding page number
     */
    async *paginateAssetsByAuthority(
        params: Omit<GetAssetsByAuthorityParams, "page">
    ): AsyncGenerator<Result<GetAssetsResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.getAssetsByAuthority({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (currentPage * limit >= response.data.result.total) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Helper method to paginate through assets by creator
     * @param params Parameters excluding page number
     */
    async *paginateAssetsByCreator(
        params: Omit<GetAssetsByCreatorParams, "page">
    ): AsyncGenerator<Result<GetAssetsResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.getAssetsByCreator({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (currentPage * limit >= response.data.result.total) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Helper method to paginate through assets by group
     * @param params Parameters excluding page number
     */
    async *paginateAssetsByGroup(
        params: Omit<GetAssetsByGroupParams, "page">
    ): AsyncGenerator<Result<GetAssetsResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.getAssetsByGroup({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (currentPage * limit >= response.data.result.total) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Get signatures for an asset
     * @param params Parameters including asset id and pagination options
     * @returns A promise that resolves to the signatures response
     */
    async getSignaturesForAsset(params: GetSignaturesForAssetParams): Promise<Result<GetSignaturesResponse, Error>> {
        return this.makeRequest<GetSignaturesResponse>("getSignaturesForAsset", params);
    }

    /**
     * Helper method to paginate through signatures for an asset
     * @param params Parameters excluding page number
     */
    async *paginateSignaturesForAsset(
        params: Omit<GetSignaturesForAssetParams, "page">
    ): AsyncGenerator<Result<GetSignaturesResponse, Error>, void, unknown> {
        let currentPage = 1;
        while (true) {
            const response = await this.getSignaturesForAsset({ ...params, page: currentPage });
            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (response.data.result.items.length < limit) {
                break;
            }

            currentPage++;
        }
    }

    /**
     * Get token accounts by owner address
     * @param params Parameters including owner address and pagination options
     * @returns A promise that resolves to the token accounts response
     */
    async getTokenAccounts(params: GetTokenAccountsParams): Promise<Result<GetTokenAccountsResponse, Error>> {
        return this.makeRequest<GetTokenAccountsResponse>("getTokenAccounts", params);
    }

    /**
     * Helper method to paginate through all token accounts
     * @param params Parameters including owner address and pagination options
     */
    async *paginateTokenAccounts(params: GetTokenAccountsParams): AsyncGenerator<Result<GetTokenAccountsResponse, Error>, void, unknown> {
        let currentPage = params.page || 1;

        while (true) {
            const response = await this.getTokenAccounts({
                ...params,
                page: currentPage
            });

            yield response;

            if (!response.success) break;

            const limit = params.limit || response.data.result.limit;

            if (response.data.result.token_accounts.length < limit) {
                break;
            }

            currentPage++;
        }
    }
} 