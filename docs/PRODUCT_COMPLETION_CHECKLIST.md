# 168 Method - Product Completion Checklist

This file is the working source of truth for the 168 redesign. The goal is to finish the original product vision deliberately instead of adding disconnected features.

Status key:
- [x] Built
- [~] Partially built or demo-only
- [ ] Not yet built

## 1. Product foundation and experience

- [x] Product name and core concept centered on 168 hours per week
- [x] Core pillars: Plan your time, Track what is due, Know what to focus on
- [x] Clean, professional, neutral visual direction
- [x] Free early-access positioning with no payment pressure in the redesigned experience
- [x] Guest exploration path
- [x] Introductory landing page explaining what 168 is trying to solve
- [x] Remove magic-link-first login experience
- [x] Email and password login
- [x] Personal signup fields: first name and primary reason for using 168
- [ ] Complete first-time onboarding flow after signup
- [ ] Save onboarding completion state per user
- [ ] Personalize dashboard welcome using user profile data
- [ ] Add short, intentional helper explanations throughout every major workflow
- [ ] Add consistent empty states that teach users what to do next
- [ ] Final pass to remove all em dashes from product copy

## 2. Authentication and user account

- [x] Supabase project connected through environment variables
- [x] Password-based sign in
- [x] Password-based account creation
- [~] Email confirmation behavior supported by Supabase but not yet polished in the product
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Sign out behavior fully tested
- [ ] Profile page with editable name and preferences
- [ ] Persist personal profile fields in the database
- [ ] Protect saved user data with verified row-level security
- [ ] Clearly distinguish guest/demo data from signed-in saved data

## 3. Dashboard - command center

- [x] Dashboard route and main layout
- [x] Your 168 summary
- [x] Today section
- [x] Focus preview
- [x] Upcoming preview
- [x] This Week preview
- [x] Ask 168 preview
- [~] Dashboard currently uses mock/demo data in several areas
- [ ] Replace mock dashboard data with real My 168 and Track data
- [ ] Show personalized greeting and relevant onboarding state
- [ ] Make summary counts update in real time
- [ ] Add clear first-use guidance when no data exists
- [ ] Make dashboard links/actions fully functional

## 4. My 168 - weekly time planning

- [x] 168-hour weekly model
- [x] Weekly schedule grid
- [x] Add time block form
- [x] Categories: Sleep, Work, Family, Health, Home, Personal, Education, Social, Other
- [x] Fixed / Fluid planning concept restored
- [x] Colored schedule blocks
- [x] Category color customization
- [x] Pastel color options
- [x] Weekly planned hours calculation
- [x] Weekly available hours calculation
- [x] Category breakdown
- [~] Color settings save locally in the browser only
- [~] Weekly schedule data is local/demo state only
- [ ] Persist time blocks to Supabase per signed-in user
- [ ] Load saved time blocks on refresh
- [ ] Edit an existing time block
- [ ] Delete a time block
- [ ] Duplicate a time block
- [ ] Recurring time blocks
- [ ] Multi-day recurring entry support
- [ ] Previous / This Week / Next navigation with real dates
- [ ] Store week/date context correctly
- [ ] Prevent or warn about overlapping time blocks
- [ ] Support time ranges beyond the current visible sample window
- [ ] Improve actual visual block height/position based on duration
- [ ] Drag time blocks to a new time/day
- [ ] Resize time blocks to change duration
- [ ] Distinguish Fixed and Fluid visually and accessibly
- [ ] Allow the user to customize what each category color means
- [ ] Persist category/color mapping to the user account
- [ ] Add user-defined categories
- [ ] Add planning guidance explaining Fixed vs Fluid before first use
- [ ] Add Find Time workflow for unscheduled responsibilities

## 5. Track - responsibilities and due dates

- [x] Track route
- [x] Add item form
- [x] Due date
- [x] Category
- [x] Repeat field
- [x] Time needed
- [x] Priority
- [x] Auto-pay field
- [x] Notes
- [x] Status views
- [x] Summary counts
- [x] Mark complete interaction
- [x] List view
- [x] Kanban-style board view
- [x] Board columns for Inbox, This Week, In Progress, Done
- [x] Drag-and-drop card movement
- [x] Non-drag move control for accessibility
- [~] Track items are local/demo state only
- [ ] Persist Track items to Supabase per user
- [ ] Load Track items after refresh
- [ ] Edit Track item
- [ ] Delete Track item
- [ ] Full recurrence engine
- [ ] Monthly/yearly/custom recurrence calculation
- [ ] Generate next due occurrence after completion
- [ ] Completion history
- [ ] Preserve prior completion dates
- [ ] Reminder timing field
- [ ] Reminder delivery behavior
- [ ] Optional amount field for bills/subscriptions
- [ ] Better status rules based on current date
- [ ] Custom Kanban columns or workflow preferences later if useful
- [ ] Connect Track items that need time to My 168 scheduling

## 6. Track to My 168 connection

- [~] Unscheduled sample items are shown in My 168
- [ ] Use real Track items with time estimates as the Unscheduled list
- [ ] Schedule a Track item directly into My 168
- [ ] Mark Track item as scheduled
- [ ] Keep schedule link when a time block moves
- [ ] Show due date while choosing schedule time
- [ ] Warn if scheduled after the due date
- [ ] Find available time automatically
- [ ] Recommend Fluid placement first when appropriate

