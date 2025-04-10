document.addEventListener("DOMContentLoaded", () => {
  loadProperties();
  loadItemNames(); // Load item names when the page loads
  loadSuppliers(); // Load suppliers when the page loads
  document
    .getElementById("addPropertyForm")
    .addEventListener("submit", handleFormSubmit);

  document.getElementById("sortBy").value = "default"; // Default sorting by name ascending
  sortProperties(); // Apply the default sorting
});

function showModal() {
  const form = document.getElementById("addPropertyForm");
  form.reset();
  document.getElementById("propertyId").value = "";
  document.getElementById("amount").removeAttribute("readonly");
  document.getElementById("amount").removeAttribute("disabled");
  document.querySelector(".modal-header h2").textContent = "Add Property";
  document.getElementById("propertyModal").style.display = "block";

  // Reset dropdowns
  const supplierDropdown = document.getElementById("item_supplier");
  supplierDropdown.innerHTML = '<option value="">Select Item Supplier</option>';
  loadSuppliers(); // repopulate suppliers fresh

  const itemDropdown = document.getElementById("item_name");
  itemDropdown.innerHTML = '<option value="">Select Item Name</option>';
  loadItemNames(); // repopulate items fresh
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
          showToast(
            propertyId
              ? "Property updated successfully!"
              : "Property added successfully!"
          );
          form.reset();
          loadProperties();
          closeModal(); // Close the modal after success
        } else {
          showToast(
            data.message || "Failed to add/update property.",
            3000,
            true
          );
        }
      } catch (error) {
        console.error("Invalid JSON:", text); // Log invalid JSON for debugging
        showToast(
          "An error occurred while processing the response.",
          3000,
          true
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast(
        "An error occurred while processing the request. Check the console for details.",
        3000,
        true
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
          <td data-label="Select"><input type="checkbox" class="property-checkbox" value="${property.id}" onchange="updateSelectAllCheckboxState()"></td>
          <td data-label="ID">${property.id}</td>
          <td data-label="Item Name">${property.item_name}</td>
          <td data-label="Date Purchased">${property.date}</td>
          <td data-label="Supplier">${property.item_supplier}</td>
          <td data-label="Amount">${property.amount}</td>
          <td data-label="Actions">
               <div class="action-buttons">
          <button class="qr-button" onclick="generateQRCode(${property.id})">Generate QR Code</button>
          <button class="edit-button" onclick="editProperty(${property.id})">Edit</button>
          <button class="delete-button" onclick="showDeleteModal(${property.id})">Delete</button>
      </div>
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

  // Calculate the new current page
  const newPage = currentPage + direction;

  // Only update currentPage if newPage is within bounds
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
  }

  // Disable the previous button if on the first page
  document.getElementById("prevPage").disabled = currentPage === 1;

  // Disable the next button if on the last page
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // Uncheck all checkboxes and the select all checkbox
  const checkboxes = document.querySelectorAll(
    "#propertyList input.property-checkbox"
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false; // Uncheck individual checkboxes
  });

  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false; // Uncheck the "Select All" checkbox
    selectAllCheckbox.indeterminate = false; // Remove indeterminate state
  }

  // Update the pagination display
  updatePagination();

  // Update the "Select All" checkbox state after changing pages
  updateSelectAllCheckboxState();
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
  // Get the new items per page value
  itemsPerPage = parseInt(document.getElementById("itemsPerPage").value, 10);

  // Calculate the total number of items
  const totalItems = document.querySelectorAll("#propertyList tr").length;

  // Calculate the new total pages based on the updated items per page
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page if the new items per page is set
  currentPage = 1;

  // Disable the previous button if on the first page
  document.getElementById("prevPage").disabled = currentPage === 1;

  // Disable the next button if there are no more pages
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // Uncheck the 'Select All' checkbox
  document.getElementById("selectAllCheckbox").checked = false;

  // Uncheck all individual checkboxes in the current page
  const checkboxes = document.querySelectorAll(
    '#propertyList input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => (checkbox.checked = false));

  // Update the pagination display
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
            <td data-label="ID">${property.id}</td>
            <td data-label="Item Name">${property.item_name}</td>
            <td data-label="Date">${property.date}</td>
            <td data-label="Supplier">${property.item_supplier}</td>
            <td data-label="Amount">${property.amount}</td>
            <td data-label="Actions">
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
          showToast("Supplier added successfully!");

          // Get the supplier dropdown
          const supplierDropdown = document.getElementById("item_supplier");

          // Create a new option for the added supplier
          const option = document.createElement("option");
          option.value = newSupplier; // Set the value
          option.textContent = newSupplier; // Set the displayed text

          // Append the new option to the dropdown
          supplierDropdown.appendChild(option);

          // Optionally, reset the dropdown to select the newly added supplier
          supplierDropdown.value = newSupplier;

          // Load suppliers to ensure consistency
          // loadSuppliers(); // Uncomment if you want to refresh the entire list
        } else {
          showToast(data.message || "Failed to add supplier.", 3000, true);
        }
      })
      .catch((error) => {
        console.error("Error adding supplier:", error);
        showToast(
          "An error occurred while processing the request.",
          3000,
          true
        );
      });
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
          showToast("Item added successfully!");

          // Get the item dropdown
          const itemDropdown = document.getElementById("item_name");

          // Create a new option for the added item
          const option = document.createElement("option");
          option.value = newItem; // Set the value
          option.textContent = newItem; // Set the displayed text

          // Append the new option to the dropdown
          itemDropdown.appendChild(option);

          // Optionally, reset the dropdown to select the newly added item
          itemDropdown.value = newItem;

          // Load item names to ensure consistency
          // loadItemNames(); // Uncomment if you want to refresh the entire list
        } else {
          showToast(data.message || "Failed to add item.", 3000, true);
        }
      })
      .catch((error) => {
        console.error("Error adding item:", error);
        showToast(
          "An error occurred while processing the request.",
          3000,
          true
        );
      });
  }
}

