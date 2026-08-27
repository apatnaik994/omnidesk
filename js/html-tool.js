document.addEventListener('DOMContentLoaded', () => {
    const htmlInput = document.getElementById('html-input');
    const htmlOutput = document.getElementById('html-output');
    const btnRunHtml = document.getElementById('btn-run-html');

    if (!htmlInput || !htmlOutput || !btnRunHtml) return;

    function compileHTML() {
        const code = htmlInput.value;
        const iframeDoc = htmlOutput.contentWindow.document;
        
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
    }

    // Run when button is clicked
    btnRunHtml.addEventListener('click', compileHTML);

    // Optional: auto-run feature with debounce could be added here, 
    // but the button provides clear intent as per UI design.
    // For now, let's also allow running it by pressing Ctrl+Enter
    htmlInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            compileHTML();
        }
    });
});
