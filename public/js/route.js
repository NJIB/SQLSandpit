$(document).ready(function () {
  /* global moment */

  // blogContainer holds all of our routes
  const blogContainer = $('.route-container');
  const routeCategorySelect = $('#category');

  //Array of objects to hold data for upsert to Routes table
  let routesData = [];

  // Click events for the edit and delete buttons
  $(document).on('click', 'button.delete', handleSubSegmentDelete);
  $(document).on('click', 'button.edit', handleSubSegmentEdit);
  $(document).on('click', '.form-check-input', handleCheckboxClick);
  $(document).on('submit', '#routes-form', handleRoutesFormSubmit);

  // $(document).on('click', '.form-check-input:checked', function (e) {
  // $(document).on('click', '.form-check-input', function (e) {
  function handleCheckboxClick(e) {
    // console.log("e.target.id: ", e.target.id);
    if (e.target.value == 'unchecked') {
      e.target.value = 'checked';
    } else {
      e.target.value = 'unchecked';
    }
    // console.log("this.val(): ", $(this).val());
    console.log(e.target.id, ": ", e.target.value);
    // console.log("e: ", e);

    for (var i = 0; i < routesData.length; i++) {
      // console.log(e.target.id.substr((e.target.id.indexOf('_') + 1),e.target.id.length));
      if (routesData[i].id == e.target.id.substr((e.target.id.indexOf('_') + 1),e.target.id.length)) {
        switch (e.target.id.substr(0, e.target.id.indexOf('_'))) {
          case "markets":
            routesData[i].markets = e.target.value;
            break;
          case "buyers":
            routesData[i].buyers = e.target.value;
            break;
          case "offerings":
            routesData[i].offerings = e.target.value;
            break;
          case "productivity":
            routesData[i].productivity = e.target.value;
            break;
          case "acquisition":
            routesData[i].acquisition = e.target.value;
            break;
        }
      }
    }
    console.log("routesData: ", routesData);
  };

  // Variable to hold our routes
  let routes;

  // The code below handles the case where we want to get route routes for a specific segment
  // Looks for a query param in the url for segment_id
  const url = window.location.search;
  let segmentId;
  if (url.indexOf('?segment_id=') !== -1) {
    segmentId = url.split('=')[1];
    getSubSegments(segmentId);
  }
  // If there's no segmentId we just get all routes as usual
  else {
    getSubSegments();
  }

  // This function grabs routes from the database and updates the view
  function getSubSegments(segment) {
    segmentId = segment || '';
    if (segmentId) {
      segmentId = '/?segment_id=' + segmentId;
    }
    $.get('/api/route' + segmentId, function (data) {
      console.log('SubSegments', data);
      routes = data;
      if (!routes || !routes.length) {
        displayEmpty(segment);
      } else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete routes
  function deleteSubSegment(id) {
    $.ajax({
      method: 'DELETE',
      url: '/api/route/' + id,
    })
      .then(function () {
        getSubSegments(routeCategorySelect.val());
      });
  }

  // InitializeRows handles appending all of our constructed route HTML inside blogContainer
  function initializeRows() {
    blogContainer.empty();
    const routesToAdd = [];
    for (let i = 0; i < routes.length; i++) {
      routesToAdd.push(createNewRow(routes[i]));
    }
    blogContainer.append(routesToAdd);
  }

  // This function constructs a route's HTML
  function createNewRow(route) {
    let formattedDate = new Date(route.createdAt);
    formattedDate = moment(formattedDate).format('MMMM Do YYYY, h:mm:ss a');

    const newSubSegmentCard = $('<div>');
    newSubSegmentCard.addClass('card');

    const newSubSegmentCardHeading = $('<div>');
    newSubSegmentCardHeading.addClass('card-header');

    const deleteBtn = $('<button>');
    deleteBtn.text('x');
    deleteBtn.addClass('delete btn btn-danger');

    const editBtn = $('<button>');
    editBtn.text('EDIT');
    editBtn.addClass('edit btn btn-info');

    const newSubSegmentTitle = $('<h2>');
    const newSubSegmentDate = $('<small>');
    const newSubSegmentSegment = $('<h5>');
    newSubSegmentSegment.text('Written by: ' + route.Segment.name);
    newSubSegmentSegment.css({
      'float': 'right',
      'color': 'blue',
      'margin-top':
        '-10px',
    });

    const newSubSegmentCardBody = $('<div>');
    newSubSegmentCardBody.addClass('card-body');

    const newSubSegmentBody = $('<p>');
    newSubSegmentTitle.text(route.title + ' ');
    newSubSegmentBody.text(route.body);
    newSubSegmentDate.text(formattedDate);
    newSubSegmentTitle.append(newSubSegmentDate);
    newSubSegmentCardHeading.append(deleteBtn);
    newSubSegmentCardHeading.append(editBtn);
    newSubSegmentCardHeading.append(newSubSegmentTitle);
    newSubSegmentCardHeading.append(newSubSegmentSegment);
    newSubSegmentCardBody.append(newSubSegmentBody);
    newSubSegmentCard.append(newSubSegmentCardHeading);
    newSubSegmentCard.append(newSubSegmentCardBody);
    newSubSegmentCard.data('route', route);
    return newSubSegmentCard;
  }

  // This function figures out which route we want to delete and then calls deleteSubSegment
  function handleSubSegmentDelete() {
    const currentSubSegment = $(this)
      .parent()
      .parent()
      .data('route');
    deleteSubSegment(currentSubSegment.id);
  }

  // This function figures out which route we want to edit and takes it to the appropriate url
  function handleSubSegmentEdit() {
    const currentSubSegment = $(this)
      .parent()
      .parent()
      .data('route');
    window.location.href = '/sms?route_id=' + currentSubSegment.id;
  }

  // This function displays a message when there are no routes
  function displayEmpty(id) {
    const query = window.location.search;
    let partial = '';
    if (id) {
      partial = ' for Segment #' + id;
    }
    blogContainer.empty();
    const messageH2 = $('<h2>');
    messageH2.css({ 'text-align': 'center', 'margin-top': '50px' });
    messageH2.html('No routes yet' + partial + ', navigate <a href=\'/sms' + query +
      '\'>here</a> in order to get started.');
    blogContainer.append(messageH2);
  }

  //INSERTING ROUTES TO REVENUE CODE

  const segmentList = $('tbody');
  const segmentTotals = $('tfooter');
  const segmentContainer = $('.segment-container');
  let segmentRevTotal = 0;

  let chart1Data = [{}];
  let chart2Data = [{}];

  // Adding event listeners to the form to create a new object, and the button to delete
  // an Segment
  // $(document).on('submit', '#routes-form', handleRoutesFormSubmit);

  // Getting the initial list of Segments
  getSegments();

  // A function to handle what happens when the form is submitted to create a new Segment
  function handleRoutesFormSubmit(event) {
    event.preventDefault();
    console.log("Submit button clicked!!")
    console.log("event: ", event);
    console.log("routesData object: ", routesData)
    upsertRoutes(routesData);

  }

  // A function for creating an segment. Calls getSegments upon completion
  function upsertRoutes(routesData) {

    console.log("routesData in upsert function: ", routesData);
    $.post('/api/route', routesData)
    .then(getSegments);
  }

  // Function for creating a new list row for segments
  function createSegmentRow(segmentData) {

    // console.log('segmentData: ', segmentData);
    const deal_size_yoy_id = "deal_size_yoy" + segmentData.id;
    const deal_count_yoy_id = "deal_count_yoy" + segmentData.id;

    const newTr = $('<tr>');
    newTr.data('segment', segmentData);
    newTr.append('<td>' + segmentData.name + '</td>');
    newTr.append('<td>$' + segmentData.deal_size + '</td>');
    newTr.append('<td>' + segmentData.deal_count + '</td>');
    newTr.append('<td>$' + segmentData.sgmt_rev + '</td>');

    if (segmentData.deal_size_yoy) {
      newTr.append('<td>' + segmentData.deal_size_yoy + '</td>');
    } else {
      newTr.append('<td>' + ' - ' + '</td>');
    }

    if (segmentData.deal_count_yoy) {
      newTr.append('<td>' + segmentData.deal_count_yoy + '%' + '</td>');
    } else {
      newTr.append('<td>' + '-' + '</td>');
    }

    if (!segmentData.next_year_deal_size) {
      newTr.append('<td>$' + segmentData.deal_size + '</td>');
    }
    else {
      newTr.append('<td>$' + segmentData.next_year_deal_size + '</td>');
    }

    if (!segmentData.next_year_deal_count) {
      newTr.append('<td>$' + segmentData.deal_count + '</td>');
    }
    else {
      newTr.append('<td>$' + segmentData.next_year_deal_count + '</td>');
    }

    if (!segmentData.next_year_sgmt_rev) {
      newTr.append('<td>$' + segmentData.sgmt_rev + '</td>');
    }
    else {
      newTr.append('<td>$' + segmentData.next_year_sgmt_rev + '</td>');
    };

    newTr.append('<td>' + '<input id="hurdle_' + segmentData.id + '" placeholder=' + 'E.g. Retention' + ' type="text" />' + '</td>');
    newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="markets_' + segmentData.id + '" value="unchecked">' + '</td>');
    newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="buyers_' + segmentData.id + '" value="unchecked">' + '</td>');
    newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="offerings_' + segmentData.id + '" value="unchecked">' + '</td>');
    newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="productivity_' + segmentData.id + '" value="unchecked">' + '</td>');
    newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="acquisition_' + segmentData.id + '" value="unchecked">' + '</td>');

    buildChartObject(segmentData);

    return newTr;
  }
  // End of createSegmentRow


  // Function for creating a new list row for segments
  function createSegmentTotals(title, segmentTotals, nextyearSgmtTotals) {

    const totalTr = $('<tr>');
    // totalTr.data('totals', segmentTotals);
    totalTr.append('<td><h4><b>' + title + '</b></h4></td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td><h4><b>$' + segmentTotals + '</b></h4></td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td>' + '</td>');
    totalTr.append('<td><h4><b>$' + nextyearSgmtTotals + '</b></h4></td>');
    return totalTr;
  }


  // Function for retrieving segments and getting them ready to be rendered to the page
  function getSegments() {

    chart1Data = [{}];
    chart2Data = [{}];

    $.get('/api/segments', function (data) {

      // console.log('data: ', data);

      segmentRevTotal = 0;
      nextyearSgmtRevTotal = 0;
      const rowsToAdd = [];

      for (let i = 0; i < data.length; i++) {
        rowsToAdd.push(createSegmentRow(data[i], i));

        // Populate object for [ulitmate] upload to Routes table
        const routesDetails = {
          id: data[i].id,
          markets: "",
          buyers: "",
          offerings: "",
          productivity: "",
          acquisition: ""
        };
        routesData.push(routesDetails);
        console.log("routesData: ", routesData);

        // Calculating total segment revenue
        segmentRevTotal += data[i].sgmt_rev;
        if (!data[i].next_year_sgmt_rev) {
          nextyearSgmtRevTotal += data[i].sgmt_rev;
        }
        else {
          nextyearSgmtRevTotal += data[i].next_year_sgmt_rev;
        };

        console.log("i: ", i);
        console.log("data.length: ", data.length);
        if ((i + 1) == data.length) {
          rowsToAdd.push(createSegmentTotals("TOTAL", segmentRevTotal, nextyearSgmtRevTotal));
        }
      }

      console.log("segmentRevTotal: ", segmentRevTotal);
      // console.log("rowsToAdd: ", rowsToAdd);

      renderSegmentList(rowsToAdd);
      nameInput.val('');
      dealsizeInput.val('');
      dealcountInput.val('');
    });

  }

  // A function for rendering the list of segments to the page
  function renderSegmentList(rows) {
    segmentList.children().not(':last').remove();
    segmentContainer.children('.alert').remove();
    if (rows.length) {
      // console.log("rows: ", rows);
      segmentList.prepend(rows);
    } else {
      renderEmpty();
    }
  }

  // This populates the object for the Revenue Bubble Chart(s)
  function buildChartObject(segmentData) {

    chart1Data.push({
      x: segmentData.deal_size,
      y: segmentData.deal_count,
      r: (segmentData.sgmt_rev / 100)
    });

    chart2Data.push({
      x: segmentData.next_year_deal_size,
      y: segmentData.next_year_deal_count,
      r: (segmentData.next_year_sgmt_rev / 100)
    });

    renderChart1(chart1Data);
    renderChart2(chart2Data);

  }

  // This creates the display object for the Revenue Bubble Chart(s)
  function renderChart1(chartData) {
    var ctx = $('#myBubbleChart1');

    var myBubbleChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        "datasets": [{
          label: "Segment Revenue - This Year",
          data: chart1Data,
          backgroundColor:
            'red'
        }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Deal Size ($)',
            },
            ticks: {
              beginAtZero: false
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Deal Count (#)',
            },
            ticks: {
              beginAtZero: false
            },
          }],
        }
      }
    });

    ctx.prepend(myBubbleChart);
  }

  // This creates the display object for the Revenue Bubble Chart(s)
  function renderChart2(chartData) {
    var ctx = $('#myBubbleChart2');

    var myBubbleChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        "datasets": [{
          label: "Next Year Segment Revenue Plan",
          data: chart2Data,
          backgroundColor:
            'green'
        }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Deal Size ($)',
            },
            ticks: {
              beginAtZero: false
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Deal Count (#)',
            },
            ticks: {
              beginAtZero: false
            }
          }],
        }
      }
    });

    ctx.prepend(myBubbleChart);
  }


  // Function for handling what to render when there are no segments
  function renderEmpty() {
    const alertDiv = $('<div>');
    alertDiv.addClass('alert alert-danger');
    alertDiv.text('You must create a Segment before you can create a SubSegment.');
    segmentContainer.append(alertDiv);
  }

});
