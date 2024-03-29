App skeleton original built using `express --sessions --css less --ejs ocdemo`

## To Install

1. run `npm install` after cloning repo (use `npm ls` to verify dependencies)
2. install mongodb: e.g. sudo brew install mongodb; sudo mkdir -p /data/db; sudo chown `id -u` /data/db
3. `sudo gem install sass`

## To Run

To run app, in two consoles run:

```
ulimit -n 1024 & sudo mongod

DEBUG=express:* node app.js
```

## Tests

Run unit tests:

```
NODE_ENV=test ./node_modules/.bin/mocha --reporter=list
```

## Debugging

```npm install -g node-inspector```

debug app:

```node-debug app.js```

debug unit tests:

```
NODE_ENV=test ./node_modules/.bin/mocha --reporter=list --debug-brk
node-inspector
```