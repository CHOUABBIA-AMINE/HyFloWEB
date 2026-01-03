# Backend Pagination & Search Specification

## Overview
This document specifies the expected backend implementation for server-side pagination and search functionality for the Structure management endpoints.

## Required Endpoint

### GET `/general/organization/structure`

**Description:** Returns paginated list of structures with optional search and filtering

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 0 | Page number (zero-indexed) |
| `size` | Integer | No | 25 | Number of items per page |
| `sort` | String | No | - | Sort field and direction (e.g., "code,asc" or "designation,desc") |
| `search` | String | No | - | Search term to filter results |
| `structureTypeId` | Long | No | - | Filter by structure type ID |

---

## Request Examples

### 1. Basic Pagination
```http
GET /general/organization/structure?page=0&size=25
```

### 2. Pagination with Search
```http
GET /general/organization/structure?page=0&size=25&search=direction
```

### 3. Pagination with Type Filter
```http
GET /general/organization/structure?page=0&size=25&structureTypeId=1
```

### 4. Combined: Search + Type Filter + Sort
```http
GET /general/organization/structure?page=0&size=25&search=bureau&structureTypeId=2&sort=code,asc
```

---

## Expected Response Format

The backend **MUST** return data in Spring Data `Page` format:

### Success Response (200 OK)

```json
{
  "content": [
    {
      "id": 1,
      "code": "DG",
      "designationFr": "Direction Générale",
      "designationEn": "General Direction",
      "designationAr": "المديرية العامة",
      "structureType": {
        "id": 1,
        "designationFr": "Direction",
        "designationEn": "Direction",
        "designationAr": "مديرية"
      },
      "parentStructure": null
    },
    {
      "id": 2,
      "code": "DRH",
      "designationFr": "Direction des Ressources Humaines",
      "designationEn": "Human Resources Direction",
      "designationAr": "مديرية الموارد البشرية",
      "structureType": {
        "id": 1,
        "designationFr": "Direction",
        "designationEn": "Direction",
        "designationAr": "مديرية"
      },
      "parentStructure": {
        "id": 1,
        "code": "DG"
      }
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "pageNumber": 0,
    "pageSize": 25,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 4,
  "totalElements": 87,
  "last": false,
  "size": 25,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 25,
  "first": true,
  "empty": false
}
```

### Minimum Required Fields

The frontend **requires** these fields in the response:

```json
{
  "content": [...],          // Array of Structure objects
  "totalElements": 87,       // Total count of all matching records
  "totalPages": 4,           // Total number of pages
  "size": 25,                // Items per page
  "number": 0,               // Current page number (zero-indexed)
  "first": true,             // Is this the first page?
  "last": false              // Is this the last page?
}
```

---

## Backend Implementation Guide

### Spring Boot Controller Example

```java
package dz.mdn.iaas.common.administration.controller;

import dz.mdn.iaas.common.administration.dto.StructureDTO;
import dz.mdn.iaas.common.administration.service.StructureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/general/organization/structure")
public class StructureController {

    private final StructureService structureService;

    public StructureController(StructureService structureService) {
        this.structureService = structureService;
    }

    /**
     * Get pageable structures with optional search and filters
     * 
     * @param pageable Spring Pageable (page, size, sort)
     * @param search Optional search term
     * @param structureTypeId Optional structure type filter
     * @return Page of StructureDTO
     */
    @GetMapping
    public Page<StructureDTO> getStructures(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long structureTypeId
    ) {
        return structureService.findAll(search, structureTypeId, pageable);
    }
}
```

### Service Layer Example

```java
package dz.mdn.iaas.common.administration.service;

import dz.mdn.iaas.common.administration.dto.StructureDTO;
import dz.mdn.iaas.common.administration.entity.Structure;
import dz.mdn.iaas.common.administration.repository.StructureRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class StructureService {

    private final StructureRepository structureRepository;

    public StructureService(StructureRepository structureRepository) {
        this.structureRepository = structureRepository;
    }

    /**
     * Find structures with pagination, search, and filters
     */
    public Page<StructureDTO> findAll(
            String search,
            Long structureTypeId,
            Pageable pageable
    ) {
        Specification<Structure> spec = Specification.where(null);

        // Add search filter if provided
        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(hasSearch(search.trim()));
        }

        // Add type filter if provided
        if (structureTypeId != null) {
            spec = spec.and(hasStructureType(structureTypeId));
        }

        // Execute query and map to DTO
        return structureRepository.findAll(spec, pageable)
                .map(this::toDTO);
    }

    /**
     * Search specification: searches in code and all designation fields
     */
    private Specification<Structure> hasSearch(String search) {
        return (root, query, cb) -> {
            String searchPattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("code")), searchPattern),
                cb.like(cb.lower(root.get("designationFr")), searchPattern),
                cb.like(cb.lower(root.get("designationEn")), searchPattern),
                cb.like(cb.lower(root.get("designationAr")), searchPattern)
            );
        };
    }

    /**
     * Structure type filter specification
     */
    private Specification<Structure> hasStructureType(Long typeId) {
        return (root, query, cb) -> 
            cb.equal(root.get("structureType").get("id"), typeId);
    }

    private StructureDTO toDTO(Structure entity) {
        // Map entity to DTO
        // ... implementation
    }
}
```

