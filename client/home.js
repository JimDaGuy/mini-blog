(function iife() {
  const handleArticleClick = (i) => {
    const focusedArticleContainer = document.getElementById('focusedArticleContainer');
    focusedArticleContainer.innerHTML = '';

    const articleItems = document.getElementsByClassName('articleDiv');
    const clickedArticle = articleItems[i];
    const title = clickedArticle.getAttribute('title');
    const articleLinkHref = clickedArticle.getAttribute('articleLink');
    const author = clickedArticle.getAttribute('author');
    const authorWebsite = clickedArticle.getAttribute('authorWebsite');
    const articleContent = clickedArticle.getAttribute('articleContent');
    const postDate = clickedArticle.getAttribute('postDate');

    const focusedH1 = document.createElement('h1');
    focusedH1.textContent = title;
    const articleLink = document.createElement('a');
    articleLink.textContent = 'Link to Article';
    articleLink.href = articleLinkHref;
    const articleAuthor = document.createElement('a');
    articleAuthor.textContent = `By ${author}`;
    articleAuthor.href = authorWebsite;
    const articleDate = document.createElement('span');
    articleDate.textContent = postDate;
    const articleText = document.createElement('p');
    articleText.textContent = articleContent;

    focusedH1.classList.add('focusedH1');
    articleLink.classList.add('focusedLink');
    articleAuthor.classList.add('focusedAuthor');
    articleDate.classList.add('focusedDate');
    articleText.classList.add('focusedText');

    focusedArticleContainer.appendChild(focusedH1);
    focusedArticleContainer.appendChild(articleAuthor);
    focusedArticleContainer.appendChild(articleLink);
    focusedArticleContainer.appendChild(articleDate);
    focusedArticleContainer.appendChild(articleText);
  };

  const displayRecentArticles = (pageNumber, resultsPerPage) => {
    const articleListContainer = document.getElementById('articleListContainer');
    const articleFilterBar = document.getElementById('articleListFilterBar');

    // Default values to page 1 and articles per page to 10
    const path = `/getRecentArticles?page=${pageNumber || 1}&rpp=${resultsPerPage || 10}`;

    // Send post request to /getArticle
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = () => {
      const responseJSON = JSON.parse(xhr.responseText);

      // Display article
      if (xhr.status === 200) {
        articleListContainer.innerHTML = '';
        const articles = responseJSON.articles;

        for (let i = 0; i < articles.length; i++) {
          const articleDiv = document.createElement('div');
          const articleHeadline = document.createElement('div');
          const headlineLink = document.createElement('a');
          articleHeadline.appendChild(headlineLink);
          const articleAuthor = document.createElement('div');
          const authorLink = document.createElement('a');
          articleAuthor.appendChild(authorLink);
          const articleSecondaryLine = document.createElement('div');
          const articleSecondarySpan = document.createElement('span');
          articleSecondaryLine.appendChild(articleSecondarySpan);
          const articleCreationDate = document.createElement('div');
          const articleCreationSpan = document.createElement('span');
          articleCreationDate.appendChild(articleCreationSpan);

          articleDiv.classList.add('articleDiv');
          articleHeadline.classList.add('articleHeadline');
          articleAuthor.classList.add('articleAuthor');
          articleSecondaryLine.classList.add('articleSecondaryLine');
          articleCreationDate.classList.add('articleCreationDate');

          // articleDiv.style.backgroundImage = `url(${articles[i].headerImageSrc})`;
          headlineLink.textContent = articles[i].title;
          headlineLink.href = `/article?id=${articles[i].id}`;
          authorLink.textContent = `by ${articles[i].author}`;
          authorLink.href = articles[i].authorWebsite;
          articleSecondarySpan.textContent = articles[i].content;
          const createdDate = articles[i].creationDate.split('T');
          articleCreationSpan.textContent = `Posted ${createdDate[0]}`;

          // Add information attributes to the article div
          articleDiv.setAttribute('title', articles[i].title);
          articleDiv.setAttribute('articleLink', `/article?id=${articles[i].id}`);
          articleDiv.setAttribute('author', articles[i].author);
          articleDiv.setAttribute('authorWebsite', articles[i].authorWebsite);
          articleDiv.setAttribute('articleContent', articles[i].content);
          articleDiv.setAttribute('postDate', `Posted ${createdDate[0]}`);

          articleDiv.appendChild(articleHeadline);
          articleDiv.appendChild(articleAuthor);
          articleDiv.appendChild(articleSecondaryLine);
          articleDiv.appendChild(articleCreationDate);
          articleDiv.addEventListener('click', () => { handleArticleClick(i); });

          articleListContainer.appendChild(articleDiv);
        }

        articleFilterBar.innerHTML = '';

        if (pageNumber < 3) {
          for (let i = 0; i < 5; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i + 1;
            pageButton.onclick = () => { displayRecentArticles(i + 1, 10); };
            articleFilterBar.appendChild(pageButton);
          }
        } else {
          for (let i = pageNumber - 2; i <= pageNumber + 2; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.onclick = () => { displayRecentArticles(i, 10); };
            articleFilterBar.appendChild(pageButton);
          }
        }
        return;
      }

      // Article not found page
      if (xhr.status === 400) {
        articleListContainer.innerHTML = '';

        articleFilterBar.innerHTML = '';

        if (pageNumber < 3) {
          for (let i = 0; i < 5; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i + 1;
            pageButton.onclick = () => { displayRecentArticles(i + 1, 10); };
            articleFilterBar.appendChild(pageButton);
          }
        } else if (pageNumber > 2) {
          for (let i = pageNumber - 2; i <= pageNumber + 2; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.onclick = () => { displayRecentArticles(i, 10); };
            articleFilterBar.appendChild(pageButton);
          }
        }
        return;
      }

      // If an unhandled response is recieved, just stick the response in the div
      articleListContainer.innerText = xhr.responseText;
    };

    xhr.send();
  };

  const init = () => {
    displayRecentArticles(1, 10);
  };

  window.onload = init;
}());
