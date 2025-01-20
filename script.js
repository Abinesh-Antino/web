// Initialize tooltips for the buttons after the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    initializeTooltips();
});

// Select UI elements
const recordBtn = document.getElementById("recordBtn");
const durationDisplay = document.getElementById("duration");
const audioClips = document.getElementById("audioClips");

let mediaRecorder;
let audioChunks = [];
let timerInterval;
let elapsedTime = 0; // Time in seconds

// Initialize media recorder
async function initMediaRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        setUpMediaRecorderEvents();
    } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Error accessing microphone: " + error);
    }
}

// Set up media recorder events
function setUpMediaRecorderEvents() {
    mediaRecorder.onstart = startRecording;
    mediaRecorder.ondataavailable = collectAudioChunks;
    mediaRecorder.onstop = stopRecording;
}

// Start recording
function startRecording() {
    audioChunks = [];
    elapsedTime = 0;
    updateRecordButtonState('stop');
    startTimer();
}

// Collect audio chunks
function collectAudioChunks(event) {
    audioChunks.push(event.data);
}

// Stop recording
function stopRecording() {
    clearInterval(timerInterval); // Stop the timer when recording stops
    updateRecordButtonState('start');
    resetDurationDisplay();
    createAudioClip();
}

// Start the timer and update the duration display
function startTimer() {
    timerInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        durationDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Update the record button text and icon
function updateRecordButtonState(state) {
    if (state === 'stop') {
        recordBtn.innerHTML = '<i class="bi bi-mic-mute fs-1 d-block"></i> Stop Recording';
    } else {
        recordBtn.innerHTML = '<i class="bi bi-mic fs-1 d-block"></i> Start Recording';
    }
}

// Reset the duration display
function resetDurationDisplay() {
    durationDisplay.textContent = "00:00"; // Reset the duration display
}

// Create the audio clip with controls and buttons
function createAudioClip() {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = createAudioElement(audioUrl);
    const listItem = createListItem(audio, audioUrl);

    audioClips.appendChild(listItem);
}

// Create an audio element with the given URL
function createAudioElement(audioUrl) {
    const audio = document.createElement("audio");
    audio.src = audioUrl;
    audio.controls = true;
    audio.load();
    return audio;
}

// Create a list item with the audio and action buttons
function createListItem(audio, audioUrl) {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", 'align-items-center');
    listItem.appendChild(audio);

    const buttonsContainer = createButtonsContainer(audioUrl);
    listItem.appendChild(buttonsContainer);

    return listItem;
}

// Create the buttons container with delete and download buttons
function createButtonsContainer(audioUrl) {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("d-flex", "align-items-center");

    const deleteBtn = createDeleteButton(audioUrl);
    const downloadBtn = createDownloadButton(audioUrl);

    buttonsContainer.appendChild(deleteBtn);
    buttonsContainer.appendChild(downloadBtn);

    return buttonsContainer;
}

// Create the delete button
function createDeleteButton(audioUrl) {
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-danger", "ms-2");
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>'; // Trash icon
    deleteBtn.addEventListener("click", () => {
        deleteAudioClip(deleteBtn, audioUrl);
    });
    return deleteBtn;
}

// Create the download button
function createDownloadButton(audioUrl) {
    const downloadBtn = document.createElement("button");
    downloadBtn.classList.add("btn", "btn-success", "ms-2");
    downloadBtn.innerHTML = '<i class="bi bi-download"></i>'; // Download icon
    downloadBtn.addEventListener("click", () => {
        downloadAudio(audioUrl);
    });
    return downloadBtn;
}

// Delete the audio clip and release memory
function deleteAudioClip(deleteBtn, audioUrl) {
    const listItem = deleteBtn.closest("li");
    listItem.remove(); // Remove the audio clip from the list
    URL.revokeObjectURL(audioUrl); // Release the object URL to free memory
}

// Download the audio clip
function downloadAudio(audioUrl) {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "audio_clip.wav";
    a.click(); // Trigger download
}

// Initialize tooltips for the buttons
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(function (element) {
        new bootstrap.Tooltip(element);
    });
}

// Toggle start/stop recording
recordBtn.addEventListener("click", async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    } else {
        if (!mediaRecorder) await initMediaRecorder();
        mediaRecorder.start();
    }
});
