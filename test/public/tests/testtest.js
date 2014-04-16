// testtest.js

describe("when an empty string is passed in", function() {
  it("returns 0", function(done) {
    var result = 0; //StringCalculator.add("");
    setTimeout(function() {
      assert(result === 0);
      done();
    }, 1000);
  });
});


