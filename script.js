const BASEURL = 'https://67a0fda298c6dba5af94.appwrite.global';

document.addEventListener("DOMContentLoaded", () => {
    initializeTooltips();
    setupClipboardPaste();
    setupAutoPaste();
    populateTable();
    setupShortenButton();
    setUpTheme();
    getData();
});

const linksData = [];


function getData() {
    fetch(BASEURL).then(response => response.json()).then(data => {
        const urls = data.urls;
        const documents = urls['documents'] ?? [];
        populateTable(documents);
        showToast('Data fetched !');
    }).catch(error => {
        console.error(error);
        showToast('Something went wrong');
    });
}

function createLink(url) {
    fetch(BASEURL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url })
    }).then(response => response.json()).then(data => getData()).catch(error => {
        console.error(error);
        showToast('Something went wrong');
    });
}

/**
 * Initializes Bootstrap tooltips.
 */
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach(tooltip => new bootstrap.Tooltip(tooltip));
}

/**
 * Handles clipboard pasting when the user clicks the clipboard icon.
 */
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById("link").value = text;
    } catch (err) {
        console.error("Failed to read clipboard: ", err);
    }
}

/**
 * Sets up event listener for clipboard pasting on button click.
 */
function setupClipboardPaste() {
    const clipboardBtn = document.querySelector(".input-group-text");
    if (clipboardBtn) {
        clipboardBtn.addEventListener("click", pasteFromClipboard);
    }
}

/**
 * Handles auto-pasting from the clipboard when the toggle switch is enabled.
 */
async function autoPaste() {
    const autoPasteSwitch = document.querySelector(".form-check-input");
    if (autoPasteSwitch.checked) {
        await pasteFromClipboard();
    }
}

/**
 * Sets up event listener for auto-pasting on switch toggle.
 */
function setupAutoPaste() {
    const autoPasteSwitch = document.querySelector(".form-check-input");
    if (autoPasteSwitch) {
        autoPasteSwitch.addEventListener("change", autoPaste);
    }
}

/**
 * Populates the table dynamically from `linksData`.
 */
function populateTable(data = []) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach((link, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td scope="row">${index + 1}</td>
            <td><a href="${BASEURL}/${link.$id}" target="_blank">${link.$id}</a></td>
            <td><a href="${link.url}" target="_blank">${link.url}</a></td>
            <td>${link.clicks ?? 0}</td>
            <td>${link.$createdAt}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Handles the form submission and adds a new shortened link to the table.
 */
function setupShortenButton() {
    const shortenButton = document.getElementById("shorten");
    const linkInput = document.getElementById("link");

    shortenButton.addEventListener("click", (event) => {
        const originalUrl = linkInput.value.trim();
        if (!originalUrl) {
            showToast('Please enter a valid URL ');
            return;
        }

        createLink(originalUrl);

        // Clear input field
        linkInput.value = "";
    });
}

function setUpTheme() {
    const lightBtn = document.getElementById("light");
    const darkBtn = document.getElementById("dark");

    lightBtn.addEventListener("click", () => {
        toggleTheme("light");
        lightBtn.classList.add("active");
        darkBtn.classList.remove("active");
        showToast("Theme set to light");
    });
    darkBtn.addEventListener("click", () => {
        toggleTheme("dark");
        darkBtn.classList.add("active");
        lightBtn.classList.remove("active");
        showToast("Theme set to dark");
    });

}

function showToast(message = "Hello") {
    const toastEl = document.getElementById("toast");
    toastEl.querySelector(".toast-body").textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function toggleTheme(theme) {
    console.log(theme);

    document.querySelector('html').attributes["data-bs-theme"].value = theme;
}