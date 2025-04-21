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

<body class="h-full min-h-screen bg-gray-50 text-gray-800 flex">
 <!-- Sidebar -->
<aside id="sidebar" class="bg-gradient-to-b from-[#0671B7] to-[#fd0000] text-white w-64 space-y-6 px-4 py-6 fixed md:relative inset-y-0 left-0 transform -translate-x-full md:translate-x-0 md:block transition-transform duration-300 ease-in-out z-40">

  <div class="flex items-center gap-2 mb-8 bg-[#fff] rounded p-x-4 py-4">
    <!-- Optional logo/title -->
    <img src="assets/logo.png" alt="Logo" class="h-10">
  </div>
  <nav class="flex flex-col gap-4 text-sm">
  <a href="#" id="nav-properties" class="bg-[#1C78B2] font-semibold px-3 py-2 rounded flex items-center gap-2">
    <i class="fas fa-building"></i> Properties
  </a>
  <a href="#" id="nav-items" class="hover:bg-[#1C78B2] px-3 py-2 rounded flex items-center gap-2">
    <i class="fas fa-box"></i> Masterlist: Items
  </a>
  <a href="#" id="nav-suppliers" class="hover:bg-[#1C78B2] px-3 py-2 rounded flex items-center gap-2">
    <i class="fas fa-truck"></i> Masterlist: Suppliers
  </a>
</nav>
</aside>


<main class="flex-1">
  <!-- Header -->
<header class="bg-white shadow p-4 flex items-center justify-between">
  <div class="flex items-center gap-2">
    <button id="menuToggle" class="text-[#0671B7] md:hidden text-2xl focus:outline-none">
      <i class="fas fa-bars"></i>
    </button>
  </div>
</header>

  <!-- Controls -->
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white shadow mt-4 rounded-lg">
    <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
      <select id="sortBy" onchange="sortProperties()" class="border border-gray-300 rounded px-3 py-2 text-sm">
        <option value="default">Sort By</option>
        <option value="name_asc">Name (A-Z)</option>
        <option value="name_desc">Name (Z-A)</option>
        <option value="date_newest">Date Purchased (Newest)</option>
        <option value="date_oldest">Date Purchased (Oldest)</option>
        <option value="amount_low_high">Amount (Low to High)</option>
        <option value="amount_high_low">Amount (High to Low)</option>
      </select>

      <input type="text" id="searchBar" placeholder="Search..." oninput="searchProperties()"
        class="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-64">
    </div>

    <div class="flex gap-2 w-full md:w-auto justify-end">
  <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-base" onclick="showModal()">New</button>
  <button id="bulkQrButton" class="bg-[#0671B7] hover:bg-[#0565A4] text-white px-4 py-2 rounded text-base" onclick="handleBulkQRCodesClick()">
    Generate QR Codes Selected
  </button>
</div>
  </div>

<!-- Section: Properties -->
<div id="section-properties" class="content-section">
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
</div>

<!-- Section: Items -->
<div id="section-items" class="content-section hidden">
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
</div>



<!-- Section: Suppliers -->
<div id="section-suppliers" class="content-section hidden">
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
</div>


  <!-- QR Code Modal -->
<div id="qrModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white p-6 rounded-xl shadow-xl text-center w-full max-w-sm">
    <h2 class="text-lg font-semibold mb-4">QR Code</h2>
    <img id="qrImage" alt="QR Code" class="w-64 h-64 mx-auto mb-4" />
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

  <!-- Pagination -->
<div class="flex flex-wrap justify-center md:justify-between items-center px-4 mt-4 mb-8 gap-2 text-sm">

    <div class="flex items-center gap-2">
      <button id="prevPage" onclick="changePage(-1)" disabled class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Previous</button>
      <span id="currentPage">Page 1</span>
      <span id="totalPages"></span>
      <button id="nextPage" onclick="changePage(1)" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Next</button>
    </div>
    <select id="itemsPerPage" onchange="updateItemsPerPage()" class="border border-gray-300 rounded px-3 py-1">
      <option value="5">5 per page</option>
      <option value="10" selected>10 per page</option>
      <option value="20">20 per page</option>
    </select>
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
          <select id="item_name" name="item_name" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Select Item</option>
          </select>
          <button type="button" class="text-[#0671B7] text-sm mt-2 hover:underline" onclick="addNewItem()">+ Add New Item</button>
        </div>

        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">Date Purchased</label>
          <input type="date" id="date" name="date" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
        </div>

        <div>
          <label for="item_supplier" class="block text-sm font-medium text-gray-700">Item Supplier</label>
          <select id="item_supplier" name="item_supplier" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Select Supplier</option>
          </select>
          <button type="button" class="text-[#0671B7] text-sm mt-2 hover:underline" onclick="addNewSupplier()">+ Add New Supplier</button>
        </div>

        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="amount" name="amount" step="0.01" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
          <input type="hidden" id="propertyId" name="propertyId">
        </div>
      </form>
    </div>
    <div class="modal-footer flex justify-end mt-6 space-x-2">
      <button type="submit" form="addPropertyForm" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow text-sm">Save</button>
      <!-- Cancel Button -->
      <button type="button" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded text-sm" onclick="closeModal()">Cancel</button>
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
      <div class="text-right">
        <button id="confirmDeleteButton" class="bg-[#F03A25] hover:bg-[#D32F2F] text-white px-4 py-2 rounded">Delete</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <script src="script.js"></script>
  </main>
</body>

</html>
