bcoin-indexer
============

Indexes the bcoin chain transactions by spent outpoint. Useful for explorers to
track spent outputs.

Install:
========

    npm install tuxcanfly/bcoin-indexer

Usage:
======

    bcoin --index-tx --plugins=bcoin-indexer

    curl http://127.0.0.1:13037/tx/outpoint/:hash/:index

Note the bcoin peer dependency.

Backported from bcoin indexer.
