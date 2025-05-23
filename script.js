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

function toggleDropdown() {
  const dropdown = document.getElementById("masterlist-dropdown");
  dropdown.classList.toggle("hidden");

  const icon = document.getElementById("arrow-icon");
  icon.classList.toggle("rotate-180");
}

// Prevent closing dropdown when clicking on Items or Suppliers
document.querySelectorAll('#masterlist-dropdown a').forEach(item => {
  item.addEventListener('click', function(e) {
    // Prevent click from closing the dropdown
    e.stopPropagation();
  });
});

function showModal() {
  console.log("showModal function called"); // Debugging log
  const form = document.getElementById("addPropertyForm");
  form.reset();
  document.getElementById("propertyId").value = "";
  document.getElementById("amount").removeAttribute("readonly");
  document.getElementById("amount").removeAttribute("disabled");
  document.querySelector(".modal-header h2").textContent = "Add Property";

  const modal = document.getElementById("propertyModal");
  modal.style.display = "flex";

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

function showDeletePropertyModal(propertyId) {
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

const amountInput = document.getElementById("amount");

amountInput.addEventListener("keydown", function (e) {
  // Block the minus key
  if (e.key === "-" || e.key === "Minus") {
    e.preventDefault();
  }
});

amountInput.addEventListener("input", function () {
  // Just in case someone pastes a negative number
  if (parseFloat(amountInput.value) < 0) {
    amountInput.value = "";
  }
});

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
          <td class="p-2 text-sm">${property.purchased_date}</td>
          <td class="p-2 text-sm">${property.depreciation_date}</td> 
          <td class="p-2 text-sm">${property.item_supplier}</td>
          <td class="p-2 text-sm">${property.amount}</td>
          <td>
            <div class="flex space-x-2">
            <button class="qr-button bg-[#0671B7] hover:bg-[#1C78B2] text-white px-4 py-2 rounded text-base" onclick="generateQRCode(${property.id})">
  Generate QR Code
</button>
<button class="edit-button bg-white text-[#0671B7] border border-[#0671B7] hover:bg-[#0671B7] hover:text-white px-4 py-2 rounded text-base" onclick="editProperty(${property.id})">
  Edit
</button>
<button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="showDeletePropertyModal(${property.id})">
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
<!-- Circular Tappable Toggle for Mobile with Centered FontAwesome Check Icon -->
<div class="absolute top-3 left-5 flex items-center space-x-3">
  <label class="inline-flex items-center cursor-pointer">
    <!-- Use the 'toggle-checkbox' class to target the checkbox -->
    <input type="checkbox" class="toggle-checkbox sr-only peer" data-id="${property.id}" />
    <div class="w-6 h-6 rounded-full bg-white border border-gray-300 peer-checked:bg-[#0671B7] peer-checked:border-none transition-colors duration-300 shadow-inner peer-checked:shadow-[#0671B7]/50 relative">
      <!-- FontAwesome Check Icon (Centered) -->
      <i class="fa fa-check text-white text-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 peer-checked:block hidden"></i>
    </div>
  </label>
</div>


  <button onclick="editProperty(${property.id})" class="absolute top-3 right-5 text-[#0671B7] hover:text-[#1C78B2]">
  <i class="fas fa-pen"></i>
</button>

  <!-- Main Info -->
  <div class="text-gray-700 mb-4 mt-6 pt-3">
    <p><span class="font-semibold">ID:</span> ${property.id}</p>
    <p><span class="font-semibold">Item:</span> ${property.item_name}</p>
    <p><span class="font-semibold">Purchased Date:</span> ${property.purchased_date}</p>
    <p><span class="font-semibold">Depreciation Date:</span> ${property.depreciation_date}</p>
    <p><span class="font-semibold">Supplier:</span> ${property.item_supplier}</p>
    <p><span class="font-semibold">Amount:</span> ₱${property.amount}</p>
  </div>

  <!-- Actions -->
  <div class="flex flex-col gap-2">
    <button class="bg-[#0671B7] hover:bg-[#1C78B2] text-white px-4 py-2 rounded text-base" onclick="generateQRCode(${property.id})">Generate QR Code</button>
    <button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="showDeletePropertyModal(${property.id})">Delete</button>
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

      // Call updatePagination AFTER rows are added
      updatePagination("properties");
    })
    .catch((error) => console.error("Error:", error));
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
          loadSupplier(); // Uncomment if you want to refresh the entire list
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

