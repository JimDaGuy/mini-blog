// Borrowed from:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const createArticleId = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text = `${text}${possible.charAt(Math.floor(Math.random() * possible.length))}`;
  }

  return text;
};

const returnJSON = (request, response, code, content) => {
  // Send content to json string
  const contentString = JSON.stringify(content);

  // Write JSON response
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.write(contentString);
  response.end();
};

/*
createPost - Adds a blog post to the database
Parameters:
author - varchar(256) - not null
authorWebsite - varchar(256) - can be null
title - varchar(256) - not null
content - text - not null
headerImageSrc - varchar(2083) - can be null
*/
const createPost = (request, response, params) => {
  // Send bad request if neccesary params are missing
  if (!params.author || !params.title || !params.content) {
    const badPostContent = {
      id: 'missingParams',
      message: 'Creating a blog post requires an author, title, and content. Missing parameters',
    };

    returnJSON(request, response, 400, badPostContent);
    return;
  }

  const articleId = createArticleId(12);

  const successfulPostContent = {
    id: 'postCreated',
    message: {
      author: params.author,
      title: params.title,
      content: params.content,
      articleId,
    },
  };

  // Also creates a timestamp for the post - can use NOW() in SQL query
  // And a lastEdited column
  // Create unique id for column that can be used in the url
  console.log(`Created article: ${params.title} by ${params.author}`);
  console.log(`Content: ${params.content}`);

  // If user list contains the name given, just update the user
  /*
  if (userObject.users[params.name]) {
    userObject.users[params.name].age = params.age;

    response.writeHead(204, { 'Content-Type': 'application/json' });
    response.end();
    return;
  }
  // If the user doesn't exist, create it
  userObject.users[params.name] = {};
  userObject.users[params.name].name = params.name;
  userObject.users[params.name].age = params.age;

  const createdUserContent = {
    message: 'Created successfully',
  };

  returnJSON(request, response, 201, createdUserContent);
  */
  returnJSON(request, response, 200, successfulPostContent);
};

module.exports = {
  createPost,
};
