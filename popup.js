document.getElementById('download-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: downloadAllMedia
        }).then(() => {
            console.log('Script executed');
        }).catch((error) => {
            console.error('Script execution failed:', error);
        });
    });
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'cancel-download' }, (response) => {
        if (response.status === 'cancelled') {
            alert('Download has been cancelled');
        }
    });
});

function downloadAllMedia() {
    const username = document.querySelector('header a')?.textContent || 'user';
    let mediaUrls = [];

    // Videoları ekle
    document.querySelectorAll('video').forEach(video => {
        if (video.src) mediaUrls.push(video.src);
    });

    // Resimleri ekle (Profil fotoğraflarını hariç tut)
    document.querySelectorAll('img').forEach(img => {
        if (img.src && !img.src.includes('profile')) {
            mediaUrls.push(img.src);
        }
    });

    // Background-image olarak gelenleri yakala
    document.querySelectorAll('[style]').forEach(el => {
        let bgImage = el.style.backgroundImage;
        if (bgImage && bgImage.startsWith('url("')) {
            let url = bgImage.split('url("')[1].split('")')[0];
            mediaUrls.push(url);
        }
    });

    console.log('Bulunan medya dosyaları:', mediaUrls);

    if (mediaUrls.length > 0) {
        // Kullanıcı adını ve medya URL'lerini gönder
        chrome.runtime.sendMessage({
            type: 'download-all',
            username: username,
            urls: mediaUrls
        }, (response) => {
            if (response.status === 'success') {
                alert(`${response.downloaded} medya indirildi.`);
            }
        });
    } else {
        alert('Bu sayfada indirilebilir medya bulunamadı.');
    }
}

// İlerleme durumunu almak için
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "update-progress") {
        const progressBar = document.querySelector('#progress-bar progress');
        const progressText = document.getElementById('progress-text');
        if (progressBar) {
            progressBar.value = message.progress;
        }
        if (progressText) {
            progressText.textContent = `Progress: ${message.progress}%`;
        }
    } else if (message.type === "update-queue") {
        const queueContent = document.getElementById('queue-content');
        if (queueContent) {
            queueContent.innerHTML = '';
            message.queue.forEach(item => {
                let div = document.createElement('div');
                div.className = 'queue-item';
                div.textContent = item;
                queueContent.appendChild(div);
            });
        }
    }
});