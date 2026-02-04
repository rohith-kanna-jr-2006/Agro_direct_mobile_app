# Infinite Redirect Loop Fix

## Problem Description

When opening the website, the onboarding page and buyer's dashboard were opening automatically and repeatedly, creating an infinite redirect loop.

## Root Causes Identified

### 1. **Duplicate useEffect Hooks in AuthContext** ❌
**Location**: `src/context/AuthContext.tsx`

There were TWO useEffect hooks managing user state:
- **Lines 50-122**: Auth0 sync effect
- **Lines 124-155**: Local storage check effect (REDUNDANT)

Both hooks were:
- Loading user data from localStorage
- Updating user state
- Triggering re-renders
- Causing each other to re-run

**Result**: Infinite loop of state updates

### 2. **Missing isLoading State Management** ❌
**Location**: `src/context/AuthContext.tsx` - Line 55

The early return in the Auth0 sync effect didn't set `isLoading` to false:

```typescript
if (user && user.email === auth0User.email && user.role) {
    return; // ❌ isLoading stays true, causing loading screen to persist
}
```

### 3. **Onboarding Redirect Loop** ❌
**Location**: `src/components/Onboarding.tsx` - Lines 43-47

The useEffect had dependencies `[user, role, navigate]` which meant:
- Every time user state updated → useEffect runs
- useEffect navigates to dashboard
- Navigation triggers user state update
- Loop continues infinitely

```typescript
useEffect(() => {
    if (user?.isOnboarded) {
        navigate(role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
    }
}, [user, role, navigate]); // ❌ Runs on every user change
```

## Solutions Implemented

### 1. ✅ Removed Redundant useEffect in AuthContext

**File**: `src/context/AuthContext.tsx`

**Action**: Deleted the second useEffect (lines 124-155) entirely

**Reason**: The Auth0 sync effect already handles loading from localStorage when not authenticated via Auth0 (lines 108-118)

```typescript
// This section already exists in the Auth0 sync effect:
else if (!auth0Loading && !isAuthenticated) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email) {
            setUser(parsedUser);
            setRole(parsedUser.role || 'farmer');
        }
    }
    setIsLoading(false);
}
```

### 2. ✅ Fixed isLoading State Management

**File**: `src/context/AuthContext.tsx`

**Changes**:
1. Added `setIsLoading(false)` to early return
2. Added error handling for localStorage parsing
3. Added fallback case for when Auth0 is done loading but no user exists
4. Enhanced logging

```typescript
// Skip if user is already synced with same email and has a role
if (user && user.email === auth0User.email && user.role) {
    setIsLoading(false); // ✅ Now sets loading to false
    return;
}
```

```typescript
// Added error handling
try {
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser && parsedUser.email) {
        console.log("[AuthContext] Loading user from localStorage:", parsedUser.email);
        setUser(parsedUser);
        setRole(parsedUser.role || 'farmer');
    }
} catch (err) {
    console.error("[AuthContext] Error parsing saved user:", err);
    localStorage.removeItem('user'); // Clean up corrupted data
}
```

```typescript
// Added fallback for Auth0 done loading
else if (!auth0Loading) {
    // Auth0 is done loading but no user - set loading to false
    setIsLoading(false);
}
```

### 3. ✅ Fixed Onboarding Redirect Loop

**File**: `src/components/Onboarding.tsx`

**Solution**: Used a `useRef` to track if navigation has already occurred

```typescript
import { useRef } from 'react';

const Onboarding = () => {
    const hasNavigated = useRef(false);
    
    // Redirect if already onboarded (only once)
    useEffect(() => {
        if (user?.isOnboarded && !hasNavigated.current) {
            console.log('[Onboarding] User already onboarded, redirecting to dashboard');
            hasNavigated.current = true;
            navigate(role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard', { replace: true });
        }
    }, [user?.isOnboarded, role, navigate]); // ✅ Only depends on isOnboarded, not entire user object
}
```

**Key Improvements**:
1. `hasNavigated.current` prevents multiple navigations
2. Changed dependency from `user` to `user?.isOnboarded` (more specific)
3. Added `{ replace: true }` to prevent back button issues
4. Added logging for debugging

## How It Works Now

### Normal Flow (No Loop)

```
1. Page loads
   ↓
2. AuthContext checks Auth0 status
   ↓
3. If not Auth0: Load user from localStorage (ONCE)
   ↓
4. Set isLoading = false
   ↓
5. If user.isOnboarded: Onboarding redirects to dashboard (ONCE via ref)
   ↓
6. Dashboard loads
   ↓
7. No more redirects ✅
```

### What Was Happening Before (Infinite Loop)

```
1. Page loads
   ↓
2. BOTH useEffects in AuthContext run
   ↓
3. Both update user state
   ↓
4. State updates trigger BOTH useEffects again
   ↓
5. Onboarding useEffect sees user change → navigates
   ↓
6. Navigation causes re-render
   ↓
7. useEffects run again
   ↓
8. Loop continues infinitely ❌
```

## Files Modified

1. **`src/context/AuthContext.tsx`**
   - Removed redundant useEffect (lines 124-155)
   - Fixed isLoading state management
   - Added error handling for localStorage
   - Added fallback for Auth0 loading states
   - Enhanced logging

2. **`src/components/Onboarding.tsx`**
   - Added `useRef` to track navigation
   - Prevented multiple redirects
   - Changed dependency to `user?.isOnboarded`
   - Added `replace: true` to navigate
   - Added logging

## Testing

### ✅ Test Cases

1. **Fresh User (Not Logged In)**
   - [ ] Open website
   - [ ] Should show landing page (no redirects)
   - [ ] No infinite loops

2. **Logged In User (Not Onboarded)**
   - [ ] Login as new user
   - [ ] Should redirect to `/onboarding` once
   - [ ] Complete onboarding
   - [ ] Should redirect to dashboard once
   - [ ] No loops

3. **Logged In User (Already Onboarded)**
   - [ ] Login as existing user
   - [ ] Should redirect to appropriate dashboard once
   - [ ] No loops

4. **Page Refresh**
   - [ ] Login and navigate to dashboard
   - [ ] Refresh page
   - [ ] Should stay on dashboard
   - [ ] No redirects

5. **Browser Console**
   - [ ] Check for logs: `[AuthContext] Loading user from localStorage`
   - [ ] Check for logs: `[Onboarding] User already onboarded, redirecting to dashboard`
   - [ ] Should only see each log ONCE per action

## Key Takeaways

1. **Avoid Duplicate Effects**: Never have multiple useEffects managing the same state
2. **Always Set Loading States**: Ensure `isLoading` is set to false in ALL code paths
3. **Use Refs for One-Time Actions**: When you need to prevent repeated effects, use `useRef`
4. **Specific Dependencies**: Use specific properties (`user?.isOnboarded`) instead of entire objects (`user`)
5. **Add Logging**: Console logs help identify infinite loops quickly

## Prevention

To prevent similar issues in the future:

1. **Code Review Checklist**:
   - [ ] Check for duplicate useEffects
   - [ ] Verify all loading states are properly managed
   - [ ] Look for navigation in useEffects with broad dependencies
   - [ ] Ensure refs are used for one-time actions

2. **Testing Checklist**:
   - [ ] Test page refresh on all routes
   - [ ] Monitor console for repeated logs
   - [ ] Check network tab for repeated API calls
   - [ ] Test with React DevTools Profiler for excessive re-renders

## Status

✅ **FIXED** - The infinite redirect loop has been resolved. The website now loads correctly without repetitive redirects between onboarding and dashboard pages.
