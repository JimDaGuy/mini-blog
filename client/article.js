(function iife() {
  const deleteArticle = (articleId) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/deleteArticle?id=${articleId}`);
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/application/x-www-form-urlencoded');
    xhr.onload = () => {
      const articleContainer = document.getElementById('articleContainer');
      articleContainer.innerHTML = 'Article has been deleted';
    };
    xhr.send();
  };

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
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/application/x-www-form-urlencoded');
    xhr.onload = () => {
      const response = JSON.parse(xhr.response);
      // Display article
      if (xhr.status === 200) {
        articleContainer.innerHTML = '';
        const articleJSON = response.article;

        const headerImage = document.createElement('img');
        headerImage.src = articleJSON.imageSrc;
        headerImage.alt = `Image for ${articleJSON.title}`;
        headerImage.classList.add('headerImage');
        articleContainer.appendChild(headerImage);
        const articleDiv = document.createElement('div');
        const titleH2 = document.createElement('h2');
        titleH2.innerText = articleJSON.title;
        const authorH3 = document.createElement('h3');
        authorH3.innerText = `By ${articleJSON.author}`;
        const editLink = document.createElement('a');
        editLink.href = `/edit?id=${articleId}`;
        editLink.innerText = 'Edit Article';
        const deleteLink = document.createElement('span');
        deleteLink.innerText = 'Delete Article';
        deleteLink.onclick = () => { deleteArticle(articleId); };
        const contentPara = document.createElement('p');
        contentPara.innerText = articleJSON.content;

        articleDiv.appendChild(titleH2);
        articleDiv.appendChild(authorH3);
        articleDiv.appendChild(editLink);
        articleDiv.appendChild(deleteLink);
        articleDiv.appendChild(contentPara);
        articleContainer.appendChild(articleDiv);
        return;
      }

      // Article not found page
      if (xhr.status === 404) {
        articleContainer.innerHTML = '';

        const h2 = document.createElement('h2');
        h2.innerText = 'Article Not Found';
        articleContainer.appendChild(h2);
        const p = document.createElement('p');
        p.innerText = 'The article you are looking for could not be found.';
        articleContainer.appendChild(p);
        return;
      }

      // Article deleted page
      if (xhr.status === 410) {
        articleContainer.innerHTML = '';

        const h2 = document.createElement('h2');
        h2.innerText = 'Article Deleted';
        articleContainer.appendChild(h2);
        const p = document.createElement('p');
        p.innerText = 'The article you are looking for has been removed. Sorry!';
        articleContainer.appendChild(p);
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
