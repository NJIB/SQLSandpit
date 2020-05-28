$(document).ready(function () {
  // Getting jQuery references to the subsegment body, title, form, and segment select
  // const bodyInput = $('#body');
  const routeInput = $('#route');
  const rmsForm = $('#rms');
  const segmentSelect = $('#segment');
  // Adding an event listener for when the form is submitted
  $(rmsForm).on('submit', handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a subsegment)
  const url = window.location.search;
  let subsegmentId;
  let segmentId;
  // Sets a flag for whether or not we're updating a subsegment to be false initially
  let updating = false;

  // If we have this section in our url, we pull out the subsegment id from the url
  // In '?subsegment_id=1', subsegmentId is 1
  if (url.indexOf('?subsegment_id=') !== -1) {
    subsegmentId = url.split('=')[1];
    getRouteData(subsegmentId, 'subsegment');
  }
  // Otherwise if we have an segment_id in our url, preset the segment select box to be our Segment
  else if (url.indexOf('?segment_id=') !== -1) {
    segmentId = url.split('=')[1];
  }

  // Getting the segments, and their subsegments
  getSegments();

  getRoutes();

  // A function for handling what happens when the form to create a new subsegment is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the subsegment if we are missing a body, title, or segment
    // if (!titleInput.val().trim() || !bodyInput.val().trim() || !segmentSelect.val()) {
      if (!routeInput.val().trim() || !segmentSelect.val()) {
        return;
    }
    // Constructing a newSubSegment object to hand to the database
    const newRoute = {
      route: routeInput
        .val()
        .trim(),
      SegmentId: segmentSelect.val(),
    };

    // If we're updating a subsegment run updateSubSegment to update a subsegment
    // Otherwise run submitRoute to create a whole new subsegment
    if (updating) {
      newRoute.id = subsegmentId;
      updateRoute(newRoute);
    } else {
      submitRoute(newRoute);
    }
  }

  // Submits a new subsegment and brings user to subsegment page upon completion
  function submitRoute(route) {
    $.post('/api/subsegments', route, function () {
      window.location.href = '/subsegment';
    });
  }

  // Gets subsegment data for the current subsegment if we're editing, or if we're adding to an segment's existing subsegments
  function getRouteData(id, type) {
    let queryUrl;
    switch (type) {
      case 'subsegment':
        queryUrl = '/api/subsegments/' + id;
        break;
      case 'segment':
        queryUrl = '/api/segments/' + id;
        break;
      default:
        return;
    }

    console.log("queryUrl: ", queryUrl);

    $.get(queryUrl, function (data) {
      if (data) {
        console.log(data.SegmentId || data.id);
        // If this subsegment exists, prefill our rms forms with its data
        titleInput.val(data.title);
        bodyInput.val(data.body);
        segmentId = data.SegmentId || data.id;
        // If we have a subsegment with this id, set a flag for us to know to update the subsegment
        // when we hit submit
        updating = true;
      }
    });
  }

  // A function to get Segments and then render our list of Segments
  function getSegments() {
    $.get('/api/segments', renderSegmentList);
  }

    // A function to get Routes and then render our list of Routes
    function getRoutes() {
      $.get('/api/routes', renderRouteList);
    }
  
  // Function to either render a list of segments, or if there are none, direct the user to the page
  // to create an segment first
  function renderSegmentList(data) {
    if (!data.length) {
      window.location.href = '/segments';
    }
    $('.hidden').removeClass('hidden');
    const rowsToAdd = [];
    for (let i = 0; i < data.length; i++) {
      rowsToAdd.push(createSegmentRow(data[i]));
    }
    segmentSelect.empty();
    console.log(rowsToAdd);
    console.log(segmentSelect);
    segmentSelect.append(rowsToAdd);
    segmentSelect.val(segmentId);
  }

  function renderRouteList(data) {
    // if (!data.length) {
    //   window.location.href = '/segments';
    // }
    $('.hidden').removeClass('hidden');
    const rowsToAdd = [];
    for (let i = 0; i < data.length; i++) {
      rowsToAdd.push(createRoutesRow(data[i]));
    }
    routeSelect.empty();
    console.log(rowsToAdd);
    console.log(routeSelect);
    routeSelect.append(rowsToAdd);
    routeSelect.val(segmentId);
  }

  // Creates the segment options in the dropdown
  function createSegmentRow(segment) {
    const listOption = $('<option>');
    listOption.attr('value', segment.id);
    listOption.text(segment.name);
    return listOption;
  }

  // Creates the segment options in the dropdown
  function createRoutesRow(segment) {
    let route_id;
    const newTr = $('<tr>');
    newTr.data('segment', segmentData);
    newTr.append('<td>' + '<input placeholder=' + routeData.route + ' id=' + route_id + ' type="text" />' + '</td>');
    return newTr;
  }


  // Update a given subsegment, bring user to the subsegment page when done
  function updateRoute(subsegment) {
    $.ajax({
      method: 'PUT',
      url: '/api/subsegments',
      data: subsegment,
    })
      .then(function () {
        window.location.href = '/subsegment';
      });
  }
});
