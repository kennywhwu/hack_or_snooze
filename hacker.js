//if both title and url have a value, calls createAndAppendNewLi
function validateInput(title, author, url, domain, storyId) {
  if (title === '' || url === '') {
    alert('Please enter a valid title and url');
  } else {
    createAndAppendNewLi(title, author, url, domain, storyId);
  }
}

//Creates and appends submit entry into link list
function createAndAppendNewLi(title, author, url, domain, storyId) {
  let newListItem = $('<li>');
  newListItem.attr('data-story-id', storyId);
  // console.log(newListItem.data());
  //Favorite star icon
  let newFavoriteIcon = $('<i>');
  newFavoriteIcon.addClass('far fa-star text-muted');

  //Link functionality
  let newLink = $('<a>');
  newLink.attr('href', url).css('color', 'black');

  //Title
  let newTitle = $('<span>');
  newTitle.text(`${title}, by ${author}`);

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
  StoryList.getStories(function(response) {
    let storyList = response;
    console.log(storyList);
    storyList.stories.forEach(function(element) {
      let title = element.title;
      let author = element.author;
      let url = element.url;
      let storyId = element.storyId;
      let domain = trimDomainName(url);
      validateInput(title, url, domain, author, storyId);
    });
  });

  //Toggle slide for submit form
  $('#show-submit').on('click', function(event) {
    $('#container-submit').slideToggle();
    $('#container-create-user').slideUp();
    $('#container-login-user').slideUp();
    $('#container-user-profile').slideUp();
  });
  //Toggle slide for create user form
  $('#show-create-user').on('click', function(event) {
    $('#container-create-user').slideToggle();
    $('#container-submit').slideUp();
    $('#container-login-user').slideUp();
    $('#container-user-profile').slideUp();
  });

  //Toggle slide for create user form
  $('#show-login-user').on('click', function(event) {
    $('#container-login-user').slideToggle();
    $('#container-create-user').slideUp();
    $('#container-submit').slideUp();
    $('#container-user-profile').slideUp();
  });

  //Uses Local Storage to grab user details
  function getLoggedInUser() {
    let userObject = JSON.parse(localStorage.getItem('userObject'));
    let temporaryUserInstance = new User(
      userObject.username,
      userObject.password,
      userObject.name
    );
    temporaryUserInstance.loginToken = userObject.loginToken;
    return temporaryUserInstance;
  }
  //On form submit, creates new list item and appends to DOM
  $('#submit-form').on('submit', function(event) {
    event.preventDefault();
    let title = $('#title').val();
    let author = $('#author').val();
    let url = $('#url').val();
    let domain = trimDomainName(url);
    //submitted from a logged in user
    StoryList.getStories(function(storyList) {
      let userInstance = getLoggedInUser();
      let storyData = { username: userInstance.username, title, author, url };
      console.log(userInstance, userInstance instanceof User);
      storyList.addStory(userInstance, storyData, () => {
        validateInput(title, author, url, domain);
        console.log(userInstance, storyData);
      });
    });
    $('#container-submit').slideToggle();
    $('#submit-form').trigger('reset');
  });

  //On create user submit, creates new user and adds user name to the top
  $('#create-user-form').on('submit', function(event) {
    event.preventDefault();
    let name = $('#fullname').val();
    let username = $('#username').val();
    let password = $('#password').val();
    User.create(username, password, name, () => {
      //ADDING USERNAME TO HEADER
      //   let $listLoggedInUser = $('<li class="nav-item active">');
      //   let $linkLoggedInUser = $(
      //     '<a class="nav-link" id="show-logged-in-user" href="#">'
      //   ).text(`${username}`);
      //   $listLoggedInUser.append($linkLoggedInUser);
      //   $('.navbar-nav').append($listLoggedInUser);
    });
    $('#container-create-user').slideToggle();
    $('#create-user-form').trigger('reset');
  });

  //On log in user submit, log the person in, return their favorites, add username to the top, ownStories
  $('#login-user-form').on('submit', function(event) {
    event.preventDefault();
    let username = $('#login-username').val();
    let password = $('#login-password').val();
    let logInUser = new User(username, password);
    // console.log('user form submit this =', this);
    // console.log('log in details', logInUser);
    logInUser.login(user => {
      console.log(user.loginToken, user instanceof User);
      localStorage.setItem('userObject', JSON.stringify(user));
      let $listLoggedInUser = $('<li class="nav-item active">');
      let $linkLoggedInUser = $(
        '<a class="nav-link" id="show-logged-in-user" href="#">'
      ).text(`${username}`);
      $listLoggedInUser.append($linkLoggedInUser);
      $('.navbar-nav').append($listLoggedInUser);
      user.retrieveDetails(res => {
        $('#user-profile-full-name').text(`${res.name}`);
        $('#user-profile-username').text(`${res.username}`);
        console.log(res);
      });
      console.log(`${name}`);

      //Toggle slide for showing wicked nice user info
      $('#show-logged-in-user').on('click', function(event) {
        $('#container-user-profile').slideToggle();
        $('#container-create-user').slideUp();
        $('#container-submit').slideUp();
        $('#container-login-user').slideUp();
      });
    });
    $('#container-login-user').slideToggle();
    $('#login-user-form').trigger('reset');
  });

  //Click on star toggles favorite class on list item
  $('ol').on('click', 'i', function(event) {
    $(event.target).toggleClass('far fas');
    $(event.target)
      .parent()
      .toggleClass('favorite');
    let userInstance = getLoggedInUser();
    if ($(event.target).hasClass('fas')) {
      //add to favorites from the user
      userInstance.addFavorite(
        $(event.target)
          .parent()
          .attr('data-story-id'),
        response => {
          console.log(response);
        }
      );
    } else {
      userInstance.removeFavorite(
        $(event.target)
          .parent()
          .attr('data-story-id'),
        response => console.log(response)
      );
    }
  });

  //Filter and unfilter by favorite/domain name
  $('#show-favorites').on('click', filterByFavorite);
  $('ol').on('click', 'small', filterByDomainName);
  $('#home-button').on('click', function(event) {
    $('li').removeClass('li-hidden-favorites li-hidden-domain same-domain');
  });
});

//JSON.parse(atob(localStorage.getItem('loginToken').split(".")[1]))
//loginToken:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imtlbm55dyIsImlhdCI6MTUzNzU1Mjc2OH0.Cd4YXDWsMfDeGuUS7BTBtMPG5DL0MAI8ybzflqa3GrA"
//first delimited section of loginToken (before first ".") is the header, second section is payload
//atob (a to b) is base-64 encoding, use to decode payload --> "{"username":"kennyw","iat":1537552768}"
//returns a JSON string, so have to parse into object

//Additional features we want to build in
//TODO: have the header 'active' on page youre on
//TODO: Add a Sign Up button on the log in form. Refactor the Sign Up ID that the Event Handler is called on
//TODO: ownStories for when they click on their name (for later)
//TODO: User should disappear if you create a user or log in
//TODO: If you create a user, have them log in
//TODO: even if you refresh page, if you're logged in - show user in header
//TODO: Remember favorited stories
