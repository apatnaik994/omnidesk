document.addEventListener('DOMContentLoaded', () => {
    // Validation & Translation
    const cronInputVal = document.getElementById('cron-input-val');
    const cronHumanReadable = document.getElementById('cron-human-readable');

    function updateTranslation() {
        const val = cronInputVal.value.trim();
        if (!val) {
            cronHumanReadable.textContent = 'Please enter a cron expression.';
            cronHumanReadable.style.color = 'var(--text-muted)';
            return;
        }

        try {
            // cronstrue needs to be available globally
            if (typeof cronstrue !== 'undefined') {
                const readable = cronstrue.toString(val, { throwExceptionOnParseError: true });
                cronHumanReadable.textContent = readable;
                cronHumanReadable.style.color = 'var(--success)';
            } else {
                cronHumanReadable.textContent = 'cronstrue library not loaded.';
            }
        } catch (e) {
            cronHumanReadable.textContent = 'Invalid Cron Expression: ' + e.toString();
            cronHumanReadable.style.color = 'var(--danger)';
        }
    }

    cronInputVal.addEventListener('input', updateTranslation);
    // Initial call
    updateTranslation();

    // Generator
    const genMin = document.getElementById('cron-gen-min');
    const genHour = document.getElementById('cron-gen-hour');
    const genDom = document.getElementById('cron-gen-dom');
    const genMon = document.getElementById('cron-gen-mon');
    const genDow = document.getElementById('cron-gen-dow');
    const genOutput = document.getElementById('cron-generated-output');
    const btnCopyCron = document.getElementById('btn-copy-cron');

    const genInputs = [genMin, genHour, genDom, genMon, genDow];

    function updateGenerator() {
        const parts = genInputs.map(input => {
            let val = input.value.trim();
            return val === '' ? '*' : val;
        });
        const generatedCron = parts.join(' ');
        genOutput.value = generatedCron;
        
        // Update the validation input as well
        cronInputVal.value = generatedCron;
        updateTranslation();
    }

    genInputs.forEach(input => {
        input.addEventListener('input', updateGenerator);
    });

    // Presets
    const presets = document.querySelectorAll('.preset-cron');
    presets.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cronParts = btn.getAttribute('data-cron').split(' ');
            if (cronParts.length >= 5) {
                genMin.value = cronParts[0];
                genHour.value = cronParts[1];
                genDom.value = cronParts[2];
                genMon.value = cronParts[3];
                genDow.value = cronParts[4];
                updateGenerator();
            }
        });
    });

    // Copy to clipboard
    btnCopyCron.addEventListener('click', (e) => {
        e.preventDefault();
        if (!genOutput.value) return;
        navigator.clipboard.writeText(genOutput.value).then(() => {
            const icon = btnCopyCron.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
            }, 2000);
        });
    });
});