function sortProperties() {
  const sortBy = document.getElementById("sortBy").value;
  const isMobile = window.innerWidth <= 768;
  const propertyContainer = document.getElementById(
    isMobile ? "propertyCardList" : "propertyList"
  );

  const rowsOrCards = Array.from(propertyContainer.children);

  const getCellValue = (element, columnIndex) => {
    if (isMobile) {
      const pTags = element.querySelectorAll("p");
      if (!pTags[columnIndex]) return "";

      const text = pTags[columnIndex].textContent;
      const value = text.split(":")[1]?.trim().toLowerCase() || "";

      return value;
    } else {
      const cell = element.children[columnIndex];
      return cell?.textContent.trim().toLowerCase() || "";
    }
  };

  rowsOrCards.sort((a, b) => {
    // Map correct column indexes based on screen size
    const nameIndex = isMobile ? 1 : 2;
    const dateIndex = isMobile ? 2 : 3;

    switch (sortBy) {
      case "name_asc":
        return getCellValue(a, nameIndex).localeCompare(
          getCellValue(b, nameIndex)
        );
      case "name_desc":
        return getCellValue(b, nameIndex).localeCompare(
          getCellValue(a, nameIndex)
        );
      case "date_newest":
        return (
          new Date(getCellValue(b, dateIndex)) -
          new Date(getCellValue(a, dateIndex))
        );
      case "date_oldest":
        return (
          new Date(getCellValue(a, dateIndex)) -
          new Date(getCellValue(b, dateIndex))
        );
      default:
        return 0;
    }
  });

  propertyContainer.innerHTML = "";
  rowsOrCards.forEach((el) => propertyContainer.appendChild(el));
}

function sortItems() {
  const sortBy = document.getElementById("itemSortBy").value;
  const isMobile = window.innerWidth <= 768;
  const itemContainer = document.getElementById(
    isMobile ? "itemCardList" : "itemList"
  );
  const elements = Array.from(itemContainer.children);

  const getCellValue = (element, columnIndex) => {
    if (isMobile) {
      const text = element.querySelectorAll("p")[columnIndex].textContent;
      const value = text.split(":")[1].trim().toLowerCase();
      return value;
    } else {
      return element.children[columnIndex].textContent.trim().toLowerCase();
    }
  };

  elements.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return getCellValue(a, 1).localeCompare(getCellValue(b, 1));
      case "name_desc":
        return getCellValue(b, 1).localeCompare(getCellValue(a, 1));
      default:
        return 0;
    }
  });

  // Re-render the sorted elements
  itemContainer.innerHTML = "";
  elements.forEach((el) => itemContainer.appendChild(el));
}

function sortSuppliers() {
  const sortBy = document.getElementById("supplierSortBy").value;
  const isMobile = window.innerWidth <= 768;
  const supplierContainer = document.getElementById(
    isMobile ? "supplierCardList" : "supplierList"
  );

  const elements = Array.from(supplierContainer.children);

  const getCellValue = (element, columnIndex) => {
    if (isMobile) {
      const text = element.querySelectorAll("p")[columnIndex].textContent;
      return text.split(":")[1].trim().toLowerCase();
    } else {
      return element.children[columnIndex].textContent.trim().toLowerCase();
    }
  };

  elements.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return getCellValue(a, 1).localeCompare(getCellValue(b, 1));
      case "name_desc":
        return getCellValue(b, 1).localeCompare(getCellValue(a, 1));
      default:
        return 0;
    }
  });

  supplierContainer.innerHTML = "";
  elements.forEach((el) => supplierContainer.appendChild(el));
}

