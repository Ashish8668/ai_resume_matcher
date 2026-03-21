# ATS Scoring Logic

This document explains how ATS match scoring is computed in this project after calibration improvements.

## Why We Changed It

Earlier scoring could look too high even when important skills were missing.  
Now the score is calibrated to prioritize missing-skill impact and better reflect real hiring fit.

## Where It Runs

Scoring is computed in:

- `backend/src/routes/match.routes.js`
- Function: `computeCalibratedAtsScore(similarityScore, gapData)`

## Inputs

The score uses:

1. `similarityScore` (0 to 1)
- AI semantic similarity between resume text and job description.

2. `gapData.missingSkills`
- Skills required by the job but missing in the resume.
- Each skill may include `importance` (0 to 1).

3. `gapData.matchedSkills`
- Skills present in both resume and job.
- Each skill may include `importance` (0 to 1).

## Formula

### Step 1: Semantic Percent

```text
semanticPercent = similarityScore * 100
```

### Step 2: Skill Coverage Percent

```text
totalSkills = missingSkillsCount + matchedSkillsCount
coveragePercent = (matchedSkillsCount / totalSkills) * 100
```

If no skills are extracted, `coveragePercent` falls back to `semanticPercent`.

### Step 3: Blended Base Score

```text
blendedBase = 0.55 * semanticPercent + 0.45 * coveragePercent
```

Rationale:
- 55% semantic fit
- 45% explicit skill coverage

### Step 4: Weighted Missing Penalty

```text
totalImportance = sum(importance of missing + matched)
missingImportance = sum(importance of missing)
weightedPenalty = (missingImportance / totalImportance) * 30
```

Penalty max is effectively 30 points.

### Step 5: Critical Skill Penalty

A skill is treated as critical if `importance >= 0.75`.

```text
criticalPenalty = min(20, criticalMissingCount * 4)
```

Penalty max is 20 points.

### Step 6: Final ATS Score

```text
atsScore = clamp(blendedBase - weightedPenalty - criticalPenalty, 5, 98)
```

Final score range is intentionally capped to avoid unrealistic extremes:
- Minimum: `5`
- Maximum: `98`

## What This Improves

1. Better penalty for missing important skills.
2. High semantic similarity alone cannot hide major skill gaps.
3. More stable, recruiter-like score behavior.

## Output Fields Returned

The API still returns:

- `match.atsScore`
- `match.similarityScore`
- `match.missingSkills`
- `match.matchedSkills`

Additionally, it now returns:

- `match.scoreBreakdown`

Breakdown fields:
- `semanticPercent`
- `coveragePercent`
- `blendedBase`
- `weightedPenalty`
- `criticalPenalty`
- `criticalMissingCount`

## Practical Interpretation

- `80+`: strong fit with few critical missing skills.
- `60-79`: moderate fit, candidate should address missing skills.
- `<60`: significant mismatch, strong upskilling/resume tailoring needed.

These are guidance bands, not hiring decisions.
