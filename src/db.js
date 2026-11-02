const knex = require('knex');
const knexfile = require('../knexfile');
const config = require('./config');

const environment = config.NODE_ENV;
const db = knex(knexfile[environment]);

module.exports = db;