function editProperty(propertyId) {
  fetch(`api/get_property.php?id=${propertyId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const property = data.property;

        // Prefill the input fields
        document.getElementById("item_name").value = property.item_name;
        document.getElementById("purchased_date").value = new Date(
          property.purchased_date
        )
          .toISOString()
          .split("T")[0]; // Ensure date is in YYYY-MM-DD format
        document.getElementById("depreciation_date").value = new Date(
          property.depreciation_date
        )
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

        // Prefill the supplier input
        const supplierInput = document.getElementById("item_supplier");
        supplierInput.value = property.item_supplier;

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

function showItemModal(item = null) {
  const form = document.getElementById("itemForm");
  form.reset(); // Clear the form
  const modal = document.getElementById("itemModal");
  const modalTitle = modal.querySelector(".modal-header h2");

  if (item) {
    // Edit mode
    modalTitle.textContent = "Edit Item";
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemId").value = item.item_id;
  } else {
    // Add mode
    modalTitle.textContent = "Add Item";
    document.getElementById("itemId").value = "";
  }

  modal.classList.remove("hidden"); // Show modal
}

function editItem(itemId) {
  fetch(`api/get_item.php?id=${itemId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showItemModal(data.item); // Use the reusable function
      } else {
        showToast(data.message || "Failed to fetch item details.", "error");
      }
    })
    .catch((error) => console.error("Error fetching item:", error));
}

function addNewItem() {
  showItemModal(); // Show the modal with no pre-filled data (Add mode)
}

function saveItem() {
  const itemId = document.getElementById("itemId").value;
  const itemName = document.getElementById("itemName").value;

  const endpoint = itemId ? "api/edit_item.php" : "api/add_item.php";

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      itemId,
      name: itemName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(
          itemId ? "Item updated successfully." : "Item added successfully.",
          "success"
        );
        closeItemModal();
        loadItems(); // Refresh list
      } else {
        showToast(data.message || "Failed to save item.", "error");
      }
    })
    .catch((error) => console.error("Error saving item:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("itemForm").addEventListener("submit", function (e) {
    e.preventDefault();
    saveItem();
  });
});

// Function to close the modal
function closeItemModal() {
  const modal = document.getElementById("itemModal");
  modal.classList.add("hidden");
}

function showSupplierModal(supplier = null) {
  const form = document.getElementById("editSupplierForm");
  form.reset(); // Clear the form
  const modal = document.getElementById("supplierModal");
  const modalTitle = modal.querySelector(".modal-header h2");

  if (supplier) {
    // Edit mode
    modalTitle.textContent = "Edit Supplier";
    document.getElementById("supplierName").value = supplier.name;
    document.getElementById("supplierId").value = supplier.supplier_id;
  } else {
    // Add mode
    modalTitle.textContent = "Add Supplier";
    document.getElementById("supplierId").value = "";
  }

  modal.classList.remove("hidden"); // Show modal
}

function addNewSupplier() {
  showSupplierModal(); // Show empty modal for new supplier
}

