var Org     = require('../models/org');
var async   = require('async');
var fs      = require('fs');
var zlib    = require('zlib');


exports = module.exports = function(done) {

  // read current state of orgs.json into data structure
  var inOrgs = JSON.parse(fs.readFileSync('updates-data/0.0.3-orgs.json'));

  var doneCount = 0;
  var misslist  = []; // count all those with null homepage.
  // test, start with just two orgs.
  // orgs = {"1000 Friends of Oregon": orgs["1000 Friends of Oregon"]};

  // for async compatibility, convert orgs to array.
  var orgarray = [];
  for(var key in inOrgs){
    orgarray.push(inOrgs[key]);
  }

    function addOneOrg(inOrg, doneCallback){
       o = new Org();
       o.orgName = inOrg.orgname;
       o.wikiLink = inOrg.wikilink;
       o.homeLink = inOrg.homelink;
       o.wikiText = inOrg.wikitext;
       o.wikiThumbLink = inOrg.wikithumblink;
       o.keywords = inOrg.keywords;
       o.save(function(err,oback){
        doneCallback(err, oback) // call done callback with possible err and new saved Org.
        doneCount += 1;
        process.stdout.write(doneCount + ' ');
       });


    }; // addOneOrg()

  // get orgs homepage for each org.
  async.each(orgarray, addOneOrg, 
    function(){
      console.log("Done, " + doneCount + ' new records added to orgs collection');
      done();
  });

}
