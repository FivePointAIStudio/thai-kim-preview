'use strict';
(() => {
  const cards = [...document.querySelectorAll('.site-card')];
  const validIds = new Set(cards.map(card => card.dataset.id));
  const KEY = 'thai-kim:thai-fabric-directory:saved:v1';
  let saved = new Set();
  let storageAvailable = true;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
    saved = new Set((Array.isArray(stored) ? stored : []).filter(id => validIds.has(id)));
  } catch { storageAvailable = false; }
  let filter = 'all';
  let query = '';
  let shareURL = new URL('./', location.href).href.split('#')[0].split('?')[0];
  let timer;
  const toast = message => {
    const node = document.getElementById('toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => node.classList.remove('show'), 2800);
  };
  function update() {
    for (const card of cards) {
      const d = card.dataset;
      const typeMatch = filter === 'all' || (filter === 'saved' ? saved.has(d.id) : filter === 'priority' ? d.priority === 'true' : d.tags.split(' ').includes(filter));
      const textMatch = !query || (d.id + ' ' + d.search).toLocaleLowerCase().includes(query.toLocaleLowerCase().trim());
      card.hidden = !(typeMatch && textMatch);
      const button = card.querySelector('[data-save]');
      const isSaved = saved.has(d.id);
      button.setAttribute('aria-pressed', String(isSaved));
      button.setAttribute('aria-label', (isSaved ? '取消收藏 ' : '收藏 ') + d.name);
      button.firstElementChild.textContent = isSaved ? '✓' : '＋';
      button.querySelector('.save-text').textContent = isSaved ? '已收藏' : '收藏';
    }
    for (const section of document.querySelectorAll('.collection')) section.hidden = !section.querySelector('.site-card:not([hidden])');
    for (const button of document.querySelectorAll('[data-filter]')) {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    const visible = cards.filter(card => !card.hidden).length;
    document.getElementById('result-count').textContent = `显示 ${visible} / ${cards.length} 个官网`;
    document.getElementById('empty').hidden = visible !== 0;
    document.getElementById('saved-count').textContent = saved.size;
    const selection = cards.filter(card => saved.has(card.dataset.id));
    document.getElementById('selected-summary').textContent = selection.length ? '已收藏：' + selection.map(card => card.dataset.id + ' ' + card.dataset.name).join('、') : '还没有收藏，点击官网卡片上的“收藏”即可加入。';
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify([...saved])); }
    catch { storageAvailable = false; }
  }
  function resetFilters() {
    filter = 'all'; query = '';
    document.getElementById('site-search').value = '';
    update();
  }
  async function copy(text, success) {
    let done = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        done = true;
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.cssText = 'position:fixed;top:-1000px;left:0';
        document.body.appendChild(el); el.select();
        done = document.execCommand('copy'); el.remove();
      }
    } catch { done = false; }
    if (done) return toast(success);
    const field = document.getElementById('copy-content');
    field.value = text;
    document.getElementById('copy-dialog').showModal();
    field.focus(); field.select();
  }
  document.addEventListener('click', event => {
    const saveButton = event.target.closest('[data-save]');
    if (saveButton) {
      const id = saveButton.dataset.save;
      if (!validIds.has(id)) return;
      saved.has(id) ? saved.delete(id) : saved.add(id);
      persist(); update();
      toast(storageAvailable ? (saved.has(id) ? '已加入本机收藏，可在底部复制反馈给同事。' : '已取消收藏。') : '当前浏览器不能保存收藏，本页内仍可选择并复制反馈。');
    }
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) { filter = filterButton.dataset.filter; update(); }
    if (event.target.closest('.starting-links a, .start-panel > p a')) resetFilters();
  });
  document.getElementById('site-search').addEventListener('input', event => { query = event.target.value; update(); });
  document.getElementById('reset-filter').addEventListener('click', resetFilters);
  document.getElementById('share-page').addEventListener('click', () => copy(shareURL, '链接已复制，可发送给同事。'));
  document.getElementById('clear-saved').addEventListener('click', () => { saved.clear(); persist(); update(); toast('已清空本机收藏。'); });
  document.getElementById('copy-feedback').addEventListener('click', () => {
    const chosen = cards.filter(card => saved.has(card.dataset.id));
    const note = document.getElementById('feedback-note').value.trim();
    if (!chosen.length && !note) return toast('请先收藏喜欢的网站，或写下你的看法。');
    const lines = ['泰国面料官网参考 · 我的反馈', '', '我喜欢的案例：', ...(chosen.length ? chosen.map(card => `${card.dataset.id}. ${card.dataset.name}\n${card.querySelector('.visit').href}`) : ['暂未选择']), '', '我喜欢的地方 / 建议：', note || '（请补充：首屏、配色、图片、排版或选料路径）', '', '全部 20 个官网：', shareURL, '注：各品牌官网为独立外部网站，截图仅用于设计参考。'];
    copy(lines.join('\n'), '收藏与反馈已复制，可直接发到讨论群。');
  });
  document.getElementById('close-copy').addEventListener('click', () => document.getElementById('copy-dialog').close());
  document.getElementById('select-copy').addEventListener('click', () => { const el = document.getElementById('copy-content'); el.focus(); el.select(); });
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    try { const ids = JSON.parse(event.newValue || '[]'); saved = new Set((Array.isArray(ids) ? ids : []).filter(id => validIds.has(id))); update(); } catch { /* Ignore malformed data. */ }
  });

  update();
  document.body.dataset.ready = 'true';
})();
