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
  document.getElementById("propertyModal").style.display = "flex";

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
  deleteModal.style.display = "flex";
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
              : "Property added successfully!",
            "success"
          );
          form.reset();
          loadProperties();
          closeModal(); // Close the modal after success
        } else {
          showToast(
            data.message || "Failed to add/update property.",
            "error",
            3000,
            true
          );
        }
      } catch (error) {
        console.error("Invalid JSON:", text); // Log invalid JSON for debugging
        showToast(
          "An error occurred while processing the response.",
          "error",
          3000,
          true
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast(
        "An error occurred while processing the request. Check the console for details.",
        "error",
        3000,
        true
      );
    });
}

function loadProperties() {
  fetch("api/get_properties.php")
    .then((response) => response.json())
    .then((properties) => {
      const propertyList = document.getElementById("propertyList"); // table rows
      const propertyCardList = document.getElementById("propertyCardList"); // mobile cards
      propertyList.innerHTML = "";
      propertyCardList.innerHTML = "";
      let totalItems = 0;
      let totalAmount = 0;

      properties.forEach((property) => {
        totalItems++;
        totalAmount += parseFloat(property.amount);

        // TABLE ROW (Desktop)
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-6 text-sm">
            <input type="checkbox" class="property-checkbox" value="${property.id}" onchange="updateSelectAllCheckboxState()">
          </td>
          <td class="p-2 text-sm">${property.id}</td>
          <td class="p-2 text-sm">${property.item_name}</td>
          <td class="p-2 text-sm">${property.date}</td>
          <td class="p-2 text-sm">${property.item_supplier}</td>
          <td class="p-2 text-sm">${property.amount}</td>
          <td>
            <div class="flex space-x-2">
            <button class="qr-button bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base" onclick="generateQRCode(${property.id})">
  Generate QR Code
</button>
<button class="edit-button bg-[#0671B7] hover:bg-[#0565A4] text-white px-4 py-2 rounded text-base" onclick="editProperty(${property.id})">
  Edit
</button>
<button class="delete-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-base" onclick="showDeleteModal(${property.id})">
  Delete
</button>

            </div>
          </td>
        `;
        propertyList.appendChild(row);

        // CARD (Mobile)
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow-md p-4 relative";

        card.innerHTML = `
  <!-- Select Toggle -->
  <div class="absolute top-3 left-5 flex items-center space-x-5">
    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" class="toggle-checkbox hidden" data-id="${property.id}">
      <span class="toggle-label w-10 h-5 bg-gray-300 rounded-full flex items-center justify-between p-1 transition-colors"></span>
    </label>
  </div>

  <button onclick="editProperty(${property.id})" class="absolute top-3 right-5 text-[#0671B7] hover:text-[#0565A4]">
  <i class="fas fa-pen"></i>
</button>

  <!-- Main Info -->
  <div class="text-gray-700 mb-4 mt-6">
    <p><span class="font-semibold">ID:</span> ${property.id}</p>
    <p><span class="font-semibold">Item:</span> ${property.item_name}</p>
    <p><span class="font-semibold">Date:</span> ${property.date}</p>
    <p><span class="font-semibold">Supplier:</span> ${property.item_supplier}</p>
    <p><span class="font-semibold">Amount:</span> ₱${property.amount}</p>
  </div>

  <!-- Actions -->
  <div class="flex flex-col gap-2">
    <button class="qr-button bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded" onclick="generateQRCode(${property.id})">Generate QR Code</button>
    <button class="delete-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" onclick="showDeleteModal(${property.id})">Delete</button>
  </div>
`;

        propertyCardList.appendChild(card);
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
          showToast("Supplier added successfully!", "success");

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
          showToast(
            data.message || "Failed to add supplier.",
            "error",
            3000,
            true
          );
        }
      })
      .catch((error) => {
        console.error("Error adding supplier:", error);
        showToast(
          "An error occurred while processing the request.",
          "error",
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
          showToast("Item added successfully!", "success");

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
          showToast(data.message || "Failed to add item.", "error", 3000, true);
        }
      })
      .catch((error) => {
        console.error("Error adding item:", error);
        showToast(
          "An error occurred while processing the request.",
          "error",
          3000,
          true
        );
      });
  }
}

function sortProperties() {
  const sortBy = document.getElementById("sortBy").value;
  const isMobile = window.innerWidth <= 768;
  const propertyContainer = document.getElementById(
    isMobile ? "propertyCardList" : "propertyList"
  );

  const rowsOrCards = Array.from(propertyContainer.children);

  const getCellValue = (element, columnIndex) => {
    if (isMobile) {
      const text = element.querySelectorAll("p")[columnIndex].textContent;
      const value = text.split(":")[1].trim().toLowerCase();

      // For amount column, clean it up (remove ₱, commas)
      if (sortBy.includes("amount")) {
        return value.replace(/[₱,]/g, "");
      }

      return value;
    } else {
      return element.children[columnIndex].textContent.trim().toLowerCase();
    }
  };

  rowsOrCards.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return getCellValue(a, 1).localeCompare(getCellValue(b, 1));
      case "name_desc":
        return getCellValue(b, 1).localeCompare(getCellValue(a, 1));
      case "date_newest":
        return new Date(getCellValue(b, 2)) - new Date(getCellValue(a, 2));
      case "date_oldest":
        return new Date(getCellValue(a, 2)) - new Date(getCellValue(b, 2));
      case "amount_low_high":
        return parseFloat(getCellValue(a, 4)) - parseFloat(getCellValue(b, 4));
      case "amount_high_low":
        return parseFloat(getCellValue(b, 4)) - parseFloat(getCellValue(a, 4));
      default:
        return 0;
    }
  });

  // Re-render the sorted elements
  propertyContainer.innerHTML = "";
  rowsOrCards.forEach((el) => propertyContainer.appendChild(el));
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
        document.getElementById("propertyModal").style.display = "flex";
      } else {
        showToast(
          data.message || "Failed to fetch property details.",
          "error",
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
        showToast("Property deleted successfully!", "success");
        loadProperties();
        closeDeleteModal();
      } else {
        showToast(
          data.message || "Failed to delete property.",
          "error",
          3000,
          true
        );
      }
    })
    .catch((error) => console.error("Error deleting property:", error));
}

function searchProperties() {
  const searchInput = document.getElementById("searchBar").value.toLowerCase();
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const cards = document.querySelectorAll("#propertyCardList > div"); // Each card is a div
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchInput) ? "" : "none";
    });
  } else {
    const rows = document.querySelectorAll("#propertyList tr");
    rows.forEach((row) => {
      const cells = Array.from(row.children);
      const matches = cells.some((cell) =>
        cell.textContent.toLowerCase().includes(searchInput)
      );
      row.style.display = matches ? "" : "none";
    });
  }
}

function closeQRModal() {
  document.getElementById("qrModal").classList.add("hidden");
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
    showToast("No properties selected.", "error", 3000, true);
    return;
  }

  // Open a new page or perform an action with the selected IDs
  window.open(`bulk_print_qr.html?ids=${selectedIds.join(",")}`, "_blank");
}

function generateBulkMobileQRCodes() {
  // Select both regular checkboxes (desktop) and toggle checkboxes (mobile)
  const checkboxes = document.querySelectorAll(
    ".property-checkbox:checked, .toggle-checkbox:checked"
  );

  // Map the selected checkboxes to their IDs using the 'data-id' attribute
  const selectedIds = Array.from(checkboxes).map(
    (checkbox) => checkbox.dataset.id
  );

  // Check if no properties are selected
  if (selectedIds.length === 0) {
    showToast("No properties selected.", "error", 3000, true);
    return;
  }

  // Open a new page or perform an action with the selected IDs
  const url = `bulk_print_qr.html?ids=${selectedIds.join(",")}`;
  window.open(url, "_blank");
}

function handleBulkQRCodesClick() {
  // Check if the screen width is less than 768px (Mobile View)
  if (window.innerWidth < 768) {
    generateBulkMobileQRCodes(propertyId); // Call the mobile version
  } else {
    generateBulkQRCodes(propertyId); // Call the desktop version
  }
}

function generateQRCode(id) {
  if (!id) {
    alert("Invalid property ID.");
    return;
  }

  // Show the QR modal
  const qrModal = document.getElementById("qrModal");
  const qrImage = document.getElementById("qrImage");
  const printButton = document.getElementById("printQRCodeBtn");

  qrImage.src = `api/generate_qr.php?id=${id}`;
  qrModal.classList.remove("hidden");

  printButton.onclick = () => {
    window.open(`single_qr.html?id=${id}`, "_blank");
  };
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

  updateSelectAllCheckboxState(); // Ensure the select-all checkbox state is updated after toggling
}

function updateSelectAllCheckboxState() {
  const checkboxes = document.querySelectorAll(".property-checkbox");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  console.log("checkboxes", checkboxes);
  console.log("selectAllCheckbox", selectAllCheckbox);

  const visibleCheckboxes = Array.from(checkboxes).filter((checkbox) => {
    const row = checkbox.closest("tr") || checkbox.closest(".bg-white");
    return row && row.style.display !== "none";
  });

  const checkedCount = visibleCheckboxes.filter(
    (checkbox) => checkbox.checked
  ).length;
  const totalVisible = visibleCheckboxes.length;

  const isAllChecked = checkedCount === totalVisible && totalVisible > 0;

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = isAllChecked;
    selectAllCheckbox.indeterminate =
      checkedCount > 0 && checkedCount < totalVisible; // Keep indeterminate for desktop
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  const background = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500 text-black",
  }[type];

  toast.className = `${background} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-2 w-full max-w-xs animate-slide-in-right`;
  toast.innerHTML = `
    <span class="text-sm font-medium">${message}</span>
    <button class="text-white hover:text-gray-200 text-lg leading-none" onclick="this.parentElement.remove()">&times;</button>
  `;

  document.getElementById("toastContainer").appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
