document.addEventListener("DOMContentLoaded", () => {
  loadProperties();
  loadItemNames(); // Load item names when the page loads
  loadSuppliers(); // Load suppliers when the page loads
  document
    .getElementById("addPropertyForm")
    .addEventListener("submit", handleFormSubmit);
});

function showModal() {
  document.getElementById("propertyModal").style.display = "block";
}

function closeModal() {
  document.getElementById("propertyModal").style.display = "none";
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = document.getElementById("addPropertyForm");
  const formData = new FormData(form);

  fetch("api/add_property.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Read response as text
    })
    .then((text) => {
      try {
        const data = JSON.parse(text); // Parse JSON manually
        if (data.success) {
          alert("Property added successfully!");
          document.getElementById("qrCodeImage").src = data.qrCodePath;
          document.getElementById("qrCodeImage").style.display = "block";
          form.reset();
          loadProperties();
        } else {
          alert(data.message || "Failed to add property.");
        }
      } catch (error) {
        console.error("Invalid JSON:", text); // Log invalid JSON for debugging
        alert("An error occurred while processing the response.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(
        "An error occurred while processing the request. Check the console for details."
      );
    });
}

function loadProperties() {
  fetch("api/get_properties.php")
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

      document.getElementById(
        "totalItems"
      ).textContent = `Total Items: ${totalItems}`;
      document.getElementById(
        "totalAmount"
      ).textContent = `Total Amount: ${totalAmount.toFixed(2)}`;
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

  const response = await fetch("api/add_property.php", {
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

  const response = await fetch("api/add_property.php", {
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
  fetch("api/get_properties.php")
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

function loadSuppliers() {
  fetch("api/get_suppliers.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && Array.isArray(data.data)) {
        const supplierDropdown = document.getElementById("item_supplier"); // Ensure this ID matches in the HTML
        supplierDropdown.innerHTML =
          '<option value="">Select Supplier</option>'; // Reset options
        data.data.forEach((supplier) => {
          if (supplier) {
            // Ensure supplier is not empty
            const option = document.createElement("option");
            option.value = supplier;
            option.textContent = supplier;
            supplierDropdown.appendChild(option);
          }
        });
      } else {
        console.error(
          "Error loading suppliers:",
          data.message || "Invalid data format."
        );
      }
    })
    .catch((error) => console.error("Error loading suppliers:", error));
}

function addNewSupplier() {
  const newSupplier = prompt("Enter the name of the new supplier:");
  if (newSupplier) {
    fetch("api/add_supplier.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name: newSupplier }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Supplier added successfully!");
          loadSuppliers(); // Reload the supplier list
        } else {
          alert(data.message || "Failed to add supplier.");
        }
      })
      .catch((error) => console.error("Error adding supplier:", error));
  }
}

function loadItemNames() {
  fetch("api/get_item_names.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && Array.isArray(data.data)) {
        const itemDropdown = document.getElementById("item_name"); // Ensure this ID matches in the HTML
        itemDropdown.innerHTML = '<option value="">Select Item</option>'; // Reset options
        data.data.forEach((item) => {
          if (item) {
            // Ensure item is not empty
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            itemDropdown.appendChild(option);
          }
        });
      } else {
        console.error(
          "Error loading item names:",
          data.message || "Invalid data format."
        );
      }
    })
    .catch((error) => console.error("Error loading item names:", error));
}

function addNewItem() {
  const newItem = prompt("Enter the name of the new item:");
  if (newItem) {
    fetch("api/add_item.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name: newItem }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Item added successfully!");
          loadItemNames(); // Reload the item list
        } else {
          alert(data.message || "Failed to add item.");
        }
      })
      .catch((error) => console.error("Error adding item:", error));
  }
}
