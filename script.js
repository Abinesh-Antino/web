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
        populateTable(documents.reverse());
        showToast('Data fetched !');
    }).catch(error => {
        console.error(error);
        showToast('Something went wrong');
    });
}

function createLink(url) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const request = new Request(BASEURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url }),
        redirect: 'follow',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => getData())
        .catch(error => {
            console.error(error);
            showToast('Something went wrong');
        });
}


function deleteLink(id) {
    fetch(BASEURL + '/' + id, { method: 'DELETE' }).then(response => response.json()).then(data => getData()).catch(error => {
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
    tbody.innerHTML = ""; // Clear existing rows

    data.forEach((link, index) => {
        const row = document.createElement("tr");

        // Index Column
        const indexTd = document.createElement("td");
        indexTd.scope = "row";
        indexTd.textContent = index + 1;
        row.appendChild(indexTd);

        // Shortened URL Column
        const shortLinkTd = document.createElement("td");
        const shortLinkContainer = document.createElement("div");
        shortLinkContainer.classList.add("d-flex", "align-items-center", "justify-content-between", "w-100");

        const shortLink = document.createElement("a");
        shortLink.href = `${BASEURL}/${link.$id}`;
        shortLink.target = "_blank";
        shortLink.textContent = link.$id;

        // Copy Button
        const copyButton = document.createElement("button");
        copyButton.classList.add("btn", "btn-sm", "btn-outline-info");
        copyButton.innerHTML = '<i class="bi bi-copy"></i>'; // Bootstrap clipboard icon
        copyButton.addEventListener("click", () => copyToClipboard(shortLink.href));

        shortLinkContainer.appendChild(shortLink);
        shortLinkContainer.appendChild(copyButton);
        shortLinkTd.appendChild(shortLinkContainer);
        row.appendChild(shortLinkTd);

        // Original URL Column
        const originalLinkTd = document.createElement("td");
        const originalLink = document.createElement("a");
        originalLink.href = link.url;
        originalLink.target = "_blank";
        originalLink.textContent = link.url;
        originalLinkTd.appendChild(originalLink);
        row.appendChild(originalLinkTd);

        // Click Count Column
        const clicksTd = document.createElement("td");
        clicksTd.textContent = link.clicks ?? 0;
        row.appendChild(clicksTd);

        // Created Date Column
        const dateTd = document.createElement("td");
        dateTd.textContent = link.$createdAt;
        row.appendChild(dateTd);

        // Delete Button Column
        const deleteTd = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.addEventListener("click", () => deleteLink(link.$id));
        deleteTd.appendChild(deleteButton);
        row.appendChild(deleteTd);

        // Append Row to Table Body
        tbody.appendChild(row);
    });
}

// Function to Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast("Link copied to clipboard!"))
        .catch(err => console.error("Failed to copy text: ", err));
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