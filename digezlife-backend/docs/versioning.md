# Versioning Policy

Alamia SaaS Platform adheres strictly to [Semantic Versioning (SemVer)](https://semver.org/).

Given a version number `MAJOR.MINOR.PATCH`, increment the:
1. `MAJOR` version when making incompatible public API changes.
2. `MINOR` version when adding functionality in a backwards compatible manner.
3. `PATCH` version when making backwards compatible bug fixes.

## Public API Constraints
Only the interfaces, facades, events, and extension points explicitly defined in `docs/kernel-api.md` are subject to Semantic Versioning guarantees. 

Internal implementation details, concrete class methods not part of contracts, and private properties may be modified in `PATCH` or `MINOR` releases without being considered a breaking change.

## Pre-releases
A pre-release version MAY be denoted by appending a hyphen and a series of dot separated identifiers immediately following the patch version (e.g., `v0.1.0-alpha`). Pre-releases indicate the version is unstable and might not satisfy intended compatibility requirements.
