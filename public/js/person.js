$(document).ready(function() {
  // Getting references to the name input and person container, as well as the table body
  const nameInput = $('#person-name');
  const personList = $('tbody');
  const personContainer = $('.person-container');
  // Adding event listeners to the form to create a new object, and the button to delete
  // an Person
  $(document).on('submit', '#person-form', handlePersonFormSubmit);
  $(document).on('click', '.delete-person', handleDeleteButtonPress);

  // Getting the initial list of Persons
  getPersons();

  // A function to handle what happens when the form is submitted to create a new Person
  function handlePersonFormSubmit(event) {
    event.preventDefault();
    // Don't do anything if the name fields hasn't been filled out
    if (!nameInput.val().trim().trim()) {
      return;
    }
    // Calling the upsertPerson function and passing in the value of the name input
    upsertPerson({
      name: nameInput
          .val()
          .trim(),
    });
  }

  // A function for creating an person. Calls getPersons upon completion
  function upsertPerson(personData) {
    $.post('/api/persons', personData)
        .then(getPersons);
  }

  // Function for creating a new list row for persons
  function createPersonRow(personData) {
    const newTr = $('<tr>');
    newTr.data('person', personData);
    newTr.append('<td>' + personData.name + '</td>');
    if (personData.Comments) {
      newTr.append('<td> ' + personData.Comments.length + '</td>');
    } else {
      newTr.append('<td>0</td>');
    }
    newTr.append('<td><a href=\'/comment?person_id=' + personData.id + '\'>Go to Comments</a></td>');
    newTr.append('<td><a href=\'/cms?person_id=' + personData.id + '\'>Create a Comment</a></td>');
    newTr.append('<td><a style=\'cursor:pointer;color:red\' class=\'delete-person\'>Delete Person</a></td>');
    return newTr;
  }

  // Function for retrieving persons and getting them ready to be rendered to the page
  function getPersons() {
    $.get('/api/persons', function(data) {
      const rowsToAdd = [];
      for (let i = 0; i < data.length; i++) {
        rowsToAdd.push(createPersonRow(data[i]));
      }
      renderPersonList(rowsToAdd);
      nameInput.val('');
    });
  }

  // A function for rendering the list of persons to the page
  function renderPersonList(rows) {
    personList.children().not(':last').remove();
    personContainer.children('.alert').remove();
    if (rows.length) {
      console.log(rows);
      personList.prepend(rows);
    } else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no persons
  function renderEmpty() {
    const alertDiv = $('<div>');
    alertDiv.addClass('alert alert-danger');
    alertDiv.text('You must create an Person before you can create a Comment.');
    personContainer.append(alertDiv);
  }

  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    const listItemData = $(this).parent('td').parent('tr').data('person');
    const id = listItemData.id;
    $.ajax({
      method: 'DELETE',
      url: '/api/persons/' + id,
    })
        .then(getPersons);
  }
});
