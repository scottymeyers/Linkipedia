$(function(){

  // foundation (forms)
	$(document).foundation();

  $('#reset').on('click', function(){
    window.location = window.location;
  });

	$('#search').on('valid.fndtn.abide', function() {
		var formData = {
		  'start' : $('input[name="start"]').val(),
			'end'   : $('input[name="end"]').val(),
      'exact' : $('input[name="exact"]').is(':checked')
		};

    $('#results').empty();

    $('body').addClass('loading');

    $.ajax({
      type        : 'POST',
      url         : '/scrape',
      data        : formData,
      dataType    : 'json',
      encode          : true
    })
    .done(function(data) {
      $('body').removeClass('loading');

      if (data.error) {
        $('#results').append('<span class="error">There was an error, check your terms and try again.</span>');
      } else {
        visualize(data);
      }
    });
  });
});

function visualize(json){
  var response, item, items = [];

  $.get( json.url, function( data ) {
    response = data[0];

    while (response.hasOwnProperty('children')){
      items.push(response.href);
      response = response.children[0];
    }

    if (response.href) {
      items.push(response.href);
    }

    $('#results').append('<p>Pages Searched: '+ json.count +'</p><ul></ul>');

    for ( var i = 0; i < items.length; i++ ) {
      $('#results ul').append('<li>'+ items[i] +'</li>');
    }

  });
}
