document.addEventListener('DOMContentLoaded', () => {
    const base64Input = document.getElementById('pdf-base64-input');
    const viewerContainer = document.getElementById('pdf-viewer-container');
    const btnView = document.getElementById('btn-view-pdf');
    const btnDownload = document.getElementById('btn-download-pdf');
    const btnClear = document.getElementById('btn-clear-pdf');
    
    // New Elements
    const btnUpload = document.getElementById('btn-upload-pdf');
    const fileInput = document.getElementById('pdf-file-input');
    const btnCopy = document.getElementById('btn-copy-pdf-b64');

    // Helper to remove any data URL prefix
    function cleanBase64(str) {
        if (str.includes(',')) {
            str = str.split(',')[1];
        }
        return str.trim();
    }

    // Convert Base64 string to Blob
    function base64ToBlob(base64, mimeType = 'application/pdf') {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
    }

    // Handle File Upload to generate Base64
    if (btnUpload && fileInput) {
        btnUpload.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type !== 'application/pdf') {
                alert("Please select a valid PDF file.");
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const result = event.target.result;
                const base64String = cleanBase64(result);
                base64Input.value = base64String;
                
                // Automatically render the PDF in the viewer
                btnView.click();
            };
            reader.readAsDataURL(file);
            
            // Reset input to allow selecting same file again
            fileInput.value = '';
        });
    }

    // Copy Base64 String to clipboard
    if (btnCopy) {
        btnCopy.addEventListener('click', (e) => {
            e.preventDefault();
            const b64 = base64Input.value.trim();
            if (!b64) return;
            
            navigator.clipboard.writeText(b64).then(() => {
                const icon = btnCopy.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-check';
                    setTimeout(() => {
                        icon.className = 'fa-regular fa-copy';
                    }, 2000);
                }
            });
        });
    }

    // View PDF inline
    btnView.addEventListener('click', (e) => {
        e.preventDefault();
        const rawBase64 = base64Input.value;
        if (!rawBase64) {
            alert("Please provide a Base64 string first.");
            return;
        }

        try {
            const b64 = cleanBase64(rawBase64);
            const blob = base64ToBlob(b64);
            const blobUrl = URL.createObjectURL(blob);

            // Render iframe with the blob URL
            viewerContainer.innerHTML = `<iframe src="${blobUrl}#toolbar=0" width="100%" height="100%" frameborder="0" style="border: none;"></iframe>`;
        } catch (error) {
            alert("Invalid Base64 string. Please ensure you provided a valid PDF Base64.");
        }
    });

    // Download PDF
    btnDownload.addEventListener('click', (e) => {
        e.preventDefault();
        const rawBase64 = base64Input.value;
        if (!rawBase64) {
            alert("Please provide a Base64 string first.");
            return;
        }

        try {
            const b64 = cleanBase64(rawBase64);
            const blob = base64ToBlob(b64);
            const blobUrl = URL.createObjectURL(blob);
            
            // Create a temporary link element
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'document.pdf';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
            alert("Invalid Base64 string.");
        }
    });

    // Clear UI
    btnClear.addEventListener('click', (e) => {
        e.preventDefault();
        base64Input.value = '';
        viewerContainer.innerHTML = '<span style="color: var(--text-muted);">PDF will appear here</span>';
    });
});
