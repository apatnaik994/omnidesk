document.addEventListener('DOMContentLoaded', () => {

    // --- Mouse Test ---
    const mouseTestArea = document.getElementById('mouse-test-area');
    const mouseLog = document.getElementById('mouse-log');
    const badgeLeft = document.getElementById('mouse-left');
    const badgeMiddle = document.getElementById('mouse-middle');
    const badgeRight = document.getElementById('mouse-right');
    const badgeDouble = document.getElementById('mouse-double');

    function resetMouseBadges() {
        [badgeLeft, badgeMiddle, badgeRight, badgeDouble].forEach(b => {
            b.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            b.style.color = 'var(--text-main)';
        });
    }

    function activateBadge(badge) {
        resetMouseBadges();
        badge.style.backgroundColor = 'var(--success)';
        badge.style.color = '#fff';
        setTimeout(resetMouseBadges, 500);
    }

    let singleClickCount = 0;
    let doubleClickCount = 0;
    const singleCountEl = document.getElementById('mouse-single-count');
    const doubleCountEl = document.getElementById('mouse-double-count');

    mouseTestArea.addEventListener('mousedown', (e) => {
        e.preventDefault();
        singleClickCount++;
        if (singleCountEl) singleCountEl.textContent = singleClickCount;
        
        if (e.button === 0) {
            activateBadge(badgeLeft);
            mouseLog.textContent = `Left Click detected at (X: ${e.offsetX}, Y: ${e.offsetY})`;
        } else if (e.button === 1) {
            activateBadge(badgeMiddle);
            mouseLog.textContent = `Middle Click detected at (X: ${e.offsetX}, Y: ${e.offsetY})`;
        } else if (e.button === 2) {
            activateBadge(badgeRight);
            mouseLog.textContent = `Right Click detected at (X: ${e.offsetX}, Y: ${e.offsetY})`;
        }
    });

    mouseTestArea.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent default context menu
    });

    mouseTestArea.addEventListener('dblclick', (e) => {
        doubleClickCount++;
        singleClickCount -= 2;
        if (singleClickCount < 0) singleClickCount = 0;
        if (singleCountEl) singleCountEl.textContent = singleClickCount;
        if (doubleCountEl) doubleCountEl.textContent = doubleClickCount;
        
        activateBadge(badgeDouble);
        mouseLog.textContent = `Double Click detected at (X: ${e.offsetX}, Y: ${e.offsetY})`;
    });

    // --- Keyboard Test ---
    const kbInput = document.getElementById('keyboard-test-input');
    const kbLogKey = document.getElementById('keyboard-log-key');
    const kbLogCode = document.getElementById('keyboard-log-code');

    kbInput.addEventListener('keydown', (e) => {
        e.preventDefault(); // prevent typing to keep it clean
        kbLogKey.textContent = e.key === ' ' ? 'Space' : e.key;
        kbLogCode.textContent = `Code: ${e.code} | keyCode: ${e.keyCode}`;
    });

    // --- Camera Test ---
    const btnTestCamera = document.getElementById('btn-test-camera');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraStatus = document.getElementById('camera-status');
    let cameraStream = null;

    btnTestCamera.addEventListener('click', async () => {
        if (cameraStream) {
            // Stop camera
            cameraStream.getTracks().forEach(track => track.stop());
            cameraPreview.srcObject = null;
            cameraStream = null;
            btnTestCamera.innerHTML = '<i class="fa-solid fa-video"></i> Start Camera';
            cameraStatus.style.display = 'block';
        } else {
            // Start camera
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraPreview.srcObject = cameraStream;
                btnTestCamera.innerHTML = '<i class="fa-solid fa-video-slash"></i> Stop Camera';
                cameraStatus.style.display = 'none';
            } catch (err) {
                alert('Could not access camera: ' + err.message);
            }
        }
    });

    // --- Microphone Test ---
    const btnTestMic = document.getElementById('btn-test-mic');
    const micVolumeBar = document.getElementById('mic-volume-bar');
    const micVolumePercentage = document.getElementById('mic-volume-percentage');
    const micVisualizer = document.getElementById('mic-visualizer');
    let visualizerCtx = micVisualizer ? micVisualizer.getContext('2d') : null;
    let micStream = null;
    let audioContext = null;
    let analyser = null;
    let microphone = null;
    let animationId = null;

    btnTestMic.addEventListener('click', async () => {
        if (micStream) {
            // Stop mic
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
            if (audioContext) audioContext.close();
            cancelAnimationFrame(animationId);
            micVolumeBar.style.width = '0%';
            if (micVolumePercentage) micVolumePercentage.textContent = '0%';
            if (visualizerCtx && micVisualizer) {
                visualizerCtx.clearRect(0, 0, micVisualizer.width, micVisualizer.height);
            }
            btnTestMic.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Start Mic';
        } else {
            // Start mic
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(micStream);
                
                microphone.connect(analyser);
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                btnTestMic.innerHTML = '<i class="fa-solid fa-microphone-slash"></i> Stop Mic';

                const updateVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    let average = sum / bufferLength;
                    // convert to percentage, max is around 255
                    let percentage = Math.min((average / 128) * 100, 100);
                    micVolumeBar.style.width = percentage + '%';
                    if (micVolumePercentage) {
                        micVolumePercentage.textContent = Math.round(percentage) + '%';
                    }

                    // Draw visualizer
                    if (visualizerCtx && micVisualizer) {
                        const width = micVisualizer.width = micVisualizer.clientWidth;
                        const height = micVisualizer.height = micVisualizer.clientHeight;
                        visualizerCtx.clearRect(0, 0, width, height);
                        
                        const barWidth = (width / bufferLength) * 2.5;
                        let barHeight;
                        let x = 0;
                        
                        for(let i = 0; i < bufferLength; i++) {
                            barHeight = (dataArray[i] / 255) * height;
                            
                            // Color based on height
                            const r = barHeight + (25 * (i/bufferLength));
                            const g = 250 * (i/bufferLength);
                            const b = 50;
                            
                            visualizerCtx.fillStyle = `rgb(${r},${g},${b})`;
                            visualizerCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                            
                            x += barWidth + 1;
                        }
                    }
                    
                    if (micStream) {
                        animationId = requestAnimationFrame(updateVolume);
                    }
                };
                updateVolume();
            } catch (err) {
                alert('Could not access microphone: ' + err.message);
            }
        }
    });

    // --- Speaker Test ---
    const btnSpeakerL = document.getElementById('btn-test-speaker-l');
    const btnSpeakerR = document.getElementById('btn-test-speaker-r');

    function playTone(panValue) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const panner = ctx.createStereoPanner();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 440; // A4
        
        panner.pan.value = panValue; // -1 for left, 1 for right
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

        oscillator.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1);
        
        setTimeout(() => ctx.close(), 1200);
    }

    btnSpeakerL.addEventListener('click', () => {
        playTone(-1);
    });

    btnSpeakerR.addEventListener('click', () => {
        playTone(1);
    });

    // --- Internet Speed Test ---
    const btnTestSpeed = document.getElementById('btn-test-speed');
    const speedResult = document.getElementById('speed-result');

    btnTestSpeed.addEventListener('click', async () => {
        btnTestSpeed.disabled = true;
        speedResult.textContent = 'Testing...';
        speedResult.style.color = 'var(--text-muted)';
        
        // Use a random image from picsum which has CORS enabled
        const testImageUrl = 'https://picsum.photos/2000/2000?random=' + new Date().getTime(); 

        const startTime = new Date().getTime();
        
        try {
            const response = await fetch(testImageUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const endTime = new Date().getTime();
            
            const durationInSeconds = (endTime - startTime) / 1000;
            const fileSizeInBytes = blob.size;
            
            // Convert to megabits
            const megabits = (fileSizeInBytes * 8) / (1024 * 1024);
            const mbps = (megabits / durationInSeconds).toFixed(2);
            
            speedResult.textContent = `${mbps} Mbps`;
            speedResult.style.color = 'var(--success)';
        } catch (error) {
            speedResult.textContent = 'Test Failed';
            speedResult.style.color = 'var(--danger)';
            console.error('Speed test error:', error);
        } finally {
            btnTestSpeed.disabled = false;
        }
    });

});
