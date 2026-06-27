# Workflow — Refactoring

## Purpose

Defines the sequence of steps, validations, and quality gates required to refactor files in the PokéVault repository. Focuses on decomposition, eliminating duplicate code, improving type contracts, and extracting side-effects to custom hooks.

---

## Sequence of Steps

1. **Target Identification & Mapping**:
   - Locate code blocks violating guidelines (e.g. components exceeding 300 lines, duplicate logic, `any` type tags).
   - Identify dependent modules and map side effects.
2. **Characterization Testing**:
   - Write or verify existing unit tests for the target module before modifying it. These tests act as a regression safeguard.
3. **Decomposition & Extraction**:
   - Split large React component files into smaller files.
   - Extract logic to dedicated custom hooks.
   - Replace complex loops with map lookups.
4. **Integration & Re-assembly**:
   - Re-import new modules into the parent file using named exports.
   - Ensure the TS compiler runs cleanly.
5. **Validation Testing**:
   - Verify the regression test suite passes.
   - Audit performance metrics (rendering times and memory usage).

---

## Required Validations

- **Refactoring constraint check**: Verify that the functionality of the refactored code remains identical to the baseline.
- **Size constraint check**: Confirm that no newly created files exceed 300 lines of code.
- **Type compliance check**: Verify that there are no remaining type escapes (`any` or unannotated casts).

---

## Completion Criteria

- [ ] All code paths refactored maintain compatibility with the previous codebase.
- [ ] No regression introduced to the build.
- [ ] Code is organized into smaller modules (≤ 300 lines) and custom hooks.
- [ ] Unit tests pass.
- [ ] PR approved by Architect, Reviewer, and Performance agents.

---

## Rollback Plan

If refactoring causes unexpected bugs:
1. Revert changes using git reset.
2. Review the gaps between mock data and production state.
3. Re-draft the refactoring design plan.
