#!/bin/bash

# test without client-side browser tests.

# run the app for endpoint tests

NODE_ENV=test ./node_modules/.bin/mocha --reporter=list -t 6000

