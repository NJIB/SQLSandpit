$(document).ready(function() {
  /* global moment */

  // blogContainer holds all of our comments
  const blogContainer = $('.comment-container');
  const commentCategorySelect = $('#category');
  // Click events for the edit and delete buttons
  $(document).on('click', 'button.delete', handleCommentDelete);
  $(document).on('click', 'button.edit', handleCommentEdit);
  // Variable to hold our comments
  let comments;

  // The code below handles the case where we want to get comment comments for a specific person
  // Looks for a query param in the url for person_id
  const url = window.location.search;
  let personId;
  if (url.indexOf('?person_id=') !== -1) {
    personId = url.split('=')[1];
    getComments(personId);
  }
  // If there's no personId we just get all comments as usual
  else {
    getComments();
  }


  // This function grabs comments from the database and updates the view
  function getComments(person) {
    personId = person || '';
    if (personId) {
      personId = '/?person_id=' + personId;
    }
    $.get('/api/comments' + personId, function(data) {
      console.log('Comments', data);
      comments = data;
      if (!comments || !comments.length) {
        displayEmpty(person);
      } else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete comments
  function deleteComment(id) {
    $.ajax({
      method: 'DELETE',
      url: '/api/comments/' + id,
    })
        .then(function() {
          getComments(commentCategorySelect.val());
        });
  }

  // InitializeRows handles appending all of our constructed comment HTML inside blogContainer
  function initializeRows() {
    blogContainer.empty();
    const commentsToAdd = [];
    for (let i = 0; i < comments.length; i++) {
      commentsToAdd.push(createNewRow(comments[i]));
    }
    blogContainer.append(commentsToAdd);
  }

  // This function constructs a comment's HTML
  function createNewRow(comment) {
    let formattedDate = new Date(comment.createdAt);
    formattedDate = moment(formattedDate).format('MMMM Do YYYY, h:mm:ss a');
    
    const newCommentCard = $('<div>');
    newCommentCard.addClass('card');
    
    const newCommentCardHeading = $('<div>');
    newCommentCardHeading.addClass('card-header');
    
    const deleteBtn = $('<button>');
    deleteBtn.text('x');
    deleteBtn.addClass('delete btn btn-danger');

    const editBtn = $('<button>');
    editBtn.text('EDIT');
    editBtn.addClass('edit btn btn-info');
    
    const newCommentTitle = $('<h2>');
    const newCommentDate = $('<small>');
    const newCommentPerson = $('<h5>');
    newCommentPerson.text('Written by: ' + comment.Person.name);
    newCommentPerson.css({
      'float': 'right',
      'color': 'blue',
      'margin-top':
      '-10px',
    });

    const newCommentCardBody = $('<div>');
    newCommentCardBody.addClass('card-body');
    
    const newCommentBody = $('<p>');
    newCommentTitle.text(comment.title + ' ');
    newCommentBody.text(comment.body);
    newCommentDate.text(formattedDate);
    newCommentTitle.append(newCommentDate);
    newCommentCardHeading.append(deleteBtn);
    newCommentCardHeading.append(editBtn);
    newCommentCardHeading.append(newCommentTitle);
    newCommentCardHeading.append(newCommentPerson);
    newCommentCardBody.append(newCommentBody);
    newCommentCard.append(newCommentCardHeading);
    newCommentCard.append(newCommentCardBody);
    newCommentCard.data('comment', comment);
    return newCommentCard;
  }

  // This function figures out which comment we want to delete and then calls deleteComment
  function handleCommentDelete() {
    const currentComment = $(this)
        .parent()
        .parent()
        .data('comment');
    deleteComment(currentComment.id);
  }

  // This function figures out which comment we want to edit and takes it to the appropriate url
  function handleCommentEdit() {
    const currentComment = $(this)
        .parent()
        .parent()
        .data('comment');
    window.location.href = '/cms?comment_id=' + currentComment.id;
  }

  // This function displays a message when there are no comments
  function displayEmpty(id) {
    const query = window.location.search;
    let partial = '';
    if (id) {
      partial = ' for Person #' + id;
    }
    blogContainer.empty();
    const messageH2 = $('<h2>');
    messageH2.css({'text-align': 'center', 'margin-top': '50px'});
    messageH2.html('No comments yet' + partial + ', navigate <a href=\'/cms' + query +
    '\'>here</a> in order to get started.');
    blogContainer.append(messageH2);
  }
});
