# Workflow — Bug Fixing

## Purpose

Defines the sequence of steps, validations, and regression safeguards required when diagnosing, documenting, and repairing a defect or incident in PokéVault.

---

## Sequence of Steps

1. **Reproduction & Documentation**: 
   - Extract the defect report details.
   - Replicate the error inside a local development environment.
   - Build a local scratch script reproducing the failure.
2. **Path Diagnostics**: 
   - Trace whether the fault is in client React state, the query cache, server route handlers, or Supabase database triggers/policies.
   - Inspect network request/response envelopes.
3. **Core Patch Formulation**:
   - Resolve the bug. Ensure no stale React closure values exist in the updated routines.
   - Ensure floats are rounded or handled strictly.
4. **Regression Safeguards**:
   - Write a unit test replicating the bug to ensure it cannot reappear in the future.
5. **Code Review Gate**:
   - Submit for code review checking for any side effects.

---

## Required Validations

- **Reproduction check**: Ensure the bug is fixed in the local scratch environment.
- **Coverage check**: Verify that the new unit test fails before the patch is applied and passes after.
- **Vitals audit**: Ensure changes do not introduce performance regressions or extra rendering passes.

---

## Completion Criteria

- [ ] Defect is resolved, verified across targeted browsers and devices.
- [ ] No regression introduced to the build.
- [ ] Test coverage written covers the code path that caused the bug.
- [ ] Logs and error diagnostics resolved, removing console alerts or swallowed errors.
- [ ] PR approved by QA and Reviewer agents.

---

## Rollback Plan

If the bug fix introduces a critical regression in production:
1. Revert the bug-fix commit immediately.
2. Redeploy the previous stable build.
3. Conduct a post-mortem to analyze the missing test cases.
