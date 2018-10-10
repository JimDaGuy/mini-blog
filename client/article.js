(function iife() {
  const displayBlogArticle = (articleId) => {
    const articleContainer = document.getElementById('articleContainer');

    // Don't send a request to the API with faulty parameters
    if (articleId === null || !articleId || articleId === '') {
      let contentString = '<h2>Enter an article id</h2>';
      contentString = `${contentString} <p>Replace ARTICLE_ID with the id of an article. /article?id=ARTICLE_ID</p>`;
      articleContainer.innerHTML = contentString;
      return;
    }

    const path = `/getArticle?id=${articleId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.setRequestHeader('Content-Type', 'application/application/x-www-form-urlencoded');
    xhr.onload = () => {
      const response = JSON.parse(xhr.response);
      // Display article
      if (xhr.status === 200) {
        const articleJSON = response.article;
        let contentString = `<div style="background-image:${articleJSON.imageSrc};"><h2>${articleJSON.title}</h2>`;
        contentString = `${contentString} <p>${articleJSON.content}</p></div>`;
        articleContainer.innerHTML = contentString;
        return;
      }

      // Article not found page
      if (xhr.status === 404) {
        let contentString = '<h2>Article Not Found</h2>';
        contentString = `${contentString} <p>The article you are looking for could not be found.</p>`;
        articleContainer.innerHTML = contentString;
        return;
      }

      // Article deleted page
      if (xhr.status === 410) {
        let contentString = '<h2>Article Deleted</h2>';
        contentString = `${contentString} <p>The article you are looking for has been removed. Sorry!</p>`;
        articleContainer.innerHTML = contentString;
        return;
      }

      // If an unhandled response is recieved, just stick the response in the div
      articleContainer.innerHTML = response.message;
    };

    xhr.send();
  };

  const init = () => {
    const urlParams = new URLSearchParams(window.location.search);
    displayBlogArticle(encodeURIComponent(urlParams.get('id')));
  };

  window.onload = init;
}());
