# Forum Pagination API Documentation

This document describes the pagination features added to the forum API endpoints in v3.2.3.

## Overview

Forum pagination prevents excessive data loading by limiting the number of topics and comments returned per request. This improves performance, especially as the forum grows with more content.

## Features

- **Offset-based pagination**: Use `offset` and `limit` parameters
- **Page-based pagination**: Use `page` and `limit` parameters
- **Total count**: Get the total number of items available
- **Has more indicator**: Know if there are more items to load
- **Backward compatible**: Works without pagination parameters (returns paginated results with defaults)

## Topics Pagination

### Endpoint
`GET /api/forum/topics?categoryId={id}`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `categoryId` | integer | required | The category ID to fetch topics from |
| `limit` | integer | 20 | Number of topics per page (max recommended: 100) |
| `offset` | integer | 0 | Number of topics to skip |
| `page` | integer | - | Page number (1-indexed, alternative to offset) |

### Response Format

```json
{
  "topics": [
    {
      "id": "uuid",
      "title": "Topic Title",
      "content": "Topic content...",
      "author_id": "uuid",
      "author_name": "username",
      "category_id": 1,
      "is_pinned": false,
      "is_locked": false,
      "view_count": 42,
      "comment_count": 15,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T12:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

### Usage Examples

**Basic usage (defaults to 20 topics, offset 0):**
```javascript
fetch('/api/forum/topics?categoryId=1')
  .then(res => res.json())
  .then(data => {
    console.log(`Showing ${data.topics.length} of ${data.total} topics`);
    console.log(`Has more: ${data.hasMore}`);
  });
```

**Offset-based pagination:**
```javascript
// Get topics 20-39 (second page with 20 per page)
fetch('/api/forum/topics?categoryId=1&limit=20&offset=20')
  .then(res => res.json())
  .then(data => console.log(data.topics));
```

**Page-based pagination:**
```javascript
// Get page 3 with 15 topics per page
fetch('/api/forum/topics?categoryId=1&page=3&limit=15')
  .then(res => res.json())
  .then(data => console.log(data.topics));
```

**Load more pattern:**
```javascript
let currentOffset = 0;
const limit = 20;

async function loadMore() {
  const response = await fetch(
    `/api/forum/topics?categoryId=1&limit=${limit}&offset=${currentOffset}`
  );
  const data = await response.json();

  displayTopics(data.topics);
  currentOffset += limit;

  if (!data.hasMore) {
    hideLoadMoreButton();
  }
}
```

## Comments Pagination

### Endpoint
`GET /api/forum/comments?topicId={id}`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `topicId` | string (uuid) | required | The topic ID to fetch comments from |
| `limit` | integer | 50 | Number of comments per page (max recommended: 200) |
| `offset` | integer | 0 | Number of comments to skip |
| `page` | integer | - | Page number (1-indexed, alternative to offset) |

### Response Format

```json
{
  "comments": [
    {
      "id": "uuid",
      "topic_id": "uuid",
      "content": "Comment content...",
      "author_id": "uuid",
      "author_name": "username",
      "is_edited": false,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 250,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

### Usage Examples

**Basic usage (defaults to 50 comments, offset 0):**
```javascript
fetch('/api/forum/comments?topicId=abc-123')
  .then(res => res.json())
  .then(data => {
    console.log(`Showing ${data.comments.length} of ${data.total} comments`);
  });
```

**Page-based pagination:**
```javascript
// Get page 2 with 30 comments per page
fetch('/api/forum/comments?topicId=abc-123&page=2&limit=30')
  .then(res => res.json())
  .then(data => console.log(data.comments));
```

**Infinite scroll pattern:**
```javascript
let currentPage = 1;
const limit = 50;

async function loadNextPage() {
  const response = await fetch(
    `/api/forum/comments?topicId=abc-123&page=${currentPage}&limit=${limit}`
  );
  const data = await response.json();

  appendComments(data.comments);
  currentPage++;

  return data.hasMore;
}

// On scroll near bottom
window.addEventListener('scroll', async () => {
  if (isNearBottom() && !loading) {
    loading = true;
    const hasMore = await loadNextPage();
    loading = false;

    if (!hasMore) {
      removeScrollListener();
    }
  }
});
```

## Performance Considerations

### Default Limits

- **Topics**: 20 per page (recommended for category views)
- **Comments**: 50 per page (recommended for topic views)

### Recommended Maximums

- **Topics**: 100 per request (larger values may impact performance)
- **Comments**: 200 per request (larger values may impact performance)

### Database Indexes

Make sure you've run the performance indexes migration:
```sql
-- From docs/database/performance-indexes-migration.sql
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic_id ON forum_comments(topic_id);
```

These indexes ensure pagination queries remain fast as the forum grows.

## Backward Compatibility

All existing frontend code will continue to work. API responses now include pagination metadata, but clients can ignore it if they don't need pagination.

**Old behavior (pre-v3.2.3):**
```javascript
// Response was just an array
const topics = await fetch('/api/forum/topics?categoryId=1').then(r => r.json());
topics.forEach(topic => console.log(topic.title));
```

**New behavior (v3.2.3+):**
```javascript
// Response is an object with topics array and metadata
const data = await fetch('/api/forum/topics?categoryId=1').then(r => r.json());
data.topics.forEach(topic => console.log(topic.title));

// You can also use the metadata
console.log(`Total topics: ${data.total}`);
console.log(`Has more: ${data.hasMore}`);
```

## Frontend Implementation Examples

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useForumTopics(categoryId, limit = 20) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    async function fetchTopics() {
      setLoading(true);
      const response = await fetch(
        `/api/forum/topics?categoryId=${categoryId}&limit=${limit}&offset=${offset}`
      );
      const data = await response.json();

      setTopics(prev => [...prev, ...data.topics]);
      setHasMore(data.hasMore);
      setLoading(false);
    }

    fetchTopics();
  }, [categoryId, limit, offset]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setOffset(prev => prev + limit);
    }
  };

  return { topics, loading, hasMore, loadMore };
}
```

### Vue.js Composable Example

```javascript
import { ref, watchEffect } from 'vue';

