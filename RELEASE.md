# Release Guide for DomainHive Framework

## Version 1.0.0 Release

This document describes the steps to release version 1.0.0 of the DomainHive Framework.

## Pre-Release Checklist

- [x] All code changes are committed
- [x] Build is successful (`npm run build`)
- [x] Dependencies are up to date
- [x] Documentation is updated (README.md, CHANGELOG.md, FEATURES.md, USAGE_GUIDE.md, QUICK_START.md)
- [x] Version number in package.json is correct (1.0.0)
- [x] Git tag v1.0.0 is created locally

## Release Steps

### 1. Push the Git Tag

The git tag `v1.0.0` has been created locally with the following command:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Enterprise Backend System"
```

To push the tag to GitHub:

```bash
git push origin v1.0.0
```

### 2. Create a GitHub Release

After pushing the tag, create a GitHub release:

1. Go to: https://github.com/Eclipse-Softworks/domainhive-framework/releases/new
2. Select tag: `v1.0.0`
3. Release title: `v1.0.0 - Enterprise Backend System`
4. Description: Copy content from CHANGELOG.md for version 1.0.0
5. Check "Set as the latest release"
6. Click "Publish release"

### 3. Publish to npm

To publish the package to npm:

```bash
# Login to npm (if not already logged in)
npm login

# Dry run to verify what will be published
npm pack --dry-run

# Publish the package
npm publish
```

This will:
- Run the `prepare` script which builds the project
- Package all necessary files (src, dist, documentation)
- Publish to the npm registry at: https://www.npmjs.com/package/domainhive-framework

### 4. Verify the Release

After publishing:

1. **Verify npm package:**
   - Visit: https://www.npmjs.com/package/domainhive-framework
   - Check version is 1.0.0
   - Verify files are included correctly

2. **Verify GitHub release:**
   - Visit: https://github.com/Eclipse-Softworks/domainhive-framework/releases
   - Check v1.0.0 release is published
   - Verify release notes are correct

3. **Test installation:**
   ```bash
   # Create a test directory
   mkdir /tmp/test-install
   cd /tmp/test-install
   npm init -y
   
   # Install the published package
   npm install domainhive-framework
   
   # Verify it works
   node -e "const { DomainHive, logger } = require('domainhive-framework'); const hive = DomainHive.getInstance(); logger.info('Framework loaded successfully!');"
   ```

## Package Contents

The package includes:

- **Source code:** `src/` directory with TypeScript files
- **Compiled code:** `dist/` directory with JavaScript and declaration files
- **Documentation:** README.md, CHANGELOG.md, FEATURES.md, USAGE_GUIDE.md, QUICK_START.md
- **Configuration:** package.json, tsconfig.json
- **Workflows:** .github/workflows/ for CI/CD

## Post-Release Tasks

- [ ] Update project board/issues to mark v1.0.0 as released
- [ ] Announce release on project channels (Discord, Twitter, etc.)
- [ ] Update any dependent projects to use the new version
- [ ] Monitor for any issues reported by early adopters
- [ ] Start planning for v1.1.0 (see ROADMAP.md)

## Rollback Procedure

If critical issues are discovered after release:

1. **Unpublish from npm (within 72 hours):**
   ```bash
   npm unpublish domainhive-framework@1.0.0
   ```

2. **Delete the GitHub release:**
   - Go to the release page
   - Click "Delete" on the release

3. **Delete the git tag:**
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```

4. **Fix the issues and release a patch version (1.0.1)**

## Notes

- The tag has been created locally and needs to be pushed to GitHub
- The package is ready to be published to npm
- All documentation is up to date
- The build completes successfully with no errors
- All type definitions are included

## Support

For questions or issues with the release process, contact:
- Email: support@eclipsesoftworks.com
- GitHub Issues: https://github.com/Eclipse-Softworks/domainhive-framework/issues
