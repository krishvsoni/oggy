# GitHub Issue Tracking Feature

This feature automatically detects if your repository is a fork and helps you validate that your commits are relevant to the issues you're solving.

## How It Works

1. **Fork Detection**: When you run `oggy analyze`, Oggy detects if your repository is a fork by checking for an `upstream` remote.

2. **Issue Selection**: If a fork is detected, you'll be prompted to enter the issue number you're solving from the parent repository.

3. **Issue Validation**: Oggy fetches the issue details from the parent repository's GitHub API and attaches it to your commit analysis.

4. **Relevance Analysis**: The AI analyzes whether your commit changes are relevant to solving the specified issue.

## Setup for Forked Repositories

To enable this feature, make sure your fork has an `upstream` remote pointing to the parent repository:

```bash
# Check your current remotes
git remote -v

# If you don't have an upstream remote, add it:
git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPO.git

# Example for a fork of oggy:
git remote add upstream https://github.com/krishvsoni/oggy.git
```

## Usage

1. **Make your commits** as usual:
```bash
git add .
git commit -m "Fix: Resolve issue with API key validation"
```

2. **Run Oggy analysis**:
```bash
oggy analyze
```

3. **When prompted**, enter the issue number:
```
Detected fork of krishvsoni/oggy

Are you solving an issue from the parent repository? Enter issue number (or press Enter to skip): 42
```

4. **Review the results**: Oggy will show:
   - Issue details (title, status, URL)
   - Commit analysis
   - **Issue Relevance Analysis** including:
     - Relevance score (0-100)
     - Whether changes are relevant
     - Explanation of relevance
     - Potential mismatches

## Example Output

```
Linked Issue:
   #42: Add support for TypeScript configuration files

Issue Relevance Analysis:
   Status: RELEVANT ✓
   Score:  85/100
   The commit addresses the core issue by adding TypeScript config parsing...
   
   Potential Mismatches:
      • Issue mentions documentation update, but no docs were changed
```

## Relevance Scoring

- **90-100**: Highly relevant - directly addresses the issue
- **70-89**: Mostly relevant - addresses core aspects
- **50-69**: Partially relevant - some connection to issue
- **30-49**: Barely relevant - tangential connection
- **0-29**: Not relevant - unrelated changes

## API Rate Limits

This feature uses GitHub's public API which has rate limits:
- **Unauthenticated**: 60 requests per hour
- **Authenticated**: 5,000 requests per hour (with GitHub token)

For now, the feature works without authentication for public repositories. Private repository support may be added in future versions.

## Skipping Issue Validation

You can skip issue validation by:
- Pressing Enter when prompted for an issue number
- The feature only activates for forked repositories
- Remote repository analysis (`--git-url`) doesn't trigger issue validation

## Troubleshooting

### "Repository not found or is private"
- Make sure the parent repository is public
- Check that your upstream remote is correctly configured

### "Issue not found or is a pull request"
- Verify the issue number exists in the parent repository
- Note that pull requests appear in the issues API but are filtered out

### Fork not detected
- Check that you have an `upstream` remote: `git remote -v`
- Add the upstream remote if missing
