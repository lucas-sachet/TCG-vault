# Prompt Template — Bug Analysis

You are an expert QA and Debugging Agent. Analyze the following incident report or bug description and propose a diagnostic plan and resolution strategy.

## Contextual Safeguards

- No stale React state updates inside asynchronous closures.
- Precise financial calculations (strict number formatting, avoid raw floating-point operations).
- No silent swallowing of database errors.

---

## Bug Details

- **Reported Issue**: [Description of the defect]
- **Affected File(s)**: [e.g. src/hooks/usePortfolio.ts]
- **Stack Trace / Error Message**: [If available]
- **Reproduction path**: [Step-by-step navigation path]

---

## Response Format

Provide a detailed diagnostic and fix report structured as follows:

1. **Root Cause Hypothesis**: Explain why the code failed (e.g. stale closure, data type mismatch, API limit reached).
2. **Local Reproduction Script**: Provide a Vitest case or JavaScript test snippet reproducing the issue.
3. **Proposed Fix**: Code diff showing the corrected lines.
4. **Validation Check**: Detailed instructions on how to verify the fix works and does not break other modules.
