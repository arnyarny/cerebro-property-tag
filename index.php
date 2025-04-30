<!DOCTYPE html>
<html lang="en" class="h-full">

<head>
  <title>Property Management</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="assets/logoshape.png">
  <link rel="stylesheet" href="custom-styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-50 text-gray-800 flex">
<!-- Sidebar -->
<aside id="sidebar" class="bg-gradient-to-b from-[#0671B7] via-[#0671B7] to-[#fd0000] text-white w-64 space-y-6 px-4 py-6 fixed md:relative inset-y-0 left-0 md:block transition-transform duration-300 ease-in-out z-40 min-h-screen">
  <div class="flex justify-center items-center gap-2 mb-8 bg-[#fff] rounded p-x-2 py-2">
    <!-- Optional logo/title -->
    <img src="assets/logo.png" alt="Logo" class="h-10">
  </div>
  <nav class="flex flex-col gap-4 text-sm">
  <a href="#" id="nav-properties" class="bg-[#209ae6] font-semibold px-3 py-2 rounded flex items-center gap-2">
    <i class="fas fa-building"></i> Properties
  </a>
  <div class="relative inline-block text-white">
  <button id="masterlist-button" onclick="toggleDropdown()" class="flex items-center gap-2 px-3 py-2 rounded">
    <i class="fas fa-folder"></i> Masterlist
    <i id="arrow-icon" class="fas fa-chevron-down transition-transform duration-200"></i>
  </button>

  <div id="masterlist-dropdown" class="hidden absolute mt-2 space-y-1 pl-6 text-white">
    <a href="#" id="nav-items" class="block px-4 py-2 rounded hover:underline flex items-center gap-2">
      <i class="fas fa-box"></i> Items
    </a>
    <a href="#" id="nav-suppliers" class="block px-4 py-2 rounded hover:underline flex items-center gap-2">
      <i class="fas fa-truck"></i> Suppliers
    </a>
  </div>
</div>
</nav>
</aside>
<!-- Sidebar Overlay -->
<div id="sidebarOverlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>

<main class="flex-1">
  <!-- Header -->
<header class="bg-white shadow p-4 flex items-center justify-between">
  <div class="flex items-center gap-2">
    <button id="menuToggle" class="text-[#0671B7] md:hidden text-2xl focus:outline-none">
      <i class="fas fa-bars"></i>
    </button>
  </div>
</header>

  <!-- Section: Properties -->
  <div id="section-properties" class="content-section">

    <!-- Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white shadow mt-4 rounded-lg">
    <div class="flex items-center gap-2 w-full md:w-auto">
  <select id="sortBy" onchange="sortProperties()" class="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-[#9ca3af]">
    <option value="default">Sort By</option>
    <option value="name_asc">Name (A-Z)</option>
    <option value="name_desc">Name (Z-A)</option>
    <option value="date_newest">Date Purchased (Newest)</option>
    <option value="date_oldest">Date Purchased (Oldest)</option>
    <option value="amount_low_high">Amount (Low to High)</option>
    <option value="amount_high_low">Amount (High to Low)</option>
  </select>

  <input type="text" id="searchBar" placeholder="Search..." oninput="searchProperties()"
    class="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-64 pl-4">
