# Backend Pagination & Search Specification

## Overview
This document specifies the expected backend implementation for server-side pagination and search functionality for the Structure management endpoints.

## Required Endpoints

### 1. GET `/general/organization/structure`

**Description:** Returns paginated list of structures without search

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 0 | Page number (zero-indexed) |
| `size` | Integer | No | 25 | Number of items per page |
| `sort` | String | No | - | Sort field and direction (e.g., "code,asc") |
| `structureTypeId` | Long | No | - | Filter by structure type ID |

### 2. GET `/general/organization/structure/search`

**Description:** Search structures with pagination

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | String | Yes | - | Search query term |
| `page` | Integer | No | 0 | Page number (zero-indexed) |
| `size` | Integer | No | 25 | Number of items per page |
| `sort` | String | No | - | Sort field and direction |
| `structureTypeId` | Long | No | - | Filter by structure type ID |

---

## Frontend Request Examples

**Without Search (uses list endpoint):**
```
GET /general/organization/structure?page=0&size=25
GET /general/organization/structure?page=0&size=25&structureTypeId=1
```

**With Search (uses search endpoint):**
```
GET /general/organization/structure/search?q=direction&page=0&size=25
GET /general/organization/structure/search?q=bureau&page=0&size=25&structureTypeId=2
```

---

## Expected Response Format

Both endpoints **MUST** return Spring Page format. See full specification for details.

---

**Last Updated:** 2026-01-03  
**Version:** 2.0  
**Author:** CHOUABBIA Amine
