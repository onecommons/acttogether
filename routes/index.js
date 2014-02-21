
/*
 * GET home page.
 */


function getTimeLeft(target_date) {
  var difference = target_date - new Date();

  // basic math variables
  var _second = 1000,
      _minute = _second * 60,
      _hour = _minute * 60,
      _day = _hour * 24;

  // calculate dates
  var days = Math.floor(difference / _day),
      hours = Math.floor((difference % _day) / _hour),
      minutes = Math.floor((difference % _hour) / _minute),
      seconds = Math.floor((difference % _minute) / _second);

      // fix dates so that it will show two digets
      days = (String(days).length >= 2) ? days : '0' + days;
      hours = (String(hours).length >= 2) ? hours : '0' + hours;
      minutes = (String(minutes).length >= 2) ? minutes : '0' + minutes;
      seconds = (String(seconds).length >= 2) ? seconds : '0' + seconds;

  return [days, hours, minutes, seconds];
}

exports.index = function(req, res){
  var now = new Date();
  var nextMonth = new Date(2014, now.getMonth()+1, 1);
  res.render('index', { debug: process.env.DEBUG,
    countdownfinish: nextMonth.toString(),
    timeLeft : getTimeLeft(nextMonth),
    categories: [ 
    {id: 1, title: "Environment",
    activity: [
      { avatar: "/static/images/user01.jpg",
        itemtype: "review",
        contents: 'EllenR reviewed <i>Build a well in Foobar</i>'
      },
      { avatar: "/static/images/user02.jpg",
        itemtype: "post",
        contents: "SamG shared a link: <a href='#'>Nebraska judge calls law that let governor approve Keystone XL pipeline route unconstitutional</a>"
      },
      { avatar: "/static/images/user01.jpg",
        itemtype: "nomination",
        contents: 'Sarah endorsed <i>Build a well in Foobar</i>'
      },
     /* { avatar: "",
        itemtype: "comment",
        contents: ""
      },*/
    ],
    topProposal: {
      title: "tusk.org",
      heroimage:"/static/images/tusk-org.jpg",
      endorsements: 128
    }
    
    },
    {title: "Human Rights",
    activity: [],
    },
    {title: "Education",activity: []},
    {title: "Internet Freedoms",activity: []},
    ]
    });
};