## 7. Focus - what deserves attention

- [x] Focus page exists
- [x] Top-priority layout concept exists
- [x] Today / This Week / Later concept exists
- [x] Quick Tasks concept exists
- [~] Focus logic currently uses sample/demo data
- [ ] Rank using real Track data
- [ ] Use due date and overdue state
- [ ] Use user-set priority
- [ ] Use estimated time needed
- [ ] Use available time from My 168
- [ ] Use scheduled vs unscheduled state
- [ ] Explain why each item was surfaced
- [ ] Avoid opaque numeric Focus Scores
- [ ] Recalculate recommendations when schedule or Track changes
- [ ] Let users dismiss/defer a recommendation

## 8. Ask 168 - grounded assistant

- [x] Ask 168 page exists
- [x] Suggested prompt concepts exist
- [~] Current experience is not yet grounded in the user's actual saved data
- [ ] Connect Ask 168 to real My 168 schedule
- [ ] Connect Ask 168 to Track items
- [ ] Connect Ask 168 to Focus recommendations
- [ ] Respect Fixed vs Fluid rules
- [ ] Respect category preferences
- [ ] Answer questions about available time
- [ ] Answer what is due this week
- [ ] Answer where time is going
- [ ] Recommend a plan before making changes
- [ ] Add explicit user approval before schedule changes
- [ ] Do not silently move commitments
- [ ] Add clear boundary between recommendation and action

## 9. Appearance and customization

- [x] Clean neutral base design
- [x] Pastel accent theme options
- [x] Lavender, Sage, Powder Blue, Soft Rose, Peach, Sand
- [x] Appearance section in Settings
- [~] Accent selection saves locally
- [ ] Apply selected accent consistently across dashboard navigation and controls
- [ ] Persist accent choice per signed-in user
- [ ] Category color mapping editor
- [ ] User-defined category colors
- [ ] Ensure contrast/accessibility for all selected colors
- [ ] Mobile appearance review

## 10. Settings

- [x] Settings route
- [x] Appearance section
- [x] Early access explanation
- [~] Profile, Notifications, and Categories are currently placeholders
- [ ] Functional Profile settings
- [ ] Functional Notifications settings
- [ ] Functional Categories settings
- [ ] Appearance persistence
- [ ] User timezone setting
- [ ] Week start preference if needed
- [ ] Account/security section

## 11. Data model and Supabase

- [x] Supabase project created
- [x] Environment variables connected in Vercel
- [~] time_blocks table/schema work started previously
- [ ] Confirm current database schema against the redesigned app
- [ ] Create/confirm profiles table fields needed by onboarding
- [ ] Create/confirm time_blocks fields for Fixed/Fluid, category, date/week, recurrence
- [ ] Create Track items table
- [ ] Create completion history table if needed
- [ ] Create user preference/category color storage
- [ ] Add foreign keys and useful indexes
- [ ] Verify row-level security on every user-owned table
- [ ] Test that one account cannot read another account's data
- [ ] Add safe guest/demo behavior without writing fake user records

## 12. Reliability and quality

- [ ] Test signup from a clean browser session
- [ ] Test login from a clean browser session
- [ ] Test guest exploration
- [ ] Test refresh persistence after Supabase wiring
- [ ] Test mobile layout
- [ ] Test desktop layout
- [ ] Test empty states
- [ ] Test invalid inputs
- [ ] Test overlapping time entries
- [ ] Test recurring Track items
- [ ] Test Kanban movement
- [ ] Test keyboard/non-drag board movement
- [ ] Test color customization
- [ ] Remove console/runtime errors
- [ ] Final copy consistency pass
- [ ] Final no-em-dash pass

## 13. Deployment and release

- [x] Redesign branch: `168-redesign-v1`
- [~] Vercel production branch/deployment has been manually managed during development
- [ ] Confirm Vercel production tracks `168-redesign-v1`
- [ ] Confirm latest commit is deployed before each test round
- [ ] Run final production smoke test
- [ ] Decide when redesign is stable enough to become the main/default branch
- [ ] Rename legacy repo/project references from 198 to 168 later, after stability

## Build order from here

### Phase 1 - Make the product real
- [ ] Wire My 168 to Supabase
- [ ] Wire Track to Supabase
- [ ] Verify row-level security and user isolation
- [ ] Add edit/delete for both areas
- [ ] Make data survive refresh and sign-in

### Phase 2 - Connect the system
- [ ] Track to My 168 scheduling
- [ ] Real Focus ranking
- [ ] Dashboard from real data
- [ ] Real week navigation
- [ ] Recurrence and completion history

### Phase 3 - Make it personal and intentional
- [ ] Guided onboarding
- [ ] Profile preferences
- [ ] Persist category colors and accent theme
- [ ] User-defined categories
- [ ] Explanations and empty states everywhere

### Phase 4 - Make 168 intelligent
- [ ] Ground Ask 168 in user data
- [ ] Find Time recommendations
- [ ] Rebalancing suggestions for Fluid time
- [ ] Approval-based schedule changes

### Phase 5 - Polish and release
- [ ] Mobile/responsive review
- [ ] Accessibility review
- [ ] Full production testing
- [ ] Copy consistency and no-em-dash pass
- [ ] Final early-access release review
