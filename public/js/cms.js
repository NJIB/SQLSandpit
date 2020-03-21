$(document).ready(function() {
  // Getting jQuery references to the comment body, title, form, and person select
  const bodyInput = $('#body');
  const titleInput = $('#title');
  const cmsForm = $('#cms');
  const personSelect = $('#person');
  // Adding an event listener for when the form is submitted
  $(cmsForm).on('submit', handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a comment)
  const url = window.location.search;
  let commentId;
  let personId;
  // Sets a flag for whether or not we're updating a comment to be false initially
  let updating = false;

  // If we have this section in our url, we pull out the comment id from the url
  // In '?comment_id=1', commentId is 1
  if (url.indexOf('?comment_id=') !== -1) {
    commentId = url.split('=')[1];
    getCommentData(commentId, 'comment');
  }
  // Otherwise if we have an person_id in our url, preset the person select box to be our Person
  else if (url.indexOf('?person_id=') !== -1) {
    personId = url.split('=')[1];
  }

  // Getting the persons, and their comments
  getPersons();

  // A function for handling what happens when the form to create a new comment is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the comment if we are missing a body, title, or person
    if (!titleInput.val().trim() || !bodyInput.val().trim() || !personSelect.val()) {
      return;
    }
    // Constructing a newComment object to hand to the database
    const newComment = {
      title: titleInput
          .val()
          .trim(),
      body: bodyInput
          .val()
          .trim(),
      PersonId: personSelect.val(),
    };

    // If we're updating a comment run updateComment to update a comment
    // Otherwise run submitComment to create a whole new comment
    if (updating) {
      newComment.id = commentId;
      updateComment(newComment);
    } else {
      submitComment(newComment);
    }
  }

  // Submits a new comment and brings user to comment page upon completion
  function submitComment(comment) {
    $.post('/api/comments', comment, function() {
      window.location.href = '/comment';
    });
  }

  // Gets comment data for the current comment if we're editing, or if we're adding to an person's existing comments
  function getCommentData(id, type) {
    let queryUrl;
    switch (type) {
      case 'comment':
        queryUrl = '/api/comments/' + id;
        break;
      case 'person':
        queryUrl = '/api/persons/' + id;
        break;
      default:
        return;
    }

    console.log("queryUrl: ", queryUrl);

    $.get(queryUrl, function(data) {
      if (data) {
        console.log(data.PersonId || data.id);
        // If this comment exists, prefill our cms forms with its data
        titleInput.val(data.title);
        bodyInput.val(data.body);
        personId = data.PersonId || data.id;
        // If we have a comment with this id, set a flag for us to know to update the comment
        // when we hit submit
        updating = true;
      }
    });
  }

  // A function to get Persons and then render our list of Persons
  function getPersons() {
    $.get('/api/persons', renderPersonList);
  }
  // Function to either render a list of persons, or if there are none, direct the user to the page
  // to create an person first
  function renderPersonList(data) {
    if (!data.length) {
      window.location.href = '/persons';
    }
    $('.hidden').removeClass('hidden');
    const rowsToAdd = [];
    for (let i = 0; i < data.length; i++) {
      rowsToAdd.push(createPersonRow(data[i]));
    }
    personSelect.empty();
    console.log(rowsToAdd);
    console.log(personSelect);
    personSelect.append(rowsToAdd);
    personSelect.val(personId);
  }

  // Creates the person options in the dropdown
  function createPersonRow(person) {
    const listOption = $('<option>');
    listOption.attr('value', person.id);
    listOption.text(person.name);
    return listOption;
  }

  // Update a given comment, bring user to the comment page when done
  function updateComment(comment) {
    $.ajax({
      method: 'PUT',
      url: '/api/comments',
      data: comment,
    })
        .then(function() {
          window.location.href = '/comment';
        });
  }
});
