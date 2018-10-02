(function iife() {
  const displayRecentArticles = (pageNumber, resultsPerPage) => {
    const articleListContainer = document.getElementById('articleListContainer');

    // Default values to page 1 and articles per page to 10
    const path = `/getRecentArticles?page=${pageNumber || 1}&rpp=${resultsPerPage || 10}`;

    // Send post request to /getArticle
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      console.dir(xhr.responseText);
      const responseJSON = JSON.parse(xhr.responseText);

      // Display article
      if (xhr.status === 200) {
        articleListContainer.innerHTML = '';
        const articles = responseJSON.articles;

        for (let i = 0; i < articles.length; i++) {
          // console.dir(articles[i]);
          const articleDiv = document.createElement('div');
          const articleHeadline = document.createElement('a');
          const articleAuthor = document.createElement('a');
          const articleSecondaryLine = document.createElement('span');
          const articleCreationDate = document.createElement('span');

          articleDiv.classList.add('articleDiv');
          articleHeadline.classList.add('articleHeadline');
          articleAuthor.classList.add('articleAuthor');
          articleSecondaryLine.classList.add('articleSecondaryLine');
          articleCreationDate.classList.add('articleCreationDate');

          // articleDiv.style.backgroundImage = `url(${articles[i].headerImageSrc})`;
          articleHeadline.textContent = articles[i].title;
          articleHeadline.href = `/article?id=${articles[i].id}`;
          articleAuthor.textContent = `by ${articles[i].author}`;
          articleAuthor.href = articles[i].authorWebsite;
          articleSecondaryLine.textContent = articles[i].content;
          const createdDate = articles[i].creationDate.split('T');
          articleCreationDate.textContent = `Posted ${createdDate[0]}`;

          articleDiv.appendChild(articleHeadline);
          articleDiv.appendChild(articleAuthor);
          articleDiv.appendChild(articleSecondaryLine);
          articleDiv.appendChild(articleCreationDate);

          articleListContainer.appendChild(articleDiv);
        }
        return;
      }

      // Article not found page
      if (xhr.status === 400) {
        articleListContainer.innerHTML = '';
        return;
      }

      // If an unhandled response is recieved, just stick the response in the div
      articleListContainer.innerHTML = xhr.responseText;
    };

    xhr.send();
  };

  const init = () => {
    displayRecentArticles(1, 10);
  };

  window.onload = init;
}());
