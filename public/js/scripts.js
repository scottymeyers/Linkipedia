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
        console.log(data);
        visualize(data);
      }
    });
  });
});

function visualize(json){
  var response, item, items = [];

  var margin = {top: 20, right: 120, bottom: 20, left: 120},
      width = 960 - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom;

  var i = 0,
      duration = 750,
      root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#results").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json(json.urls, function(error, flare) {
    if (error) throw error;

    root = flare[0];
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  });

  d3.select(self.frameElement).style("height", "800px");

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.the_id || (d.the_id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.href.replace(/[ ]*\/wiki\/[ ]*|[ ]+/g,' ').replace(/_+/g, ' '); })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.the_id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  $.get( json.result, function( data ) {
    response = data[0];

    while (response.hasOwnProperty('children')){
      items.push(response.href);
      response = response.children[0];
    }

    if (response.href) {
      items.push(response.href);
    }

    $('#results').prepend('<p>Pages Searched: <em>'+ json.pages_searched +'</em> | Depth: <em>'+ json.depth +'</em></p><ul></ul>');
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