function editSupplier(supplierId) {
  fetch(`api/get_supplier_edit.php?id=${supplierId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSupplierModal(data.supplier);
      } else {
        showToast(data.message || "Failed to fetch supplier details.", "error");
      }
    })
    .catch((error) => {
      console.error("Error fetching supplier:", error);
    });
}

function saveSupplier() {
  const supplierId = document.getElementById("supplierId").value;
  const supplierName = document.getElementById("supplierName").value;

  const endpoint = supplierId
    ? "api/edit_supplier.php"
    : "api/add_supplier.php";

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      supplierId,
      name: supplierName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(
          supplierId
            ? "Supplier updated successfully."
            : "Supplier added successfully.",
          "success"
        );
        closeSupplierModal();
        loadSupplier(); // Refresh list
      } else {
        showToast(data.message || "Failed to save supplier.", "error");
      }
    })
    .catch((error) => console.error("Error saving supplier:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("editSupplierForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    saveSupplier();
  });
});

function closeSupplierModal() {
  document.getElementById("supplierModal").classList.add("hidden");
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

let supplierIdPendingDelete = null;

function openDeleteSupplierModal(supplierId) {
  supplierIdPendingDelete = supplierId;
  document.getElementById("deleteSupplierModal").classList.remove("hidden");
}

function closeDeleteSupplierModal() {
  supplierIdPendingDelete = null;
  document.getElementById("deleteSupplierModal").classList.add("hidden");
}

document
  .getElementById("confirmDeleteSupplierBtn")
  .addEventListener("click", () => {
    if (supplierIdPendingDelete !== null) {
      deleteSupplier(supplierIdPendingDelete); // Call the supplier deletion function
    }
  });

function deleteSupplier(supplierId) {
  fetch(`api/delete_supplier.php?id=${supplierId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Supplier deleted successfully!", "success");
        loadSupplier(); // reload the list after deletion
        closeDeleteSupplierModal(); // optional modal close
      } else {
        showToast(
          data.message || "Failed to delete supplier.",
          "error",
          3000,
          true
        );
      }
    })
    .catch((error) => console.error("Error deleting supplier:", error));
}

let itemIdPendingDelete = null;

function openDeleteItemModal(itemId) {
  itemIdPendingDelete = itemId;
  document.getElementById("deleteItemModal").classList.remove("hidden");
}

function closeDeleteItemModal() {
  itemIdPendingDelete = null;
  document.getElementById("deleteItemModal").classList.add("hidden");
}

// Make sure the element exists before adding event listener to avoid errors.
const confirmDeleteBtn = document.getElementById("confirmDeleteItemBtn");
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (itemIdPendingDelete !== null) {
      deleteItem(itemIdPendingDelete); // Calls your existing function
    }
  });
}

