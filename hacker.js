//if both title and url have a value, calls create AndAppendNewLi
function validateInput(title, url) {
  if (title === '' || url === '') {
    alert('Please enter a valid title and url');
  } else {
    createAndAppendNewLi(title, url);
  }
}

function createAndAppendNewLi(title, url) {
  let newListItem = $('<li>');
  let newFavoriteIcon = $('<i>');
  newFavoriteIcon.addClass('far fa-star');

  let newTitle = $('<span>');
  newTitle.text(title);

  let newSmallText = $('<small>');
  newSmallText.text(url);

  newListItem.append(newFavoriteIcon, newTitle, newSmallText);

  $('ol').append(newListItem);
}

$(document).ready(function() {
  $('#show-submit').on('click', function(event) {
    $('#container-submit').slideToggle();
  });

  //On form submit, creates new list item and appends to DOM
  $('form').on('submit', function(event) {
    event.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val();
    validateInput(title, url);
    $('form').trigger('reset');
  });

  $('ol').on('click', 'i', function(event) {
    $(event.target).toggleClass('far fas');
    $(event.target)
      .parent()
      .toggleClass('favorite');
  });

  $('#show-favorites').on('click', function(event) {
    $('#container-list li:not(.favorite)').toggleClass('li-hidden');
  });
});
