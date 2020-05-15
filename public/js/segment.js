$(document).ready(function() {
  // Getting references to the name input and segment container, as well as the table body
  const nameInput = $('#segment-name');
  const dealsizeInput = $('#segment-deal_size');
  const dealcountInput = $('#segment-deal_count');

  const segmentList = $('tbody');
  const segmentContainer = $('.segment-container');
  // Adding event listeners to the form to create a new object, and the button to delete
  // an Segment
  $(document).on('submit', '#segment-form', handleSegmentFormSubmit);
  $(document).on('click', '.delete-segment', handleDeleteButtonPress);

  // Getting the initial list of Segments
  getSegments();

  // A function to handle what happens when the form is submitted to create a new Segment
  function handleSegmentFormSubmit(event) {
    event.preventDefault();
    
    // Don't do anything if the name fields hasn't been filled out
    if (!nameInput.val().trim().trim()) {
      return;
    }

    console.log("nameInput: ", nameInput.val().trim());
    console.log("dealsizeInput: ", dealsizeInput.val().trim());
    console.log("dealcountInput: ", dealcountInput.val().trim());


    // const sgmt_rev = (dealsizeInput.val().trim() * dealsizeInput.val().trim());
    // console.log("sgmt_rev: ", sgmt_rev);

    const segmentData = {
      name: nameInput
          .val()
          .trim(),
      deal_size: dealsizeInput
          .val()
          .trim(),
      deal_count: dealcountInput
          .val()
          .trim(),
      // sgmt_rev: sgmt_rev
    }

    console.log("segmentData object: ", segmentData)

    upsertSegment(segmentData);
  }

  // A function for creating an segment. Calls getSegments upon completion
  function upsertSegment(segmentData) {
    $.post('/api/segments', segmentData)
        .then(getSegments);
  }

  // Function for creating a new list row for segments
  function createSegmentRow(segmentData) {
    const newTr = $('<tr>');
    newTr.data('segment', segmentData);
    newTr.append('<td>' + segmentData.name + '</td>');
    newTr.append('<td>$' + segmentData.deal_size + '</td>');
    newTr.append('<td>' + segmentData.deal_count + '</td>');
    newTr.append('<td>$' + segmentData.sgmt_rev + '</td>');
    if (segmentData.SubSegments) {
      newTr.append('<td> ' + segmentData.SubSegments.length + '</td>');
    } else {
      newTr.append('<td>0</td>');
    }
    newTr.append('<td><a style=\'cursor:pointer;color:green;font-size:24px\' href=\'/subsegment?segment_id=' + segmentData.id + '\'>...</a></td>');
    newTr.append('<td><a style=\'cursor:pointer;color:green;font-size:24px\' href=\'/sms?segment_id=' + segmentData.id + '\'>+</a></td>');
    newTr.append('<td><a style=\'cursor:pointer;color:red\' class=\'delete-segment\'>X</a></td>');
    return newTr;
  }

  // Function for retrieving segments and getting them ready to be rendered to the page
  function getSegments() {
    $.get('/api/segments', function(data) {
      const rowsToAdd = [];
      for (let i = 0; i < data.length; i++) {
        rowsToAdd.push(createSegmentRow(data[i]));
      }
      renderSegmentList(rowsToAdd);
      nameInput.val('');
    });
  }

  // A function for rendering the list of segments to the page
  function renderSegmentList(rows) {
    segmentList.children().not(':last').remove();
    segmentContainer.children('.alert').remove();
    if (rows.length) {
      console.log(rows);
      segmentList.prepend(rows);
    } else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no segments
  function renderEmpty() {
    const alertDiv = $('<div>');
    alertDiv.addClass('alert alert-danger');
    alertDiv.text('You must create a Segment before you can create a SubSegment.');
    segmentContainer.append(alertDiv);
  }

  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    const listItemData = $(this).parent('td').parent('tr').data('segment');
    const id = listItemData.id;
    $.ajax({
      method: 'DELETE',
      url: '/api/segments/' + id,
    })
        .then(getSegments);
  }
});
