'use strict';

const postList = document.querySelector('#post-list');
const postCount = document.querySelector('#post-count');
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function makePostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';

  const top = document.createElement('div');
  top.className = 'post-top';
  const category = document.createElement('span');
  category.className = 'post-category';
  category.textContent = post.category;
  const date = document.createElement('time');
  date.dateTime = post.date;
  date.textContent = dateFormatter.format(new Date(`${post.date}T12:00:00`));
  top.append(category, date);

  const title = document.createElement('h3');
  title.textContent = post.title;
  const excerpt = document.createElement('p');
  excerpt.textContent = post.excerpt;
  const more = document.createElement('span');
  more.className = 'post-more';
  more.textContent = 'Artigo publicado';
  article.append(top, title, excerpt, more);
  return article;
}

async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Falha ao buscar artigos');
    const posts = await response.json();
    postList.replaceChildren(...posts.map(makePostCard));
    postCount.textContent = `${posts.length} artigos`;
  } catch (_error) {
    postCount.textContent = 'Blog temporariamente indisponível';
    const message = document.createElement('p');
    message.className = 'empty-posts';
    message.textContent = 'Não foi possível carregar os artigos agora.';
    postList.replaceChildren(message);
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
loadPosts();