### Repository Layer Example

```java
package dz.mdn.iaas.common.administration.repository;

import dz.mdn.iaas.common.administration.entity.Structure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface StructureRepository extends 
        JpaRepository<Structure, Long>,
        JpaSpecificationExecutor<Structure> {
    // JpaSpecificationExecutor provides:
    // - Page<T> findAll(Specification<T> spec, Pageable pageable)
}
```

---

## Search Behavior

When `search` parameter is provided, the backend should search in:

1. **code** field (exact or partial match)
2. **designationFr** field (partial match, case-insensitive)
3. **designationEn** field (partial match, case-insensitive)
4. **designationAr** field (partial match, case-insensitive)

**Search Logic:** OR condition (matches any of the above fields)

**Examples:**
- `search=DG` → Finds structures with code "DG", "DG01", or "SDG"
- `search=direction` → Finds structures with "direction" in French, English, or Arabic designation
- `search=مديرية` → Finds structures with Arabic designation containing "مديرية"

---

## Filter Behavior

When `structureTypeId` is provided:
- Filter structures by `structureType.id = structureTypeId`
- Can be combined with search parameter (AND condition)

**Example:**
```
search=bureau&structureTypeId=2
```
Finds structures that:
- Have structure type ID = 2 **AND**
- Contain "bureau" in code or any designation field

---

## Sorting

Support sorting by these fields:
- `code` (default)
- `designationFr`
- `designationEn`
- `designationAr`
- `structureType.designationFr`

**Format:** `field,direction`

**Examples:**
- `sort=code,asc` → Sort by code ascending
- `sort=designationFr,desc` → Sort by French designation descending
- `sort=code,asc&sort=designationFr,asc` → Multi-field sort

---

## Error Responses

### Invalid Page Number (400 Bad Request)
```json
{
  "timestamp": "2026-01-03T21:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Page index must not be less than zero",
  "path": "/general/organization/structure"
}
```

### Invalid Size (400 Bad Request)
```json
{
  "timestamp": "2026-01-03T21:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Page size must be greater than zero",
  "path": "/general/organization/structure"
}
```

---

## Performance Considerations

1. **Database Indexes:** Add indexes on:
   - `code`
   - `designationFr`
   - `designationEn`
   - `designationAr`
   - `structure_type_id` (foreign key)

2. **Query Optimization:**
   - Use JPA Specifications for dynamic queries
   - Avoid N+1 queries (use JOIN FETCH for structureType)
   - Limit max page size (e.g., 100 items)

3. **Caching:**
   - Consider caching structure types
   - Cache frequently accessed pages

---

## Testing Checklist

### Frontend Tests
- [ ] Load first page without filters
- [ ] Navigate to page 2, 3, etc.
- [ ] Search by code
- [ ] Search by French designation
- [ ] Search by English designation
- [ ] Search by Arabic designation
- [ ] Filter by structure type
- [ ] Combine search + type filter
- [ ] Sort by different fields
- [ ] Change page size
- [ ] Clear all filters

### Backend Tests
- [ ] Pageable parameter binding works
- [ ] Search returns correct results
- [ ] Type filter returns correct results
- [ ] Combined filters work correctly
- [ ] Sorting works for all supported fields
- [ ] Total count is accurate
- [ ] Empty search returns all results
- [ ] Invalid page number returns 400
- [ ] Invalid page size returns 400

---

## Migration Path

If backend currently doesn't support pagination:

### Option 1: Implement Full Server-Side (Recommended)
Implement the specification above with JPA Pageable

### Option 2: Temporary Client-Side Fallback (Not Recommended)
The frontend service has fallback logic that handles array responses, but this:
- ❌ Doesn't scale for large datasets
- ❌ Transfers unnecessary data
- ❌ Increases memory usage
- ❌ Slows down the UI

**Action:** Implement server-side pagination as soon as possible.

---

## Additional Notes

- Page numbers are **zero-indexed** (first page = 0)
- Default page size is **25**
- Search is **case-insensitive**
- Search performs **partial matching** (contains)
- Filters use **AND** logic when combined
- Empty search parameter returns all results

---

## Contact

For questions about this specification:
- Frontend: See `src/modules/general/organization/services/StructureService.ts`
- Backend: Implement as specified in this document

---

**Last Updated:** 2026-01-03  
**Version:** 1.0  
**Author:** CHOUABBIA Amine
