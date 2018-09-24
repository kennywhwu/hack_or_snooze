const BASE_URL = "https://hack-or-snooze.herokuapp.com";

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static getStories(cb) {
    $.getJSON(`${BASE_URL}/stories`, function(response) {
      const stories = response.data.map(function(val) {
        const { username, title, author, url, storyId } = val;
        return new Story(username, title, author, url, storyId);
      });
      const storyList = new StoryList(stories);
      return cb(storyList);
    });
  }

  addStory(user, data, cb) {
    $.ajax({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: {
        data: {
          username: user.username,
          title: data.title,
          author: data.author,
          url: data.url
        }
      },
      headers: {
        authorization: `Bearer: ${user.loginToken}`
      },
      success: response => {
        // modify user stories as well as list of stories
        const { author, title, url, username, storyId } = response.data;
        const newStory = new Story(author, title, url, username, storyId);
        this.stories.push(newStory);
        user.retrieveDetails(() => cb(newStory));
      }
    });
  }

  removeStory(user, storyId, cb) {
    $.ajax({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      headers: {
        authorization: `Bearer: ${user.loginToken}`
      },
      success: () => {
        const storyIndex = this.stories.findIndex(
          story => story.storyId === storyId
        );
        this.stories.splice(storyIndex, 1);
        user.retrieveDetails(() => cb(this));
      }
    });
  }
}

class User {
  constructor(username, password, name, createdAt, updatedAt) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.loginToken = "";
    this.favorites = [];
    this.ownStories = [];
  }

  static create(username, password, name, cb) {
    $.post(
      `${BASE_URL}/users`,
      {
        data: {
          username,
          password,
          name
        }
      },
      function(response) {
        const { username, name } = response.data;
        const newUser = new User(username, password, name);
        return cb(newUser);
      }
    );
  }
  login(cb) {
    $.post(
      `${BASE_URL}/auth`,
      {
        data: {
          username: this.username,
          password: this.password
        }
      },
      response => {
        const token = response.data.token;
        localStorage.HOSJWT = token;
        this.loginToken = token;
        return cb(this);
      }
    );
  }

  retrieveDetails(cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      headers: {
        authorization: `Bearer: ${this.loginToken}`
      },
      success: response => {
        this.name = response.data.name;
        this.favorites = response.data.favorites;
        this.ownStories = response.data.stories;
        this.createdAt = response.data.createdAt;
        this.updatedAt = response.data.updatedAt;
        return cb(this);
      }
    });
  }

  addFavorite(storyId, cb) {
    return this._toggleFavorite(storyId, true, cb);
  }

  removeFavorite(storyId, cb) {
    return this._toggleFavorite(storyId, false, cb);
  }

  _toggleFavorite(storyId, isAdding, cb) {
    const HTTPVerb = isAdding ? "POST" : "DELETE";
    $.ajax({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: HTTPVerb,
      headers: {
        authorization: `Bearer: ${this.loginToken}`
      },
      success: response => {
        if (isAdding) {
          this.favorites.push(response.data);
        } else {
          const favoriteIndex = this.favorites.findIndex(
            val => val.storyId === storyId
          );
          this.favorites.splice(favoriteIndex, 1);
        }
        this.retrieveDetails(() => cb(this));
      }
    });
  }

  update(data, cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      method: "PATCH",
      headers: {
        authorization: `Bearer: ${this.loginToken}`
      },
      data: {
        data
      },
      success: cb
    });
  }

  remove(cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      method: "DELETE",
      headers: {
        authorization: `Bearer: ${this.loginToken}`
      },
      success: cb
    });
  }
}

class Story {
  constructor(author, title, url, username, storyId) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
  }

  update(user, data, cb) {
    $.ajax({
      url: `${BASE_URL}/stories/${this.storyId}`,
      method: "PATCH",
      headers: {
        authorization: `Bearer: ${user.loginToken}`
      },
      data: {
        data
      },
      success: response => {
        const { author, title, url } = response.data;
        this.author = author;
        this.title = title;
        this.url = url;
        return cb(this);
      }
    });
  }
}