function deleteItem(itemId) {
  fetch(`api/delete_item.php?id=${itemId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Item deleted successfully!", "success");
        loadItems(); // Refresh item list
        closeDeleteItemModal(); // Close the modal
      } else {
        showToast(
          data.message || "Failed to delete item.",
          "error",
          3000,
          true
        );
      }
    })
    .catch((error) => {
      console.error("Error deleting item:", error);
      showToast("An error occurred while deleting the item.", "error");
    });
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

function searchItems() {
  const searchInput = document
    .getElementById("itemSearchBar")
    .value.toLowerCase();
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const cards = document.querySelectorAll("#itemCardList > div"); // Each card is a div
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchInput) ? "" : "none";
    });
  } else {
    const rows = document.querySelectorAll("#itemList tr");
    rows.forEach((row) => {
      const cells = Array.from(row.children);
      const matches = cells.some((cell) =>
        cell.textContent.toLowerCase().includes(searchInput)
      );
      row.style.display = matches ? "" : "none";
    });
  }
}

function searchSuppliers() {
  const searchInput = document
    .getElementById("supplierSearchBar")
    .value.toLowerCase();
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const cards = document.querySelectorAll("#supplierCardList > div"); // Each card is a div
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchInput) ? "" : "none";
    });
  } else {
    const rows = document.querySelectorAll("#supplierList tr");
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
  const checkboxes = Array.from(document.querySelectorAll(".property-checkbox:checked")).filter((checkbox) => {
    const row = checkbox.closest("tr");
    return row && row.style.display !== "none"; // Only visible rows
  });

  const selectedIds = checkboxes.map((checkbox) => checkbox.value);

  if (selectedIds.length === 0) {
    showToast("No properties selected.", "error", 3000, true);
    return;
  }

  window.open(`bulk_print_qr.html?ids=${selectedIds.join(",")}`, "_blank");
}

function generateBulkMobileQRCodes() {
  const checkboxes = Array.from(document.querySelectorAll(".toggle-checkbox:checked")).filter((checkbox) => {
    const card = checkbox.closest("#propertyCardList > *");
    return card && getComputedStyle(card).display !== "none"; // ✅ Check if card is visible
  });

  const selectedIds = checkboxes.map((checkbox) => checkbox.dataset.id);

  if (selectedIds.length === 0) {
    showToast("No properties selected.", "error", 3000, true);
    return;
  }

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

function clearCheckboxesOnMobileView() {
  // Check if the screen width is less than 768px (Mobile View)
  if (window.innerWidth < 768) {
    // Uncheck all desktop checkboxes
    const desktopCheckboxes = document.querySelectorAll(".property-checkbox");
    desktopCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    // Uncheck all mobile toggle checkboxes
    const mobileCheckboxes = document.querySelectorAll(".toggle-checkbox");
    mobileCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
}

window.addEventListener("resize", clearCheckboxesOnMobileView);

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
    success: "bg-[#0671B7]",
    error: "bg-red-600",
    info: "bg-emerald-600",
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

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  // More reliable mobile check
  const isMobile = () => window.innerWidth <= 767;

  const openSidebar = () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    document.body.classList.add("sidebar-open");
  };

  const closeSidebar = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("sidebar-open");
  };

  // Mobile-specific logic: toggle sidebar when menu button is clicked
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (isMobile()) {
        const isOpen = !sidebar.classList.contains("-translate-x-full");
        isOpen ? closeSidebar() : openSidebar();
      }
    });
  }

  // Close sidebar when clicking on the overlay (on mobile)
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Nav logic
  const navLinks = {
    properties: document.getElementById("nav-properties"),
    items: document.getElementById("nav-items"),
    suppliers: document.getElementById("nav-suppliers"),
  };

  function setActiveNav(section) {
    Object.entries(navLinks).forEach(([key, el]) => {
      if (key === section) {
        el.classList.add("bg-[#209ae6]", "font-semibold");
      } else {
        el.classList.remove("bg-[#209ae6]", "font-semibold");
      }
    });

    document.querySelectorAll(".content-section").forEach((sectionEl) => {
      sectionEl.classList.add("hidden");
    });

    const activeSection = document.getElementById(`section-${section}`);
    if (activeSection) {
      activeSection.classList.remove("hidden");
    }
  }

  navLinks.properties.addEventListener("click", () => {
    setActiveNav("properties");
  });

  navLinks.items.addEventListener("click", () => {
    setActiveNav("items");
    loadItems(); // ✅ Load item list when navigating
  });

  navLinks.suppliers.addEventListener("click", () => {
    setActiveNav("suppliers");
    loadSupplier(); // ✅ Load supplier list when navigating
  });

  // Click logic for closing sidebar if clicked outside (mobile)
  document.addEventListener("click", (event) => {
    if (isMobile()) {
      const isClickInsideSidebar = sidebar.contains(event.target);
      const isClickOnMenuButton = menuToggle.contains(event.target);
      const isSidebarOpen = !sidebar.classList.contains("-translate-x-full");

      if (!isClickInsideSidebar && !isClickOnMenuButton && isSidebarOpen) {
        closeSidebar();
      }
    }
  });

  // Resize logic to handle switching between mobile and desktop
  window.addEventListener("resize", () => {
    if (isMobile()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Slight delay to ensure layout settles before deciding on sidebar visibility
  setTimeout(() => {
    if (!isMobile()) {
      openSidebar();
    } else {
      closeSidebar(); // Ensure closed on mobile just in case
    }
  }, 50);
});

function loadItems() {
  fetch("api/get_items.php")
    .then((response) => response.json())
    .then((data) => {
      const itemList = document.getElementById("itemList"); // desktop
      const itemCardList = document.getElementById("itemCardList"); // mobile
      itemList.innerHTML = "";
      itemCardList.innerHTML = "";

      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          if (item && item.item_id && item.name) {
            // Desktop row
            const row = document.createElement("tr");
            row.innerHTML = `
              <td class="p-2">${item.item_id}</td>
              <td class="p-2">${item.name}</td>
              <td class="p-2">
                <div class="flex space-x-2">
                  <button class="edit-button bg-white text-[#0671B7] border border-[#0671B7] hover:bg-[#0671B7] hover:text-white px-4 py-2 rounded text-base" onclick="editItem(${item.item_id})">Edit</button>
                  <button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="openDeleteItemModal(${item.item_id})">Delete</button>
                </div>
              </td>
            `;
            itemList.appendChild(row);

            // Mobile card
            const card = document.createElement("div");
            card.className = "bg-white rounded-xl shadow p-4 relative";

            card.innerHTML = `
            <button onclick="editItem(${item.item_id})" class="absolute top-3 right-5 text-[#0671B7] hover:text-[#1C78B2]">
  <i class="fas fa-pen"></i>
</button>
              <div class="text-gray-700 mb-4">
                <p><span class="font-semibold">Item ID:</span> ${item.item_id}</p>
                <p><span class="font-semibold">Name:</span> ${item.name}</p>
              </div>

              <div class="flex flex-col gap-2">
                <button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="openDeleteItemModal(${item.item_id})">Delete</button>
              </div>
            `;
            itemCardList.appendChild(card);
          }
        });
      } else {
        console.error(
          "Invalid response:",
          data.message || "Invalid data format"
        );
      }
      // Call updatePagination AFTER rows are added
      updatePagination("items");
    })
    .catch((error) => console.error("Error loading items:", error));
}

function loadSupplier() {
  fetch("api/get_supplier.php")
    .then((response) => response.json())
    .then((data) => {
      const supplierList = document.getElementById("supplierList"); // desktop
      const supplierCardList = document.getElementById("supplierCardList"); // mobile
      supplierList.innerHTML = "";
      supplierCardList.innerHTML = "";

      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((supplier) => {
          if (supplier && supplier.supplier_id && supplier.name) {
            // Desktop row
            const row = document.createElement("tr");
            row.innerHTML = `
              <td class="p-2">${supplier.supplier_id}</td>
              <td class="p-2">${supplier.name}</td>
              <td class="p-2">
                <div class="flex space-x-2">
                  <button class="edit-button bg-white text-[#0671B7] border border-[#0671B7] hover:bg-[#0671B7] hover:text-white px-4 py-2 rounded text-base" onclick="editSupplier(${supplier.supplier_id})">Edit</button>
                  <button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="openDeleteSupplierModal(${supplier.supplier_id})">Delete</button>
                </div>
              </td>
            `;
            supplierList.appendChild(row);

            // Mobile card
            const card = document.createElement("div");
            card.className = "bg-white rounded-xl shadow p-4 relative";

            card.innerHTML = `
            <button onclick="editSupplier(${supplier.supplier_id})" class="absolute top-3 right-5 text-[#0671B7] hover:text-[#1C78B2]">
  <i class="fas fa-pen"></i>
</button>

              <div class="text-gray-700 mb-4">
                <p><span class="font-semibold">Supplier ID:</span> ${supplier.supplier_id}</p>
                <p><span class="font-semibold">Name:</span> ${supplier.name}</p>
              </div>

              <div class="flex flex-col gap-2">
                <button class="delete-button bg-white text-[#F03A25] border border-[#F03A25] hover:bg-[#F03A25] hover:text-white px-4 py-2 rounded text-base" onclick="openDeleteSupplierModal(${supplier.supplier_id})">Delete</button>
              </div>
            `;
            supplierCardList.appendChild(card);
          }
        });
      } else {
        console.error(
          "Invalid response:",
          data.message || "Invalid data format"
        );
      }
      // Call updatePagination AFTER rows are added
      updatePagination("suppliers");
    })
    .catch((error) => console.error("Error loading suppliers:", error));
}

const paginationState = {
  properties: { currentPage: 1, itemsPerPage: 10 },
  items: { currentPage: 1, itemsPerPage: 10 },
  suppliers: { currentPage: 1, itemsPerPage: 10 },
};

function changePage(section, direction) {
  const state = paginationState[section];
  console.log(`Changing page for section: ${section}`);

  const listId =
    section === "properties"
      ? "propertyList"
      : section === "items"
      ? "itemList"
      : "supplierList";
  const list = document.querySelector(`#${listId}`);

  if (!list) {
    console.error(`${listId} not found!`);
    return;
  }

  const rows = Array.from(list.querySelectorAll("tr"));
  const totalItems = rows.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / state.itemsPerPage);

  console.log(`Total Items: ${totalItems}, Total Pages: ${totalPages}`);

  const newPage = state.currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    state.currentPage = newPage;
  } else {
    console.log("Invalid page number, keeping current page.");
  }

  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = true;
  }
  const checkboxes = list.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });

  document.querySelector(`#${section}PrevPage`).disabled =
    state.currentPage === 1;
  document.querySelector(`#${section}NextPage`).disabled =
    state.currentPage === totalPages;

  updatePagination(section);
}

