/*!
 * plugin.js - indexer plugin for bcoin
 * Copyright (c) 2017-2018, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const OutpointIndexer = require('./outpointindexer');

/**
 * @exports wallet/plugin
 */

const plugin = exports;

/**
 * Plugin
 * @extends EventEmitter
 */

class Plugin extends OutpointIndexer {
  /**
   * Create a plugin.
   * @constructor
   * @param {Node} node
   */

  constructor(node) {
    const options = {
      network: node.network,
      logger: node.logger,
      chain: node.chain,
      memory: node.config.bool('memory'),
      prefix: node.config.filter('index').str('prefix') || node.config.prefix
    };

    super(options);

    node.http.get('/tx/outpoint/:hash/:index', async (req, res) => {
      const valid = Validator.fromRequest(req);
      const hash = valid.brhash('hash');
      const index = valid.u32('index');

      enforce(hash, 'Hash is required.');
      enforce(index != null, 'Index is required.');

      const outpoint = Outpoint.fromOptions({
        hash: hash,
        index: index
      });
      const tx = await this.node.outpointindex.getTX(outpoint);

      const meta = await this.node.getMeta(tx);

      if (!meta) {
        res.json(404);
        return;
      }

      const view = await this.node.getMetaView(meta);

      res.json(200, meta.getJSON(this.network, view, this.chain.height));
    });
  }
}

/**
 * Plugin name.
 * @const {String}
 */

plugin.id = 'outpointindexer';

/**
 * Plugin initialization.
 * @param {Node} node
 * @returns {WalletDB}
 */

plugin.init = function init(node) {
  return new Plugin(node);
};
