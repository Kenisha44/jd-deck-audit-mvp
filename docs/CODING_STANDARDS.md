# Coding Standards

## General

- One responsibility per component.
- One responsibility per service.
- Keep functions small and focused.
- Prefer reusable components.

## Git

Every completed epic:

1. Test
2. Update documentation
3. Commit
4. Deploy

## Naming

Components:
PascalCase

Services:
camelCase

Routes:
lowercase

## Architecture

Business logic belongs in Services.

Routes only coordinate requests.

Utilities contain shared helper functions.

## Documentation

Every completed feature updates:

- CHANGELOG
- FEATURES
- ROADMAP (if applicable)
- TODO