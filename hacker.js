//if both title and url have a value, calls createAndAppendNewLi
function validateInput(title, url, domain) {
  if (title === '' || url === '') {
    alert('Please enter a valid title and url');
  } else {
    createAndAppendNewLi(title, url, domain);
    $('#container-submit').slideToggle();
    $('form').trigger('reset');
  }
}

//Creates and appends submit entry into link list
function createAndAppendNewLi(title, url, domain) {
  let newListItem = $('<li>');

  //Favorite star icon
  let newFavoriteIcon = $('<i>');
  newFavoriteIcon.addClass('far fa-star text-muted');

  //Link functionality
  let newLink = $('<a>');
  newLink.attr('href', url).css('color', 'black');

  //Title
  let newTitle = $('<span>');
  newTitle.text(title);

  //Domain name
  let newSmallText = $('<small>');
  newSmallText.text(`(${domain})`);
  newSmallText.addClass('text-muted');

  //Append all elements to link list
  newLink.append(newTitle);
  newListItem
    .append(newFavoriteIcon, newLink, newSmallText)
    .children()
    .addClass('pl-2');
  $('ol').append(newListItem);
}

//Trim url to just domain name; http://www.google.com/pages --> google.com
function trimDomainName(url) {
  url = url.replace('https://', '');
  url = url.replace('http://', '');
  url = url.replace('www.', '');
  return url.split('/')[0];
}

function filterByDomainName(event) {
  let domainName = $(event.target).text();
  $(`ol li:contains(${domainName})`).addClass('same-domain');
  $('#container-list li:not(.same-domain)').addClass('li-hidden-domain');
}

function filterByFavorite(event) {
  $('#container-list li:not(.favorite)').toggleClass('li-hidden-favorites');
}

//Wait for DOM to load
$(document).ready(function() {
  //Toggle slide for submit form
  $('#show-submit').on('click', function(event) {
    $('#container-submit').slideToggle();
  });

  //On form submit, creates new list item and appends to DOM
  $('form').on('submit', function(event) {
    event.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val();
    let domain = trimDomainName(url);
    validateInput(title, url, domain);
  });

  //Click on star toggles favorite class on list item
  $('ol').on('click', 'i', function(event) {
    $(event.target).toggleClass('far fas');
    $(event.target)
      .parent()
      .toggleClass('favorite');
  });

  //Filter and unfilter by favorite/domain name
  $('#show-favorites').on('click', filterByFavorite);
  $('ol').on('click', 'small', filterByDomainName);
  $('#home-button').on('click', function(event) {
    $('li').removeClass('li-hidden-favorites li-hidden-domain same-domain');
  });
});
