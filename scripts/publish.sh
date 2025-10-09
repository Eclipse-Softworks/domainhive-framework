#!/bin/bash

# DomainHive Framework Release Script
# This script helps automate the release process

set -e  # Exit on error

echo "🚀 DomainHive Framework Release Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $VERSION"
echo ""

# Check if tag exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "✅ Git tag v$VERSION already exists"
else
    echo "❌ Git tag v$VERSION does not exist"
    read -p "   Create tag now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -a "v$VERSION" -m "Release v$VERSION"
        echo "✅ Tag v$VERSION created"
    else
        echo "❌ Aborting release"
        exit 1
    fi
fi

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# Run tests if they exist
if grep -q "\"test\"" package.json; then
    echo ""
    echo "🧪 Running tests..."
    npm test
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed"
        exit 1
    fi
    echo "✅ Tests passed"
fi

# Dry run of npm pack
echo ""
echo "📋 Checking package contents (dry run)..."
npm pack --dry-run > /tmp/npm-pack-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Package validation successful"
    echo ""
    echo "Package will include:"
    grep "npm notice" /tmp/npm-pack-output.txt | head -20
    echo "   ... (see /tmp/npm-pack-output.txt for full list)"
else
    echo "❌ Package validation failed"
    cat /tmp/npm-pack-output.txt
    exit 1
fi

# Ask for confirmation
echo ""
echo "📤 Ready to release v$VERSION"
echo ""
echo "This will:"
echo "  1. Push the git tag v$VERSION to GitHub"
echo "  2. Publish the package to npm"
echo ""
read -p "Continue with release? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# Push the tag
echo ""
echo "🏷️  Pushing tag to GitHub..."
git push origin "v$VERSION"
if [ $? -eq 0 ]; then
    echo "✅ Tag pushed successfully"
else
    echo "❌ Failed to push tag"
    exit 1
fi

# Publish to npm
echo ""
echo "📦 Publishing to npm..."
npm publish

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Package published to npm"
    echo ""
    echo "Next steps:"
    echo "  1. Create GitHub release at: https://github.com/Eclipse-Softworks/domainhive-framework/releases/new?tag=v$VERSION"
    echo "  2. Verify at: https://www.npmjs.com/package/domainhive-framework"
    echo "  3. Test installation: npm install domainhive-framework@$VERSION"
    echo ""
else
    echo "❌ npm publish failed"
    exit 1
fi
