# Icon library: Capgemini Invent starter-kit

50 Material-Symbols-style SVG icons, single-glyph, Capgemini Dark Blue (#121A38),
96x96. Location: `assets/icons/kit/<name>.svg`. The same names, grouped by theme,
are in `design-system/catalog.md` (Assets, Kit icons).

## Rule: icons must mean something
Whenever a layout shows icons (feature grids, nav items, service rows), every
icon MUST relate to the content beside it. Never ship the kit's default sample
icons. Search this list by concept (a synonym, the object, or the action) and
pick the closest match.

## How to use an icon
Reference the file with the `.cg-icon` class from `components.css`:

```html
<img class="cg-icon" src="../../assets/icons/kit/lightbulb.svg" alt="">
<img class="cg-icon cg-icon--lg" src="../../assets/icons/kit/account_tree.svg" alt="">
```

Sizes: default 24px, `cg-icon--sm` 20px, `cg-icon--lg` 48px, `cg-icon--xl`
72px. `cg-icon--inverse` turns the glyph white on dark surfaces (automatic
inside `.cg-section--inverse` and the dark theme). Use `alt=""` when the icon
is decorative. A name not in this list 404s, so confirm it here first.

## Full list (50)
- account_tree
- add_alert
- add_chart
- ads_click
- alt_route
- animation
- apartment
- architecture
- attach_file
- auto_awesome_mosaic
- auto_awesome_motion
- automation
- autorenew
- av_timer
- avg_pace
- badge
- beach_access
- bolt
- book_ribbon
- browse_activity
- bug_report
- business_center
- candlestick_chart
- captive_portal
- category
- chair
- check_circle
- checked_bag
- cloud
- cognition
- colors
- comment_bank
- database
- deployed_code
- devices_fold
- drafts
- emoji_objects
- energy
- finance
- flowchart
- globe
- graph_2
- headphones
- ink_pen
- join
- key_vertical
- keyboard
- lab_research
- language
- lightbulb
