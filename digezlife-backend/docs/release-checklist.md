# Release Checklist

This checklist must be followed before tagging a new release.

## Pre-Release Checks
- [ ] All tests passing locally (`composer test`)
- [ ] CI pipeline is green for the target branch
- [ ] Code coverage has not significantly decreased
- [ ] No high-severity vulnerabilities found (`composer audit`)
- [ ] PHPStan reports 0 errors (`vendor/bin/phpstan analyse`)

## Changelog
- [ ] Ensure `CHANGELOG.md` is updated with changes since the last release.
- [ ] Categorize changes (Added, Changed, Deprecated, Removed, Fixed, Security).

## Tagging
- [ ] Tag matches the Versioning Policy (SemVer).
- [ ] Tag the release on GitHub (triggering `release.yml`).
