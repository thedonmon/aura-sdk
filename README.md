# Aura SDK

A TypeScript SDK for interacting with the Aura API, providing a simple interface for querying NFT assets and token accounts on Solana.

## Features

- 🔑 Simple authentication with API keys
- 💾 Optional caching support with customizable providers
- 📄 Built-in pagination helpers
- 🔄 Comprehensive asset querying capabilities
- 📦 Full TypeScript support
- 🌐 Cross-platform compatibility (Node.js and browser)

## Installation
```bash
npm install aura-sdk
```
## Quick Start
```typescript
import { Aura, MemoryCache } from 'aura-sdk';
// Initialize the SDK
const sdk = new Aura('your-api-key', 'https://mainnet-aura.metaplex.com', {
cacheTTL: 60000, // 1 minute
cacheProvider: new MemoryCache(),
});
// Fetch a single asset
const asset = await sdk.getAsset('asset-id');
// Fetch assets by owner with pagination
for await (const page of sdk.paginateAssetsByOwner({
ownerAddress: 'owner-address',
limit: 100
})) {
console.log(page.result.items);
}

```
## API Reference

### Constructor
```typescript
new Aura(
apiKey: string,
baseUrl?: string,
options?: {
cacheTTL?: number;
cacheProvider?: CacheProvider;
}
)
```
### Digital Asset Standard (DAS) Methods

#### Asset Operations
- `getAsset(assetId: string)`: Fetch a single asset
- `getAssetBatch(assetIds: string[])`: Fetch multiple assets in one request
- `searchAssets(params: SearchAssetsParams)`: Search assets with various criteria

#### Asset Queries by Owner/Creator
- `getAssetsByOwner(params: GetAssetsByOwnerParams)`: Fetch assets by owner address
- `getAssetsByAuthority(params: GetAssetsByAuthorityParams)`: Fetch assets by authority
- `getAssetsByCreator(params: GetAssetsByCreatorParams)`: Fetch assets by creator
- `getAssetsByGroup(params: GetAssetsByGroupParams)`: Fetch assets by group/collection

#### Compressed NFTs
- `getAssetProof(assetId: string)`: Get proof for a compressed NFT
- `getAssetProofBatch(assetIds: string[])`: Get proofs for multiple compressed NFTs

#### Token Operations
- `getTokenAccounts(params: GetTokenAccountsParams)`: Get token accounts by owner
- `getSignaturesForAsset(params: GetSignaturesForAssetParams)`: Get signatures for an asset

### Pagination Helpers

All main query methods have corresponding pagination helpers:
- `paginateAssetsByOwner(params)`
- `paginateAssetsByAuthority(params)`
- `paginateAssetsByCreator(params)`
- `paginateAssetsByGroup(params)`
- `paginateSearchAssets(params)`
- `paginateSignaturesForAsset(params)`
- `paginateTokenAccounts(params)`

### Caching

The SDK includes optional caching support through the `CacheProvider` interface:

## Error Handling

The SDK provides detailed error information through the `AuraError` class:

```typescript
try {
  const asset = await sdk.getAsset('invalid-pubkey');
} catch (error) {
  if (error instanceof AuraError) {
    console.error(`Aura API Error ${error.code}: ${error.message}`);
    // Handle specific error codes
    switch (error.code) {
      case -32000:
        console.error('Invalid public key provided');
        break;
      case -32001:
        console.error('Rate limit exceeded');
        break;
      // ... handle other error codes
    }
  } else {
    console.error('Network or other error:', error);
  }
}
```

Common error codes:
- `-32000`: Invalid public key
- `-32001`: Rate limit exceeded
- `-32602`: Invalid parameter
- `-32601`: Method not found
- `-32603`: Internal server error

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions for all APIs and models.

## Documentation

For more detailed information about Aura and its capabilities, visit the [official Metaplex Aura documentation](https://developers.metaplex.com/aura).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
