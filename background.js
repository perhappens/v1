let isCancelled = false; // Global değişken olarak tanımladık

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in service worker:', message);  // Gelen mesajı kontrol et

    if (message.type === 'cancel-download') {
        isCancelled = true; // İndirme iptalini işaretle
        sendResponse({ status: 'cancelled' });
        return;
    }

    // Mesajda URL varsa işlem yap
    if (message.urls && message.urls.length > 0) {
        const username = message.username || 'user';
        const baseDir = `perhApps Downloader/${username}`;  // Kullanıcı ismi dinamik olarak alınacak
        const existingFiles = new Set(message.existingFiles || []);

        let currentProgress = 0;
        const totalPosts = message.urls.length;
        const queue = [];
        let downloadedCount = 0;
        let existingCount = 0;

        // URL'lerin kontrolü için dosya adlarını saklayın
        let downloadedUrls = new Set();

        // İndirme işlevi
        const downloadFile = (url, index, callback) => {
            if (isCancelled) { // İptal kontrolü
                sendResponse({ status: 'cancelled' });
                return;
            }

            const extension = url.includes('.mp4') ? 'mp4' : 'jpg';
            const filename = `${baseDir}/media_${index + 1}.${extension}`;

            if (existingFiles.has(filename) || downloadedUrls.has(url)) {
                console.log(`File already exists or URL already downloaded: ${filename}`);
                existingCount++;
                callback();
            } else {
                queue.push(filename);
                downloadedUrls.add(url);
                // İndirme işlemi başlat
                chrome.downloads.download({
                    url: url,
                    filename: filename,
                    saveAs: false  // Kullanıcının indirme yeri seçmesini engellemek
                }, (downloadId) => {
                    console.log(`Download started with ID: ${downloadId}`);
                    currentDownloads[downloadId] = url;

                    // İlerleme durumunu güncelle
                    currentProgress = Math.floor(((index + 1) / totalPosts) * 100);
                    chrome.runtime.sendMessage({
                        type: "update-progress",
                        progress: currentProgress
                    });

                    downloadedCount++;
                    setTimeout(callback, 2000);  // 2 saniye gecikme
                });
            }
        };

        // İndirme işlemini başlat
        const startBatchDownload = (index) => {
            if (index < message.urls.length) {
                const batchSize = 10;
                const batch = message.urls.slice(index, index + batchSize);
                let completed = 0;

                const onComplete = () => {
                    completed++;
                    if (completed === batch.length) {
                        startBatchDownload(index + batchSize);
                    }
                };

                batch.forEach((url, i) => {
                    downloadFile(url, index + i, onComplete);
                });
            } else {
                sendResponse({ status: 'success', downloaded: downloadedCount, existing: existingCount });
            }
            chrome.runtime.sendMessage({
                type: "update-queue",
                queue: queue
            });
        };

        startBatchDownload(0);
    } else {
        sendResponse({ status: 'error', message: 'No URLs provided' });
    }

    return true; // Asenkron yanıt sağlamak için
});