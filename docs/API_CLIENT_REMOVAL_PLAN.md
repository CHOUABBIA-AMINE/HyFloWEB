# API Client Removal - Migration Plan

**Started**: 2026-01-08 09:46 CET  
**Status**: 🔵 IN PROGRESS  
**Priority**: MEDIUM (Cleanup & Simplification)

---

## Objective

Remove the unnecessary `api-client.ts` wrapper and migrate all services to use `axiosInstance` directly.

**Combined with**: Fix duplicate `/api/` prefix in service URLs.

---

## Why Remove api-client.ts?

### Current Setup (Unnecessary Complexity)

```typescript
// src/lib/api-client.ts
import axiosInstance from '../shared/config/axios';
export const apiClient = axiosInstance;  // Just re-exports!
```

### Problems

1. **Adds no value** - Just a simple re-export
2. **Inconsistent usage** - AuthService already uses axiosInstance directly
3. **Extra abstraction** - Makes code harder to understand
4. **Maintenance overhead** - One more file to maintain

### Benefits of Removal

✅ **Simpler imports** - Direct, explicit imports  
✅ **One pattern** - All services use same import  
✅ **Less confusion** - Clear where axios comes from  
✅ **Fewer files** - Cleaner codebase  
✅ **Consistent with AuthService** - Already uses direct import  

---

## Migration Steps

### Step 1: Update All Service Imports

**Pattern to Find**:
```typescript
import { apiClient } from '@/lib/api-client';
```

**Replace With**:
```typescript
import axiosInstance from '@/shared/config/axios';
```

### Step 2: Update All apiClient Usage

**Pattern to Find**:
```typescript
apiClient.get(...)
apiClient.post(...)
apiClient.put(...)
apiClient.delete(...)
apiClient.patch(...)
```

**Replace With**:
```typescript
axiosInstance.get(...)
axiosInstance.post(...)
axiosInstance.put(...)
axiosInstance.delete(...)
axiosInstance.patch(...)
```

### Step 3: Fix BASE_URL Paths (Remove /api/ prefix)

**Pattern to Find**:
```typescript
const BASE_URL = '/api/...';
private readonly BASE_URL = '/api/...';
```

**Replace With**:
```typescript
const BASE_URL = '/...';  // No /api prefix
private readonly BASE_URL = '/...';  // No /api prefix
```

### Step 4: Delete api-client.ts

```bash
rm src/lib/api-client.ts
```

### Step 5: Verify & Test

```bash
npm run build
npm run lint
npm run dev
```

---

## Affected Files

### Services Using apiClient (Need Migration)

**General Module**:
- `src/modules/general/localization/services/*.ts` (~5 files)
- `src/modules/general/organization/services/*.ts` (~4 files)
- `src/modules/general/type/services/*.ts` (if any)

**Network Module**:
- `src/modules/network/common/services/*.ts`
- `src/modules/network/core/services/*.ts` (~9 files)
- `src/modules/network/type/services/*.ts`
- `src/modules/network/geo/services/*.ts`

**Total Estimated**: ~30-50 service files

### Files Already Correct

- `src/modules/system/auth/services/AuthService.ts` ✅ (uses axiosInstance)
- `src/modules/system/security/services/*.ts` (need to check)

---

## Migration Script

### Automated Fix (Linux/Mac)

```bash
#!/bin/bash
# API Client Removal Script

echo "Step 1: Replace import statements..."
find src/modules -type f -name "*.ts" -exec sed -i '' \
  "s|import { apiClient } from '@/lib/api-client';|import axiosInstance from '@/shared/config/axios';|g" {} +

echo "Step 2: Replace apiClient usage..."
find src/modules -type f -name "*.ts" -exec sed -i '' \
  "s|apiClient\.|axiosInstance.|g" {} +

echo "Step 3: Fix BASE_URL paths (remove /api prefix)..."
find src/modules -type f -name "*Service.ts" -exec sed -i '' \
  "s|BASE_URL = '/api/|BASE_URL = '/|g" {} +

echo "Step 4: Check for missed patterns..."
grep -r "apiClient" src/modules --include="*.ts" || echo "All apiClient references replaced!"

echo "Step 5: Verify no import errors..."
grep -r "@/lib/api-client" src/modules --include="*.ts" || echo "All imports updated!"

echo "✅ Migration complete! Now run:"
echo "  npm run build"
echo "  npm run lint"
echo "  npm run dev"
echo ""
echo "If tests pass, delete api-client.ts:"
echo "  rm src/lib/api-client.ts"
```

### For macOS (note the '' after -i)

Use `sed -i ''` instead of `sed -i`

### For Linux

Use `sed -i` (without the '')

### For Windows PowerShell

```powershell
# Step 1: Replace imports
Get-ChildItem -Path "src/modules" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "import \{ apiClient \} from '@/lib/api-client';", "import axiosInstance from '@/shared/config/axios';"
    $content = $content -replace "apiClient\.", "axiosInstance."
    Set-Content $_.FullName -Value $content -NoNewline
}

# Step 2: Fix BASE_URL
Get-ChildItem -Path "src/modules" -Filter "*Service.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "BASE_URL = '/api/", "BASE_URL = '/"
    Set-Content $_.FullName -Value $content -NoNewline
}

Write-Host "Migration complete! Run: npm run build"
```

