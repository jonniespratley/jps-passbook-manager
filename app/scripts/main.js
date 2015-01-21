$(document).ready(function () {

	$('.scroll').click(function (event) {
		event.preventDefault();
		$('html,body').animate({
			scrollTop: $(this.hash).offset().top - 50
		}, 'slow');
	});


	$(document).find('.delete-btn').on('click', function (e) {
		e.preventDefault();
		var c = confirm('DELETE: Are you sure?');
		if (c) {
			return true;
		} else {
			//
		}
		console.log(e);
	});


	//Toggle content
	$('.page-header h1').bind("click", function () {
		$(this).next().slideToggle(200);
	});

	$('legend').on('click', function (e) {
		console.log(e);
		$(this).next().slideToggle(200);
	});

	$('.toggle').bind("click", function () {
		$(this).next('div').slideToggle(200);
	});

	console.log('document is ready');
});
