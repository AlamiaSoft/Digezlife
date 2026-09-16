I would **not** proceed to Phase 4 yet.

You're at the point where many framework projects make a mistake: they keep adding features before proving the existing foundation actually works. A platform kernel is only valuable if its contracts, integrations, and extension points are reliable.

I'd insert a dedicated phase.

# Phase 3.5 — Platform Validation & Hardening

The objective is simple:

> **Prove that Alamia can build a real SaaS product without changing the kernel.**

---

# Validation Pyramid

## Level 1 — Static Quality

Every commit should pass:

* PHPStan (highest practical level)
* Laravel Pint
* Rector (dry run)
* Composer Normalize
* Deptrac (domain dependency validation)
* PHP-CS-Fixer (optional)

**Goal:** architectural correctness.

---

## Level 2 — Unit Tests

Every domain owns its tests.

Example:

```text
Tenant/
Tests/

Identity/
Tests/

Billing/
Tests/

Workflow/
Tests/
```

Target:

* > 90% service coverage
* 100% critical domain coverage

---

## Level 3 — Integration Tests

Test domain interaction.

Examples:

```
Tenant
↓

Settings

Tenant
↓

Feature Flags

Workflow
↓

Notifications

Billing
↓

Quota

Identity
↓

Authorization
```

These catch the real bugs.

---

## Level 4 — Platform Tests

Test the kernel itself.

Examples:

```
Module loading

↓

Tenant creation

↓

User registration

↓

Plan assignment

↓

Feature resolution

↓

Notification

↓

Audit log
```

End-to-end.

---

## Level 5 — Example Modules

This is the most important validation.

Build three tiny modules.

```
Hello World

↓

CRM Lite

↓

Booking Lite
```

If those can be built **without changing the kernel**, your architecture is good.

If you need to keep modifying Kernel, your abstractions aren't finished.

---

# Build a Sample SaaS

Don't build another scaffold.

Build a tiny product.

Example:

```
Tenant

↓

Create Workspace

↓

Invite User

↓

Assign Plan

↓

Enable Feature

↓

Create Customer

↓

Receive Notification

↓

Audit Entry

↓

API Access

↓

Webhook Fired
```

One happy path.

---

# CI Pipeline

Every PR should run:

```
composer validate

↓

composer install

↓

pint

↓

phpstan

↓

deptrac

↓

phpunit

↓

integration

↓

e2e

↓

coverage
```

No merge without green.

---

# Performance Tests

Measure:

* Tenant boot time
* Module discovery
* Permission resolution
* Settings lookup
* Feature flag lookup
* Workflow dispatch
* Webhook dispatch

Establish baselines now.

---

# Architecture Tests

Use Deptrac or Pest Architecture.

Rules like:

```
Billing

cannot access

Tenant Infrastructure
```

```
Identity

cannot access

Billing
```

```
Modules

cannot access

Shared internals
```

Enforce them automatically.

---

# Build a Reference Application

This is huge.

Create:

```
examples/

starter-saas/
```

Everything should work from:

```
alamia/core

+

3 modules
```

Nothing else.

If the reference app works...

every future SaaS will.

---

# Documentation

Write these before Phase 4:

```
Kernel Architecture

Module Development

Domain Rules

Events

Dependency Rules

Testing Guide

Upgrade Guide

Release Process
```

Treat docs as code.

---

# Release Candidate

I'd define:

```
v0.9.0

↓

Kernel Freeze
```

From then on:

* No breaking namespaces
* No moving domains
* No restructuring folders

Only additions.

---

## My biggest recommendation

Before writing a single new feature, **build one real SaaS on top of Alamia**—even a deliberately simple one such as a basic CRM or internal ticketing system.

If you can complete that application **without modifying `alamia-core`**, you've achieved the goal of a reusable business platform kernel.

If you repeatedly find yourself editing the kernel to accommodate the application, that's valuable feedback. It tells you exactly which abstractions need refinement before you expand the platform further. This validation phase will do more to improve Alamia than adding another dozen platform features.
