document.addEventListener("DOMContentLoaded", () => {
  loadProperties();
  loadItemNames(); // Load item names when the page loads
  loadSuppliers(); // Load suppliers when the page loads
  document
    .getElementById("addPropertyForm")
    .addEventListener("submit", handleFormSubmit);
});

function showModal() {
  const form = document.getElementById("addPropertyForm");
  form.reset(); // Reset the form fields
  document.getElementById("propertyId").value = ""; // Clear the propertyId field
  document.getElementById("amount").removeAttribute("readonly"); // Ensure the amount field is editable
  document.getElementById("amount").removeAttribute("disabled"); // Ensure the amount field is not disabled
  document.querySelector(".modal-header h2").textContent = "Add Property"; // Set header to "Add Property"
  document.getElementById("propertyModal").style.display = "block";
}

function closeModal() {
  document.getElementById("propertyModal").style.display = "none";
}

function showDeleteModal(propertyId) {
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "block";
  document.getElementById("confirmDeleteButton").onclick = () => {
    deleteProperty(propertyId);
  };
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = document.getElementById("addPropertyForm");
  const formData = new FormData(form);
  const propertyId = document.getElementById("propertyId").value; // Check if propertyId exists

  const endpoint = propertyId
    ? "api/edit_property.php"
    : "api/add_property.php"; // Use appropriate endpoint

  fetch(endpoint, {
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
          alert(
            propertyId
              ? "Property updated successfully!"
              : "Property added successfully!"
          ); // Show appropriate message
          form.reset();
          loadProperties();
          closeModal(); // Close the modal after success
        } else {
          alert(data.message || "Failed to add/update property.");
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
                        <button class="delete-button" onclick="showDeleteModal(${property.id})">Delete</button>
                        <button class="qr-button" onclick="generateQRCode(${property.id})">Generate QR Code</button>
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
                        <button class="delete-button" onclick="showDeleteModal(${property.id})">Delete</button>
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
      const supplierDropdown = document.getElementById("item_supplier");
      supplierDropdown.innerHTML =
        '<option value="">Select Item Supplier</option>'; // Default option
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((supplier) => {
          if (supplier) {
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
      const itemDropdown = document.getElementById("item_name");
      itemDropdown.innerHTML = '<option value="">Select Item Name</option>'; // Default option
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          if (item) {
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

function sortProperties() {
  const sortBy = document.getElementById("sortClassification").value;
  const propertyList = document.getElementById("propertyList");
  const rows = Array.from(propertyList.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const getCellValue = (row, columnIndex) =>
      row.children[columnIndex].textContent.trim().toLowerCase();

    switch (sortBy) {
      case "name":
        return getCellValue(a, 1).localeCompare(getCellValue(b, 1));
      case "date":
        return new Date(getCellValue(a, 2)) - new Date(getCellValue(b, 2));
      case "supplier":
        return getCellValue(a, 3).localeCompare(getCellValue(b, 3));
      case "amount":
        return parseFloat(getCellValue(a, 4)) - parseFloat(getCellValue(b, 4));
      default:
        return 0; // No sorting if no valid option is selected
    }
  });

  // Clear the table and append sorted rows
  propertyList.innerHTML = "";
  rows.forEach((row) => propertyList.appendChild(row));
}

function editProperty(propertyId) {
  fetch(`api/get_property.php?id=${propertyId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const property = data.property;

        // Prefill the input fields
        document.getElementById("item_name").value = property.item_name;
        document.getElementById("date").value = new Date(property.date)
          .toISOString()
          .split("T")[0]; // Ensure date is in YYYY-MM-DD format
        document.getElementById("amount").value = parseFloat(
          property.amount
        ).toFixed(2); // Ensure amount is formatted correctly

        // Ensure the amount field is not readonly or disabled
        document.getElementById("amount").removeAttribute("readonly");
        document.getElementById("amount").removeAttribute("disabled");

        document.getElementById("propertyId").value = propertyId;

        // Prefill the supplier dropdown
        const supplierDropdown = document.getElementById("item_supplier");
        supplierDropdown.innerHTML = `<option value="${property.item_supplier}" selected>${property.item_supplier}</option>`;

        // Load all suppliers and ensure the current one is selected
        fetch("api/get_suppliers.php")
          .then((response) => response.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              supplierDropdown.innerHTML = ""; // Clear existing options
              data.data.forEach((supplier) => {
                const option = document.createElement("option");
                option.value = supplier;
                option.textContent = supplier;
                if (supplier === property.item_supplier) {
                  option.selected = true; // Mark the current supplier as selected
                }
                supplierDropdown.appendChild(option);
              });
            }
          });

        // Prefill the item dropdown
        const itemDropdown = document.getElementById("item_name");
        itemDropdown.innerHTML = `<option value="${property.item_name}" selected>${property.item_name}</option>`;

        // Load all items and ensure the current one is selected
        fetch("api/get_item_names.php")
          .then((response) => response.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              itemDropdown.innerHTML = ""; // Clear existing options
              data.data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                if (item === property.item_name) {
                  option.selected = true; // Mark the current item as selected
                }
                itemDropdown.appendChild(option);
              });
            }
          });

        // Set the modal header to "Edit Property"
        document.querySelector(".modal-header h2").textContent =
          "Edit Property";

        // Show the modal
        document.getElementById("propertyModal").style.display = "block";
      } else {
        alert(data.message || "Failed to fetch property details.");
      }
    })
    .catch((error) => console.error("Error fetching property:", error));
}

function deleteProperty(propertyId) {
  fetch(`api/delete_property.php?id=${propertyId}`, {
    method: "DELETE", // Use the id in the query string
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Property deleted successfully!");
        loadProperties();
        closeDeleteModal();
      } else {
        alert(data.message || "Failed to delete property.");
      }
    })
    .catch((error) => console.error("Error deleting property:", error));
}

function searchProperties() {
  const searchInput = document.getElementById("searchBar").value.toLowerCase();
  const rows = document.querySelectorAll("#propertyList tr");

  rows.forEach((row) => {
    const cells = Array.from(row.children);
    const matches = cells.some((cell) =>
      cell.textContent.toLowerCase().includes(searchInput)
    );
    row.style.display = matches ? "" : "none"; // Show row if it matches, hide otherwise
  });
}

function generateQRCode(propertyId) {
  if (!propertyId) {
    console.error("Invalid Property ID.");
    alert("Invalid Property ID.");
    return;
  }

  const timestamp = new Date().getTime(); // Add a unique timestamp to bypass cache

  fetch(`api/generate_qr.php?id=${propertyId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Parse JSON response
    })
    .then((data) => {
      if (data.image_url) {
        // Force browser to load the latest QR code by appending a timestamp
        const qrCodeContainer = document.getElementById("qrcode");
        qrCodeContainer.innerHTML = `<img src="${data.image_url}?t=${timestamp}" alt="QR Code" style="max-width: 100%; height: auto;">`;

        document.getElementById("qrCodeModal").style.display = "block";
        alert("QR code is successfully saved in the qr_codes folder!");
      } else {
        alert("Failed to generate QR code.");
      }
    })
    .catch((error) => {
      console.error("Error generating QR code:", error);
      alert("An error occurred while generating the QR code.");
    });
}


function closeQRCodeModal() {
  document.getElementById("qrCodeModal").style.display = "none";
}
