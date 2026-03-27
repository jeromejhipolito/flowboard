# Phase 2 — Visual Design Overhaul (BR-4)

**Duration:** 90 minutes | **Priority:** HIGH — Portfolio polish

---

## Step 2.1: Replace Color Palette (globals.css) — 10 min

**REWRITE:** `apps/web/src/app/globals.css`
- [ ] Replace entire file with new indigo-violet palette
- [ ] Light mode: background #f8f7ff, primary #5b4ff5, border #e5e3fb
- [ ] Dark mode: 3-level elevation (#0c0c14 / #14141f / #1c1c2e)
- [ ] Dark primary: #7c6ff7 (brighter for readability)
- [ ] Add gradient tokens: `--gradient-primary`, `--gradient-surface`
- [ ] Add scrollbar styling for dark mode
- [ ] Add page entrance animation keyframes (`slide-up-fade`)
- [ ] Add `.animate-enter` + delay classes for staggered entrance
- [ ] Add `@media (prefers-reduced-motion)` fallback

## Step 2.2: Landing Page Hero — 10 min

**EDIT:** `apps/web/src/app/page.tsx`
- [ ] Add radial gradient background blob (rgba(91,79,245,0.12))
- [ ] Add status chip: green dot + "Real-time collaboration — built for teams"
- [ ] Gradient "Flow" text: `bg-gradient-to-br from-[#5b4ff5] via-[#8b5cf6] to-[#c4b5fd] bg-clip-text text-transparent`
- [ ] Gradient CTA button: `style={{ background: 'var(--gradient-primary)' }}`
- [ ] Outline secondary button with hover border-primary/40
- [ ] Both buttons: `active:scale-[0.97]` press feedback

## Step 2.3: Auth Layout Gradient — 5 min

**EDIT:** `apps/web/src/app/(auth)/layout.tsx`
- [ ] Add radial gradient background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,79,245,0.15) 0%, transparent 70%)`
- [ ] Add FlowBoard logo icon (rounded-xl bg-primary + FolderKanban icon)
- [ ] Logo text beside icon

## Step 2.4: Sidebar Redesign — 15 min

**EDIT:** `apps/web/src/components/layout/sidebar.tsx`
- [ ] Logo: gradient text "Flow" + regular "Board" with bg-primary icon
- [ ] Active link: `before:absolute before:left-0 before:w-[3px] before:bg-primary` left accent bar
- [ ] Active link bg: `bg-primary/12 text-primary font-semibold`
- [ ] Inactive: `text-muted-foreground hover:bg-accent hover:text-foreground`
- [ ] Add section labels: `text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60`
- [ ] Workspace avatar: gradient background `var(--gradient-primary)`
- [ ] Add `transition-all duration-150` to all nav links

## Step 2.5: Card Shadow System — 5 min

**EDIT:** `apps/web/src/components/ui/card.tsx`
- [ ] Default: `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
- [ ] Hover: `hover:shadow-[0_4px_12px_rgba(91,79,245,0.12)]`
- [ ] Hover lift: `hover:-translate-y-0.5`
- [ ] Transition: `transition-all duration-200`
- [ ] Rounded: `rounded-xl` (upgrade from rounded-lg)

## Step 2.6: Button Press Feedback — 2 min

**EDIT:** `apps/web/src/components/ui/button.tsx`
- [ ] Add to base CVA class: `active:scale-[0.97] active:brightness-95`
- [ ] Add `transition-all duration-150` if not present

## Step 2.7: Kanban Column Accent Bars — 10 min

**EDIT:** `apps/web/src/components/board/kanban-column.tsx`
- [ ] Add 3px colored top accent bar: `<div className="h-[3px] w-full" style={{ background: statusColor }} />`
- [ ] Column header: `text-xs font-bold uppercase tracking-widest` with `style={{ color: statusColor }}`
- [ ] Remove the colored dot, replace with colored text
- [ ] Column bg: `bg-muted/40 dark:bg-card/60` with border
- [ ] Count badge: rounded-full with bg-muted

## Step 2.8: Task Card Priority Border — 10 min

**EDIT:** `apps/web/src/components/board/task-card.tsx`
- [ ] Add left accent border: `<div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ backgroundColor: priorityColor }} />`
- [ ] Card hover: `hover:-translate-y-0.5 hover:border-primary/30`
- [ ] Hover shadow: `hover:shadow-[0_4px_12px_rgba(91,79,245,0.1)]`
- [ ] Drag overlay: stronger shadow + `border-primary/50`
- [ ] Add `pl-2` to inner content wrapper to clear the accent bar

## Step 2.9: Page Entrance Animations — 10 min

- [ ] Kanban columns: add `animate-enter animate-enter-delay-{index}` classes
- [ ] Workspace cards: same staggered entrance
- [ ] Analytics chart widgets: already have Suspense + stagger (verify)

## Step 2.10: Verify Visual Changes

- [ ] Light mode: violet-tinted background, clear card separation, gradient CTA
- [ ] Dark mode: 3-level elevation visible, cards distinct from background
- [ ] Sidebar: gradient logo, left accent on active link
- [ ] Kanban: colored top bars, priority left borders on cards
- [ ] Landing: gradient hero, status chip, press feedback on buttons
- [ ] All buttons: scale-down press feedback on click
- [ ] Page load: columns slide up with stagger

## Completion Criteria
- Primary color is indigo-violet (not generic blue)
- Dark mode has visible card/page contrast (3-level)
- Cards lift on hover with primary-tinted shadow
- Kanban columns have colored accent bars
- Task cards have left priority borders
- Sidebar has gradient logo + active state bar
- Landing page has gradient hero + status chip
- Buttons have press feedback
