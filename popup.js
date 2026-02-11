(function () {
  const panelHidden = document.getElementById('panelHidden');
  const startDate = document.getElementById('startDate');
  const lichessUsername = document.getElementById('lichessUsername');
  const lichessPerf = document.getElementById('lichessPerf');
  const chesscomUsername = document.getElementById('chesscomUsername');
  const chesscomPerf = document.getElementById('chesscomPerf');
  const textarea = document.getElementById('customText');
  const saveBtn = document.getElementById('save');

  chrome.storage.sync.get(['panelHidden', 'customText', 'startDate', 'lichessUsername', 'lichessPerf', 'chesscomUsername', 'chesscomPerf'], function (result) {
    panelHidden.checked = Boolean(result.panelHidden);
    textarea.value = result.customText || '';
    startDate.value = result.startDate || '';
    lichessUsername.value = result.lichessUsername || '';
    lichessPerf.value = result.lichessPerf || 'rapid';
    chesscomUsername.value = result.chesscomUsername || '';
    chesscomPerf.value = result.chesscomPerf || 'rapid';
  });

  saveBtn.addEventListener('click', function () {
    const customText = textarea.value.trim();
    const date = startDate.value;
    const lichess = lichessUsername.value.trim();
    const lichessPerfVal = lichessPerf.value || 'rapid';
    const chesscom = chesscomUsername.value.trim();
    const chesscomPerfVal = chesscomPerf.value || 'rapid';
    chrome.storage.sync.set({
      panelHidden: panelHidden.checked,
      customText: customText,
      startDate: date || '',
      lichessUsername: lichess,
      lichessPerf: lichessPerfVal,
      chesscomUsername: chesscom,
      chesscomPerf: chesscomPerfVal
    }, function () {
      saveBtn.textContent = '保存しました';
      setTimeout(function () {
        saveBtn.textContent = '保存';
      }, 1500);
    });
  });
})();
