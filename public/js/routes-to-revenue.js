$(document).ready(function () {
  // Getting references to the name input and segment container, as well as the table body
  const nameInput = $('#segment-name');
  const dealsizeInput = $('#segment-deal_size');
  const dealcountInput = $('#segment-deal_count');

  const segmentList = $('tbody');
  const segmentTotals = $('tfooter');
  const segmentContainer = $('.segment-container');
  let segmentRevTotal = 0;

  // const chart1Area = $('#myBubbleChart1');
  // const chart2Area = $('#myBubbleChart2');
  // var ctx = $('#myBubbleChart');
  let chart1Data = [{}];
  let chart2Data = [{}];

  // Adding event listeners to the form to create a new object, and the button to delete
  // an Segment
  $(document).on('submit', '#segment-form', handleSegmentFormSubmit);
  $(document).on('click', '.delete-segment', handleDeleteButtonPress);
  $(document).on('click', '.update', handleUpdateButtonPress);

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

    const segmentData = {
      name: nameInput
        .val()
        .trim(),
      deal_size: dealsizeInput
        .val()
        .trim(),
      deal_count: dealcountInput
        .val()
        .trim()
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

    // console.log('segmentData: ', segmentData);
    // const deal_size_yoy_id = "deal_size_yoy" + (i + 1);
    const deal_size_yoy_id = "deal_size_yoy" + segmentData.id;
    // const deal_count_yoy_id = "deal_count_yoy" + (i + 1);
    const deal_count_yoy_id = "deal_count_yoy" + segmentData.id;

    const newTr = $('<tr>');
    newTr.data('segment', segmentData);
    newTr.append('<td>' + segmentData.name + '</td>');
    newTr.append('<td>$' + segmentData.deal_size + '</td>');
    newTr.append('<td>' + segmentData.deal_count + '</td>');
    newTr.append('<td>$' + segmentData.sgmt_rev + '</td>');

    if (segmentData.deal_size_yoy) {
      newTr.append('<td>' + '<input placeholder=' + segmentData.deal_size_yoy + ' id=' + deal_size_yoy_id + ' type="text" />' + '</td>');
    } else {
      newTr.append('<td>' + '<input placeholder="+/-  %"' + 'id=' + deal_size_yoy_id + ' type="text" />' + '</td>');
    }

    if (segmentData.deal_count_yoy) {
      newTr.append('<td>' + '<input placeholder=' + segmentData.deal_count_yoy + ' id=' + deal_count_yoy_id + ' type="text" />' + '</td>');
    } else {
      newTr.append('<td>' + '<input placeholder="+/-  %"' + 'id=' + deal_count_yoy_id + ' type="text" />' + '</td>');
    }

    // Potentially only show button, if change field is populated?
    newTr.append('<td>' + '<button class="btn btn-success update">></button>' + '</td>');

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

    if (segmentData.SubSegments) {
      newTr.append('<td> ' + segmentData.SubSegments.length + '</td>');
    } else {
      newTr.append('<td>0</td>');
    }
    newTr.append('<td><a style=\'cursor:pointer;color:green;font-size:24px\' href=\'/subsegment?segment_id=' + segmentData.id + '\'>...</a></td>');
    newTr.append('<td><a style=\'cursor:pointer;color:green;font-size:24px\' href=\'/rms?segment_id=' + segmentData.id + '\'>+</a></td>');
    newTr.append('<td><a style=\'cursor:pointer;color:red\' class=\'delete-segment\'>X</a></td>');

    console.log("segmentData: ", segmentData);

    buildChartObject(segmentData);

    return newTr;
  }

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
        // rowsToAdd.push(createSegmentRow(data[i]));
        rowsToAdd.push(createSegmentRow(data[i], i));

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

  function handleUpdateButtonPress() {

    const listItemData = $(this).parent('td').parent('tr').data('segment');
    // console.log("listItemData: ", listItemData);

    const id = listItemData.id;
    // console.log("listItemData.id: ", listItemData.id);

    let nextyearDealsize = 0;
    let nextyearDealcount = 0;

    const dealsizeyoychangeInput = $('#deal_size_yoy' + listItemData.id);
    const dealcountyoychangeInput = $('#deal_count_yoy' + listItemData.id);

    // console.log('dealsizeyoychangeInput: ', dealsizeyoychangeInput.val());
    if (dealsizeyoychangeInput === '') {
      nextyearDealsize = listItemData.deal_size;
      // console.log("nextyearDealsize: ", nextyearDealsize);
    } else {
      nextyearDealsize = (listItemData.deal_size * (1 + (dealsizeyoychangeInput.val() / 100)));
      // console.log("nextyearDealsize: ", nextyearDealsize);
    }

    // console.log('dealcountyoychangeInput: ', dealcountyoychangeInput.val());
    if (dealcountyoychangeInput === '') {
      nextyearDealcount = listItemData.deal_count;
      // console.log("nextyearDealcount: ", nextyearDealcount);
    } else {
      nextyearDealcount = (listItemData.deal_count * (1 + (dealcountyoychangeInput.val() / 100)));
      // console.log("nextyearDealcount: ", nextyearDealcount);
    }

    const nextyearSgmtrev = (nextyearDealsize * nextyearDealcount);
    // console.log("nextyearSgmtrev: ", nextyearSgmtrev);


    const segmentData = {
      id: listItemData.id,
      name: listItemData.name,
      deal_size: listItemData.deal_size,
      deal_count: listItemData.deal_count,
      deal_size_yoy: dealsizeyoychangeInput.val() * 1,
      deal_count_yoy: dealcountyoychangeInput.val() * 1,
      next_year_deal_size: nextyearDealsize,
      next_year_deal_count: nextyearDealcount,
      next_year_sgmt_rev: nextyearSgmtrev
    }

    console.log("segmentData object: ", segmentData)


    $.ajax({
      method: 'PUT',
      url: '/api/segments',
      data: segmentData,
    })
      .then(getSegments);
  }


});
