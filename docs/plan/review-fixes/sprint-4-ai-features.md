# Sprint 4 — AI Features (3-4 Days)

**Goal:** Add AI-powered natural language task parsing + task enrichment.
**Flagged by:** AI/ML Engineer (9/10 differentiation score)

---

## Step 4.1: Create AI Module Scaffolding (1 hr)

**Files:** New `apps/api/src/ai/` directory
**Issue:** No AI features exist — the #1 recommended differentiator.

- [ ] Create `src/ai/ai.module.ts`:
  - Import BullModule.registerQueue({ name: 'ai' })
  - Providers: AiService, AiController, AiListener, AiProcessor
  - Exports: AiService
- [ ] Install Anthropic SDK: `pnpm add @anthropic-ai/sdk --filter @flowboard/api`
- [ ] Add `ANTHROPIC_API_KEY` to:
  - `.env` and `.env.example`
  - Joi validation schema in `app.module.ts`
- [ ] Import `AiModule` in `app.module.ts`

## Step 4.2: Natural Language Task Parsing Endpoint (4 hrs)

**Files:** `src/ai/ai.service.ts`, `src/ai/ai.controller.ts`, `src/ai/dto/parse-task.dto.ts`
**Goal:** User types "Fix auth bug, high priority, assign to Sarah, due Friday" → structured task data.

- [ ] Create `dto/parse-task.dto.ts`:
  - `input`: @IsString(), @MaxLength(500)
  - `workspaceMembers`: array of { id, firstName, lastName }
  - `workspaceLabels`: array of { id, name }
- [ ] Create `ai.service.ts` with `parseTask()` method:
  - Build system prompt with constrained enums (priority, status values)
  - Include workspace members and labels as context (for name resolution)
  - Call Anthropic API with `tool_use` for structured output:
    ```ts
    tools: [{
      name: 'create_task',
      input_schema: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['LOW','MEDIUM','HIGH','URGENT'] },
        assigneeId: { type: 'string', description: 'ID from provided members list' },
        dueDate: { type: 'string', description: 'ISO date string' },
        labelIds: { type: 'array', items: { type: 'string' } }
      }
    }]
    ```
  - Hard timeout: 5 seconds (AbortController)
  - Return parsed fields or `null` on failure
- [ ] Create `ai.controller.ts`:
  - `POST /ai/parse-task` — @ApiTags('AI')
  - Apply tighter rate limit: `@Throttle({ default: { limit: 20, ttl: 60000 } })`
  - Return parsed task fields
- [ ] Add fallback: if API unavailable, return 503 with `{ fallback: true }`

## Step 4.3: Command Palette AI Integration (3 hrs)

**File:** `apps/web/src/components/command-palette/command-palette.tsx`
**Goal:** Type natural language → see AI-parsed task suggestion → confirm to create.

- [ ] Add new hook `src/hooks/use-ai-parse.ts`:
  - `useAiParse()` — useMutation POST /ai/parse-task
  - 600ms debounce on input
  - Returns parsed fields or null
- [ ] Modify command palette:
  - When input doesn't match any command AND length > 10 chars:
    - Show "AI parsing..." loading indicator
    - After debounce, call `useAiParse()`
  - On success: show preview chip:
    ```
    Create: "Fix auth bug" | HIGH | Sarah | Fri Mar 27
    [Press Enter to create]
    ```
  - On Enter: open CreateTaskModal pre-populated with parsed fields
  - On failure/timeout: show "Could not parse. Press Enter to create manually."
- [ ] Add visual indicator: sparkle icon next to AI-generated suggestions
- [ ] Add keyboard shortcut hint: "Type a task description for AI parsing"

## Step 4.4: AI Task Enrichment on Creation (3 hrs)

**Files:** `src/ai/ai.listener.ts`, `src/ai/ai.processor.ts`, schema migration
**Goal:** When a task is created, AI suggests priority + labels asynchronously.

- [ ] Add schema fields: `aiSuggestedPriority Boolean @default(false)`, `aiSuggestedLabels Boolean @default(false)` to Task model
- [ ] Run `prisma migrate dev --name add-ai-suggested-fields`
- [ ] Create `ai.listener.ts`:
  - `@OnEvent('task.created')` handler
  - Only enrich tasks with description (skip title-only tasks)
  - Add job to `ai` Bull queue
- [ ] Create `ai.processor.ts`:
  - Fetch task + workspace labels from DB
  - Call Anthropic API with structured output:
    - Suggest priority (if user didn't set one / left as MEDIUM default)
    - Suggest 0-3 labels from workspace label set
  - Patch task via `TasksService.update()` with suggestions
  - Set `aiSuggestedPriority = true` / `aiSuggestedLabels = true`
  - Emit `task.updated` event (gateway broadcasts to board)
- [ ] Frontend: add "AI" indicator on task card for AI-suggested fields:
  - Small muted "AI" text badge next to priority/labels
  - Badge disappears when user manually edits that field

## Step 4.5: AI Cost & Safety Controls (1 hr)

- [ ] Add per-workspace "Enable AI" toggle:
  - Add `aiEnabled Boolean @default(true)` to Workspace model
  - Check in AiService before any API call
- [ ] Set monthly spend limit in Anthropic dashboard
- [ ] Add circuit breaker in AiService:
  - Track failures in Redis: `ai:failures` counter with 5min TTL
  - If > 5 failures in 5 min: disable AI calls, return fallback
  - Auto-reset after TTL expires
- [ ] Log all AI API calls in AuditLog with `action: 'AI_ENRICHED'`
- [ ] Document in README: "Task titles/descriptions may be sent to Anthropic API"

## Completion Criteria
- Type "Fix auth bug, high priority, assign to Sarah" in command palette → see parsed preview
- Press Enter → CreateTaskModal opens pre-populated with correct fields
- New tasks with descriptions get AI-suggested priority/labels within 2 seconds
- AI indicator visible on task cards for AI-suggested fields
- AI features degrade gracefully when API is unavailable
- Rate limited to 20 parses/minute per user
