let dataLoaded = false;

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvqHir6yYMKMmiAwA8a1JgWcliwhHqKyM31eQPcse-Nq6qJyRz6" +
    "3PQPg-bkyfWrbfiIVYcVVicrljy/pub?gid=1699150383&single=true&output=tsv";

let resources = [];

const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");

function parseTSVRow(row) {
    const result = [];
    let current = "";

    for (const char of row) {
        if (char === "\t") {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function createResourceCard(resource) {
    return `
        <div>
            <h3>${resource.agencyName}</h3>

            <p>
                <strong>Category:</strong>
                ${resource.category}
            </p>

            <p>
                <strong>Serves:</strong>
                ${resource.cityCountyServed}
            </p>

            <p>
                <strong>Phone:</strong>
                ${resource.phoneNumber}
            </p>

            <p>
                <strong>Address:</strong>
                ${resource.streetAddress}
            </p>

            <p>
                <strong>Hours:</strong>
                ${resource.officeHours}
            </p>

            <p>
                ${resource.serviceScope}
            </p>

        </div>
    `;
}

function displayResources(resourceList) {
    const container = document.getElementById("resourceContainer");

    let html = "";

    for (const resource of resourceList) {
        html += createResourceCard(resource);
    }

    container.innerHTML = html;
}

let searchTimeout;

searchBox.addEventListener("input", function () {

    if (!dataLoaded) return;

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        const searchText = searchBox.value.toLowerCase();

        const filteredResources = resources.filter(resource =>
            (resource.searchIndex || "").includes(searchText)
        );

        displayResources(filteredResources);

    }, 120);
});

const container = document.getElementById("resourceContainer");

container.innerHTML = "";
displayResources(resources);

fetch(sheetUrl)
    .then(response => response.text())
    .then(csvText => {

        const rows = csvText
            .split("\n")
            .map(r => r.trim())
            .filter(r => r.length > 0);

        const headers = parseTSVRow(rows[0]);

        resources = [];

        for (let i = 1; i < rows.length; i++) {

            const values = parseTSVRow(rows[i]);
            const rowObj = {};

            for (let j = 0; j < headers.length; j++) {
                rowObj[headers[j]] = values[j] || "";
            }

            const resource = {
                agencyName: rowObj["Agency Name"],
                cityCountyServed: rowObj["City/County Served"],
                phoneNumber: rowObj["Phone Number"],
                streetAddress: rowObj["Street Address"],
                officeHours: rowObj["Office Hours"],
                website: rowObj["Official Website / Contact Link"],
                category: rowObj["Original Category Group"],
                serviceScope: rowObj["Full Service Scope & Client Criteria"]
            };

            resource.searchIndex = (
                resource.agencyName + " " +
                resource.cityCountyServed + " " +
                resource.phoneNumber + " " +
                resource.streetAddress + " " +
                resource.officeHours + " " +
                resource.website + " " +
                resource.category + " " +
                resource.serviceScope
            ).toLowerCase();

            resources.push(resource);
        }

        displayResources(resources);
        dataLoaded = true;
    });