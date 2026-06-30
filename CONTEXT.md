# PokéVault

A binder-first platform for Pokémon TCG collectors to organize and browse owned cards in virtual 9-pocket albums.

## Language

**Binder**:
A named virtual 9-pocket album with one or more pages.
_Avoid_: folder, collection, album (generic)

**Page**:
A single 3×3 grid of pockets within a Binder.
_Avoid_: sheet, spread

**Pocket**:
One of nine numbered positions on a Page; holds at most one Holding.
_Avoid_: slot (in user-facing copy), cell, square

**Holding**:
One owned copy of a card, including grade, condition, purchase data, and personal photos.
_Avoid_: collection item, specimen, copy (ambiguous)

**Unslotted Holding**:
A Holding not currently placed in any Pocket; available to place into a Binder.
_Avoid_: unassigned, loose card

**Catalog Card**:
Reference card data from the TCG API (name, set, number, image); not the same as a Holding.
_Avoid_: card (alone), template