function updatePagination(section) {
  const state = paginationState[section];
  const listId =
    section === "properties"
      ? "propertyList"
      : section === "items"
      ? "itemList"
      : "supplierList";
  const cardListId =
    section === "properties"
      ? "propertyCardList"
      : section === "items"
      ? "itemCardList"
      : "supplierCardList";

  const list = document.querySelector(`#${listId}`);
  const cardList = document.querySelector(`#${cardListId}`);

  let rows, cards;

  if (list) {
    rows = Array.from(list.querySelectorAll("tr"));
  }
  if (cardList) {
    cards = Array.from(cardList.children);
  }

  const totalItems = (rows || cards).length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / state.itemsPerPage);

  console.log(`Total Items: ${totalItems}, Total Pages: ${totalPages}`);

  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end = start + state.itemsPerPage;

  // Show or hide rows for desktop
  if (rows) {
    rows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
    });
      // ✅ Check all visible checkboxes by default
  const checkboxes = list.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox, index) => {
    // Only check the ones that are visible
    if (index >= start && index < end) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });
  }

// Show or hide cards for mobile
if (cards) {
  cards.forEach((card, index) => {
    const isVisible = index >= start && index < end;
    card.style.display = isVisible ? "" : "none";

    // ✅ Automatically check the checkbox inside visible cards
    const checkbox = card.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.checked = isVisible;
    }
  });
}

  document.getElementById(
    `${section}CurrentPage`
  ).textContent = `Page ${state.currentPage}`;
  document.getElementById(
    `${section}TotalPages`
  ).textContent = `of ${totalPages}`;
}