function sortProperties() {
  const sortBy = document.getElementById("sortBy").value; // Change to get the new sortBy value
  const propertyList = document.getElementById("propertyList");

  // Convert rows to an array for sorting
  const rows = Array.from(propertyList.querySelectorAll("tr"));

  // Sort the rows based on the selected criteria
  rows.sort((a, b) => {
    const getCellValue = (row, columnIndex) =>
      row.children[columnIndex].textContent.trim().toLowerCase();

    switch (sortBy) {
      case "name_asc":
        return getCellValue(a, 2).localeCompare(getCellValue(b, 2)); // Item Name
      case "name_desc":
        return getCellValue(b, 2).localeCompare(getCellValue(a, 2)); // Item Name
      case "date_newest":
        return new Date(getCellValue(b, 3)) - new Date(getCellValue(a, 3)); // Date
      case "date_oldest":
        return new Date(getCellValue(a, 3)) - new Date(getCellValue(b, 3)); // Date
      case "amount_low_high":
        return parseFloat(getCellValue(a, 5)) - parseFloat(getCellValue(b, 5)); // Amount
      case "amount_high_low":
        return parseFloat(getCellValue(b, 5)) - parseFloat(getCellValue(a, 5)); // Amount
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
        showToast(
          data.message || "Failed to fetch property details.",
          3000,
          true
        );
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
        showToast("Property deleted successfully!");
        loadProperties();
        closeDeleteModal();
      } else {
        showToast(data.message || "Failed to delete property.", 3000, true);
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

function closeQRCodeModal() {
  document.getElementById("qrCodeModal").style.display = "none";
}

function showToast(message, duration = 3000) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function generateBulkQRCodes() {
  const checkboxes = document.querySelectorAll(".property-checkbox:checked");
  const selectedIds = Array.from(checkboxes).map((checkbox) => checkbox.value);

  if (selectedIds.length === 0) {
    showToast("No properties selected.");
    return;
  }

  // Open a new page or perform an action with the selected IDs
  window.open(`bulk_print_qr.html?ids=${selectedIds.join(",")}`, "_blank");
}

function generateQRCode(id) {
  if (!id) {
    alert("Invalid property ID.");
    return;
  }

  // Open the single_qr.html page with the property ID as a query parameter
  window.open(`single_qr.html?id=${id}`, "_blank");
}

function toggleSelectAll(selectAllCheckbox) {
  // Get all checkboxes within the property list
  const checkboxes = document.querySelectorAll(
    "#propertyList input[type='checkbox']"
  );

  // Iterate over checkboxes and set their checked state based on the "Select All" checkbox
  checkboxes.forEach((checkbox) => {
    // Check if the checkbox is visible (not hidden)
    if (checkbox.closest("tr").style.display !== "none") {
      checkbox.checked = selectAllCheckbox.checked; // Set the checked state to match the "Select All" checkbox
    }
  });
}

function updateSelectAllCheckboxState() {
  const checkboxes = document.querySelectorAll(
    "#propertyList input.property-checkbox"
  );
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  // Only consider visible checkboxes (e.g., after pagination or search)
  const visibleCheckboxes = Array.from(checkboxes).filter((checkbox) => {
    const row = checkbox.closest("tr");
    return row && row.style.display !== "none"; // Only visible rows
  });

  const checkedCount = visibleCheckboxes.filter(
    (checkbox) => checkbox.checked
  ).length;
  const totalVisible = visibleCheckboxes.length;

  if (selectAllCheckbox) {
    selectAllCheckbox.checked =
      checkedCount === totalVisible && totalVisible > 0; // Check if all are checked
    selectAllCheckbox.indeterminate =
      checkedCount > 0 && checkedCount < totalVisible; // Indeterminate if some are checked
  }
}
