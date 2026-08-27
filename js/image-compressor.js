document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const imageInput = document.getElementById('image-input');
    const btnBrowse = document.getElementById('btn-browse');
    
    const compressControls = document.getElementById('compress-controls');
    
    const originalPreview = document.getElementById('original-preview');
    const compressedPreview = document.getElementById('compressed-preview');
    const originalSizeTxt = document.getElementById('original-size');
    const compressedSizeTxt = document.getElementById('compressed-size');
    
    const qualitySlider = document.getElementById('quality-slider');
    const widthSlider = document.getElementById('width-slider');
    const qualityValue = document.getElementById('quality-value');
    const widthValue = document.getElementById('width-value');
    
    const btnDownload = document.getElementById('btn-download');
    const btnProcessServer = document.getElementById('btn-compress-server');

    let currentFile = null;
    let currentImageObj = null;

    // Trigger file input on browse click
    btnBrowse.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Handle file input change
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select a valid image file.');
            return;
        }

        currentFile = file;
        originalSizeTxt.textContent = formatBytes(file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            
            const img = new Image();
            img.onload = () => {
                currentImageObj = img;
                // Initialize width slider max
                widthSlider.max = img.width;
                widthSlider.value = img.width > 800 ? 800 : img.width;
                widthValue.textContent = widthSlider.value;
                
                compressControls.style.display = 'flex';
                compressImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    const formatSelect = document.getElementById('format-select');
    const targetSizeInput = document.getElementById('target-size');
    const btnAutoCompress = document.getElementById('btn-auto-compress');

    // Sliders & Controls
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = Math.round(e.target.value * 100) + '%';
        compressImage();
    });

    widthSlider.addEventListener('input', (e) => {
        widthValue.textContent = e.target.value;
        compressImage();
    });

    formatSelect.addEventListener('change', () => {
        compressImage();
    });

    btnAutoCompress.addEventListener('click', () => {
        if (!currentImageObj) return;
        const targetKB = parseFloat(targetSizeInput.value);
        if (isNaN(targetKB) || targetKB <= 0) {
            alert('Please enter a valid target size in KB.');
            return;
        }
        
        btnAutoCompress.textContent = "Fitting...";
        btnAutoCompress.disabled = true;
        
        // Small delay to allow UI to update
        setTimeout(() => {
            autoFitImage(targetKB * 1024);
            btnAutoCompress.textContent = "Auto Fit";
            btnAutoCompress.disabled = false;
        }, 10);
    });

    function autoFitImage(targetBytes) {
        let low = 0.01;
        let high = 1.0;
        let bestQuality = 0.7;
        let bestDiff = Infinity;
        const format = formatSelect.value;
        let currentWidth = parseInt(widthSlider.value);
        
        function getSize(q, w) {
            let tW = currentImageObj.width;
            let tH = currentImageObj.height;
            if (tW > w) {
                tH = Math.round((tH * w) / tW);
                tW = w;
            }
            const canvas = document.createElement('canvas');
            canvas.width = tW;
            canvas.height = tH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(currentImageObj, 0, 0, tW, tH);
            const dataUrl = canvas.toDataURL(format, q);
            return Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
        }
        
        // Binary search for best quality
        for (let i = 0; i < 8; i++) {
            let mid = (low + high) / 2;
            let size = getSize(mid, currentWidth);
            
            if (size <= targetBytes) {
                if (targetBytes - size < bestDiff) {
                    bestDiff = targetBytes - size;
                    bestQuality = mid;
                }
                low = mid;
            } else {
                high = mid;
            }
        }
        
        let currentSize = getSize(bestQuality, currentWidth);
        
        // If even lowest quality is too big, shrink width
        if (currentSize > targetBytes) {
            bestQuality = 0.6; // lock to an acceptable quality
            let wLow = 50;
            let wHigh = currentWidth;
            let bestW = currentWidth;
            
            for (let i = 0; i < 8; i++) {
                let wMid = Math.floor((wLow + wHigh) / 2);
                let size = getSize(bestQuality, wMid);
                if (size <= targetBytes) {
                    bestW = wMid;
                    wLow = wMid;
                } else {
                    wHigh = wMid;
                }
            }
            widthSlider.value = bestW;
            widthValue.textContent = bestW;
        }
        
        qualitySlider.value = bestQuality;
        qualityValue.textContent = Math.round(bestQuality * 100) + '%';
        compressImage();
    }

    function compressImage() {
        if (!currentImageObj) return;

        const quality = parseFloat(qualitySlider.value);
        const maxWidth = parseInt(widthSlider.value);
        const format = formatSelect.value;
        
        let targetWidth = currentImageObj.width;
        let targetHeight = currentImageObj.height;

        if (targetWidth > maxWidth) {
            targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
            targetWidth = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(currentImageObj, 0, 0, targetWidth, targetHeight);

        // Convert canvas to Data URL
        const compressedDataUrl = canvas.toDataURL(format, quality);
        
        // Update UI
        compressedPreview.src = compressedDataUrl;
        
        // Calculate size of compressed data URL (approx)
        const sizeBytes = Math.round((compressedDataUrl.length - compressedDataUrl.indexOf(',') - 1) * 3 / 4);
        compressedSizeTxt.textContent = formatBytes(sizeBytes);

        // Prepare download link extension
        let ext = format.split('/')[1];
        if(ext === 'jpeg') ext = 'jpg';
        
        btnDownload.href = compressedDataUrl;
        btnDownload.download = `compressed.${ext}`;
    }

    // Server-side AJAX simulation/call
    btnProcessServer.addEventListener('click', () => {
        if (!compressedPreview.src) return;
        
        const base64Image = compressedPreview.src;
        const btnIcon = btnProcessServer.querySelector('i');
        
        btnIcon.className = 'fa-solid fa-spinner fa-spin';
        
        fetch('api/process.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_image',
                image: base64Image,
                filename: currentFile.name
            })
        })
        .then(response => response.json())
        .then(data => {
            btnIcon.className = 'fa-solid fa-server';
            if(data.success) {
                alert('Image processed and logged on server successfully! Path: ' + data.path);
            } else {
                alert('Server returned an error.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            btnIcon.className = 'fa-solid fa-server';
            alert('Failed to connect to PHP backend. Make sure you are running a local PHP server.');
        });
    });
});