function updateItemsPerPage(section) {
  const state = paginationState[section];
  const selectValue = document.getElementById(`${section}ItemsPerPage`).value;

  if (selectValue === "all") {
    const listId =
      section === "properties"
        ? "propertyList"
        : section === "items"
        ? "itemList"
        : "supplierList";
    const list = document.querySelector(`#${listId}`);
    const totalItems = list ? list.querySelectorAll("tr").length : 0;

    state.itemsPerPage = totalItems || 1; // Prevent divide by zero
  } else {
    state.itemsPerPage = parseInt(selectValue, 10);
  }

  state.currentPage = 1;
  changePage(section, 0); // Refresh
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "Initial rows:",
    document.querySelectorAll("#propertyList tr").length
  );
  updatePagination("properties");
  updatePagination("items");
  updatePagination("suppliers");
});

const itemInput = document.getElementById("item_name");
const suggestionsBox = document.getElementById("itemSuggestions");

itemInput.addEventListener("input", async () => {
  const query = itemInput.value.trim();

  if (query.length < 1) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch(
      `api/search_items.php?q=${encodeURIComponent(query)}`
    );
    const suggestions = await response.json();

    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.remove("hidden");

    if (suggestions.length === 0) {
      const li = document.createElement("li");
      li.innerHTML = `No match found. <button class="text-[#0671B7] underline text-sm ml-1" onclick="addNewItemAuto('${query}')">+ Add New Item</button>`;
      li.className = "px-4 py-2 text-gray-500";
      suggestionsBox.appendChild(li);
      return;
    }

    suggestions.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.className = "cursor-pointer px-4 py-2 hover:bg-emerald-100";
      li.addEventListener("click", () => {
        itemInput.value = item;
        suggestionsBox.classList.add("hidden");
      });
      suggestionsBox.appendChild(li);
    });
  } catch (error) {
    console.error("Autocomplete fetch failed:", error);
  }
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== itemInput) {
    suggestionsBox.classList.add("hidden");
  }
});

