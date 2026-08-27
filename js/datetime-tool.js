document.addEventListener('DOMContentLoaded', () => {
    // Add / Subtract Time Elements
    const startInput = document.getElementById('dt-start-input');
    const operation = document.getElementById('dt-operation');
    const yearsInput = document.getElementById('dt-years');
    const monthsInput = document.getElementById('dt-months');
    const daysInput = document.getElementById('dt-days');
    const hoursInput = document.getElementById('dt-hours');
    const minutesInput = document.getElementById('dt-minutes');
    const secondsInput = document.getElementById('dt-seconds');
    const btnCalcAddSub = document.getElementById('btn-calc-addsub');
    const addSubResult = document.getElementById('dt-addsub-result');

    // Default to current local time for start date
    const now = new Date();
    // format to YYYY-MM-DDThh:mm:ss
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 19);
    startInput.value = localISOTime;

    btnCalcAddSub.addEventListener('click', (e) => {
        e.preventDefault();
        if (!startInput.value) {
            alert("Please select a start date and time.");
            return;
        }

        const date = new Date(startInput.value);
        const op = operation.value === 'add' ? 1 : -1;

        const y = parseInt(yearsInput.value) || 0;
        const m = parseInt(monthsInput.value) || 0;
        const d = parseInt(daysInput.value) || 0;
        const h = parseInt(hoursInput.value) || 0;
        const min = parseInt(minutesInput.value) || 0;
        const sec = parseInt(secondsInput.value) || 0;

        date.setFullYear(date.getFullYear() + (y * op));
        date.setMonth(date.getMonth() + (m * op));
        date.setDate(date.getDate() + (d * op));
        date.setHours(date.getHours() + (h * op));
        date.setMinutes(date.getMinutes() + (min * op));
        date.setSeconds(date.getSeconds() + (sec * op));

        addSubResult.textContent = date.toLocaleString();
    });

    // Difference Elements
    const diffFrom = document.getElementById('dt-diff-from');
    const diffTo = document.getElementById('dt-diff-to');
    const btnCalcDiff = document.getElementById('btn-calc-diff');
    const diffResult = document.getElementById('dt-diff-result');

    // Default values for diff
    const todayLocal = new Date(now - tzOffset);
    diffFrom.value = todayLocal.toISOString().slice(0, 19);
    const nextWeekLocal = new Date(todayLocal.getTime() + 7 * 24 * 60 * 60 * 1000);
    diffTo.value = nextWeekLocal.toISOString().slice(0, 19);

    btnCalcDiff.addEventListener('click', (e) => {
        e.preventDefault();
        if (!diffFrom.value || !diffTo.value) {
            alert("Please select both dates and times.");
            return;
        }

        const date1 = new Date(diffFrom.value);
        const date2 = new Date(diffTo.value);

        // Difference in milliseconds
        const diffTime = Math.abs(date2 - date1);
        
        // Total metrics
        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        
        // Remainder metrics for exact readout
        const remHours = diffHours % 24;
        const remMinutes = diffMinutes % 60;
        const remSeconds = diffSeconds % 60;
        
        let exactParts = [];
        if (diffDays > 0) exactParts.push(`${diffDays} Days`);
        if (remHours > 0) exactParts.push(`${remHours} Hours`);
        if (remMinutes > 0) exactParts.push(`${remMinutes} Minutes`);
        if (remSeconds > 0) exactParts.push(`${remSeconds} Seconds`);
        
        if (exactParts.length === 0) exactParts.push('0 Seconds');

        const diffMonths = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
        const diffYears = Math.abs(date2.getFullYear() - date1.getFullYear());

        let resultStr = exactParts.join(', ');
        if (diffWeeks > 0) resultStr += ` (~${diffWeeks} Weeks)`;
        if (Math.abs(diffMonths) > 0) resultStr += ` | ~${Math.abs(diffMonths)} Months`;
        if (diffYears > 0) resultStr += ` | ~${diffYears} Years`;

        diffResult.textContent = resultStr;
    });

    // Time Difference Only Elements
    const timeOnlyFrom = document.getElementById('time-only-from');
    const timeOnlyTo = document.getElementById('time-only-to');
    const btnCalcTimeOnly = document.getElementById('btn-calc-time-only');
    const timeOnlyResult = document.getElementById('time-only-result');

    // Default values for time only
    const currentTime = new Date();
    timeOnlyFrom.value = currentTime.toTimeString().slice(0, 8);
    const laterTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    timeOnlyTo.value = laterTime.toTimeString().slice(0, 8);

    btnCalcTimeOnly.addEventListener('click', (e) => {
        e.preventDefault();
        if (!timeOnlyFrom.value || !timeOnlyTo.value) {
            alert("Please select both times.");
            return;
        }

        // Parse time manually to avoid timezone parsing differences
        const [h1, m1, s1 = 0] = timeOnlyFrom.value.split(':').map(Number);
        const [h2, m2, s2 = 0] = timeOnlyTo.value.split(':').map(Number);

        const date1 = new Date(1970, 0, 1, h1, m1, s1);
        let date2 = new Date(1970, 0, 1, h2, m2, s2);

        // If 'to' time is earlier than 'from' time, assume it crosses midnight
        if (date2 < date1) {
            date2.setDate(date2.getDate() + 1);
        }

        // Difference in milliseconds
        const diffTime = Math.abs(date2 - date1);

        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        const remHours = diffHours % 24;
        const remMinutes = diffMinutes % 60;
        const remSeconds = diffSeconds % 60;

        let exactParts = [];
        if (remHours > 0) exactParts.push(`${remHours} Hours`);
        if (remMinutes > 0) exactParts.push(`${remMinutes} Minutes`);
        if (remSeconds > 0) exactParts.push(`${remSeconds} Seconds`);

        if (exactParts.length === 0) exactParts.push('0 Seconds');

        timeOnlyResult.textContent = exactParts.join(', ');
    });
});
