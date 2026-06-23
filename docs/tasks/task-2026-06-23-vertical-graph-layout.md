# Implementation Task: Vertical Graph Layout Frontend Updates

## Description

Updated the UI for the vertical graph layout for the inventory tracking module.

## Changes

- Added an invisible `target` Handle on the Left of `GroupNode` in `ConnectionGraphDrawer.tsx` to accept incoming edges from the root item node.
- Added drop shadow, semi-transparent white background (`bg-white/60`), and backdrop blur to `GroupNode` to distinguish it from the light gray canvas.
- Added a light gray background (`bg-slate-50`) to the main `ReactFlow` canvas.
- Set `selectable: false` for the root inventory item node and group nodes to prevent misleading highlight effects.

## Status

Completed and verified.
