$(function(){

  // table filtering on history
  if ( $('#history').length ) {
    new Tablesort(document.getElementById('history'), {});
  }

  // foundation (forms)
	$(document).foundation();

  // reset button
  $('.reset').on('click', function(){
    location.reload();
  });

  // form submit
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
        console.log(data.error);
        $('#results').append('<span class="error">There was an error, check your terms and try again. ('+ data.error +')</span>');
      } else {
        visualize(data);
      }
    });
  });
});

function visualize(json){
  var response, item, items = [];

  $.get( json.urls, function( data ) {
    var $urls = $('#urls');

    for ( var i = 0; i < data.length; i++ ) {
      if ( $('div[data-id="'+ data[i].parent +'"]').length ) {
        $('div[data-id="'+ data[i].parent +'"]').append('<div data-id="'+ data[i].id +'" class="url"></div>');
      } else {
        $urls.append('<div data-id="'+ data[i].id +'" class="url"></div>');
      }
    }
  });

  $.get( json.result, function( data ) {
    response = data[0];

    while (response.hasOwnProperty('children')){
      items.push(response.href);
      response = response.children[0];
    }

    if (response.href) {
      items.push(response.href);
    }

    $('#results').append('<p>Pages Searched: <em>'+ json.count +'</em> | Depth: <em>'+ json.depth +'</em></p><ul></ul>');

    for ( var i = 0; i < items.length; i++ ) {
      $('#results ul').append('<li>'+ items[i] +'</li>');
    }

  });
}

// tablesort.number.js
(function(){
  var cleanNumber = function(i) {
    return i.replace(/[^\-?0-9.]/g, '');
  },

  compareNumber = function(a, b) {
    a = parseFloat(a);
    b = parseFloat(b);

    a = isNaN(a) ? 0 : a;
    b = isNaN(b) ? 0 : b;

    return a - b;
  };

  Tablesort.extend('number', function(item) {
    return item.match(/^-?[£\x24Û¢´€]?\d+\s*([,\.]\d{0,2})/) || // Prefixed currency
      item.match(/^-?\d+\s*([,\.]\d{0,2})?[£\x24Û¢´€]/) || // Suffixed currency
      item.match(/^-?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/); // Number
  }, function(a, b) {
    a = cleanNumber(a);
    b = cleanNumber(b);

    return compareNumber(b, a);
  });
}());

// Basic dates in dd/mm/yy or dd-mm-yy format.
// Years can be 4 digits. Days and Months can be 1 or 2 digits.
(function(){
  var parseDate = function(date) {
    date = date.replace(/\-/g, '/');
    date = date.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/, '$1/$2/$3'); // format before getTime

    return new Date(date).getTime() || -1;
  };

  Tablesort.extend('date', function(item) {
    return (
      item.search(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?\,?\s*/i) !== -1 ||
      item.search(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) !== -1 ||
      item.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) !== -1
    ) && !isNaN(parseDate(item));
  }, function(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();

    return parseDate(b) - parseDate(a);
  });
}());
