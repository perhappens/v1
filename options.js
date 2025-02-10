document.getElementById('saveSettings').addEventListener('click', () => {
  const downloadFolder = document.getElementById('downloadFolder').value;
  const enableNotifications = document.getElementById('enableNotifications').checked;
  const backgroundColor = document.getElementById('backgroundColor').value;
  const downloadSpeed = document.getElementById('downloadSpeed').value;

  chrome.storage.sync.set({
    downloadFolder,
    enableNotifications,
    backgroundColor,
    downloadSpeed
  }, () => {
    alert('Settings saved');
  });
});

window.addEventListener('load', () => {
  chrome.storage.sync.get(['downloadFolder', 'enableNotifications', 'backgroundColor', 'downloadSpeed'], (result) => {
    if (result.downloadFolder) {
      document.getElementById('downloadFolder').value = result.downloadFolder;
    }
    if (result.enableNotifications !== undefined) {
      document.getElementById('enableNotifications').checked = result.enableNotifications;
    }
    if (result.backgroundColor) {
      document.getElementById('backgroundColor').value = result.backgroundColor;
      document.body.style.backgroundColor = result.backgroundColor;
    }
    if (result.downloadSpeed) {
      document.getElementById('downloadSpeed').value = result.downloadSpeed;
    }
  });
});