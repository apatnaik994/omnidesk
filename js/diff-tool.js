document.addEventListener('DOMContentLoaded', () => {
    const originalInput = document.getElementById('diff-original');
    const modifiedInput = document.getElementById('diff-modified');
    const modeSelect = document.getElementById('diff-mode');
    const btnClear = document.getElementById('btn-clear-diff');
    const resultsArea = document.getElementById('diff-results');

    function escapeHtml(unsafe) {
        return (unsafe || '')
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function calculateDiff() {
        const originalText = originalInput.value;
        const modifiedText = modifiedInput.value;
        const mode = modeSelect.value;

        if (!originalText && !modifiedText) {
            resultsArea.innerHTML = '<div style="color: var(--text-muted); text-align: center; margin-top: 2rem;">Results will appear here automatically as you type...</div>';
            return;
        }

        try {
            let resultHtml = '';

            if (mode === 'lines') {
                const diff = Diff.diffLines(originalText, modifiedText);

                for (let i = 0; i < diff.length; i++) {
                    let part = diff[i];
                    
                    if (part.removed && diff[i+1] && diff[i+1].added) {
                        const removedText = part.value;
                        const addedText = diff[i+1].value;
                        const wordDiff = Diff.diffWordsWithSpace(removedText, addedText);
                        
                        // Render removed lines
                        let currentRemovedLine = '';
                        wordDiff.forEach(wp => {
                            if (!wp.added) {
                                const lines = wp.value.split('\n');
                                for (let j = 0; j < lines.length; j++) {
                                    if (j > 0) {
                                        const displayLine = currentRemovedLine === '' ? ' ' : currentRemovedLine;
                                        resultHtml += `<div style="background: rgba(255, 118, 117, 0.15); color: var(--danger); padding: 2px 15px; border-left: 4px solid var(--danger);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">-</span>${displayLine}</div>`;
                                        currentRemovedLine = '';
                                    }
                                    let content = escapeHtml(lines[j]);
                                    if (wp.removed && content) {
                                        content = `<span style="background: rgba(255, 118, 117, 0.4); border-radius: 2px;">${content}</span>`;
                                    }
                                    currentRemovedLine += content;
                                }
                            }
                        });
                        if (currentRemovedLine !== '') {
                            const displayLine = currentRemovedLine === '' ? ' ' : currentRemovedLine;
                            resultHtml += `<div style="background: rgba(255, 118, 117, 0.15); color: var(--danger); padding: 2px 15px; border-left: 4px solid var(--danger);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">-</span>${displayLine}</div>`;
                        }

                        // Render added lines
                        let currentAddedLine = '';
                        wordDiff.forEach(wp => {
                            if (!wp.removed) {
                                const lines = wp.value.split('\n');
                                for (let j = 0; j < lines.length; j++) {
                                    if (j > 0) {
                                        const displayLine = currentAddedLine === '' ? ' ' : currentAddedLine;
                                        resultHtml += `<div style="background: rgba(0, 184, 148, 0.15); color: var(--success); padding: 2px 15px; border-left: 4px solid var(--success);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">+</span>${displayLine}</div>`;
                                        currentAddedLine = '';
                                    }
                                    let content = escapeHtml(lines[j]);
                                    if (wp.added && content) {
                                        content = `<span style="background: rgba(0, 184, 148, 0.4); border-radius: 2px;">${content}</span>`;
                                    }
                                    currentAddedLine += content;
                                }
                            }
                        });
                        if (currentAddedLine !== '') {
                            const displayLine = currentAddedLine === '' ? ' ' : currentAddedLine;
                            resultHtml += `<div style="background: rgba(0, 184, 148, 0.15); color: var(--success); padding: 2px 15px; border-left: 4px solid var(--success);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">+</span>${displayLine}</div>`;
                        }

                        i++; // skip the added part since we processed it together with removed part
                    } else {
                        // normal processing for unchanged, purely added, or purely removed lines
                        const lines = part.value.split('\n');
                        if (lines[lines.length - 1] === '') {
                            lines.pop(); 
                        }
                        
                        lines.forEach(line => {
                            const escapedLine = escapeHtml(line);
                            const displayLine = escapedLine === '' ? ' ' : escapedLine;
                            if (part.added) {
                                resultHtml += `<div style="background: rgba(0, 184, 148, 0.15); color: var(--success); padding: 2px 15px; border-left: 4px solid var(--success);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">+</span>${displayLine}</div>`;
                            } else if (part.removed) {
                                resultHtml += `<div style="background: rgba(255, 118, 117, 0.15); color: var(--danger); padding: 2px 15px; border-left: 4px solid var(--danger);"><span style="user-select: none; opacity: 0.5; margin-right: 10px;">-</span>${displayLine}</div>`;
                            } else {
                                resultHtml += `<div style="color: var(--text-muted); padding: 2px 15px; border-left: 4px solid transparent;"><span style="user-select: none; opacity: 0.5; margin-right: 10px;"> </span>${displayLine}</div>`;
                            }
                        });
                    }
                }
                resultsArea.innerHTML = `<div style="padding: 10px 0;">${resultHtml}</div>`;
            } else {
                const diff = Diff.diffWordsWithSpace(originalText, modifiedText);
                diff.forEach((part) => {
                    const escapedValue = escapeHtml(part.value);
                    if (part.added) {
                        resultHtml += `<span style="background: rgba(0, 184, 148, 0.2); color: var(--success); border-radius: 3px;">${escapedValue}</span>`;
                    } else if (part.removed) {
                        resultHtml += `<span style="background: rgba(255, 118, 117, 0.2); color: var(--danger); text-decoration: line-through; border-radius: 3px;">${escapedValue}</span>`;
                    } else {
                        resultHtml += `<span style="color: var(--text-main);">${escapedValue}</span>`;
                    }
                });
                resultsArea.innerHTML = `<div style="padding: 15px;">${resultHtml}</div>`;
            }
            
        } catch (e) {
            console.error('Diff error:', e);
            resultsArea.innerHTML = '<div style="color: var(--danger); padding: 15px;">An error occurred while comparing the text.</div>';
        }
    }

    originalInput.addEventListener('input', calculateDiff);
    modifiedInput.addEventListener('input', calculateDiff);
    modeSelect.addEventListener('change', calculateDiff);

    btnClear.addEventListener('click', () => {
        originalInput.value = '';
        modifiedInput.value = '';
        calculateDiff();
    });
});
