document.addEventListener('DOMContentLoaded', () => {
    const secretKeyInput = document.getElementById('aes-secret-key');
    const textInput = document.getElementById('aes-input');
    const textOutput = document.getElementById('aes-output');
    
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnDecrypt = document.getElementById('btn-decrypt');
    const btnCopyAes = document.getElementById('btn-copy-aes');

    function showAlert(msg) {
        // Simple alert for now, could be enhanced with custom toast notification
        alert(msg);
    }

    function getProcessedKey(keyStr, keySizeBits) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let requiredBytes = keySizeBits / 8;
        if (key.sigBytes < requiredBytes) {
            let padding = CryptoJS.lib.WordArray.create(new Array((requiredBytes - key.sigBytes + 3) >>> 2).fill(0));
            key.concat(padding);
            key.sigBytes = requiredBytes;
        } else if (key.sigBytes > requiredBytes) {
            key.sigBytes = requiredBytes;
        }
        return key;
    }

    function getProcessedIv(ivStr) {
        let iv = CryptoJS.enc.Utf8.parse(ivStr);
        if (iv.sigBytes < 16) {
            let padding = CryptoJS.lib.WordArray.create(new Array((16 - iv.sigBytes + 3) >>> 2).fill(0));
            iv.concat(padding);
            iv.sigBytes = 16;
        } else if (iv.sigBytes > 16) {
            iv.sigBytes = 16;
        }
        return iv;
    }

    function getAesConfig() {
        const keySizeBits = parseInt(document.getElementById('aes-key-size').value, 10);
        const modeStr = document.getElementById('aes-mode').value;
        const paddingStr = document.getElementById('aes-padding').value;
        const ivStr = document.getElementById('aes-iv').value;
        const keyStr = secretKeyInput.value;

        let config = {
            mode: CryptoJS.mode[modeStr],
            padding: CryptoJS.pad[paddingStr]
        };

        let finalKey = keyStr;

        if (ivStr || modeStr === 'ECB') {
            if (ivStr && modeStr !== 'ECB') {
                config.iv = getProcessedIv(ivStr);
            }
            finalKey = getProcessedKey(keyStr, keySizeBits);
        } else {
            config.keySize = keySizeBits / 32;
        }

        return { finalKey, config };
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function base64ToArrayBuffer(base64) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async function getWebCryptoKey(keyStr, keySizeBits) {
        let requiredBytes = keySizeBits / 8;
        let encoder = new TextEncoder();
        let keyBytes = encoder.encode(keyStr);
        let finalKeyBytes = new Uint8Array(requiredBytes);
        finalKeyBytes.set(keyBytes.slice(0, requiredBytes));
        
        return await window.crypto.subtle.importKey(
            "raw",
            finalKeyBytes,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    function getWebCryptoIv(ivStr) {
        let encoder = new TextEncoder();
        let ivBytes = encoder.encode(ivStr);
        let finalIv = new Uint8Array(12);
        finalIv.set(ivBytes.slice(0, 12));
        return finalIv;
    }

    btnEncrypt.addEventListener('click', async () => {
        const text = textInput.value;
        const keyStr = secretKeyInput.value;
        const modeStr = document.getElementById('aes-mode').value;
        const keySizeBits = parseInt(document.getElementById('aes-key-size').value, 10);
        const ivStr = document.getElementById('aes-iv').value;

        if (!keyStr) {
            showAlert("Please enter a secret key.");
            return;
        }
        if (!text) {
            showAlert("Please enter text to encrypt.");
            return;
        }

        try {
            if (modeStr === 'GCM') {
                if (!ivStr) {
                    showAlert("GCM mode requires an IV. Please provide one.");
                    return;
                }
                const key = await getWebCryptoKey(keyStr, keySizeBits);
                const iv = getWebCryptoIv(ivStr);
                const encoder = new TextEncoder();
                const encodedText = encoder.encode(text);
                
                const encryptedBuf = await window.crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    encodedText
                );
                textOutput.value = arrayBufferToBase64(encryptedBuf);
            } else {
                const { finalKey, config } = getAesConfig();
                const encrypted = CryptoJS.AES.encrypt(text, finalKey, config).toString();
                textOutput.value = encrypted;
            }
        } catch (e) {
            showAlert("Encryption failed: " + e.message);
        }
    });

    btnDecrypt.addEventListener('click', async () => {
        const cipherText = textInput.value;
        const keyStr = secretKeyInput.value;
        const modeStr = document.getElementById('aes-mode').value;
        const keySizeBits = parseInt(document.getElementById('aes-key-size').value, 10);
        const ivStr = document.getElementById('aes-iv').value;

        if (!keyStr) {
            showAlert("Please enter a secret key.");
            return;
        }
        if (!cipherText) {
            showAlert("Please enter text to decrypt.");
            return;
        }

        try {
            if (modeStr === 'GCM') {
                if (!ivStr) {
                    showAlert("GCM mode requires the original IV.");
                    return;
                }
                const key = await getWebCryptoKey(keyStr, keySizeBits);
                const iv = getWebCryptoIv(ivStr);
                const cipherBuf = base64ToArrayBuffer(cipherText);
                
                const decryptedBuf = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    cipherBuf
                );
                const decoder = new TextDecoder();
                textOutput.value = decoder.decode(decryptedBuf);
            } else {
                const { finalKey, config } = getAesConfig();
                const bytes = CryptoJS.AES.decrypt(cipherText, finalKey, config);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                
                if (!decrypted) {
                    showAlert("Decryption failed. Incorrect key or invalid ciphertext.");
                    return;
                }
                
                textOutput.value = decrypted;
            }
        } catch (e) {
            showAlert("Decryption failed: " + e.message);
        }
    });

    btnCopyAes.addEventListener('click', () => {
        if (!textOutput.value) return;
        navigator.clipboard.writeText(textOutput.value).then(() => {
            const icon = btnCopyAes.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
            }, 2000);
        });
    });
});
