# GitHub Issue Tracking Feature - Implementation Summary

## Overview
This feature adds automatic fork detection and GitHub issue validation to Oggy. When analyzing commits in a forked repository, users can link their commits to issues from the parent repository, and AI will validate whether the changes are relevant to solving the issue.

## New Files Created

### 1. `src/utils/github.ts`
A comprehensive GitHub helper utility that provides:
- **Fork detection**: Checks if the current repository is a fork by analyzing git remotes
- **Issue fetching**: Retrieves issues from GitHub's public API
- **Issue validation**: Verifies if an issue exists and is not a pull request
- **URL parsing**: Handles both HTTPS and SSH GitHub URLs

Key Classes:
- `GitHubHelper`: Main class with methods for fork detection and issue management
- `ForkInfo`: Interface for fork information
- `GitHubIssue`: Interface for GitHub issue data

### 2. `ISSUE_TRACKING.md`
Complete documentation for the new feature including:
- How the feature works
- Setup instructions for forked repositories
- Usage examples
- Relevance scoring explanation
- API rate limit information
- Troubleshooting guide

## Modified Files

### 1. `src/types.ts`
**Changes:**
- Extended `CommitInfo` interface with optional issue fields:
  - `issueNumber?: number`
  - `issueTitle?: string`
  - `issueBody?: string`
  
- Extended `AnalysisResult` interface with issue relevance:
  - `issueRelevance?: { isRelevant, score, explanation, mismatches }`

### 2. `src/cli.ts`
**Changes:**
- Imported `GitHubHelper` utility
- Added fork detection logic after commit retrieval
- Interactive prompt for issue number input
- Fetches issue details from parent repository
- Attaches issue information to commit object
- User-friendly error handling and progress indicators

**Workflow:**
1. After fetching commit info, check if repo is a fork
2. If fork detected, prompt user for issue number
3. Fetch issue from parent repository via GitHub API
4. Attach issue data to commit for analysis
5. Display issue information to user

### 3. `src/agent/orchestrator.ts`
**Changes:**
- Updated `analyzeCommit` to include issue info in context
- Added new method `analyzeIssueRelevance()`:
  - Takes commit and code context
  - Calls AI to validate relevance
  - Returns relevance score and analysis

### 4. `src/agent/groq.ts`
**Changes:**
- Added `checkIssueRelevance()` method:
  - Uses AI to compare issue description with commit changes
  - Returns structured relevance analysis with score (0-100)
  - Identifies mismatches between expected and actual changes

**Scoring System:**
- 90-100: Highly relevant
- 70-89: Mostly relevant
- 50-69: Partially relevant
- 30-49: Barely relevant
- 0-29: Not relevant

### 5. `src/analyzers/report.ts`
**Changes:**
- Display linked issue information in commit details
- New "Issue Relevance Analysis" section showing:
  - Relevance status (✓ or ✗)
  - Relevance score with color coding
  - AI explanation of relevance
  - Potential mismatches list
- Updated markdown report generation to include issue data

### 6. `README.md`
**Changes:**
- Added "GitHub Issue Tracking" to features list
- New section "GitHub Issue Tracking (for Forked Repositories)" in usage
- Example interaction and output
- Link to detailed documentation (ISSUE_TRACKING.md)

## Feature Flow

```
User runs: oggy analyze
         ↓
Fetch commit information
         ↓
Check if repo is a fork (upstream remote exists)
         ↓
YES → Prompt for issue number
         ↓
Fetch issue from parent repo (GitHub API)
         ↓
Attach issue to commit object
         ↓
Run standard analysis
         ↓
AI validates commit relevance to issue
         ↓
Display relevance analysis in report
```

## Technical Details

### Fork Detection
- Checks for `upstream` git remote
- Parses remote URLs to extract owner/repo
- Supports both HTTPS and SSH URLs

### GitHub API Integration
- Uses public GitHub REST API (no auth required for public repos)
- Rate limit: 60 requests/hour (unauthenticated)
- Filters out pull requests from issues
- Graceful error handling for network issues

### AI Analysis
- Compares issue description with commit changes
- Analyzes file changes relevance
- Checks commit message references
- Identifies missing aspects or mismatches
- Provides actionable feedback

## Benefits

1. **Quality Control**: Ensures commits actually solve the stated issue
2. **Contribution Validation**: Helps maintainers verify PR relevance
3. **Learning Tool**: Educates contributors on issue requirements
4. **Time Saving**: Catches misaligned work before PR review
5. **Better PRs**: Encourages focused, issue-aligned commits

## Future Enhancements (Potential)

1. GitHub token authentication for private repos and higher rate limits
2. Automatic issue number detection from commit messages
3. Multi-issue support (one commit addressing multiple issues)
4. Integration with GitHub Projects and milestones
5. Suggest related issues based on code changes
6. Track issue progress across multiple commits

## Testing Checklist

- [x] Fork detection with upstream remote
- [x] Issue fetching from public repository
- [x] Issue validation (not a PR)
- [x] Graceful handling of invalid issue numbers
- [x] Skip functionality (press Enter)
- [x] Non-fork repositories (no prompt)
- [x] Remote repository analysis (skip issue check)
- [x] Error handling (network issues, repo not found)
- [x] Display formatting and colors
- [x] Report generation with issue data
- [x] AI relevance analysis accuracy

## Dependencies

No new dependencies added - uses:
- Built-in `fetch` API for GitHub requests
- Existing `simple-git` for git operations
- Existing `readline` for user prompts
- Existing `ora` for spinners

## Backward Compatibility

✅ Fully backward compatible:
- Existing functionality unchanged
- New feature only activates for forks
- Optional (can skip by pressing Enter)
- No breaking changes to APIs or configs
