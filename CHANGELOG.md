# Changelog

This file records notable changes to the package.

## 1.0.1 - 2026-09-12

### Added

- Support overflowing ranges such as `22-2`, `NOV-FEB`, and `FRI-MON`.
- Support increments inside lists, such as `0/15,30`.
- Support range increments, such as `0-30/10`, in all numeric fields.
- Support `L` by itself in the day-of-week field.
- Support `L` with ordinary values in a day-of-month list, such as `5,15,L`.
- Accept spaces and tabs as field separators.
- Add regression tests for Quartz 2.5.x-compatible expressions.

### Fixed

- Accept `2099` as the starting year of an increment.
- Expand overflowing ranges and range increments correctly when they occur in a list.

### Packaging

- Include `dist/index.min.js.map` in the npm package.
- Check package contents in the npm and GitHub Packages release workflows.

### API compatibility

- Existing valid expressions keep their previous result structure.
- A standalone range increment uses `mode: "rangeIncrement"` and the value
  `[start, end, interval]`.
- A day-of-month list that contains `L` uses `mode: "list"`. Each list item
  keeps its own `mode` and `value`.
