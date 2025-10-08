# AI System Architecture

## Overview

This document describes the scalable, industry-standard AI system architecture implemented for the Dentist Abroad Navigator. The system replaces the previous hard-coded approach with a proper vector-based semantic search system.

## Architecture Components

### 1. Content Extraction (`src/lib/content-extractor.ts`)

**Purpose**: Extracts actual content from MDX files instead of generating artificial content.

**Key Features**:

- Uses Fumadocs' `page.data.getText('processed')` method
- Leverages the framework's built-in markdown processing
- Preserves document structure and metadata
- Handles errors gracefully with fallbacks

**Benefits**:

- Uses real content instead of generated text
- Leverages Fumadocs' optimized processing pipeline
- No manual file reading or markdown parsing required
- Automatically adapts to content changes

### 2. Vector Store (`src/lib/vector-store.ts`)

**Purpose**: Manages embeddings and provides semantic search capabilities.

**Key Features**:

- In-memory vector store with OpenAI embeddings
- Cosine similarity search
- Document metadata preservation
- Category-based filtering
- Singleton pattern for efficiency

**Benefits**:

- Industry-standard vector search
- Efficient similarity calculations
- Cached embeddings for performance
- Scalable architecture

### 3. Semantic Search (`src/lib/semantic-search.ts`)

**Purpose**: Provides a clean API for semantic search functionality.

**Key Features**:

- Backward-compatible interface
- Configurable result limits and similarity thresholds
- Error handling and logging
- Integration with vector store

**Benefits**:

- Simple, clean API
- Maintains existing interface
- Easy to extend and modify

## Data Flow

```
MDX Files → Content Extractor → Vector Store → Semantic Search → Chat API
```

1. **Content Extraction**: MDX files are read and processed into structured content
2. **Vector Store**: Content is embedded and stored with metadata
3. **Semantic Search**: Queries are embedded and matched against stored vectors
4. **Chat API**: Search results are formatted and sent to the LLM

## Key Improvements

### Before (Problems)

- ❌ Hard-coded path matching in `get-llm-text.ts`
- ❌ Artificial content generation
- ❌ No proper content extraction
- ❌ Inefficient embedding strategy
- ❌ Not scalable or maintainable

### After (Solutions)

- ✅ Real content extraction from MDX files
- ✅ Proper vector store with embeddings
- ✅ Industry-standard semantic search
- ✅ Efficient caching and performance
- ✅ Scalable and maintainable architecture

## Performance Benefits

1. **Caching**: Embeddings are cached to avoid recomputation
2. **Efficiency**: Only relevant content is processed
3. **Scalability**: Vector store can handle large document collections
4. **Accuracy**: Real content provides better search results

## Usage Examples

### Basic Search

```typescript
import { getRelevantContent } from "@/lib/semantic-search";

const results = await getRelevantContent("dental school requirements", 5);
```

### Direct Vector Store Access

```typescript
import { vectorStore } from "@/lib/vector-store";

// Initialize and search
await vectorStore.initialize();
const docs = await vectorStore.search("TOEFL preparation", 3);

// Category filtering
const aspDocs = vectorStore.getDocumentsByCategory("applying-to-advanced-standing");
```

## Future Enhancements

### Potential Improvements

1. **Vector Database**: Replace in-memory store with Pinecone/Weaviate
2. **Hybrid Search**: Combine semantic and keyword search
3. **RAG Pipeline**: Implement retrieval-augmented generation
4. **Real-time Updates**: Auto-update embeddings when content changes
5. **Analytics**: Track search performance and user queries

### MCP Integration

For production use, consider implementing Model Context Protocol (MCP) for:

- External data sources
- Real-time content updates
- Advanced search capabilities
- Integration with external systems

## Testing

Run the test script to verify the system:

```bash
npx tsx src/lib/test-vector-store.ts
```

## Migration Notes

The new system is backward-compatible with the existing chat API. No changes are required to the frontend or API routes. The system automatically:

1. Extracts content from MDX files
2. Creates embeddings on first use
3. Provides semantic search results
4. Maintains the same response format

## Conclusion

This architecture provides a scalable, maintainable, and industry-standard approach to semantic search. It eliminates the need for hard-coded content generation and provides a foundation for future enhancements.
