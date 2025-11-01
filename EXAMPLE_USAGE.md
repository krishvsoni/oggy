# Example: Using the GitHub Issue Tracking Feature

## Scenario
You've forked the Oggy repository and want to contribute by fixing issue #42: "Add support for TypeScript configuration files"

## Step 1: Set up your fork

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/oggy.git
cd oggy

# Add upstream remote (parent repository)
git remote add upstream https://github.com/krishvsoni/oggy.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/oggy.git (fetch)
# origin    https://github.com/YOUR_USERNAME/oggy.git (push)
# upstream  https://github.com/krishvsoni/oggy.git (fetch)
# upstream  https://github.com/krishvsoni/oggy.git (push)
```

## Step 2: Work on the issue

```bash
# Create a feature branch
git checkout -b fix/typescript-config-support

# Make your changes
# ... edit files ...

# Commit your changes
git add .
git commit -m "feat: Add TypeScript configuration file parser

- Add tsconfig.json parser
- Support for extends property
- Validate compiler options
- Fixes #42"
```

## Step 3: Run Oggy analysis

```bash
oggy analyze
```

## Expected Output

```
Oggy - AI Commit Analyzer

 Detected fork of krishvsoni/oggy

Are you solving an issue from the parent repository? Enter issue number (or press Enter to skip): 42

⠋ Fetching issue #42 from krishvsoni/oggy...
✓ Issue #42 found: Add support for TypeScript configuration files
   Status: open
   URL: https://github.com/krishvsoni/oggy/issues/42

✓ Commits will be validated against this issue

✓ Commit information retrieved
Using model: llama-3.3-70b-versatile

⠋ Analyzing commit metrics...
✓ Commit metrics analyzed
⠋ Agent creating analysis plan...
✓ Analysis plan created

Agent Plan:
   Goal: Analyze commit for TypeScript config support implementation
   Complexity: medium

Agent Thinking Process:
   Analyzing file changes for TypeScript configuration handling...
   Checking parser implementation quality...
   Validating test coverage...

⠋ Performing deep code analysis...
✓ Deep analysis completed
⠋ Analyzing issue relevance...
✓ Issue relevance analyzed
⠋ Generating PR title...
✓ PR title generated

================================================================================
COMMIT ANALYSIS REPORT
================================================================================

Commit Information:
   Hash:    a7f3e2d1
   Message: feat: Add TypeScript configuration file parser
   Author:  Your Name
   Files:   5 changed

Linked Issue:
   #42: Add support for TypeScript configuration files

Overall Score:
   92/100

Status:
   READY

Summary:
   Excellent implementation of TypeScript configuration parsing with proper 
   validation and error handling. Code is well-structured and follows best 
   practices. Test coverage is comprehensive.

Issue Relevance Analysis:
   Status: RELEVANT ✓
   Score:  95/100
   The commit directly addresses the issue requirements by implementing a 
   complete TypeScript configuration parser. File changes are highly relevant, 
   including parser logic, validation, and comprehensive tests. The commit 
   message properly references the issue number.

   Potential Mismatches:
      • Issue mentions documentation update in README, but no README changes found

Issues Found:

   CRITICAL (0):
   None found

   HIGH (0):
   None found

   MEDIUM (1):
      • Documentation: Missing inline documentation for extends property handling
        Location: src/parsers/tsconfig.ts:45
        Suggestion: Add JSDoc comments explaining recursive extends resolution

   LOW (1):
      • Performance: Consider caching parsed tsconfig files
        Location: src/parsers/tsconfig.ts:12
        Suggestion: Implement simple memoization for repeated file reads

Suggestions:
   1. [MEDIUM] Documentation: Add example usage in README.md as mentioned in the issue
   2. [LOW] Testing: Add edge case test for circular extends references

PR Readiness:
   ✓ Ready for Pull Request!
   Score (92) meets minimum requirement (70)

Generated PR Description:
   ─────────────────────────────────────────────────────────────────────────
   # Add TypeScript Configuration File Parser

   ## Changes
   -  Implemented comprehensive tsconfig.json parser
   -  Added support for extends property with recursive resolution
   -  Included validation for compiler options
   -  Comprehensive test suite with edge cases
   -  Type definitions for TypeScript configuration

   ## Fixes
   Closes #42

   ## Testing
   - Added unit tests for parser functionality
   - Tested extends property resolution
   - Validated error handling for malformed configs

   ## Notes
   Consider adding usage documentation to README as mentioned in the issue.
   ─────────────────────────────────────────────────────────────────────────

================================================================================
```

## Step 4: Address feedback

Based on the analysis, you should:

1. ✅ Add documentation to README (mentioned in issue and flagged as mismatch)
2. ✅ Add JSDoc comments for the extends property handling
3. ✅ (Optional) Add caching for better performance
4. ✅ (Optional) Test circular extends edge case

```bash
# Make improvements
# ... update files ...

# Commit improvements
git add .
git commit -m "docs: Add TypeScript config usage to README

- Document new tsconfig parser usage
- Add examples for basic and advanced scenarios
- Addresses documentation requirement from #42"

# Run analysis again
oggy analyze
# You'll be prompted for the issue number again (enter 42)
```

## Step 5: Create Pull Request

```bash
# Push to your fork
git push origin fix/typescript-config-support

# Create PR on GitHub
# The PR description can be based on Oggy's generated description
```

## Benefits Demonstrated

1. **Caught Missing Documentation**: Oggy identified that the issue mentioned README updates but they weren't included
2. **Code Quality**: Received suggestions for JSDoc comments and performance improvements
3. **Relevance Validation**: AI confirmed the changes actually solve the issue (95% relevance)
4. **PR Description**: Auto-generated professional PR description
5. **Confidence**: High score (92/100) means you can submit the PR with confidence

## What if relevance is low?

If Oggy reports low relevance (< 50), example:

```
Issue Relevance Analysis:
   Status: NOT RELEVANT ✗
   Score:  35/100
   The commit changes primarily focus on API key validation, which is 
   unrelated to the TypeScript configuration parsing requested in issue #42.

   Potential Mismatches:
      • Issue requests tsconfig.json parser implementation
      • Commit changes authentication logic instead
      • No configuration-related files modified
      • Commit may be addressing a different issue

PR Readiness:
   ⚠ Needs improvement before PR
```

**What to do:**
1. Review the issue requirements carefully
2. Check if you're working on the correct branch/issue
3. Ensure your changes actually address the issue
4. Consider splitting unrelated changes into separate commits
