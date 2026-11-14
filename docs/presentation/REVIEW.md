# Presentation and release review

The approved design uses the cinematic workshop artwork, blue/copper/violet/emerald
workflow sections, a scroll-linked hero, a pinned four-stage image story, and
shared controls across the workshop workspace. Stage buttons follow the reading
position and move to their corresponding chapters. Dialogs and controls provide
interaction feedback. Dark/light themes and reduced motion remain available.

The GitHub overview follows SakuraMind's presentation sequence: branded opening,
actual application screenshots, workflow, architecture, setup and roadmap.
The banner and text-free website artwork were approved by the project owner.
Future new project artwork still needs owner approval before integration.

## Visual verification

The approved local revision was checked at 1440x1000 and 390x844. Checks covered
scrolling through all four chapters in both directions, stage-button navigation,
no horizontal overflow, keyboard focus, dialog focus containment/Escape/focus
return, and light/dark workspace colours. Reduced motion removes spatial
transforms and uses immediate chapter navigation. A simulated invoice-fetch
failure retained other dashboard counts and recovered after refresh.

Published screenshots are in [public/images](../../public/images). They capture
the working interface. Local visual checks preceded the cloud release; cloud
HTTP/API checks do not replace a new browser or assistive-technology audit.

## Release verification

- 58 automated tests pass, including real local MySQL/MongoDB queries, image
  validation, bounded upload transport, session signing, appointment timezone
  round trips and mechanic assignment permissions.
- TypeScript passes. Lint completes with existing hook-dependency warnings.
- Next.js is patched to 15.5.29. The production-only dependency audit reported
  zero findings at the release checkpoint; development-tool findings remain.
- Private backup recovery passed in isolated MySQL/MongoDB containers before
  cloud import. The original local databases were preserved.
- Hosted MySQL preserves 3,383 rows across 15 base tables, seven routines, five
  triggers and six views. All 20 registered SQL queries execute successfully.
- Hosted MongoDB preserves the three reports and their IDs, five indexes,
  validation options and all seven aggregation pipelines.

The cloud workflow passed and its temporary records were removed. The tested
production build is live at [autocare-insight.vercel.app](https://autocare-insight.vercel.app).
Anonymous public access, optimized artwork/assets, demo sign-in and both hosted
databases passed final HTTP checks. Detailed release status and hosting limits are in the
[managed hosting guide](../../deploy/MANAGED_HOSTING.md).
