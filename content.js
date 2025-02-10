// Sayfa yüklendiğinde çalışacak fonksiyon
window.addEventListener('load', function () {
    // Kullanıcı adını almak için doğru sınıfı seçiyoruz
    let userName = document.querySelector('span.x1lliihq')?.textContent;

    // Takip et butonunu buluyoruz
    let followButton = document.querySelector('button._acan._acap._acas');

    // Eğer takip et butonu varsa, butonun altına "Tümünü indir" butonu ekle
    if (followButton) {
        // "Tümünü indir" butonunu oluşturuyoruz
        let downloadButton = document.createElement('button');
        downloadButton.textContent = 'Tümünü indir';
        downloadButton.style.marginTop = '10px'; // butonun altına biraz boşluk ekliyoruz
        downloadButton.style.padding = '10px';
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.style.color = 'white';
        downloadButton.style.border = 'none';
        downloadButton.style.borderRadius = '5px';
        downloadButton.style.cursor = 'pointer';

        // Takip et butonunun hemen altına "Tümünü indir" butonunu ekliyoruz
        followButton.parentNode.appendChild(downloadButton);

        // Butona tıklandığında dosya indirilmesi işlemi
        downloadButton.addEventListener('click', function () {
            const username = document.querySelector('span.x1lliihq')?.textContent || 'user';
            let mediaUrls = [];

            // Videoları ekle
            document.querySelectorAll('div.xg7h5cd.x1n2onr6 video').forEach(video => {
                if (video.src) mediaUrls.push(video.src);
            });

            // Resimleri ekle (Profil fotoğraflarını hariç tut)
            document.querySelectorAll('div.xg7h5cd.x1n2onr6 img').forEach(img => {
                if (img.src && !img.src.includes('profile')) {
                    mediaUrls.push(img.src);
                }
            });

            // Background-image olarak gelenleri yakala
            document.querySelectorAll('div.xg7h5cd.x1n2onr6 [style]').forEach(el => {
                let bgImage = el.style.backgroundImage;
                if (bgImage && bgImage.startsWith('url("')) {
                    let url = bgImage.split('url("')[1].split('")')[0];
                    mediaUrls.push(url);
                }
            });

            console.log('Bulunan medya dosyaları:', mediaUrls);

            if (mediaUrls.length > 0) {
                // Dosyaların mevcutluğunu kontrol et
                chrome.runtime.sendMessage({ type: 'check-existing', username: username, urls: mediaUrls }, (response) => {
                    const existingFiles = new Set(response.existingFiles);
                    chrome.runtime.sendMessage({ urls: mediaUrls, username: username, existingFiles: Array.from(existingFiles) }, (response) => {
                        console.log('Mesaj gönderildi:', response);
                        if (response.status === 'success') {
                            alert(`${response.downloaded} media downloaded, ${response.existing} media exist.`);
                        }
                    });
                });
            } else {
                alert('Bu sayfada indirilebilir medya bulunamadı.');
            }
        });
    }
});