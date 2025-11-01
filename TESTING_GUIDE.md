# Testing Guide for GitHub Issue Tracking Feature

## Prerequisites

1. **Fork a public GitHub repository** (or use a test fork)
2. **Set up upstream remote** pointing to parent repository
3. **Install Oggy** and configure with Groq API key
4. **Make some commits** to test with

## Test Cases

### Test 1: Fork Detection - Positive Case

**Setup:**
```bash
cd your-forked-repo
git remote -v
# Should show both origin (your fork) and upstream (parent repo)
```

**Test:**
```bash
oggy analyze
```

**Expected Result:**
- Message: "Detected fork of OWNER/REPO"
- Prompt: "Are you solving an issue from the parent repository?"

---

### Test 2: Fork Detection - Negative Case (Not a Fork)

**Setup:**
```bash
cd non-forked-repo
git remote -v
# Should only show origin, no upstream
```

**Test:**
```bash
oggy analyze
```

**Expected Result:**
- No fork detection message
- No issue prompt
- Normal analysis proceeds

---

### Test 3: Valid Issue Number

**Setup:**
- Ensure parent repo has a public issue (e.g., #1, #2, etc.)
- Verify it's an issue, not a pull request

**Test:**
```bash
oggy analyze
# When prompted, enter a valid issue number: 1
```

**Expected Result:**
- Spinner: "Fetching issue #1 from OWNER/REPO..."
- Success message: "Issue #1 found: [TITLE]"
- Status and URL displayed
- "Commits will be validated against this issue"
- Analysis includes "Linked Issue" section
- Analysis includes "Issue Relevance Analysis" section

---

### Test 4: Invalid Issue Number

**Setup:**
- Use an issue number that doesn't exist (e.g., 99999)

**Test:**
```bash
oggy analyze
# When prompted, enter: 99999
```

**Expected Result:**
- Error message: "Issue #99999 not found or is a pull request"
- Fallback: "Continuing without issue validation..."
- Normal analysis proceeds without issue data

---

### Test 5: Pull Request Number (Should be filtered)

**Setup:**
- Find a pull request number in parent repo

**Test:**
```bash
oggy analyze
# When prompted, enter the PR number
```

**Expected Result:**
- Message: "Issue #X not found or is a pull request"
- Continues without issue validation

---

### Test 6: Skip Issue Validation

**Test:**
```bash
oggy analyze
# When prompted, just press Enter without typing anything
```

**Expected Result:**
- Message: "Skipping issue validation..."
- Normal analysis proceeds

---

### Test 7: Non-numeric Input

**Test:**
```bash
oggy analyze
# When prompted, enter: abc or random text
```

**Expected Result:**
- Message: "Invalid issue number, skipping issue validation..."
- Normal analysis proceeds

---

### Test 8: Network Error Handling

**Setup:**
- Disconnect from internet or use a private repo URL

**Test:**
```bash
oggy analyze
# Enter an issue number
```

**Expected Result:**
- Error message: "Failed to fetch issue: [error details]"
- Fallback: "Continuing without issue validation..."
- Normal analysis proceeds

---

### Test 9: Issue Relevance - High Score

**Setup:**
- Create a commit that directly addresses an issue
- Commit message should reference the issue

**Example:**
```bash
# Issue #5: "Add error handling to API calls"
# Commit: "feat: Add try-catch blocks to all API endpoints"
git commit -m "feat: Add comprehensive error handling

- Add try-catch to all API endpoints
- Implement error logging
- Add user-friendly error messages
Fixes #5"

oggy analyze
# Enter: 5
```

**Expected Result:**
- Issue Relevance Status: RELEVANT ✓
- Score: 80-100
- Positive explanation
- Few or no mismatches

---

### Test 10: Issue Relevance - Low Score

**Setup:**
- Create a commit unrelated to the issue

**Example:**
```bash
# Issue #5: "Add error handling to API calls"
# Commit: "Update README styling"
git commit -m "docs: Update README formatting"

oggy analyze
# Enter: 5
```

**Expected Result:**
- Issue Relevance Status: NOT RELEVANT ✗
- Score: 0-49
- Explanation stating mismatches
- List of mismatches showing unrelated changes

---

### Test 11: Remote Repository Analysis (Should Skip)

**Test:**
```bash
oggy analyze --git-url https://github.com/someuser/somerepo.git
```

**Expected Result:**
- No fork detection
- No issue prompt
- Analysis proceeds normally

---

### Test 12: Unstaged Changes Analysis

**Test:**
```bash
# Make some changes without committing
oggy analyze --unstaged
```

**Expected Result:**
- Fork detection works
- Issue prompt appears (if fork)
- Issue can be linked
- Relevance analysis runs

---

### Test 13: Private Repository (Expected to Fail Gracefully)

**Setup:**
- Use a fork of a private repository

**Test:**
```bash
oggy analyze
# Enter an issue number
```

**Expected Result:**
- Error: "Repository OWNER/REPO not found or is private"
- Continues without issue validation
- No crash

---

### Test 14: Report Output with Issue Data

**Test:**
```bash
oggy analyze --output report.md
# Enter a valid issue number when prompted
```

**Expected Result:**
- Markdown file created
- Contains "Linked Issue" section
- Contains "Issue Relevance" section
- Properly formatted

---

### Test 15: Multiple Consecutive Analyses

**Test:**
```bash
oggy analyze
# Enter issue number: 1

oggy analyze
# Enter issue number: 2
```

**Expected Result:**
- Both analyses work independently
- Different issues attached correctly
- No state pollution between runs

---

## Manual Verification Checklist

After running tests, verify:

- [ ] Fork detection logic works correctly
- [ ] Issue fetching from GitHub API succeeds
- [ ] Issue filtering (excludes PRs) works
- [ ] Error handling is graceful (no crashes)
- [ ] User prompts are clear and helpful
- [ ] Spinner/progress indicators work
- [ ] Issue data displays correctly in report
- [ ] Relevance analysis is accurate
- [ ] Report includes all issue sections
- [ ] Markdown export includes issue data
- [ ] Non-fork repos don't trigger feature
- [ ] Skip functionality works
- [ ] Invalid inputs handled gracefully
- [ ] Network errors handled properly
- [ ] Color coding is appropriate

## Performance Testing

**Test Response Time:**
```bash
time oggy analyze
# Check that issue fetching doesn't significantly slow down analysis
```

**Expected:**
- Fork detection: < 100ms
- Issue fetching: < 2 seconds
- Overall impact: Minimal (< 5% increase)

## Edge Cases to Consider

1. **Very long issue descriptions** (> 10,000 characters)
2. **Issues with special characters** in title/body
3. **Closed issues** (should still work)
4. **Very old issues** (created years ago)
5. **Issues with many labels**
6. **Repository with 100+ open issues**

## Known Limitations

1. Requires `upstream` remote to be configured
2. Only works with public repositories (no GitHub token)
3. GitHub API rate limit: 60 requests/hour (unauthenticated)
4. Cannot auto-detect issue number from commit message (yet)
5. Single issue per analysis (no multi-issue support)

## Debugging Tips

**Enable verbose logging:**
```bash
DEBUG=1 oggy analyze
```

**Check git remotes:**
```bash
git remote -v
git remote show upstream
```

**Test GitHub API directly:**
```bash
curl https://api.github.com/repos/OWNER/REPO/issues/1
```

**Check fork status:**
```bash
git config --get remote.upstream.url
```

## Success Criteria

All tests should:
- Complete without crashes
- Show appropriate error messages
- Provide helpful feedback
- Degrade gracefully on failure
- Not block the main analysis flow