</div>

      <div class="flex gap-2 w-full md:w-auto justify-end">
    <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base" onclick="showModal()">New</button>
    <button id="bulkQrButton" class="bg-[#0671B7] hover:bg-[#0565A4] text-white px-4 py-2 rounded text-base" onclick="handleBulkQRCodesClick()">
      Generate QR Codes Selected
    </button>
  </div>
    </div>

  <!-- Select All -->
  <div class="px-4 mt-4 hidden md:block">
    <label class="inline-flex items-center space-x-2 text-sm">
      <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this)" class="accent-[#0671B7]">
      <span>Select All</span>
    </label>
  </div>

  <!-- Table container: visible only on md and up -->
  <div class="hidden md:block overflow-x-auto mt-4 px-4">
    <table class="min-w-full bg-white rounded shadow border">
      <thead class="bg-[#0671B7] text-white text-sm">
        <tr>
          <th class="p-2 text-left">Select</th>
          <th class="p-2 text-left">ID</th>
          <th class="p-2 text-left">Item Name</th>
          <th class="p-2 text-left">Date Purchased</th>
          <th class="p-2 text-left">Supplier</th>
          <th class="p-2 text-left">Amount</th>
          <th class="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody id="propertyList" class="text-sm divide-y"></tbody>
    </table>
  </div>

    <!-- Mobile card list (shown only on small screens) -->
  <div id="propertyCardList" class="md:hidden space-y-4 mt-4"></div>

    <!-- Summary -->
    <div class="flex justify-between items-center px-4 mt-4 text-sm">
      <span id="totalItems">Total Items: 0</span>
      <span id="totalAmount">Total Amount: 0</span>
    </div>

    <!-- Properties Pagination -->
  <div class="flex flex-wrap justify-center md:justify-between items-center px-4 mt-4 mb-8 gap-2 text-sm">

  <div class="flex items-center gap-2">
    <button id="propertiesPrevPage" onclick="changePage('properties', -1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Prev</button>
    <span id="propertiesCurrentPage">Page 1</span>
    <span id="propertiesTotalPages"></span>
    <button id="propertiesNextPage" onclick="changePage('properties', 1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Next</button>
  </div>
  <select id="propertiesItemsPerPage" onchange="updateItemsPerPage('properties')" class="border border-gray-300 rounded px-3 py-1">
    <option value="5">5 per page</option>
    <option value="10" selected>10 per page</option>
    <option value="20">20 per page</option>
  </select>
  </div>
  </div>

  <!-- QR Code Modal -->
<div id="qrModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white p-6 rounded-xl shadow-xl text-center w-full max-w-sm">
    <h2 class="text-lg font-semibold mb-4">QR Code</h2>
    <img id="qrImage" alt="QR Code" class="max-w-full h-auto mx-auto mb-4 rounded-lg" />
    <div class="flex justify-center space-x-3">
      <button id="printQRCodeBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm">
        Print
      </button>
      <button onclick="closeQRModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm">
        Close
      </button>
    </div>
  </div>
</div>

  <!-- Property Modal -->
<div id="propertyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
    <div class="modal-header flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Add/Edit Property</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body space-y-4">
      <form id="addPropertyForm" class="space-y-4">
        <div>
          <label for="item_name" class="block text-sm font-medium text-gray-700">Item Name</label>
          <div class="relative">
            <input type="text" id="item_name" name="item_name" autocomplete="off"
  required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3">
<ul id="itemSuggestions" class="border rounded-md mt-1 hidden bg-white shadow absolute z-10 w-full max-w-lg"></ul>
</div>
        </div>
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">Date Purchased</label>
          <input type="date" id="date" name="date" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3 bg-white appearance-none">
        </div>

        <div>
        <label for="item_supplier" class="block text-sm font-medium text-gray-700">Item Supplier</label>
<div class="relative">
  <input type="text" id="item_supplier" name="item_supplier" autocomplete="off"
    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3" required>
  <ul id="supplierSuggestions" class="border rounded-md mt-1 hidden bg-white shadow absolute z-10 w-full max-w-lg"></ul>
</div>

        </div>

        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="amount" name="amount" step="0.01" min="0" required
  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3">

          <input type="hidden" id="propertyId" name="propertyId">
        </div>
      </form>
    </div>
    <div class="modal-footer flex justify-end mt-6 space-x-2">
      <button type="submit" form="addPropertyForm" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow text-base">Save</button>
      <!-- Cancel Button -->
      <button type="button" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-base" onclick="closeModal()">Cancel</button>
    </div>
    </div>
  </div>
</div>

  <!-- Delete Modal -->
  <div id="deleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-sm p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-[#F03A25]">Confirm Deletion</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeDeleteModal()">×</button>
    </div>
    <p class="mb-4 text-sm">Are you sure you want to delete this property?</p>
    <div class="flex justify-end space-x-2">
      <button onclick="closeDeleteModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Cancel</button>
      <button id="confirmDeleteButton" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded">Delete</button>
    </div>
  </div>
</div>  

  <!-- Section: Items -->
  <div id="section-items" class="content-section hidden">
    
    <!-- Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white shadow mt-4 rounded-lg">
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select id="itemSortBy" onchange="sortItems()" class="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-[#9ca3af]">
          <option value="default">Sort By</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>

        <input type="text" id="itemSearchBar" placeholder="Search..." oninput="searchItems()"
          class="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-64 pl-4">
      </div>

      <div class="flex gap-2 w-full md:w-auto justify-end">
    <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base" onclick="addNewItem()">New</button>
  </div>
    </div>  

    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto mt-4 px-4">
      <table class="min-w-full bg-white rounded shadow border">
        <thead class="bg-[#0671B7] text-white text-sm">
          <tr>
            <th class="p-2 text-left">Item ID</th>
            <th class="p-2 text-left">Name</th>
            <th class="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody id="itemList" class="text-sm divide-y"></tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div id="itemCardList" class="md:hidden space-y-4 mt-4 px-4"></div>

    <!-- Items Pagination -->
  <div class="flex flex-wrap justify-center md:justify-between items-center px-4 mt-4 mb-8 gap-2 text-sm">

  <div class="flex items-center gap-2">
    <button id="itemsPrevPage" onclick="changePage('items', -1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Prev</button>
    <span id="itemsCurrentPage">Page 1</span>
    <span id="itemsTotalPages"></span>
    <button id="itemsNextPage" onclick="changePage('items', 1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Next</button>
  </div>
  <select id="itemsItemsPerPage" onchange="updateItemsPerPage('items')" class="border border-gray-300 rounded px-3 py-1">
    <option value="5">5 per page</option>
    <option value="10" selected>10 per page</option>
    <option value="20">20 per page</option>
  </select>
  </div>
  </div>

  <!-- Edit Item Modal -->
<div id="itemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
    <div class="modal-header flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Edit Item</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeItemModal()">×</button>
    </div>
    <form id="editItemForm" class="space-y-4">
      <div>
        <label for="edit_item_name" class="block text-sm font-medium text-gray-700">Item Name</label>
        <input type="text" id="edit_item_name" name="edit_item_name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3">
        <input type="hidden" id="edit_item_id" name="edit_item_id">
      </div>
      <div class="modal-footer flex justify-end mt-6 space-x-2">
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow text-base">Save</button>
        <button type="button" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-base" onclick="closeItemModal()">Cancel</button>
      </div>
    </form>
  </div>
</div>

<div id="deleteItemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-sm p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-[#F03A25]">Confirm Item Deletion</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeDeleteItemModal()">×</button>
    </div>
    <p class="mb-4 text-sm">Are you sure you want to delete this item?</p>
    <div class="flex justify-end space-x-2">
      <button onclick="closeDeleteItemModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Cancel</button>
      <button id="confirmDeleteItemBtn" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded">Delete</button>
    </div>
  </div>
</div>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2"></div>


  <!-- Section: Suppliers -->
  <div id="section-suppliers" class="content-section hidden">

    <!-- Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white shadow mt-4 rounded-lg">
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select id="supplierSortBy" onchange="sortSuppliers()" class="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-[#9ca3af]">
          <option value="default">Sort By</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>

        <input type="text" id="supplierSearchBar" placeholder="Search..." oninput="searchSuppliers()"
          class="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-64 pl-4">
      </div>

      <div class="flex gap-2 w-full md:w-auto justify-end">
    <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base" onclick="addNewSupplier()">New</button>
  </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto mt-4 px-4">
      <table class="min-w-full bg-white rounded shadow border">
        <thead class="bg-[#0671B7] text-white text-sm">
          <tr>
            <th class="p-2 text-left">Supplier ID</th>
            <th class="p-2 text-left">Name</th>
            <th class="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody id="supplierList" class="text-sm divide-y"></tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div id="supplierCardList" class="md:hidden space-y-4 mt-4 px-4"></div>
    
    <!-- Suppliers Pagination -->
  <div class="flex flex-wrap justify-center md:justify-between items-center px-4 mt-4 mb-8 gap-2 text-sm">
    <div class="flex items-center gap-2">
      <button id="suppliersPrevPage" onclick="changePage('suppliers', -1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Prev</button>
      <span id="suppliersCurrentPage">Page 1</span>
      <span id="suppliersTotalPages"></span>
      <button id="suppliersNextPage" onclick="changePage('suppliers', 1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Next</button>
    </div>
    <select id="suppliersItemsPerPage" onchange="updateItemsPerPage('suppliers')" class="border border-gray-300 rounded px-3 py-1">
      <option value="5">5 per page</option>
      <option value="10" selected>10 per page</option>
      <option value="20">20 per page</option>
    </select>
  </div>

<!-- Edit Supplier Modal -->
<div id="supplierModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
    <div class="modal-header flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Edit Supplier</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeSupplierModal()">×</button>
    </div>
    <form id="editSupplierForm" class="space-y-4">
      <div>
        <label for="edit_supplier_name" class="block text-sm font-medium text-gray-700">Supplier Name</label>
        <input type="text" id="edit_supplier_name" name="edit_supplier_name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3">
        <input type="hidden" id="edit_supplier_id" name="edit_supplier_id">
      </div>
      <div class="modal-footer flex justify-end mt-6 space-x-2">
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base">Save</button>
        <button type="button" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-base" onclick="closeSupplierModal()">Cancel</button>
      </div>
    </form>
  </div>
</div>

  <!-- Delete Modal -->
  <div id="deleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-sm p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-[#F03A25]">Confirm Deletion</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeDeleteModal()">×</button>
    </div>
    <p class="mb-4 text-sm">Are you sure you want to delete this property?</p>
    <div class="flex justify-end space-x-2">
      <button onclick="closeDeleteModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Cancel</button>
      <button id="confirmDeleteButton" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded">Delete</button>
    </div>
  </div>
</div>

<div id="deleteSupplierModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-full max-w-sm p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-[#F03A25]">Confirm Supplier Deletion</h2>
      <button class="text-gray-500 hover:text-red-500 text-xl" onclick="closeDeleteSupplierModal()">×</button>
    </div>
    <p class="mb-4 text-sm">Are you sure you want to delete this supplier?</p>
    <div class="flex justify-end space-x-2">
      <button onclick="closeDeleteSupplierModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Cancel</button>
      <button id="confirmDeleteSupplierBtn" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded">Delete</button>
    </div>
  </div>
</div>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <script src="script.js"></script>
  </main>
</body>

</html>
