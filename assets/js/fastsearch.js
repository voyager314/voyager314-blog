import * as params from '@params';

// ================================================================
// Enhanced fastsearch — rich results with keyword highlighting
// ================================================================

const resList = document.getElementById('searchResults');
const sInput  = document.getElementById('searchInput');
const countEl = document.getElementById('searchCount');
let fuse;

// --- Helpers ---
function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightChars(text, indices) {
    if (!indices || !indices.length) return esc(text);
    const chars = Array.from(text);
    let out = '', i = 0;
    for (const [s, e] of indices) {
        out += esc(chars.slice(i, s).join(''));
        out += '<mark>' + esc(chars.slice(s, e + 1).join('')) + '</mark>';
        i = e + 1;
    }
    return out + esc(chars.slice(i).join(''));
}

function snippetAround(text, indices, radius = 80) {
    if (!text) return '';
    if (!indices || !indices.length) return esc(text.slice(0, 180)) + (text.length > 180 ? '…' : '');
    const from = Math.max(0, indices[0][0] - radius);
    const to   = Math.min(text.length, indices[0][0] + radius * 2);
    const shifted = indices
        .map(([a, b]) => [a - from, b - from])
        .filter(([a, b]) => a >= 0 && b < to - from + 1);
    return (from > 0 ? '…' : '') + highlightChars(text.slice(from, to), shifted) + (to < text.length ? '…' : '');
}

function getIndices(matches, key) {
    const m = (matches || []).find(x => x.key === key);
    return m ? m.indices : null;
}

function buildCard({ item, matches }) {
    const titleHtml = highlightChars(item.title || '', getIndices(matches, 'title'));
    const bodyHtml  = snippetAround(
        item.summary || item.content || '',
        getIndices(matches, 'summary') || getIndices(matches, 'content')
    );
    const meta = [item.date, item.readingTime ? item.readingTime + ' min' : ''].filter(Boolean).join(' · ');
    return `<li class="post-entry search-result-item">
        <header class="entry-header"><h2>${titleHtml}</h2></header>
        <div class="entry-content search-summary"><p>${bodyHtml}</p></div>
        ${meta ? `<footer class="entry-footer">${esc(meta)}</footer>` : ''}
        <a class="entry-link" aria-label="${esc(item.title || '')}" href="${item.permalink}"></a>
    </li>`;
}

// --- Load index ---
window.addEventListener('load', () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || xhr.status !== 200) return;
        const data = JSON.parse(xhr.responseText);
        if (!data) return;
        const opts = {
            includeMatches: true,
            minMatchCharLength: 2,
            shouldSort: true,
            threshold: 0.4,
            ignoreLocation: true,
            keys: ['title', 'summary', 'content'],
        };
        if (params.fuseOpts) {
            Object.assign(opts, {
                isCaseSensitive:    params.fuseOpts.iscasesensitive    ?? false,
                minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 2,
                shouldSort:         params.fuseOpts.shouldsort         ?? true,
                threshold:          params.fuseOpts.threshold          ?? 0.4,
                ignoreLocation:     params.fuseOpts.ignorelocation      ?? true,
                keys:               params.fuseOpts.keys               ?? opts.keys,
            });
        }
        fuse = new Fuse(data, opts);
    };
    xhr.open('GET', '../index.json');
    xhr.send();
});

// --- Search ---
function runSearch(query) {
    if (!fuse || !resList) return;
    if (!query) {
        resList.innerHTML = '';
        if (countEl) countEl.textContent = '';
        return;
    }
    const limit   = params.fuseOpts?.limit ?? 10;
    const results = fuse.search(query, { limit });
    if (!results.length) {
        resList.innerHTML = '<li class="no-results">没有找到相关文章</li>';
        if (countEl) countEl.textContent = '无结果';
        return;
    }
    resList.innerHTML = results.map(buildCard).join('');
    if (countEl) countEl.textContent = `找到 ${results.length} 篇文章`;
}

if (sInput) {
    sInput.addEventListener('input',  function () { runSearch(this.value.trim()); });
    sInput.addEventListener('search', function () {
        if (!this.value) { resList.innerHTML = ''; if (countEl) countEl.textContent = ''; sInput.focus(); }
    });
}

// --- Keyboard navigation ---
document.addEventListener('keydown', function (e) {
    const ae      = document.activeElement;
    const box     = document.getElementById('searchbox');
    if (!box || !box.contains(ae)) return;

    if (e.key === 'Escape') {
        sInput.value = ''; resList.innerHTML = '';
        if (countEl) countEl.textContent = '';
        sInput.focus(); return;
    }

    const links = Array.from(resList?.querySelectorAll('.entry-link') ?? []);
    if (!links.length) return;
    const idx = links.indexOf(ae);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        (ae === sInput ? links[0] : links[Math.min(idx + 1, links.length - 1)])?.focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        (idx <= 0 ? sInput : links[idx - 1])?.focus();
    } else if (e.key === 'ArrowRight' && ae !== sInput) {
        ae.click();
    }
});
