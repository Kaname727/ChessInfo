(function () {
  'use strict';

  const CONTAINER_ID = 'kikaku-clock-container';

  function formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function formatDate(date) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const y = date.getFullYear();
    const mo = date.getMonth() + 1;
    const d = date.getDate();
    const w = weekdays[date.getDay()];
    return `${y}/${mo}/${d} (${w})`;
  }

  function daysSince(startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today - start) / (24 * 60 * 60 * 1000));
  }

  function createOverlay() {
    if (document.getElementById(CONTAINER_ID)) return;

    const container = document.createElement('div');
    container.id = CONTAINER_ID;

    const grip = document.createElement('div');
    grip.className = 'kikaku-grip';
    grip.title = 'ドラッグで移動';

    const dateEl = document.createElement('div');
    dateEl.className = 'kikaku-date';

    const timeEl = document.createElement('div');
    timeEl.className = 'kikaku-time';

    const daysEl = document.createElement('div');
    daysEl.className = 'kikaku-custom';

    const lichessEl = document.createElement('div');
    lichessEl.className = 'kikaku-lichess';

    const chesscomEl = document.createElement('div');
    chesscomEl.className = 'kikaku-chesscom';

    container.appendChild(grip);
    container.appendChild(dateEl);
    container.appendChild(timeEl);
    container.appendChild(daysEl);
    container.appendChild(lichessEl);
    container.appendChild(chesscomEl);
    document.body.appendChild(container);

    function setHidden(hidden) {
      const isHidden = Boolean(hidden);
      container.style.display = isHidden ? 'none' : 'block';
      return isHidden;
    }

    function applyPosition(pos) {
      if (pos && typeof pos.top === 'number' && typeof pos.left === 'number') {
        container.style.top = pos.top + 'px';
        container.style.left = pos.left + 'px';
        container.style.right = 'auto';
      } else {
        container.style.top = '16px';
        container.style.right = '20px';
        container.style.left = 'auto';
      }
    }

    chrome.storage.local.get(['panelPosition'], function (result) {
      applyPosition(result.panelPosition);
    });

    let dragStart = null;
    grip.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top, left: rect.left, top: rect.top };
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragStart) return;
      e.preventDefault();
      const left = e.clientX - dragStart.x;
      const top = e.clientY - dragStart.y;
      container.style.left = left + 'px';
      container.style.top = top + 'px';
      container.style.right = 'auto';
    });
    document.addEventListener('mouseup', function () {
      if (!dragStart) return;
      const rect = container.getBoundingClientRect();
      chrome.storage.local.set({ panelPosition: { left: rect.left, top: rect.top } });
      dragStart = null;
    });

    function update() {
      const now = new Date();
      dateEl.textContent = formatDate(now);
      timeEl.textContent = formatTime(now);
    }

    function setDays(startDateStr) {
      if (!startDateStr) {
        daysEl.style.display = 'none';
        return;
      }
      const d = daysSince(startDateStr);
      daysEl.textContent = d + ' 日目';
      daysEl.style.display = 'block';
    }

    const LICHESS_CACHE_MS = 2 * 60 * 1000;
    let lichessCache = { data: null, at: 0 };

    function setLichess(username, perfType) {
      if (!username || !username.trim()) {
        lichessEl.style.display = 'none';
        return;
      }
      const key = username.toLowerCase().trim() + ':' + (perfType || 'rapid');
      if (lichessCache.data && lichessCache.key === key && Date.now() - lichessCache.at < LICHESS_CACHE_MS) {
        lichessEl.innerHTML = lichessCache.data.html;
        lichessEl.style.display = 'block';
        return;
      }
      fetch('https://lichess.org/api/user/' + encodeURIComponent(username.trim()))
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (user) {
          const perfs = user.perfs || {};
          const perf = perfs[perfType || 'rapid'] || perfs.rapid || perfs.blitz || perfs.classical || {};
          const rating = perf.rating != null ? perf.rating : '-';
          const games = perf.games != null ? perf.games : 0;
          const count = user.count || {};
          const win = count.win != null ? count.win : 0;
          const loss = count.loss != null ? count.loss : 0;
          const draw = count.draw != null ? count.draw : 0;
          const total = win + loss + draw;
          const winRate = total > 0 ? Math.round((win / total) * 100) : '-';
          const perfLabel = { rapid: 'Rapid', blitz: 'Blitz', classical: 'Classical', bullet: 'Bullet' }[perfType || 'rapid'] || 'Rapid';
          lichessEl.innerHTML =
            '<span class="kikaku-lichess-label">Lichess ' + perfLabel + '</span>' +
            '<span class="kikaku-lichess-value">' + rating + '</span> · ' +
            '<span class="kikaku-lichess-value">' + games + ' 局</span> · ' +
            '<span class="kikaku-lichess-value">勝率 ' + winRate + '%</span>';
          lichessEl.style.display = 'block';
          lichessCache = { key: key, at: Date.now(), data: { html: lichessEl.innerHTML } };
        })
        .catch(function () {
          lichessEl.innerHTML = '<span class="kikaku-lichess-error">Lichess 取得できず</span>';
          lichessEl.style.display = 'block';
        });
    }

    const CHESSCOM_CACHE_MS = 2 * 60 * 1000;
    let chesscomCache = { data: null, at: 0 };

    const CHESSCOM_PERF_KEYS = { rapid: 'chess_rapid', blitz: 'chess_blitz', bullet: 'chess_bullet', classical: 'chess_daily' };
    const CHESSCOM_PERF_LABELS = { rapid: 'Rapid', blitz: 'Blitz', bullet: 'Bullet', classical: 'Daily' };

    function setChesscom(username, perfType) {
      if (!username || !username.trim()) {
        chesscomEl.style.display = 'none';
        return;
      }
      const key = username.toLowerCase().trim() + ':' + (perfType || 'rapid');
      if (chesscomCache.data && chesscomCache.key === key && Date.now() - chesscomCache.at < CHESSCOM_CACHE_MS) {
        chesscomEl.innerHTML = chesscomCache.data.html;
        chesscomEl.style.display = 'block';
        return;
      }
      const perfKey = CHESSCOM_PERF_KEYS[perfType || 'rapid'] || 'chess_rapid';
      fetch('https://api.chess.com/pub/player/' + encodeURIComponent(username.trim()) + '/stats')
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (data) {
          const stat = data[perfKey];
          if (!stat || !stat.last) {
            chesscomEl.innerHTML = '<span class="kikaku-lichess-error">Chess.com データなし</span>';
            chesscomEl.style.display = 'block';
            return;
          }
          const rating = stat.last.rating != null ? stat.last.rating : '-';
          const rec = stat.record || {};
          const win = rec.win != null ? rec.win : 0;
          const loss = rec.loss != null ? rec.loss : 0;
          const draw = rec.draw != null ? rec.draw : 0;
          const games = win + loss + draw;
          const winRate = games > 0 ? Math.round((win / games) * 100) : '-';
          const label = CHESSCOM_PERF_LABELS[perfType || 'rapid'] || 'Rapid';
          chesscomEl.innerHTML =
            '<span class="kikaku-lichess-label">Chess.com ' + label + '</span>' +
            '<span class="kikaku-lichess-value">' + rating + '</span> · ' +
            '<span class="kikaku-lichess-value">' + games + ' 局</span> · ' +
            '<span class="kikaku-lichess-value">勝率 ' + winRate + '%</span>';
          chesscomEl.style.display = 'block';
          chesscomCache = { key: key, at: Date.now(), data: { html: chesscomEl.innerHTML } };
        })
        .catch(function () {
          chesscomEl.innerHTML = '<span class="kikaku-lichess-error">Chess.com 取得できず</span>';
          chesscomEl.style.display = 'block';
        });
    }

    update();
    setInterval(update, 1000);

    chrome.storage.sync.get(['panelHidden', 'startDate', 'lichessUsername', 'lichessPerf', 'chesscomUsername', 'chesscomPerf'], function (result) {
      const hidden = setHidden(result.panelHidden);
      if (hidden) return;
      setDays(result.startDate || '');
      setLichess(result.lichessUsername || '', result.lichessPerf || 'rapid');
      setChesscom(result.chesscomUsername || '', result.chesscomPerf || 'rapid');
    });

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== 'sync') return;
      if (changes.panelHidden) {
        const hidden = setHidden(changes.panelHidden.newValue);
        if (hidden) return;
        chrome.storage.sync.get(['startDate', 'lichessUsername', 'lichessPerf', 'chesscomUsername', 'chesscomPerf'], function (result) {
          setDays(result.startDate || '');
          setLichess(result.lichessUsername || '', result.lichessPerf || 'rapid');
          setChesscom(result.chesscomUsername || '', result.chesscomPerf || 'rapid');
        });
        return;
      }
      if (changes.startDate) setDays(changes.startDate.newValue || '');
      if (changes.lichessUsername || changes.lichessPerf) {
        chrome.storage.sync.get(['lichessUsername', 'lichessPerf'], function (r) {
          setLichess(r.lichessUsername || '', r.lichessPerf || 'rapid');
        });
      }
      if (changes.chesscomUsername || changes.chesscomPerf) {
        chrome.storage.sync.get(['chesscomUsername', 'chesscomPerf'], function (r) {
          setChesscom(r.chesscomUsername || '', r.chesscomPerf || 'rapid');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createOverlay);
  } else {
    createOverlay();
  }
})();