// Allow "Enter" key to confirm item and close dropdown
itemInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    suggestionsBox.classList.add("hidden");
  }
});

function addNewItemAuto(itemName) {
  const newItem = itemName || itemInput.value;
  suggestionsBox.classList.add("hidden");

  if (!newItem) return;

  fetch("api/add_item.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: newItem }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Item added successfully!", "success");

        // Optionally set input field to new item name
        itemInput.value = newItem;

        // Load or add to suggestions
        loadItems(); // or update suggestions manually if needed
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

const supplierInput = document.getElementById("item_supplier");
const supplierSuggestionsBox = document.getElementById("supplierSuggestions");

supplierInput.addEventListener("input", async () => {
  const query = supplierInput.value.trim();

  if (query.length < 1) {
    supplierSuggestionsBox.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(
      `api/search_suppliers.php?q=${encodeURIComponent(query)}`
    );
    const suppliers = await res.json();

    supplierSuggestionsBox.innerHTML = "";
    supplierSuggestionsBox.classList.remove("hidden");

    if (suppliers.length === 0) {
      const li = document.createElement("li");
      li.innerHTML = `No match found. <button class="text-[#0671B7] underline text-sm ml-1" onclick="addNewSupplierAuto('${query}')">+ Add New Supplier</button>`;
      li.className = "px-4 py-2 text-gray-500";
      supplierSuggestionsBox.appendChild(li);
      return;
    }

    suppliers.forEach((supplier) => {
      const li = document.createElement("li");
      li.textContent = supplier;
      li.className = "cursor-pointer px-4 py-2 hover:bg-emerald-100";
      li.addEventListener("click", () => {
        supplierInput.value = supplier;
        supplierSuggestionsBox.classList.add("hidden");
      });
      supplierSuggestionsBox.appendChild(li);
    });
  } catch (err) {
    console.error("Supplier autocomplete failed:", err);
  }
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (
    !supplierSuggestionsBox.contains(e.target) &&
    e.target !== supplierInput
  ) {
    supplierSuggestionsBox.classList.add("hidden");
  }
});

// Enter key closes dropdown
supplierInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    supplierSuggestionsBox.classList.add("hidden");
  }
});

function addNewSupplierAuto(supplierName) {
  supplierSuggestionsBox.classList.add("hidden");

  fetch("api/add_supplier.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: supplierInput.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Supplier added successfully!", "success");
      } else {
        showToast(
          data.message || "Failed to add supplier.",
          "error",
          3000,
          true
        );
      }
    })
    .catch((err) => {
      console.error("Error adding supplier:", err);
      showToast(
        "An error occurred while processing the request.",
        "error",
        3000,
        true
      );
    });
}
