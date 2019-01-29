#!/usr/bin/env node
const path = require('path');
const program = require('commander');
const scanner = require('../engineering/scan');

async function run() {
  const cwd = path.resolve('.');

  console.log(cwd)
  scanner.scan(cwd);
}

run();