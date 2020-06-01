$(document).ready(function() {
  /* global moment */

  // blogContainer holds all of our subsegments
  const blogContainer = $('.subsegment-container');
  const subsegmentCategorySelect = $('#category');
  // Click events for the edit and delete buttons
  $(document).on('click', 'button.delete', handleSubSegmentDelete);
  $(document).on('click', 'button.edit', handleSubSegmentEdit);
  // Variable to hold our subsegments
  let subsegments;

  // The code below handles the case where we want to get subsegment subsegments for a specific segment
  // Looks for a query param in the url for segment_id
  const url = window.location.search;
  let segmentId;
  if (url.indexOf('?segment_id=') !== -1) {
    segmentId = url.split('=')[1];
    getSubSegments(segmentId);
  }
  // If there's no segmentId we just get all subsegments as usual
  else {
    getSubSegments();
  }


  // This function grabs subsegments from the database and updates the view
  function getSubSegments(segment) {
    segmentId = segment || '';
    if (segmentId) {
      segmentId = '/?segment_id=' + segmentId;
    }
    $.get('/api/subsegments' + segmentId, function(data) {
      console.log('SubSegments', data);
      subsegments = data;
      if (!subsegments || !subsegments.length) {
        displayEmpty(segment);
      } else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete subsegments
  function deleteSubSegment(id) {
    $.ajax({
      method: 'DELETE',
      url: '/api/subsegments/' + id,
    })
        .then(function() {
          getSubSegments(subsegmentCategorySelect.val());
        });
  }

  // InitializeRows handles appending all of our constructed subsegment HTML inside blogContainer
  function initializeRows() {
    blogContainer.empty();
    const subsegmentsToAdd = [];
    for (let i = 0; i < subsegments.length; i++) {
      subsegmentsToAdd.push(createNewRow(subsegments[i]));
    }
    blogContainer.append(subsegmentsToAdd);
  }

  // This function constructs a subsegment's HTML
  function createNewRow(subsegment) {
    let formattedDate = new Date(subsegment.createdAt);
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
    newSubSegmentSegment.text('Written by: ' + subsegment.Segment.name);
    newSubSegmentSegment.css({
      'float': 'right',
      'color': 'blue',
      'margin-top':
      '-10px',
    });

    const newSubSegmentCardBody = $('<div>');
    newSubSegmentCardBody.addClass('card-body');
    
    const newSubSegmentBody = $('<p>');
    newSubSegmentTitle.text(subsegment.title + ' ');
    newSubSegmentBody.text(subsegment.body);
    newSubSegmentDate.text(formattedDate);
    newSubSegmentTitle.append(newSubSegmentDate);
    newSubSegmentCardHeading.append(deleteBtn);
    newSubSegmentCardHeading.append(editBtn);
    newSubSegmentCardHeading.append(newSubSegmentTitle);
    newSubSegmentCardHeading.append(newSubSegmentSegment);
    newSubSegmentCardBody.append(newSubSegmentBody);
    newSubSegmentCard.append(newSubSegmentCardHeading);
    newSubSegmentCard.append(newSubSegmentCardBody);
    newSubSegmentCard.data('subsegment', subsegment);
    return newSubSegmentCard;
  }

  // This function figures out which subsegment we want to delete and then calls deleteSubSegment
  function handleSubSegmentDelete() {
    const currentSubSegment = $(this)
        .parent()
        .parent()
        .data('subsegment');
    deleteSubSegment(currentSubSegment.id);
  }

  // This function figures out which subsegment we want to edit and takes it to the appropriate url
  function handleSubSegmentEdit() {
    const currentSubSegment = $(this)
        .parent()
        .parent()
        .data('subsegment');
    window.location.href = '/sms?subsegment_id=' + currentSubSegment.id;
  }

  // This function displays a message when there are no subsegments
  function displayEmpty(id) {
    const query = window.location.search;
    let partial = '';
    if (id) {
      partial = ' for Segment #' + id;
    }
    blogContainer.empty();
    const messageH2 = $('<h2>');
    messageH2.css({'text-align': 'center', 'margin-top': '50px'});
    messageH2.html('No subsegments yet' + partial + ', navigate <a href=\'/sms' + query +
    '\'>here</a> in order to get started.');
    blogContainer.append(messageH2);
  }
});
