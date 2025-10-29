# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.19.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.18.0...v2.19.0) (2025-10-29)


### Features

* add Discord webhook configuration UI to admin panel ([bd05e9c](https://github.com/adrianlarsen102/EVU-WEB/commit/bd05e9c52c71f2d7ad8643a96f41de1c039e00b1))
* add Discord webhook notification system ([f31ece0](https://github.com/adrianlarsen102/EVU-WEB/commit/f31ece0a80f4cb629f05316fe6a9c1e51c951991))
* add quick security fix script for remaining warnings ([ae5dc37](https://github.com/adrianlarsen102/EVU-WEB/commit/ae5dc37072e98f190c7e122a081b682b29c018de))


### Bug Fixes

* add database scripts for duplicate indexes and Discord setup ([8394d30](https://github.com/adrianlarsen102/EVU-WEB/commit/8394d3039a93609e56470fd35418f304c8b891c9))
* add remaining function search_path fixes ([d351c79](https://github.com/adrianlarsen102/EVU-WEB/commit/d351c7918434318bc586ea0d6b86c44985e26fe1))
* make security-fixes.sql resilient to missing tables ([b8af392](https://github.com/adrianlarsen102/EVU-WEB/commit/b8af39264f34679f738cd041fbaff9a4a4d8421b))
* resolve Supabase Security Advisor warnings ([5b4c06f](https://github.com/adrianlarsen102/EVU-WEB/commit/5b4c06fca70489db516f0f8067cd607c3d164e1e))
* resolve Supabase security warnings for integer-parameter function versions ([b782b16](https://github.com/adrianlarsen102/EVU-WEB/commit/b782b1608d88a55483543b7ee2e2d78b614afcde))


### Documentation

* comprehensive update to CLAUDE.md for v2.17.2 ([7445256](https://github.com/adrianlarsen102/EVU-WEB/commit/7445256e59e035b1704c9e05988f6003c7311861))

## [2.18.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.17.2...v2.18.0) (2025-10-27)


### Features

* add user edit functionality in admin panel ([c53df3b](https://github.com/adrianlarsen102/EVU-WEB/commit/c53df3b9d1c90309471684acc6df51e8ae1fa620))


### Bug Fixes

* implement CSRF token protection for admin panel ([d88495a](https://github.com/adrianlarsen102/EVU-WEB/commit/d88495a0970c5e2bf945f08144531367566ee8d9))

### [2.17.2](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.17.1...v2.17.2) (2025-10-27)


### Bug Fixes

* add triple-layer error handling for audit logging ([c43c85e](https://github.com/adrianlarsen102/EVU-WEB/commit/c43c85e44a2babddda098ea9637527a921fcbd6c))
* bypass Vercel security checkpoint for API routes ([dcc8c03](https://github.com/adrianlarsen102/EVU-WEB/commit/dcc8c03041550afd0468dff2aef63875321e9218))
* convert lib files from CommonJS to ES6 modules ([9ecc38f](https://github.com/adrianlarsen102/EVU-WEB/commit/9ecc38fc8ee8d0648d429837c3eb44a0066696d0))
* correct Promise chain in dashboard API ([81ff8c4](https://github.com/adrianlarsen102/EVU-WEB/commit/81ff8c485d94e2eff2a75030ba2aa39e7abd2d76))
* enhance error handling and add deployment tools ([84a7a72](https://github.com/adrianlarsen102/EVU-WEB/commit/84a7a722f9b6c0df18bc6cc1dfa971bcb998a7ea))
* revert invalid security config and add SQL initialization script ([5602617](https://github.com/adrianlarsen102/EVU-WEB/commit/56026175d236dbb739a984335baae70658d0331f))

### [2.17.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.17.0...v2.17.1) (2025-10-27)


### Bug Fixes

* make audit logging non-blocking and improve error handling ([3d0ba13](https://github.com/adrianlarsen102/EVU-WEB/commit/3d0ba13566ae81bf3272039011931d3e889101f8))

## [2.17.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.16.0...v2.17.0) (2025-10-24)


### Features

* implement comprehensive high-priority security improvements ([1704e7a](https://github.com/adrianlarsen102/EVU-WEB/commit/1704e7a50925edc7d4bd43c7fcc89340558e3ca9))


### Bug Fixes

* audit_logs RLS policies for session-based authentication ([227a113](https://github.com/adrianlarsen102/EVU-WEB/commit/227a1138100c1207367ddfc1e6b5b3e94ef8ecb9))
* audit_logs table compatibility with admins table ID type ([186a4fc](https://github.com/adrianlarsen102/EVU-WEB/commit/186a4fc1da6373e0cae31e967baf9ce7b989b423))


### Documentation

* add comprehensive audit logs installation guide ([e50c33a](https://github.com/adrianlarsen102/EVU-WEB/commit/e50c33a250e47e0abc7b3c6d8954bf489bd63a87))

## [2.16.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.15.0...v2.16.0) (2025-10-24)


### Features

* add comprehensive Privacy Policy and Terms & Conditions pages ([81ce1c2](https://github.com/adrianlarsen102/EVU-WEB/commit/81ce1c24fae28d1097c2dc101f2e5ea9595c6266))


### Bug Fixes

* resolve 5 critical security vulnerabilities ([e8475da](https://github.com/adrianlarsen102/EVU-WEB/commit/e8475da2453c795a580fdbb34a7895b7867afd68))

## [2.15.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.14.0...v2.15.0) (2025-10-23)


### Features

* comprehensive platform improvements and optimizations ([a064dc1](https://github.com/adrianlarsen102/EVU-WEB/commit/a064dc1f0981d1ce126b015e33a7aac3ddb9eb31))


### Bug Fixes

* regenerate package-lock.json for testing dependencies ([6e6264c](https://github.com/adrianlarsen102/EVU-WEB/commit/6e6264ccd77034f8e7509a4dc74b4d4e22b0a21f))

## [2.14.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.13.1...v2.14.0) (2025-10-21)


### Features

* optimize profile page and add admin panel quick access ([a47ffdc](https://github.com/adrianlarsen102/EVU-WEB/commit/a47ffdc8de9bc38e8eca9668dd4b996a2625185e))

### [2.13.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.13.0...v2.13.1) (2025-10-21)


### Bug Fixes

* add favicon and resolve website loading issues ([802e9fa](https://github.com/adrianlarsen102/EVU-WEB/commit/802e9fa5588813daad3e46c57e530fd3011f0621))
* improve text contrast in all themes for better readability ([2f9c3a5](https://github.com/adrianlarsen102/EVU-WEB/commit/2f9c3a58e00b4f9508459a7ffb8ef69e53286ef3)), closes [#f3e8](https://github.com/adrianlarsen102/EVU-WEB/issues/f3e8) [#e0f4f7](https://github.com/adrianlarsen102/EVU-WEB/issues/e0f4f7) [#d1fae5](https://github.com/adrianlarsen102/EVU-WEB/issues/d1fae5)

## [2.13.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.12.0...v2.13.0) (2025-10-21)


### Features

* implement comprehensive RBAC system with custom roles and permissions ([96f99cb](https://github.com/adrianlarsen102/EVU-WEB/commit/96f99cb175de2402b9a93f0125672953bba16d39))


### Bug Fixes

* update RBAC SQL schema to use uuid-ossp extension ([b53308f](https://github.com/adrianlarsen102/EVU-WEB/commit/b53308f8e2bbca05be81fc0081245680a5d7401d))

## [2.12.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.11.1...v2.12.0) (2025-10-20)


### Features

* implement advanced platform enhancements (phase 3) ([3994293](https://github.com/adrianlarsen102/EVU-WEB/commit/39942938163e7a1549762cb9331e05ab624accae))
* implement dark/light theme system (phase 2) ([0bfa66b](https://github.com/adrianlarsen102/EVU-WEB/commit/0bfa66b89fd95d6a98fd40032d00f3e49ef1ab88)), closes [#0099](https://github.com/adrianlarsen102/EVU-WEB/issues/0099) [#f8f9](https://github.com/adrianlarsen102/EVU-WEB/issues/f8f9) [#1a202](https://github.com/adrianlarsen102/EVU-WEB/issues/1a202) [#e91e63](https://github.com/adrianlarsen102/EVU-WEB/issues/e91e63) [#10b981](https://github.com/adrianlarsen102/EVU-WEB/issues/10b981) [#00d4](https://github.com/adrianlarsen102/EVU-WEB/issues/00d4) [#0f1419](https://github.com/adrianlarsen102/EVU-WEB/issues/0f1419) [#1a1f2](https://github.com/adrianlarsen102/EVU-WEB/issues/1a1f2) [#ff006](https://github.com/adrianlarsen102/EVU-WEB/issues/ff006) [#00ff88](https://github.com/adrianlarsen102/EVU-WEB/issues/00ff88)
* implement major platform improvements (phase 1) ([78e4733](https://github.com/adrianlarsen102/EVU-WEB/commit/78e4733c4f2f2eb62bfa971388889020e455ebc2))


### Bug Fixes

* add request timeouts to prevent website loading hang ([9471ced](https://github.com/adrianlarsen102/EVU-WEB/commit/9471ced98f3cf55a6e161a897f7caa6eb19647f6))
* update metrics cron to daily schedule for free tier compatibility ([d813f3f](https://github.com/adrianlarsen102/EVU-WEB/commit/d813f3f6ebc59029175b4eeac03394879b421a65))


### Documentation

* comprehensive code audit and improvements documentation ([0e7e2a3](https://github.com/adrianlarsen102/EVU-WEB/commit/0e7e2a3031321d38243717e12c0d657fca6cb46d))
* comprehensive completion report for all improvements ([2f0feb5](https://github.com/adrianlarsen102/EVU-WEB/commit/2f0feb5c0fa938605ae1096c67774220e1b2559a))

### [2.11.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.11.0...v2.11.1) (2025-10-09)


### Bug Fixes

* disable overly strict referer check causing registration failures ([1abdd36](https://github.com/adrianlarsen102/EVU-WEB/commit/1abdd3663a0baa26cdd15a30e0d221164376b687))

## [2.11.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.10.0...v2.11.0) (2025-10-09)


### Features

* add GDPR-compliant data management system ([a92c999](https://github.com/adrianlarsen102/EVU-WEB/commit/a92c999583a12a9ebf9bf51d9c6c3720fc13728a))

## [2.10.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.9.1...v2.10.0) (2025-10-09)


### Features

* add image upload functionality for user profiles ([04ac1fc](https://github.com/adrianlarsen102/EVU-WEB/commit/04ac1fccdb6310ac23b3f9c09d0ae09341a25681))

### [2.9.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.9.0...v2.9.1) (2025-10-08)

## [2.9.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.8.0...v2.9.0) (2025-10-08)


### Features

* add automatic forum counter updates and complete database migration ([498840d](https://github.com/adrianlarsen102/EVU-WEB/commit/498840dc05a766567508852337c5abc052121fd5))


### Bug Fixes

* resolve function return type conflicts in migration script ([4e68102](https://github.com/adrianlarsen102/EVU-WEB/commit/4e68102b74e441d048625f75020658cd0da25803))


### Performance Improvements

* fix Cumulative Layout Shift (CLS) issues on all pages ([8d16f17](https://github.com/adrianlarsen102/EVU-WEB/commit/8d16f17b838e529cac482b48a9c85a7652676838))

## [2.8.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.7.0...v2.8.0) (2025-10-08)


### Features

* add admin panel email settings management ([1e8c0b8](https://github.com/adrianlarsen102/EVU-WEB/commit/1e8c0b88df5fa25182bb4d76e579c28dc983848d))
* add comprehensive performance and security enhancements ([c1ff3c9](https://github.com/adrianlarsen102/EVU-WEB/commit/c1ff3c98c737339a487c8a8eb46e76dacd2dec90))
* add email notification system with Resend integration ([fcd5994](https://github.com/adrianlarsen102/EVU-WEB/commit/fcd599419cc94ade4946ce6cc19051fc6228892f))
* add SMTP support as alternative to Resend API ([f333d59](https://github.com/adrianlarsen102/EVU-WEB/commit/f333d59c4b37bbc345deb07c66b2ddf52ee2fa43))
* add test email functionality and improve admin panel styling ([9f57812](https://github.com/adrianlarsen102/EVU-WEB/commit/9f57812c330a2d06e5dc4d9bd1fece13206e421d))
* add user registration system with password strength validation ([047c10a](https://github.com/adrianlarsen102/EVU-WEB/commit/047c10a7fa9f0d0b5a0a716ba4b8870b389fb1d7))
* complete support ticket system with admin panel (Phase 2) ([73cfe1e](https://github.com/adrianlarsen102/EVU-WEB/commit/73cfe1ee6f21fd3d96e8dc396e53738486a24f9c))
* enhance forum admin with comprehensive category management ([b376f97](https://github.com/adrianlarsen102/EVU-WEB/commit/b376f9777b79b6bceca72e9c61065ffe9bea0c32))
* enhance welcome and ticket confirmation email templates ([ba7896e](https://github.com/adrianlarsen102/EVU-WEB/commit/ba7896eb42010f08ea931c66345e5d0253a9043c))
* implement complete forum system with topics, comments, and moderation ([d735edf](https://github.com/adrianlarsen102/EVU-WEB/commit/d735edf3bb8fa5330bbf6e78335aed5773784374))
* implement comprehensive support ticket system (Phase 1) ([151eac4](https://github.com/adrianlarsen102/EVU-WEB/commit/151eac4c45e73c7c1270a3a1d228fa965d0ea195))
* implement dynamic Recent Activity feed on forum page ([5b3a9d6](https://github.com/adrianlarsen102/EVU-WEB/commit/5b3a9d62f679237be6cc429263d5faffa0993628))


### Bug Fixes

* add missing Link import in profile page ([41062aa](https://github.com/adrianlarsen102/EVU-WEB/commit/41062aa4244bacf825e2667fc96cc4eb88223265))
* add Usercentrics to CSP connect-src directive ([3c45087](https://github.com/adrianlarsen102/EVU-WEB/commit/3c45087bbc4c80530726a33d29a9d25c3f0b74b5))
* improve forum form layout and responsive scaling ([bb7bd61](https://github.com/adrianlarsen102/EVU-WEB/commit/bb7bd611f7a40765ee3b8e136b12c956818ad686))
* resolve category ID validation and improve responsive scaling ([f3baa4b](https://github.com/adrianlarsen102/EVU-WEB/commit/f3baa4b1ed4eec547d132d7cffbf2657dd4277d8))

## [2.7.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.6.1...v2.7.0) (2025-10-06)


### Features

* add Vercel Analytics integration ([130f467](https://github.com/adrianlarsen102/EVU-WEB/commit/130f467814c17e62e8e47086d51f0e1c8047e581))

### [2.6.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.6.0...v2.6.1) (2025-10-06)


### Documentation

* add GitHub labels setup guide ([e2cd1b2](https://github.com/adrianlarsen102/EVU-WEB/commit/e2cd1b2197c6dddcc3f9d9b6af2733a777d0f820))

## [2.6.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.5.2...v2.6.0) (2025-10-06)


### Features

* add Usercentrics CMP and fix release workflow ([d50e6b4](https://github.com/adrianlarsen102/EVU-WEB/commit/d50e6b46d4ae54a593f9f43ce46d3357119dc60a))
* support both automatic and manual PR creation ([6ec84ea](https://github.com/adrianlarsen102/EVU-WEB/commit/6ec84ea17ad8e6364b403b10609ace59aefdfa19))


### Bug Fixes

* add tag cleanup to release workflow ([c6c6ae3](https://github.com/adrianlarsen102/EVU-WEB/commit/c6c6ae3ae5ad0abfe39e68ddedfa813a6142c8b4))
* correct release workflow syntax and logic ([5abb094](https://github.com/adrianlarsen102/EVU-WEB/commit/5abb0949f44a50f94d8e1a24aa4e4e2e1e3493c8))
* improve error handling in PR creation step ([26f7f35](https://github.com/adrianlarsen102/EVU-WEB/commit/26f7f3561010c972e6e85c5d79592e9b4c2338e2))
* improve tag and branch cleanup in workflow ([153d445](https://github.com/adrianlarsen102/EVU-WEB/commit/153d44530473ca22d3e77d12757bcc6f135e321b))
* make PR labels optional in release workflow ([2632644](https://github.com/adrianlarsen102/EVU-WEB/commit/26326440a90983601486be47230895739ec132c9))
* provide manual PR instructions due to GitHub Actions restrictions ([265106b](https://github.com/adrianlarsen102/EVU-WEB/commit/265106b86ae790d2fa38d591d3472a412ea63a5f))
* update release workflow to respect branch protection ([930da7b](https://github.com/adrianlarsen102/EVU-WEB/commit/930da7bd4a711797bb1ca077c7e1bea492033a8c))
* use gh CLI for PR creation instead of action ([337fb63](https://github.com/adrianlarsen102/EVU-WEB/commit/337fb637fb428fd2e93f352777c5362046a37504))


### Code Refactoring

* reorganize documentation into structured folders ([5b3b3b7](https://github.com/adrianlarsen102/EVU-WEB/commit/5b3b3b72344ff634a02aaed58bb5df1e66ca2470))


### Documentation

* document automated release workflow with GH_TOKEN ([e29da20](https://github.com/adrianlarsen102/EVU-WEB/commit/e29da2047ec38f6c2d542d8d8b1cbbc904e1ec8f))

### [2.5.2](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.5.1...v2.5.2) (2025-10-06)

### [2.5.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.5.0...v2.5.1) (2025-10-06)


### Documentation

* add comprehensive branching strategy documentation ([bb0ee78](https://github.com/adrianlarsen102/EVU-WEB/commit/bb0ee786d23ad2ce9e15e4ca69dda99905aa90c1))

## [2.5.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.4.1...v2.5.0) (2025-10-06)


### Features

* add dual-server support to admin panel ([f3b0d55](https://github.com/adrianlarsen102/EVU-WEB/commit/f3b0d558b4041f7053e87b0decc7a952e8124174))

### [2.4.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.4.0...v2.4.1) (2025-10-06)


### Documentation

* update changelog page branding and document admin panel dual-server requirements ([0d4f7d1](https://github.com/adrianlarsen102/EVU-WEB/commit/0d4f7d1dba1f001b302759107300a83ffe0b658f))

## [2.4.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.3.1...v2.4.0) (2025-10-06)


### Features

* update forum and layout for dual-server gaming network ([1f2e2a1](https://github.com/adrianlarsen102/EVU-WEB/commit/1f2e2a1c69be1b87d4aa39a0b3ed3ad255f36fce))

### [2.3.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.3.0...v2.3.1) (2025-10-06)


### Bug Fixes

* improve role-based auth fallback for backward compatibility ([cea0038](https://github.com/adrianlarsen102/EVU-WEB/commit/cea0038d36772dde3c0fce7ea1aeac8c17b0f2b4))

## [2.3.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.2.1...v2.3.0) (2025-10-06)


### Features

* add dual-server support for Minecraft and FiveM ([359401f](https://github.com/adrianlarsen102/EVU-WEB/commit/359401f8bb21c8d15b8e526bb4ea3fb4577ed20a))

### [2.2.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.2.0...v2.2.1) (2025-10-06)


### Bug Fixes

* update profile page to match main site design ([c239989](https://github.com/adrianlarsen102/EVU-WEB/commit/c23998978799ccdd33674ab04089d4d7858b02e9))

## [2.2.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.1.2...v2.2.0) (2025-10-06)


### Features

* add role-based access control system for user management ([fc2c384](https://github.com/adrianlarsen102/EVU-WEB/commit/fc2c384e90ce313ed7a73b3f3133b895cacdf1fa))

### [2.1.2](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.1.1...v2.1.2) (2025-10-06)


### Bug Fixes

* support GitHub compare links in changelog version headers ([1da0832](https://github.com/adrianlarsen102/EVU-WEB/commit/1da08324902328a54fb54383e1252d880c1c590d))

### [2.1.1](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.1.0...v2.1.1) (2025-10-06)


### Documentation

* add explanation for standard-version deprecation warnings ([042f36b](https://github.com/adrianlarsen102/EVU-WEB/commit/042f36bdc63a878c1a8957ffc7c696ac2cf6561b))

## [2.1.0](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.0.2...v2.1.0) (2025-10-06)


### Features

* add Vercel Speed Insights for performance monitoring ([2e356f6](https://github.com/adrianlarsen102/EVU-WEB/commit/2e356f6c52e0a87dc60a744867e4907965c2e922))

### [2.0.2](https://github.com/adrianlarsen102/EVU-WEB/compare/v2.0.1...v2.0.2) (2025-10-06)


### Bug Fixes

* improve CHANGELOG.md parser to support standard-version format ([988fb50](https://github.com/adrianlarsen102/EVU-WEB/commit/988fb503a640c0c76e0d426465db0d9181835782))

### 2.0.1 (2025-10-06)


### Bug Fixes

* update GitHub Actions workflow permissions for automatic releases ([dca5330](https://github.com/adrianlarsen102/EVU-WEB/commit/dca5330b6057397a186960be4c0cdebf3ece6848))

## [2.0.0] - 2025-10-06

### Features
- Added profiles
- Complete user management system with username/password login
- GDPR-compliant cookie consent with Privacy Policy and Terms of Service
- Complete Supabase setup SQL script with current content

### Improvements
- Updated deployment documentation to reflect current implementation