document.addEventListener('DOMContentLoaded', () => {
    // --- Password Generator ---
    const lenSlider = document.getElementById('pwd-length');
    const lenVal = document.getElementById('pwd-len-val');
    const chkUpper = document.getElementById('pwd-upper');
    const chkLower = document.getElementById('pwd-lower');
    const chkNum = document.getElementById('pwd-numbers');
    const chkSym = document.getElementById('pwd-symbols');
    const pwdOutput = document.getElementById('pwd-output');
    const btnGenPwd = document.getElementById('btn-generate-pwd');
    const btnCopyPwd = document.getElementById('btn-copy-pwd');

    const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    const NUM_CHARS = '0123456789';
    const SYM_CHARS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    lenSlider.addEventListener('input', () => {
        lenVal.textContent = lenSlider.value;
    });

    function generatePassword() {
        let chars = '';
        if (chkUpper.checked) chars += UPPER_CHARS;
        if (chkLower.checked) chars += LOWER_CHARS;
        if (chkNum.checked) chars += NUM_CHARS;
        if (chkSym.checked) chars += SYM_CHARS;

        if (!chars) {
            pwdOutput.value = 'Select at least one option!';
            return;
        }

        let length = parseInt(lenSlider.value);
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        pwdOutput.value = password;
    }

    btnGenPwd.addEventListener('click', generatePassword);

    btnCopyPwd.addEventListener('click', () => {
        if (!pwdOutput.value || pwdOutput.value === 'Select at least one option!') return;
        navigator.clipboard.writeText(pwdOutput.value).then(() => {
            const icon = btnCopyPwd.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
            }, 2000);
        });
    });

    // Initialize with a password
    generatePassword();

    // --- Hash Calculator ---
    const hashInput = document.getElementById('hash-input');
    const hashMd5 = document.getElementById('hash-md5');
    const hashSha256 = document.getElementById('hash-sha256');
    const hashSha512 = document.getElementById('hash-sha512');

    hashInput.addEventListener('input', () => {
        const text = hashInput.value;
        if (!text) {
            hashMd5.value = '';
            hashSha256.value = '';
            hashSha512.value = '';
            return;
        }

        try {
            hashMd5.value = CryptoJS.MD5(text).toString();
            hashSha256.value = CryptoJS.SHA256(text).toString();
            hashSha512.value = CryptoJS.SHA512(text).toString();
        } catch (e) {
            console.error('Hash error:', e);
        }
    });
});
