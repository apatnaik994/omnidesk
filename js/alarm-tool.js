document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('alarm-time-input');
    const messageInput = document.getElementById('alarm-message-input');
    const soundInput = document.getElementById('alarm-sound-input');
    const volumeInput = document.getElementById('alarm-volume-input');
    const volumeValue = document.getElementById('alarm-volume-value');
    const btnSetAlarm = document.getElementById('btn-set-alarm');
    const activeAlarmsList = document.getElementById('active-alarms-list');

    let alarms = [];

    // Setup audio for alarm
    let audioCtx = null;
    let activeSoundInterval = null;
    let activeNodes = [];

    if (volumeInput && volumeValue) {
        volumeInput.addEventListener('input', () => {
            volumeValue.textContent = Math.round(volumeInput.value * 100) + '%';
        });
    }

    function playAlarmSound(type, volume) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        stopAlarmSound();
        
        function playTone() {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            const now = audioCtx.currentTime;
            
            if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gainNode.gain.setValueAtTime(volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (type === 'chime') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.4); // G5
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                
                osc.start(now);
                osc.stop(now + 1.5);
            } else if (type === 'siren') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
                osc.frequency.linearRampToValueAtTime(600, now + 0.8);
                
                gainNode.gain.setValueAtTime(volume * 0.5, now);
                
                osc.start(now);
                osc.stop(now + 0.8);
            }
            
            activeNodes.push(osc);
        }
        
        playTone();
        const loopTime = type === 'chime' ? 2000 : (type === 'siren' ? 800 : 1000);
        activeSoundInterval = setInterval(playTone, loopTime);
    }

    function stopAlarmSound() {
        if (activeSoundInterval) {
            clearInterval(activeSoundInterval);
            activeSoundInterval = null;
        }
        activeNodes.forEach(node => {
            try { node.stop(); } catch(e){}
        });
        activeNodes = [];
    }

    function renderAlarms() {
        activeAlarmsList.innerHTML = '';
        if (alarms.length === 0) {
            activeAlarmsList.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">No active alarms.</div>';
            return;
        }

        alarms.forEach((alarm, index) => {
            const alarmEl = document.createElement('div');
            alarmEl.style.display = 'flex';
            alarmEl.style.justifyContent = 'space-between';
            alarmEl.style.alignItems = 'center';
            alarmEl.style.padding = '10px 15px';
            alarmEl.style.background = 'rgba(0,0,0,0.2)';
            alarmEl.style.borderRadius = '8px';
            
            const infoDiv = document.createElement('div');
            
            const timeSpan = document.createElement('strong');
            timeSpan.style.color = 'var(--primary)';
            timeSpan.style.fontSize = '1.2rem';
            timeSpan.style.marginRight = '10px';
            // format time to 12-hour or just show as is
            timeSpan.textContent = formatTime(alarm.time);

            const msgSpan = document.createElement('span');
            msgSpan.textContent = alarm.message + (alarm.sound ? ` (${alarm.sound})` : '');

            infoDiv.appendChild(timeSpan);
            infoDiv.appendChild(msgSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'danger-btn';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            deleteBtn.onclick = () => {
                alarms.splice(index, 1);
                renderAlarms();
            };

            alarmEl.appendChild(infoDiv);
            alarmEl.appendChild(deleteBtn);
            activeAlarmsList.appendChild(alarmEl);
        });
    }

    function formatTime(timeStr) {
        // timeStr is HH:MM (24-hour)
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
    }

    function showNotification(message, soundType, volumeLevel) {
        // Create an on-screen modal notification
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        const modal = document.createElement('div');
        modal.className = 'glass-panel';
        modal.style.padding = '40px';
        modal.style.textAlign = 'center';
        modal.style.maxWidth = '400px';
        modal.style.borderRadius = '15px';
        modal.style.boxShadow = '0 10px 30px rgba(0,206,201,0.3)';

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-bell fa-shake';
        icon.style.fontSize = '4rem';
        icon.style.color = 'var(--primary)';
        icon.style.marginBottom = '20px';

        const title = document.createElement('h2');
        title.textContent = 'Reminder!';
        title.style.marginBottom = '10px';
        title.style.color = 'white';

        const text = document.createElement('p');
        text.textContent = message;
        text.style.fontSize = '1.2rem';
        text.style.marginBottom = '30px';

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'primary-btn';
        dismissBtn.style.width = '100%';
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.onclick = () => {
            document.body.removeChild(overlay);
            stopAlarmSound();
        };

        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(text);
        modal.appendChild(dismissBtn);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
        
        // Play sound
        playAlarmSound(soundType || 'beep', volumeLevel !== undefined ? volumeLevel : 1.0);

        // Also try native notification if permitted
        if (window.Notification && Notification.permission === "granted") {
            new Notification("Reminder", { body: message });
        }
    }

    btnSetAlarm.addEventListener('click', () => {
        const time = timeInput.value;
        let message = messageInput.value.trim();
        const soundType = soundInput ? soundInput.value : 'beep';
        const volumeLevel = volumeInput ? parseFloat(volumeInput.value) : 1.0;

        if (!time) {
            alert('Please select a time for the alarm.');
            return;
        }

        if (!message) {
            message = 'Alarm';
        }

        alarms.push({ time, message, sound: soundType, volume: volumeLevel });
        
        // Sort alarms by time
        alarms.sort((a, b) => a.time.localeCompare(b.time));

        // Clear inputs
        timeInput.value = '';
        messageInput.value = '';

        renderAlarms();
        
        // Request notification permission if not already asked
        if (window.Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    });

    // Checker loop
    setInterval(() => {
        if (alarms.length === 0) return;

        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        const currentSeconds = now.getSeconds();

        // Check at the beginning of the minute
        if (currentSeconds === 0 || currentSeconds === 1) {
            let triggered = false;
            
            // Loop backwards so we can safely splice
            for (let i = alarms.length - 1; i >= 0; i--) {
                if (alarms[i].time === currentTimeStr) {
                    const alarm = alarms[i];
                    showNotification(alarm.message, alarm.sound, alarm.volume);
                    alarms.splice(i, 1);
                    triggered = true;
                }
            }

            if (triggered) {
                renderAlarms();
            }
        }
    }, 1000);
});
