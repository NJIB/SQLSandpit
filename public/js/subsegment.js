$(document).ready(function () {
  /* global moment */

  // blogContainer holds all of our subsegments
  const blogContainer = $('.subsegment-container');
  const subsegmentCategorySelect = $('#category');

  //Array of objects to hold data for upsert to Routes table
  let subsegmentsData = [];
  const rowsToAdd = [];
  const segmentList = $('tbody');
  const segmentTotals = $('tfooter');
  const segmentContainer = $('.segment-container');
  let segmentRevTotal = 0;

  let chart1Data = [{}];
  let chart2Data = [{}];

  // Click events for the edit and delete buttons
  $(document).on('click', 'button.delete', handleSubSegmentDelete);
  $(document).on('click', 'button.edit', handleSubSegmentEdit);
  $(document).on('click', '.form-check-input', handleCheckboxClick);
  $(document).on('submit', '#subsegments-form', handleRoutesFormSubmit);

  // Variable to hold our subsegments
  let subsegments;

  // The code below handles the case where we want to get subsegments for a specific segment
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

  // Getting the initial list of Segments
  getSegments();
  getSubSegmentDetails();

  // This function grabs subsegments from the database and updates the view
  function getSubSegments(segment) {
    segmentId = segment || '';
    if (segmentId) {
      segmentId = '/?segment_id=' + segmentId;
    }
    $.get('/api/subsegments' + segmentId, function (data) {
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
      .then(function () {
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

  function handleCheckboxClick(e) {
    console.log("subsegmentsData: ", subsegmentsData)
    console.log("e.target.id: ", e.target.id);
    if (e.target.value == 'unchecked') {
      e.target.value = 'checked';
    } else {
      e.target.value = 'unchecked';
    }
    console.log("this.val(): ", $(this).val());
    console.log(e.target.id, ": ", e.target.value);
    console.log("e: ", e);

    for (var i = 0; i < subsegmentsData.length; i++) {
      console.log(e.target.id.substr((e.target.id.indexOf('_') + 1), e.target.id.length));
      if (subsegmentsData[i].id == e.target.id.substr((e.target.id.indexOf('_') + 1), e.target.id.length)) {
        // Defining IDs to be referenced when updating the SubSegments table

        const hurdle_id = ("hurdle_" + subsegmentsData[i].id);
        console.log('hurdle_id:', hurdle_id);
        const markets_id = ("markets_" + subsegmentsData[i].id);
        console.log('markets_id:', markets_id);
        const buyers_id = ("buyers_" + subsegmentsData[i].id);
        console.log("buyers_id: ", $(buyers_id));
        const offerings_id = ("offerings_" + subsegmentsData[i].id);
        console.log('offerings_id:', offerings_id);
        const productivity_id = ("productivity_" + subsegmentsData[i].id);
        console.log('productivity_id:', productivity_id);
        const acquisition_id = ("acquisition_" + subsegmentsData[i].id);
        console.log('acquisition_id:', acquisition_id);

        const change_id = e.target.id;
        console.log("change_id: ", change_id);

        const hurdle_desc = $('#' + hurdle_id);
        console.log('hurdle_desc:', hurdle_desc.val().trim());
        subsegmentsData[i].hurdle = hurdle_desc.val().trim();
        switch (e.target.id.substr(0, e.target.id.indexOf('_'))) {
          case "markets":
            subsegmentsData[i].markets = e.target.value;
            break;
          case "buyers":
            subsegmentsData[i].buyers = e.target.value;
            break;
          case "offerings":
            subsegmentsData[i].offerings = e.target.value;
            break;
          case "productivity":
            subsegmentsData[i].productivity = e.target.value;
            break;
          case "acquisition":
            subsegmentsData[i].acquisition = e.target.value;
            break;
        }
      }
    }
    console.log("subsegmentsData: ", subsegmentsData);
  };

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
    messageH2.css({ 'text-align': 'center', 'margin-top': '50px' });
    messageH2.html('No subsegments yet' + partial + ', navigate <a href=\'/sms' + query +
      '\'>here</a> in order to get started.');
    blogContainer.append(messageH2);
  }

  // A function to handle what happens when the form is submitted to create a new route
  function handleRoutesFormSubmit(event) {
    event.preventDefault();

    //Need to pull down existing records from the database - to determine if it needs to be POST or a PUT
    for (let i = 0; i < subsegmentsData.length; i++) {
      console.log("subsegmentsData object: ", subsegmentsData[i])

      let segmentId = subsegmentsData[i].SegmentId || '';
      if (segmentId) {
        segmentId = '/?segment_id=' + segmentId;
        console.log("segmentId: ", segmentId);
      }

      $.get('/api/subsegments' + segmentId, function (data) {
        console.log('SubSegments: ', data);
        subsegments = data;
        if (!subsegments || !subsegments.length) {
          upsertRoutes(subsegmentsData[i]);
        } else {
          console.log("UPDATING!");
          updateRouteInfo(subsegments, subsegmentsData[i])
        }
      });
    };

    // for (let i = 0; i < subsegmentsData.length; i++) {
    // console.log("subsegmentsData object: ", subsegmentsData[i])
    // upsertRoutes(subsegmentsData[i]);
    // };
  };


  // A function for updating the SubSegment table record
  function updateRouteInfo(oldRecord, newDetails) {
    console.log("oldRecord: ", oldRecord[0]);
    console.log("newDetails: ", newDetails);

    let newRecord = {
      id: oldRecord[0].id,
      hurdle: oldRecord[0].hurdle,
      markets: oldRecord[0].markets,
      buyers: oldRecord[0].buyers,
      offerings: oldRecord[0].offerings,
      productivity: oldRecord[0].productivity,
      acquisition: oldRecord[0].acquisition,
      SegmentId: oldRecord[0].SegmentId,
    };
    console.log("newRecord: ", newRecord);

    if (oldRecord[0].hurdle !== newDetails.hurdle) {
      oldRecord.hurdle = newDetails.hurdle;
    }
    if (oldRecord[0].markets !== newDetails.markets) {
      oldRecord.markets = newDetails.markets;
    }
    if (oldRecord[0].buyers !== newDetails.buyers) {
      oldRecord.buyers = newDetails.buyers;
    }
    if (oldRecord[0].offerings !== newDetails.offerings) {
      oldRecord.offerings = newDetails.offerings;
    }
    if (oldRecord[0].productivity !== newDetails.productivity) {
      oldRecord.productivity = newDetails.productivity;
    }
    if (oldRecord[0].acquisition !== newDetails.acquisition) {
      oldRecord.acquisition = newDetails.acquisition;
    }

    // console.log("newRecord (updated): ", newRecord)
    console.log("oldRecord (updated): ", oldRecord)

    $.ajax({
      method: 'PUT',
      url: '/api/subsegments',
      // data: newRecord,
      data: oldRecord,
    });

  };

  // A function for creating an segment. Calls getSegments upon completion
  function upsertRoutes(subsegmentObj) {
    console.log("subsegmentObj in upsert: ", subsegmentObj);

    $.post('/api/subsegments', subsegmentObj)
    // .then(getSegments);
  }

  // A function for updating SubSegment records. Calls getSubSegments upon completion
  // function updateRouteInfo(subsegmentUpdate) {
  //   console.log("subsegmentUpdate in update: ", subsegmentUpdate[0]);

  //     $.ajax({
  //       method: 'PUT',
  //       url: '/api/subsegments',
  //       data: subsegmentUpdate,
  //     })
  // .then(function() {
  //   window.location.href = '/subsegment';
  // });
  // }


  // Function for creating a new list row for segments
  function createSegmentRow(segmentData) {

    console.log('segmentData: ', segmentData);
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

    //FRIDAY NIGHT TEST CODE
    let segmentId = segmentData.id || '';
    if (segmentId) {
      segmentId = '/?segment_id=' + segmentId;
      console.log("segmentId: ", segmentId);
    }

    $.get('/api/subsegments' + segmentId, function (data) {
      console.log('All SubSegment data found for segmentId', segmentData.id, ': ', data);
      subsegments = data;

      if (!subsegments || !subsegments.length) {
        console.log("NO SUBSEGMENT DATA FOUND FOR SEGMENT ", segmentData.id);
        newTr.append('<td>' + '<input id="hurdle_' + segmentData.id + '" placeholder=' + 'E.g. Retention' + ' type="text" />' + '</td>');
        newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="markets_' + segmentData.id + '" value="checked">' + '</td>');
        newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="buyers_' + segmentData.id + '" value="unchecked">' + '</td>');
        newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="offerings_' + segmentData.id + '" value="unchecked">' + '</td>');
        newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="productivity_' + segmentData.id + '" value="unchecked">' + '</td>');
        newTr.append('<td>' + '<input class="form-check-input" type="checkbox" id="acquisition_' + segmentData.id + '" value="unchecked">' + '</td>');
      } else {
        console.log("Creating SubSegment row for segmentData.id:", segmentData.id);
        createSubSegmentRow(subsegments, segmentData.id)
      }
    });

    buildChartObject(segmentData);

    return newTr;
  }
  // End of createSegmentRow


  //This function builds the SubSegment details, to be appended to rowsToAdd
  function createSubSegmentRow(subsegments, segmentId) {
    console.log("subsegments: ", subsegments);

    for (let i = 0; i < subsegments.length; i++) {

      console.log("segmentId being searched: ", segmentId);
      console.log("subsegments.id being searched: ", subsegments[i].id);
      if (subsegments[i].id === segmentId) {

        console.log("segmentId found:", segmentId);

        console.log(subsegments[i].hurdle);

        let hurdle_value;
        if (subsegments[i].hurdle) {
          hurdle_value = '"' + subsegments[i].hurdle + '"'
        } else {
          hurdle_value = '"E.g. Retention"';
        }
        console.log("hurdle_value: ", hurdle_value);

        const markets_value = subsegments[i].markets;
        console.log("markets_value: ", markets_value);
        const buyers_value = subsegments[i].buyers;
        console.log("buyers_value: ", buyers_value);
        const offerings_value = subsegments[i].offerings;
        console.log("offerings_value: ", offerings_value);
        const productivity_value = subsegments[i].productivity;
        console.log("productivity_value: ", productivity_value);
        const acquisition_value = subsegments[i].acquisition;
        console.log("acquisition_value: ", acquisition_value);

        const trAppend = $('<tr>');
        const hurdleScript = '<td>' + '<input id="hurdle_' + subsegments[i].id + '" placeholder=' + hurdle_value + ' type="text" />' + '</td>'
        console.log('hurdleScript: ', hurdleScript);
        trAppend.append(hurdleScript);

        // Setting checkboxes to checked or unchecked, depending on results from GET from Subsegments table
        let marketsScript = "";
        // let marketsUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="markets_' + subsegments[i].id + '" value=' + markets_value + '>' + '</td>';
        // let marketsChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="markets_' + subsegments[i].id + '" value=' + markets_value + '>' + '</td>';
        let marketsUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="markets_' + subsegments[i].id + '" value="unchecked"' + '>' + '</td>';
        let marketsChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="markets_' + subsegments[i].id + '" value="checked"' + '>' + '</td>';

        console.log("markets_value: ", markets_value);
        if (markets_value == "checked") {
          marketsScript = marketsChecked;
        } else {
          marketsScript = marketsUnchecked;
        }
        console.log("marketsScript: ", marketsScript);
        trAppend.append(marketsScript);

        let buyersScript = "";
        // let buyersUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="buyers_' + subsegments[i].id + '" value=' + buyers_value + '>' + '</td>';
        // let buyersChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="buyers_' + subsegments[i].id + '" value=' + buyers_value + '>' + '</td>';
        let buyersUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="buyers_' + subsegments[i].id + '" value="unchecked"' + '>' + '</td>';
        let buyersChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="buyers_' + subsegments[i].id + '" value="checked"' + '>' + '</td>';

        console.log("buyers_value: ", buyers_value);
        if (buyers_value == "checked") {
          buyersScript = buyersChecked;
        } else {
          buyersScript = buyersUnchecked;
        }
        console.log("buyersScript: ", buyersScript);
        trAppend.append(buyersScript);



        let offeringsScript = "";
        // let offeringsUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="offerings_' + subsegments[i].id + '" value=' + offerings_value + '>' + '</td>';
        // let offeringsChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="offerings_' + subsegments[i].id + '" value=' + offerings_value + '>' + '</td>';
        let offeringsUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="offerings_' + subsegments[i].id + '" value="unchecked"' + '>' + '</td>';
        let offeringsChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="offerings_' + subsegments[i].id + '" value="checked"' + '>' + '</td>';

        console.log("offerings_value: ", offerings_value);
        if (offerings_value == "checked") {
          offeringsScript = offeringsChecked;
        } else {
          offeringsScript = offeringsUnchecked;
        }
        console.log("offeringsScript: ", offeringsScript);
        trAppend.append(offeringsScript);

        let productivityScript = "";
        // let productivityUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="productivity_' + subsegments[i].id + '" value=' + productivity_value + '>' + '</td>';
        // let productivityChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="productivity_' + subsegments[i].id + '" value=' + productivity_value + '>' + '</td>';
        let productivityUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="productivity_' + subsegments[i].id + '" value="unchecked"' + '>' + '</td>';
        let productivityChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="productivity_' + subsegments[i].id + '" value="checked"' + '>' + '</td>';

        console.log("productivity_value: ", productivity_value);
        if (productivity_value == "checked") {
          productivityScript = productivityChecked;
        } else {
          productivityScript = productivityUnchecked;
        }
        console.log("productivityScript: ", productivityScript);
        trAppend.append(productivityScript);

        let acquisitionScript = "";
        // let acquisitionUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="acquisition_' + subsegments[i].id + '" value=' + acquisition_value + '>' + '</td>';
        // let acquisitionChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="acquisition_' + subsegments[i].id + '" value=' + acquisition_value + '>' + '</td>';
        let acquisitionUnchecked = '<td>' + '<input class="form-check-input" type="checkbox" id="acquisition_' + subsegments[i].id + '" value="unchecked"' + '>' + '</td>';
        let acquisitionChecked = '<td>' + '<input class="form-check-input" type="checkbox" checked="checked" id="acquisition_' + subsegments[i].id + '" value="checked"' + '>' + '</td>';

        console.log("acquisition_value: ", acquisition_value);
        if (acquisition_value == "checked") {
          acquisitionScript = acquisitionChecked;
        } else {
          acquisitionScript = acquisitionUnchecked;
        }
        console.log("acquisitionScript: ", acquisitionScript);
        trAppend.append(acquisitionScript);

        // return trAppend;

        rowsToAdd[i].append(trAppend);
        console.log("rowsToAdd: ", rowsToAdd);
      }
    }
  };
  // End of createSubSegmentRow



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
      // const rowsToAdd = [];

      for (let i = 0; i < data.length; i++) {
        console.log("data[i]: ", data[i]);
        rowsToAdd.push(createSegmentRow(data[i], i));

        // Populate object for [ultimate] upload to Routes table
        const subsegmentsDetails = {
          id: data[i].id,
          hurdle: "",
          markets: "",
          buyers: "",
          offerings: "",
          productivity: "",
          acquisition: "",
          SegmentId: data[i].id,
        };

        console.log("subsegmentsDetails: ", subsegmentsDetails);

        subsegmentsData.push(subsegmentsDetails);
        console.log("subsegmentsData: ", subsegmentsData);

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

      console.log("rowsToAdd: ", rowsToAdd);

      getSubSegmentDetails();
      // createSubSegmentRow(subsegments);
      rowsToAdd.push(createSubSegmentRow(subsegments));


      // console.log("segmentRevTotal: ", segmentRevTotal);

      renderSegmentList(rowsToAdd);
      // nameInput.val('');
      // dealsizeInput.val('');
      // dealcountInput.val('');
    });

  }

  // This function grabs subsegments from the database and updates the view
  function getSubSegmentDetails() {

    console.log("subsegmentsData: ", subsegmentsData);

    for (let i = 0; i < subsegmentsData.length; i++) {

      // segmentId = subsegmentsData.SegmentId || '';
      segmentId = subsegmentsData[i].id || '';
      console.log("segmentId: ", segmentId);

      if (segmentId) {
        segmentId = '/?segment_id=' + segmentId;
      }
      $.get('/api/subsegments' + segmentId, function (data) {
        console.log('SubSegment data', data);
        subsegments = data;

        // if (!subsegments || !subsegments.length) {
        //   displayEmpty(segment);
        // } else {
        //   initializeRows();
        // }
      });
    }
  };


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