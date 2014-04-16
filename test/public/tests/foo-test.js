
// load the unit we are testing, or more js as needed.
BrowserTestFrame.loadUnit('/static/js/foo.js');


// the tests. 
describe('foo', function() {
    
    it('should return 12', function(){
        assert.equal(foof(), 12);
    });

    it('should return 12*12', function(){
        var x = foof();
        assert.equal(foof() * foof(), 144);
    });

});

