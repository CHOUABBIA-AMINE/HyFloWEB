# Service URL Fix - Remove Duplicate /api/ Prefix

**Issue Identified**: 2026-01-08 09:36 CET  
**Priority**: HIGH  
**Impact**: All API calls may be failing due to incorrect URLs

---

## Problem Description

### Current Situation

**Axios Base URL** (in `src/shared/config/axios.ts`):
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hyflo/api'
                                                                      ^^^^^^^^ includes /api
```

**Service URLs** (in service files like `CountryService.ts`):
```typescript
const BASE_URL = '/api/general/localization/countries';
                  ^^^^ DUPLICATE /api prefix!
```

**Resulting URL** (WRONG):
```
http://localhost:8080/hyflo/api/api/general/localization/countries
                           ^^^^^^^^ DUPLICATE!
```

### Correct Behavior

**Service URLs should be**:
```typescript
const BASE_URL = '/general/localization/countries';  // No /api prefix!
```

**Resulting URL** (CORRECT):
```
http://localhost:8080/hyflo/api/general/localization/countries
```

---

## Fix Strategy

### Pattern to Find
```typescript
const BASE_URL = '/api/
```

### Pattern to Replace With
```typescript
const BASE_URL = '/
```

**Simple Rule**: Remove the `/api` prefix from all `BASE_URL` constants in service files since it's already in axios baseURL.

---

## Files to Fix

All service files in these modules need checking and fixing:

### General Module Services
- `src/modules/general/localization/services/*.ts` (5+ files)
- `src/modules/general/organization/services/*.ts` (5+ files)
- `src/modules/general/type/services/*.ts` (if any)

### Network Module Services
- `src/modules/network/common/services/*.ts`
- `src/modules/network/core/services/*.ts`
- `src/modules/network/type/services/*.ts`
- `src/modules/network/geo/services/*.ts`
- `src/modules/network/flow/services/*.ts` (if exists)

### System Module Services
- `src/modules/system/auth/services/*.ts`
- `src/modules/system/*/services/*.ts`

**Estimated Files**: 50-100 service files

---

## Quick Fix Options

### Option 1: VS Code Find & Replace (RECOMMENDED)

1. Open VS Code
2. Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)
3. **Find**: `BASE_URL = '/api/`
4. **Replace**: `BASE_URL = '/`
5. **Files to include**: `src/modules/**/*Service.ts`
6. **Preview changes** before replacing
7. Click "Replace All"
8. Review the diff

### Option 2: Using sed (Linux/Mac)

```bash
# Dry run first (see what would change)
find src/modules -name "*Service.ts" -type f -exec grep -l "BASE_URL = '/api/" {} \;

# Apply the fix
find src/modules -name "*Service.ts" -type f -exec sed -i "s|BASE_URL = '/api/|BASE_URL = '/|g" {} +

# For macOS (requires -i '')
find src/modules -name "*Service.ts" -type f -exec sed -i '' "s|BASE_URL = '/api/|BASE_URL = '/|g" {} +

# Verify changes
git diff src/modules
```

### Option 3: Using PowerShell (Windows)

```powershell
# Find affected files first
Get-ChildItem -Path "src/modules" -Filter "*Service.ts" -Recurse | 
  Select-String -Pattern "BASE_URL = '/api/" | 
  Select-Object -ExpandProperty Path -Unique

# Apply the fix
Get-ChildItem -Path "src/modules" -Filter "*Service.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "BASE_URL = '/api/") {
        $content = $content -replace "BASE_URL = '/api/", "BASE_URL = '/"
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.FullName)"
    }
}
```

### Option 4: Manual Review

If you prefer to review each file manually:

```bash
# Find all files with the issue
grep -r "BASE_URL = '/api/" src/modules --include="*Service.ts"
```

Then edit each file individually.

---

## Example Fixes

### Before ❌
```typescript
// src/modules/general/localization/services/CountryService.ts
const BASE_URL = '/api/general/localization/countries';

// src/modules/general/organization/services/OrganizationService.ts
const BASE_URL = '/api/general/organization/organizations';

// src/modules/network/core/services/NetworkService.ts
const BASE_URL = '/api/network/core/networks';

