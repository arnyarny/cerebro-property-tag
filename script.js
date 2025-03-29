document.addEventListener("DOMContentLoaded", () => {
    loadProperties();
    document.getElementById("addPropertyForm").addEventListener("submit", handleFormSubmit);
});

function showModal() {
    document.getElementById("propertyModal").style.display = "block";
}

function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById("addPropertyForm");
    const formData = new FormData(form);

    fetch("add_property.php", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Property added successfully!");
                document.getElementById("qrCodeImage").src = data.qrCodePath;
                document.getElementById("qrCodeImage").style.display = "block";
                form.reset();
                loadProperties();
            } else {
                alert("Failed to add property.");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function loadProperties() {
    fetch("get_properties.php")
        .then((response) => response.json())
        .then((properties) => {
            const propertyList = document.getElementById("propertyList");
            propertyList.innerHTML = "";
            let totalItems = 0;
            let totalAmount = 0;

            properties.forEach((property) => {
                totalItems++;
                totalAmount += parseFloat(property.amount);

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${property.id}</td>
                    <td>${property.item_name}</td>
                    <td>${property.date}</td>
                    <td>${property.item_supplier}</td>
                    <td>${property.amount}</td>
                    <td>
                        <button class="edit-button" onclick="editProperty(${property.id})">Edit</button>
                        <button class="delete-button" onclick="deleteProperty(${property.id})">Delete</button>
                    </td>
                `;
                propertyList.appendChild(row);
            });

            document.getElementById("totalItems").textContent = `Total Items: ${totalItems}`;
            document.getElementById("totalAmount").textContent = `Total Amount: ${totalAmount.toFixed(2)}`;
        })
        .catch((error) => console.error("Error:", error));
}

let currentPage = 1;
let itemsPerPage = 10;

function changePage(direction) {
    const totalItems = document.querySelectorAll("#propertyList tr").length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    currentPage += direction;

    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;

    updatePagination();
}

function updatePagination() {
    const rows = document.querySelectorAll("#propertyList tr");
    const totalItems = rows.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    rows.forEach((row, index) => {
        row.style.display = index >= start && index < end ? "" : "none";
    });

    document.getElementById("currentPage").textContent = `Page ${currentPage}`;
    document.getElementById("totalPages").textContent = ` of ${totalPages}`;
}

function updateItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById("itemsPerPage").value, 10);
    currentPage = 1;
    updatePagination();
}

async function generateQRCode() {
    const itemName = document.getElementById("item_name").value;
    const date = document.getElementById("date").value;
    const itemSupplier = document.getElementById("item_supplier").value;
    const amount = document.getElementById("amount").value;

    if (!itemName || !date || !itemSupplier || !amount) {
        alert("Please fill in all fields before generating the QR code.");
        return;
    }

    const response = await fetch("add_property.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            generate_qr: true,
            item_name: itemName,
            date: date,
            item_supplier: itemSupplier,
            amount: amount,
        }),
    });

    const result = await response.json();

    if (result.success) {
        const qrCodeImage = document.getElementById("qrCodeImage");
        qrCodeImage.src = result.qrCodePath;
        qrCodeImage.style.display = "block";

        document.getElementById("propertyId").value = result.propertyId || 1;
    } else {
        alert("Failed to generate QR code.");
    }
}

async function saveProperty(event) {
    event.preventDefault();

    const itemName = document.getElementById("item_name").value;
    const date = document.getElementById("date").value;
    const itemSupplier = document.getElementById("item_supplier").value;
    const amount = document.getElementById("amount").value;
    const qrCodeImage = document.getElementById("qrCodeImage").src;
    const propertyId = document.getElementById("propertyId").value;

    if (
        !itemName ||
        !date ||
        !itemSupplier ||
        !amount ||
        !qrCodeImage ||
        !propertyId
    ) {
        alert("Please fill in all fields and generate the QR code before saving.");
        return;
    }

    const response = await fetch("add_property.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            save_property: true,
            item_name: itemName,
            date: date,
            item_supplier: itemSupplier,
            amount: amount,
            qr_code_base64: qrCodeImage,
            property_id: propertyId,
        }),
    });

    const result = await response.json();

    if (result.success) {
        alert("Property saved successfully! File saved at: " + result.filePath);
        location.reload();
    } else {
        alert("Failed to save property.");
    }
}

function fetchProperties() {
    fetch("get_properties.php")
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const propertyList = document.getElementById("propertyList");
            propertyList.innerHTML = "";

            data.forEach((property) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${property.id}</td>
                    <td>${property.item_name}</td>
                    <td>${property.date}</td>
                    <td>${property.item_supplier}</td>
                    <td>${property.amount}</td>
                    <td>
                        <button class="edit-button" onclick="editProperty(${property.id})">Edit</button>
                        <button class="delete-button" onclick="deleteProperty(${property.id})">Delete</button>
                    </td>
                `;
                propertyList.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching properties:", error);
        });
}
