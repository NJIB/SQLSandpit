$(document).ready(function() {
  // Getting jQuery references to the subsegment body, title, form, and segment select
  const bodyInput = $('#body');
  const titleInput = $('#title');
  const smsForm = $('#sms');
  const segmentSelect = $('#segment');
  // Adding an event listener for when the form is submitted
  $(smsForm).on('submit', handleFormSubmit);
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
    getSubSegmentData(subsegmentId, 'subsegment');
  }
  // Otherwise if we have an segment_id in our url, preset the segment select box to be our Segment
  else if (url.indexOf('?segment_id=') !== -1) {
    segmentId = url.split('=')[1];
  }

  // Getting the segments, and their subsegments
  getSegments();

  // A function for handling what happens when the form to create a new subsegment is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the subsegment if we are missing a body, title, or segment
    if (!titleInput.val().trim() || !bodyInput.val().trim() || !segmentSelect.val()) {
      return;
    }
    // Constructing a newSubSegment object to hand to the database
    const newSubSegment = {
      title: titleInput
          .val()
          .trim(),
      body: bodyInput
          .val()
          .trim(),
      SegmentId: segmentSelect.val(),
    };

    // If we're updating a subsegment run updateSubSegment to update a subsegment
    // Otherwise run submitSubSegment to create a whole new subsegment
    if (updating) {
      newSubSegment.id = subsegmentId;
      updateSubSegment(newSubSegment);
    } else {
      submitSubSegment(newSubSegment);
    }
  }

  // Submits a new subsegment and brings user to subsegment page upon completion
  function submitSubSegment(subsegment) {
    $.post('/api/subsegments', subsegment, function() {
      window.location.href = '/subsegment';
    });
  }

  // Gets subsegment data for the current subsegment if we're editing, or if we're adding to an segment's existing subsegments
  function getSubSegmentData(id, type) {
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

    $.get(queryUrl, function(data) {
      if (data) {
        console.log(data.SegmentId || data.id);
        // If this subsegment exists, prefill our sms forms with its data
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

  // Creates the segment options in the dropdown
  function createSegmentRow(segment) {
    const listOption = $('<option>');
    listOption.attr('value', segment.id);
    listOption.text(segment.name);
    return listOption;
  }

  // Update a given subsegment, bring user to the subsegment page when done
  function updateSubSegment(subsegment) {
    $.ajax({
      method: 'PUT',
      url: '/api/subsegments',
      data: subsegment,
    })
        .then(function() {
          window.location.href = '/subsegment';
        });
  }
});