// src/modules/system/auth/services/AuthService.ts
const BASE_URL = '/api/system/auth';
```

### After ✅
```typescript
// src/modules/general/localization/services/CountryService.ts
const BASE_URL = '/general/localization/countries';

// src/modules/general/organization/services/OrganizationService.ts
const BASE_URL = '/general/organization/organizations';

// src/modules/network/core/services/NetworkService.ts
const BASE_URL = '/network/core/networks';

// src/modules/system/auth/services/AuthService.ts
const BASE_URL = '/system/auth';
```

---

## Testing After Fix

### 1. Verify No Syntax Errors
```bash
npm run build
```
**Expected**: Build succeeds without errors

### 2. Verify Code Quality
```bash
npm run lint
```
**Expected**: No new linting errors

### 3. Test Application
```bash
npm run dev
```

### 4. Check Browser Network Tab

Open DevTools → Network tab and look for API calls:

**Before Fix** ❌:
```
GET http://localhost:8080/hyflo/api/api/general/localization/countries → 404
GET http://localhost:8080/hyflo/api/api/system/auth/login → 404
```

**After Fix** ✅:
```
GET http://localhost:8080/hyflo/api/general/localization/countries → 200
POST http://localhost:8080/hyflo/api/system/auth/login → 200
```

### 5. Functional Testing

- ✅ Login works
- ✅ Data loads in tables/lists
- ✅ CRUD operations work (Create, Read, Update, Delete)
- ✅ No 404 errors in console
- ✅ Forms submit successfully
- ✅ Search/filter functionality works

---

## Verification Checklist

- [ ] Ran find & replace
- [ ] Reviewed git diff to verify changes
- [ ] Build completes successfully (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Application starts (`npm run dev`)
- [ ] Network tab shows correct URLs (no `/api/api/`)
- [ ] Login functionality works
- [ ] Data loads correctly in at least 3 modules
- [ ] No 404 errors in console
- [ ] CRUD operations tested
- [ ] Committed changes with descriptive message

---

## Git Commit Message

```bash
git add -A
git commit -m "fix: remove duplicate /api/ prefix from all service URLs

- Axios baseURL already includes '/hyflo/api'
- Service BASE_URL constants should not repeat /api prefix
- Fixed ~50+ service files across all modules
- URLs now correctly resolve without duplication

Before: /hyflo/api/api/general/... (404 Not Found)
After:  /hyflo/api/general/... (200 OK)

Affected modules:
- General (Localization, Organization, Type)
- Network (Common, Core, Type, Geo)
- System (Auth, etc.)

Tested: All API endpoints now return correct responses"

git push origin main
```

---

## Related Files

**Axios Configuration**:
- `src/shared/config/axios.ts` - Defines baseURL with `/hyflo/api`
- `src/lib/api-client.ts` - Re-exports axios instance as `apiClient`

**All Service Files**:
- Pattern: `src/modules/**/services/*Service.ts`
- ~50-100 files total

---

## Why This Happened

This is a common mistake when:
1. Backend API uses `/api` as a base path
2. Axios is configured with baseURL including `/api`
3. Developers also include `/api` in service URLs thinking it's needed
4. Result: Path concatenation creates `/api/api/...`

**The Rule**: 
> When baseURL includes a path segment, service URLs must use **relative paths** without repeating that segment.

**Example**:
- If baseURL = `/hyflo/api`
- Then service URL = `/general/localization/countries` (no /api!)
- Result = `/hyflo/api/general/localization/countries` ✅

---

## Rollback Plan

If issues arise after the fix:

```bash
# Revert all changes in modules directory
git checkout -- src/modules

# Or revert the specific commit
git revert <commit-hash>
git push origin main
```

---

## Impact Assessment

| Aspect | Impact |
|--------|--------|
| **Files Affected** | 50-100 service files |
| **Lines Changed** | 50-100 lines (1 per file) |
| **Risk Level** | LOW (simple find & replace) |
| **Time to Fix** | 2-5 minutes (automated) |
| **Testing Time** | 10-15 minutes |
| **Downtime** | None (dev environment) |
| **Rollback Time** | < 1 minute |

---

**Status**: 🔴 **CRITICAL - NEEDS IMMEDIATE FIX**  
**Action Required**: Run fix script → Test → Commit  
**Estimated Total Time**: 15-20 minutes  
**Next Step**: Choose a fix option and execute
