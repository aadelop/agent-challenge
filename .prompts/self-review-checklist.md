# Self-Review Checklist

## **Pre-Submission Requirements**

### **Documentation Compliance**
- [ ] Read and followed `/docs/dev-guidance.md` patterns exactly
- [ ] Applied all rules from `/docs/style-normalization.md`
- [ ] Referenced relevant examples from `/src/examples/`
- [ ] Used explicit imports and type annotations throughout

### **Mastra Integration**
- [ ] Tool uses `execute: async ({ context }) =>` parameter pattern (CRITICAL)
- [ ] Tool has proper `id`, `description`, `inputSchema`, `outputSchema`
- [ ] Agent is defined with `name`, `tools`, `model`, `instructions`
- [ ] Agent is registered in `src/mastra/index.ts` agents object (CRITICAL)
- [ ] Tool is exported from `src/mastra/tools/index.ts`
- [ ] Tool follows input → process → output → error handling lifecycle

### **Nosana Integration** (if applicable)
- [ ] Job payload includes required `idempotencyKey` field
- [ ] Job submission includes proper error handling and retries
- [ ] Mock mode support with `MOCK_MODE=true` environment variable
- [ ] Status checking implemented for async job tracking
- [ ] Proper timeout handling for long-running jobs

### **CopilotKit Integration** (if applicable)
- [ ] `useCopilotAction` properly defined with parameters and handler
- [ ] `useCopilotReadable` exposes relevant state for AI context
- [ ] State updates are deterministic and trigger UI re-renders
- [ ] Error states properly handled and displayed to user
- [ ] Async operations show loading states

### **TypeScript Compliance**
- [ ] All variables have explicit type annotations
- [ ] Interfaces defined for all data structures
- [ ] Error handling uses `error instanceof Error` pattern
- [ ] Environment variables validated with explicit fallbacks
- [ ] Code compiles without errors: `tsc --noEmit`

### **Code Quality**
- [ ] One module = one concern principle followed
- [ ] Public API explicitly exported at bottom of files
- [ ] Only async/await used (no .then() chains or callbacks)
- [ ] External API calls wrapped in retry mechanism
- [ ] Proper separation of concerns (service → tool → agent)

### **Testing Requirements**
- [ ] Unit tests added for all new tools in `__tests__/` directory
- [ ] Integration tests for external API boundaries
- [ ] Mock request/response snapshots for payload validation
- [ ] Error path testing with proper error message validation
- [ ] Tests include both success and failure scenarios

### **Environment & Configuration**
- [ ] Required environment variables documented
- [ ] Mock mode configuration works for development
- [ ] Configuration validates required vs optional settings
- [ ] Default values provided where appropriate
- [ ] No hardcoded URLs or API keys in source code

## **Integration Boundary Checklist**

### **Mastra Tool Boundary**
- [ ] Input schema validation works correctly
- [ ] Output schema matches return values exactly
- [ ] Context parameter extraction handles all input fields
- [ ] Tool execution errors are properly formatted and thrown
- [ ] Tool appears in agent configuration and Playground

### **External API Boundary** (Nosana, Alpha Vantage, etc.)
- [ ] Request payloads match API documentation
- [ ] Response parsing handles all expected fields
- [ ] Rate limiting and retry logic implemented
- [ ] Error responses properly handled and mapped
- [ ] API authentication works in both dev and prod modes

### **UI Integration Boundary** (CopilotKit)
- [ ] Action parameters match user input expectations
- [ ] State changes trigger appropriate UI updates
- [ ] Loading states provide user feedback
- [ ] Error states display meaningful messages
- [ ] Action results format correctly for display

## **Final Verification Steps**

### **Development Server Test**
- [ ] Server starts without compilation errors: `pnpm run dev:agent`
- [ ] Playground accessible at http://localhost:4111
- [ ] New agent/tools visible in Playground interface
- [ ] Tools execute successfully with test inputs
- [ ] Error scenarios handled gracefully

### **Self-Assessment Questions**
1. **Architecture**: Does this code follow the established Mastra → Tools → Services pattern?
2. **Integration**: Will this work correctly with existing agents and tools?
3. **Error Handling**: Are all failure modes properly handled and logged?
4. **Testing**: Can another developer understand and test this code?
5. **Documentation**: Is the code self-documenting with clear types and names?

## **Common Issues to Check**

### **Critical Failures** (Will break the system)
- [ ] Agent not registered in main Mastra configuration
- [ ] Tool parameter destructuring missing `{ context }`
- [ ] Missing required environment variables
- [ ] Import paths incorrect or missing
- [ ] TypeScript compilation errors

### **Runtime Issues** (Will cause tool failures)
- [ ] Async operations without proper error handling
- [ ] External API calls without retry logic
- [ ] Missing input/output schema validation
- [ ] Hardcoded values instead of environment variables
- [ ] State updates in UI components not handled properly

### **Code Quality Issues** (Will cause maintenance problems)
- [ ] Implicit types or any types used
- [ ] Missing error message context
- [ ] No test coverage for new functionality
- [ ] Inconsistent naming conventions
- [ ] Mixed async patterns (callbacks + promises)

## **Final Checklist Format**

When submitting code, include this exact format:

```
Self-Review Completed:
✅ Documentation compliance verified
✅ Mastra integration tested
✅ [Technology] integration verified (if applicable)
✅ TypeScript compilation passes
✅ Development server test successful

Risks: [List specific technical risks]
Assumptions: [What you assumed about environment/requirements]
Follow-ups: [What should be tested/verified by others]
```
