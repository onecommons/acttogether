// make a default Fund and Campaign, which will be credited in any transaction wherein
//  a campaign is not specified.

var Campaign = require('../models/campaign');
var Fund     = require('../models/fund');

exports = module.exports = function(done) {
   f = new Fund();
   f.name = "One Commons Default Fund";
   f._id = Fund.DEFAULT_ID;
   f.save(function(err, fback){
    if(err) {throw err}
    c = new Campaign();
    c.name = "One Commons Default Campaign";
    c.fund = fback._id;
    c._id  = Campaign.DEFAULT_ID;
    c.save(function(err, cback){
      if(err){throw err}
      done();
    })
   })
}
