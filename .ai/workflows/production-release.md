# Workflow — Production Release

## Purpose

Defines the sequence of steps, validations, and rollback processes required to deploy PokéVault changes to production. Ensures that assets are optimized, database schemas are migrated without downtime, and system health is verified.

---

## Sequence of Steps

1. **Code Freeze & Pre-flight Testing**:
   - Lock features.
   - Run clean builds: `npm run clean && npm run build`.
   - Run type checks (`npm run lint`).
   - Execute the complete test suite (unit + E2E integration tests).
2. **Database Migration Preparation**:
   - Test Supabase migration scripts against a staging instance.
   - Ensure RLS configurations are active and all generated types match the database schema.
3. **Deployment**:
   - Trigger production pipeline build (Next.js compilation, CSS compilation, asset generation).
   - Apply schema changes to the production Supabase database.
4. **Smoke Testing**:
   - Verify auth flow (login, token persistence).
   - Check pricing synchronization and binder editing UI.
   - Verify Service Worker caching and image proxy loads.
5. **Post-Deployment Monitoring**:
   - Check client-side logs and server metrics.
   - Monitor Core Web Vitals targets.

---

## Required Validations

- **Build sanity check**: Bundle is compiled without warning or TS errors.
- **Downtime protection**: Database migrations must use non-blocking SQL syntax (e.g., adding columns with default values, creating indices concurrently).
- **Core flows validation**: Check login, card adding, and collection display.

---

## Completion Criteria

- [ ] All code runs cleanly on the production build target.
- [ ] Supabase migrations are fully executed and validated.
- [ ] Smoke tests pass with no console errors.
- [ ] Core Web Vitals meet SLA requirements (LCP < 2.5s, CLS < 0.1).
- [ ] Release branch tagged with version identifier.

---

## Rollback Plan

If a deployment fails or crashes services:
1. Revert deployment immediately on the hosting platform (Vercel/Static Host) to the previous stable container tag.
2. If database changes are incompatible, apply the rollback SQL migration file.
3. Notify the team and inspect logs in the staging sandbox.
