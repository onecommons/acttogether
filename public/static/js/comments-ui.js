//gTogglerClass '.show-hide-toggle' used by toggler elementsa on comments
var gTogglerClass = '.show-hide-toggle';

//toggle function for fixed-height displays with potentially large contents
function toggleDisplay(selector,singleRowHeight,bindType) {

	var display = $(selector);
	var toggler = display.find(gTogglerClass).first();
	display.css({'height':'auto'});//set height to auto    
	var fullHeight = display.height();//get full content height when auto
	display.css({'height':singleRowHeight});//now set height to one row
	if (display.height() >= fullHeight) {//only show toggler if full contents larger than 1 row
		toggler.css('visibility','hidden');
	} else {
		toggler.css('visibility','visible');
	}
}

function initDisplay() {

	// section-list comments
		$('.section-body.comments').each(function() {
		toggleDisplay($(this),'1.6rem','click');
	}); 

	$('.section-body > .comments-header').click(function() {
		$(this).closest('.section-body.comments').find(gTogglerClass).first().click();
	});

	// section-list comments replies
	$('.replies').each(function() {
		toggleDisplay($(this),'1.6rem','click');
	});
	$('.replies > .comments-header').click(function() {
		$(this).closest('.replies').find(gTogglerClass).click();
	});

}

$(document).ready(function() {

  	initDisplay();
 
	// on Click event for toggle comments 'views' 
	$('.show-hide-toggle').click(function(){
		if (!$(this).hasClass('hover')) {
			$(this).addClass('hover').closest('div').addClass('show-all');
		} else {
			$(this).removeClass('hover').closest('div').removeClass('show-all');
		}

	});

});