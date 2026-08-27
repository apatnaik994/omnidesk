document.addEventListener('DOMContentLoaded', () => {
    const patternInput = document.getElementById('regex-pattern');
    const flagsInput = document.getElementById('regex-flags');
    const testStringInput = document.getElementById('regex-test-string');
    const resultsArea = document.getElementById('regex-results');

    function testRegex() {
        const pattern = patternInput.value;
        const flags = flagsInput.value;
        const text = testStringInput.value;

        if (!pattern) {
            resultsArea.innerHTML = '<span style="color: var(--text-muted);">Enter a regex pattern to see results...</span>';
            return;
        }
        if (!text) {
            resultsArea.innerHTML = '<span style="color: var(--text-muted);">Enter a test string to see matches...</span>';
            return;
        }

        try {
            const regex = new RegExp(pattern, flags);
            
            // To highlight matches in the result area
            // We need to escape HTML first, then wrap matches in spans
            
            // Simple escape function to prevent XSS and formatting issues
            const escapeHtml = (unsafe) => {
                return unsafe
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
            };

            let matchFound = false;
            let resultHtml = '';
            
            if (regex.global) {
                let match;
                let lastIndex = 0;
                
                // Ensure no infinite loops with zero-length matches
                const maxLoops = 10000;
                let loops = 0;
                
                while ((match = regex.exec(text)) !== null) {
                    loops++;
                    if (loops > maxLoops) break;
                    
                    matchFound = true;
                    // text before match
                    resultHtml += escapeHtml(text.substring(lastIndex, match.index));
                    // the match
                    resultHtml += `<span style="background: rgba(0, 206, 201, 0.3); color: var(--primary); border-radius: 3px; padding: 0 2px;">${escapeHtml(match[0])}</span>`;
                    
                    lastIndex = regex.lastIndex;
                    
                    // If zero-length match, manually advance index
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                }
                
                // Add remaining text
                resultHtml += escapeHtml(text.substring(lastIndex));
                
            } else {
                // Non-global regex
                const match = regex.exec(text);
                if (match) {
                    matchFound = true;
                    resultHtml += escapeHtml(text.substring(0, match.index));
                    resultHtml += `<span style="background: rgba(0, 206, 201, 0.3); color: var(--primary); border-radius: 3px; padding: 0 2px;">${escapeHtml(match[0])}</span>`;
                    resultHtml += escapeHtml(text.substring(match.index + match[0].length));
                } else {
                    resultHtml = escapeHtml(text);
                }
            }
            
            if (matchFound) {
                resultsArea.innerHTML = resultHtml;
            } else {
                resultsArea.innerHTML = '<span style="color: var(--danger);">No matches found.</span>';
            }

        } catch (e) {
            resultsArea.innerHTML = `<span style="color: var(--danger);">Invalid Regex: ${e.message}</span>`;
        }
    }

    patternInput.addEventListener('input', testRegex);
    flagsInput.addEventListener('input', testRegex);
    testStringInput.addEventListener('input', testRegex);
});
