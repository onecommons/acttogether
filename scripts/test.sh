#!/bin/bash

# test without client-side browser tests.

NODE_ENV=test ./node_modules/.bin/mocha --reporter=list

