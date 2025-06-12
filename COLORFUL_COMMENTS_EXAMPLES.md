# Colorful Comments Examples

This file demonstrates the different colorful comment types available with the Colorful Comments extension:

## Comment Types

### Red (!) - Errors, Warnings, Important Notes
```typescript
// ! CRITICAL: This function handles sensitive user data
// ! WARNING: Do not modify this without thorough testing
// ! ERROR: Known issue with this implementation
```

### Blue (?) - Questions, Investigations
```typescript
// ? TODO: Should we cache this result?
// ? INVESTIGATE: Why is this slower than expected?
// ? QUESTION: Is this the best approach?
```

### Green (*) - Success, Completed, Positive Notes
```typescript
// * SUCCESS: Feature implementation completed
// * DONE: All tests passing
// * GOOD: Optimized for performance
```

### Yellow (^) - Highlights, Important Information
```typescript
// ^ IMPORTANT: This is the main entry point
// ^ HIGHLIGHT: Pay attention to this section
// ^ KEY: This configuration affects the entire app
```

### Pink (&) - Special Cases, Annotations
```typescript
// & SPECIAL: Edge case handling
// & NOTE: This is a workaround for browser compatibility
// & ANNOTATION: Custom implementation required
```

### Purple (~) - Deprecated, Old Code
```typescript
// ~ DEPRECATED: Use the new API instead
// ~ OLD: Legacy code - remove in next version
// ~ OBSOLETE: No longer needed
```

### Mustard (todo) - TODO Items
```typescript
// todo Implement user authentication
// todo Add error handling
// todo Optimize database queries
```

### Grey (//) - Regular Comments
```typescript
// Regular comment without special highlighting
// Standard documentation comment
// Normal inline explanation
```

## Examples in Your Codebase

The following files have been updated with colorful comments:

- `lib/db.ts` - Database configuration and setup
- `next-env.d.ts` - TypeScript configuration
- `components/ui/sidebar.tsx` - Sidebar component implementation
- `components/ui/chart.tsx` - Chart utilities

Each comment type will appear in a different color in VS Code when the Colorful Comments extension is active.