---

## Manual Migration Example

### Before ❌

```typescript
/**
 * Facility Service
 */
import { apiClient } from '@/lib/api-client';
import type { FacilityDTO } from '../dto/FacilityDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/core/facilities';

export class FacilityService {
  static async getAll(pageable: Pageable): Promise<Page<FacilityDTO>> {
    const response = await apiClient.get<Page<FacilityDTO>>(BASE_URL, {
      params: { page: pageable.page, size: pageable.size }
    });
    return response.data;
  }

  static async create(dto: FacilityDTO): Promise<FacilityDTO> {
    const response = await apiClient.post<FacilityDTO>(BASE_URL, dto);
    return response.data;
  }
}
```

### After ✅

```typescript
/**
 * Facility Service
 */
import axiosInstance from '@/shared/config/axios';
import type { FacilityDTO } from '../dto/FacilityDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/facilities';  // No /api prefix!

export class FacilityService {
  static async getAll(pageable: Pageable): Promise<Page<FacilityDTO>> {
    const response = await axiosInstance.get<Page<FacilityDTO>>(BASE_URL, {
      params: { page: pageable.page, size: pageable.size }
    });
    return response.data;
  }

  static async create(dto: FacilityDTO): Promise<FacilityDTO> {
    const response = await axiosInstance.post<FacilityDTO>(BASE_URL, dto);
    return response.data;
  }
}
```

### Changes Made

1. ✅ Import changed: `apiClient` → `axiosInstance`
2. ✅ Import path changed: `@/lib/api-client` → `@/shared/config/axios`
3. ✅ Usage changed: `apiClient.get` → `axiosInstance.get`
4. ✅ BASE_URL fixed: `/api/network/...` → `/network/...`

---

## Testing Checklist

### Build & Lint

- [ ] `npm run build` - Completes without errors
- [ ] `npm run lint` - No new linting errors
- [ ] No TypeScript errors
- [ ] No import errors

### Runtime Testing

- [ ] Application starts: `npm run dev`
- [ ] Login works
- [ ] Data loads in tables/lists
- [ ] CRUD operations work
- [ ] No console errors
- [ ] Network tab shows correct URLs (no `/api/api/`)

### Module-Specific Testing

- [ ] **General/Localization** - Countries, states, locations load
- [ ] **General/Organization** - Persons, employees, structures work
- [ ] **Network/Core** - Facilities, pipelines, terminals work
- [ ] **Network/Geo** - Map features work
- [ ] **System/Auth** - Login/logout still works (already using axiosInstance)

### URL Verification

Check Network tab in DevTools:

**Should see** ✅:
```
GET /hyflo/api/general/localization/countries
GET /hyflo/api/network/core/facilities
POST /hyflo/api/auth/login
```

**Should NOT see** ❌:
```
GET /hyflo/api/api/general/...
GET /hyflo/api/api/network/...
```

---

## Rollback Plan

If issues occur:

### Option 1: Git Revert

```bash
# Revert the commit
git revert <commit-hash>
git push origin main
```

### Option 2: Manual Rollback

```bash
# Restore from git
git checkout HEAD~1 -- src/modules
git checkout HEAD~1 -- src/lib/api-client.ts

# Commit
git commit -m "Rollback: Restore api-client.ts"
git push origin main
```

---

## Git Commit Message

```bash
git add -A
git commit -m "refactor: remove api-client.ts wrapper and fix service URLs

REMOVED:
- src/lib/api-client.ts (unnecessary re-export wrapper)

CHANGED:
- All services now import axiosInstance directly from @/shared/config/axios
- Updated ~30-50 service files
- Replaced all apiClient.* calls with axiosInstance.*
- Removed duplicate /api/ prefix from all BASE_URL constants

BENEFITS:
- Simpler, more direct imports
- Consistent pattern across all services
- Cleaner codebase
- Easier to understand
- Fixed duplicate /api/api/ URL issue

Before: import { apiClient } from '@/lib/api-client'
        const BASE_URL = '/api/general/...'
        Result: /hyflo/api/api/general/... (404)

After:  import axiosInstance from '@/shared/config/axios'
        const BASE_URL = '/general/...'
        Result: /hyflo/api/general/... (200)

Tested: All modules load correctly, API calls work"

git push origin main
```

---

## Progress Tracking

### Phase 1: Preparation ✅
- [x] Document migration plan
- [x] Create migration scripts
- [x] Identify affected files

### Phase 2: Execute Migration ⏳
- [ ] Run migration script
- [ ] Review git diff
- [ ] Verify all files updated

### Phase 3: Testing ⏳
- [ ] Build succeeds
- [ ] Linter passes
- [ ] Application runs
- [ ] API calls work
- [ ] No console errors

### Phase 4: Cleanup ⏳
- [ ] Delete api-client.ts
- [ ] Final verification
- [ ] Commit changes
- [ ] Update documentation

---

## Estimated Time

| Task | Time |
|------|------|
| Run script | 1 minute |
| Review changes | 5 minutes |
| Build & lint | 2 minutes |
| Testing | 10 minutes |
| Commit | 2 minutes |
| **Total** | **~20 minutes** |

---

**Status**: 🔵 Ready to Execute  
**Next Step**: Run migration script  
**Risk Level**: LOW (easy to rollback)
