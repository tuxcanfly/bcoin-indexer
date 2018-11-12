/*!
 * outpointindexer.js - outpoint indexer
 * Copyright (c) 2018, the bcoin developers (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const bdb = require('bdb');
const layout = require('./layout');
const Indexer = require('./indexer');

/*
 * OutpointIndexer Database Layout:
 *  i[hash][index] -> hash (tx by outpoint)
*/

Object.assign(layout, {
  i: bdb.key('i', ['hash256', 'uint32'])
});

/**
 * OutpointIndexer
 * @alias module:indexer.OutpointIndexer
 * @extends Indexer
 */

class OutpointIndexer extends Indexer {
  /**
   * Create a indexer
   * @constructor
   * @param {Object} options
   */

  constructor(options) {
    super('outpoint', options);

    this.db = bdb.create(this.options);
  }

  /**
   * Index transactions by outpoints.
   * @private
   * @param {ChainEntry} entry
   * @param {Block} block
   * @param {CoinView} view
   */

  async indexBlock(entry, block, view) {
    const b = this.db.batch();

    for (let i = 0; i < block.txs.length; i++) {
      const tx = block.txs[i];

      if (!tx.isCoinbase()) {
        for (const {prevout} of tx.inputs) {
          const {hash, index} = prevout;
          b.put(layout.i.encode(hash, index), tx.hash());
        }
      }
    }

    return b.write();
  }

  /**
   * Remove outpoints from index.
   * @private
   * @param {ChainEntry} entry
   * @param {Block} block
   * @param {CoinView} view
   */

  async unindexBlock(entry, block, view) {
    const b = this.db.batch();

    for (let i = 0; i < block.txs.length; i++) {
      const tx = block.txs[i];

      if (!tx.isCoinbase()) {
        for (const {prevout} of tx.inputs) {
          const {hash, index} = prevout;
          b.del(layout.i.encode(hash, index));
        }
      }
    }

    return b.write();
  }

  /**
   * Retrieve a transaction by outpoint.
   * @param {Outpoint} outpoint
   * @returns {Promise} - Returns {@link TX}.
   */

  async getTX(outpoint) {
    const data = await this.db.get(layout.i.encode(
      outpoint.hash,
      outpoint.index
    ));

    if (!data)
      return null;

    return data;
  }
}

module.exports = OutpointIndexer;