export function useForumComments(topicId, limit = 50) {
  const comments = ref([]);
  const loading = ref(true);
  const hasMore = ref(false);
  const page = ref(1);

  watchEffect(async () => {
    loading.value = true;
    const response = await fetch(
      `/api/forum/comments?topicId=${topicId.value}&page=${page.value}&limit=${limit}`
    );
    const data = await response.json();

    if (page.value === 1) {
      comments.value = data.comments;
    } else {
      comments.value.push(...data.comments);
    }

    hasMore.value = data.hasMore;
    loading.value = false;
  });

  const loadMore = () => {
    if (!loading.value && hasMore.value) {
      page.value++;
    }
  };

  return { comments, loading, hasMore, loadMore };
}
```

## Testing

### Manual Testing

**Test pagination works:**
```bash
# Create 30 test topics in category 1, then test:
curl "http://localhost:3000/api/forum/topics?categoryId=1&limit=10&offset=0"
curl "http://localhost:3000/api/forum/topics?categoryId=1&limit=10&offset=10"
curl "http://localhost:3000/api/forum/topics?categoryId=1&limit=10&offset=20"

# Should return:
# - First request: 10 topics, hasMore=true
# - Second request: 10 topics, hasMore=true
# - Third request: 10 topics, hasMore=false
```

**Test page-based pagination:**
```bash
curl "http://localhost:3000/api/forum/topics?categoryId=1&page=1&limit=10"
curl "http://localhost:3000/api/forum/topics?categoryId=1&page=2&limit=10"
```

**Test without pagination parameters:**
```bash
# Should return default (20 topics)
curl "http://localhost:3000/api/forum/topics?categoryId=1"
```

### Automated Testing

```javascript
describe('Forum Topics Pagination', () => {
  it('returns paginated topics with metadata', async () => {
    const response = await fetch('/api/forum/topics?categoryId=1&limit=5&offset=0');
    const data = await response.json();

    expect(data).toHaveProperty('topics');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('limit', 5);
    expect(data).toHaveProperty('offset', 0);
    expect(data).toHaveProperty('hasMore');
    expect(Array.isArray(data.topics)).toBe(true);
    expect(data.topics.length).toBeLessThanOrEqual(5);
  });

  it('calculates hasMore correctly', async () => {
    // Assuming there are 25 topics total
    const response1 = await fetch('/api/forum/topics?categoryId=1&limit=20&offset=0');
    const data1 = await response1.json();
    expect(data1.hasMore).toBe(true);

    const response2 = await fetch('/api/forum/topics?categoryId=1&limit=20&offset=20');
    const data2 = await response2.json();
    expect(data2.hasMore).toBe(false);
  });
});
```

## Migration Guide

### Updating Frontend Code

**Before (v3.2.2 and earlier):**
```javascript
// API returned an array directly
fetch('/api/forum/topics?categoryId=1')
  .then(res => res.json())
  .then(topics => {
    topics.forEach(topic => displayTopic(topic));
  });
```

**After (v3.2.3+):**
```javascript
// API returns an object with topics array
fetch('/api/forum/topics?categoryId=1')
  .then(res => res.json())
  .then(data => {
    data.topics.forEach(topic => displayTopic(topic));

    // Optional: Use pagination metadata
    if (data.hasMore) {
      showLoadMoreButton();
    }
  });
```

### Recommended Migration Steps

1. **Update API calls**: Change `response.json()` to expect object instead of array
2. **Add pagination UI**: Add "Load More" button or infinite scroll
3. **Test thoroughly**: Ensure all forum views work correctly
4. **Update documentation**: Document pagination in your internal docs
5. **Monitor performance**: Check database query performance with pagination

## Troubleshooting

### Issue: Getting empty arrays

**Cause**: Offset is too large (beyond total count)

**Solution**: Check `hasMore` before requesting next page

```javascript
if (data.hasMore) {
  // Safe to load more
} else {
  // No more data available
}
```

### Issue: Duplicate items when paginating

**Cause**: New items added between requests can shift offsets

**Solution**: Use page-based pagination with stable sorting, or implement cursor-based pagination for real-time feeds

### Issue: Slow queries with large offsets

**Cause**: Database needs to skip many rows

**Solution**:
- Ensure indexes are created (see performance-indexes-migration.sql)
- Limit maximum offset (e.g., max 1000)
- Consider cursor-based pagination for very large datasets

## Future Enhancements

Potential improvements for future versions:

1. **Cursor-based pagination**: More efficient for large datasets
2. **Sorting options**: Allow sorting by date, popularity, etc.
3. **Search integration**: Paginate search results
4. **Cache pagination results**: Reduce database load
5. **GraphQL support**: More flexible pagination with GraphQL

---

**Version**: v3.2.3+
**Last Updated**: 2025-01-15
**Author**: EVU Development Team
