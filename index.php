<!DOCTYPE html>
<html lang="en">
<head>
    <title>Property Management</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="image/png" href="assets/logoshape.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">


</head>
<body>
    <header class="header">
        <img src="assets/logo.png" alt="Logo" class="logo">
    </header>

    <div class="controls">
    <div class="controls-left">
        <div class="sort-search">
        <select id="sortBy" onchange="sortProperties()">
  <option value="default">Sort By</option>
  <option value="name_asc">Name (A-Z)</option>
  <option value="name_desc">Name (Z-A)</option>
  <option value="date_newest">Date Purchased (Newest)</option>
  <option value="date_oldest">Date Purchased (Oldest)</option>
  <option value="amount_low_high">Amount (Low to High)</option>
  <option value="amount_high_low">Amount (High to Low)</option>
</select>

            <input type="text" id="searchBar" placeholder="Search..." oninput="searchProperties()">
        </div>
    </div>
    <div class="controls-right">
        <button class="new-button" onclick="showModal()">New</button>
        <button class="generate-qr-button" onclick="generateBulkQRCodes(propertyId)">Generate QR Codes Selected</button>
    </div>
    </div>

    <div class="select-all"><input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this)">
    Select All in this Page</div>

    <table>
        <thead>
            <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Item Name</th>
                <th>Date Purchased</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="propertyList"></tbody>
    </table>

    <div id="qrCodeModal" class="modal" style="display: none;">
        <div class="modal-header">
            <h2>QR Code</h2>
            <button class="close-button" onclick="closeQRCodeModal()">X</button>
        </div>
        <div class="modal-body">
            <div id="qrcode"></div>
            <button onclick="closeQRCodeModal()">Close</button>
        </div>
    </div>

    <div class="summary">
        <span id="totalItems">Total Items: 0</span>
        <span id="totalAmount" class="float-right">Total Amount: 0</span>
    </div>

    <div class="pagination">
        <button id="prevPage" onclick="changePage(-1)" disabled>Previous</button>
        <span id="currentPage">Page 1</span>
        <span id="totalPages"></span>
        <button id="nextPage" onclick="changePage(1)">Next</button>
        <select id="itemsPerPage" onchange="updateItemsPerPage()">
            <option value="5">5 per page</option>
            <option value="10" selected>10 per page</option>
            <option value="20">20 per page</option>
        </select>
    </div>

    <div id="propertyModal" class="modal">
        <div class="modal-header">
            <h2>Add/Edit Property</h2>
            <button class="close-button" onclick="closeModal()">X</button>
        </div>
        <div class="modal-body">
            <form id="addPropertyForm">
                <label for="item_name">Item Name:</label>
                <select id="item_name" name="item_name" required>
                    <option value="">Select Item</option>
                </select>
                <button type="button" class="add-item-button" onclick="addNewItem()">Add New Item</button>

                <label for="date">Date Purchased:</label>
                <input type="date" id="date" name="date" required>

                <label for="item_supplier">Item Supplier:</label>
                <select id="item_supplier" name="item_supplier" required>
                    <option value="">Select Supplier</option>
                </select>
                <button type="button" class="add-supplier-button" onclick="addNewSupplier()">Add New Supplier</button>

                <label for="amount">Amount:</label>
                <input type="number" id="amount" name="amount" step="0.01" required>
                <input type="hidden" id="propertyId" name="propertyId">
            </form>
            <div class="modal-footer">
            <button type="submit" form="addPropertyForm" class="save-button">Save to Database</button>
        </div>
        </div>
    </div>

    <div id="deleteModal" class="modal">
        <div class="modal-header">
            <h2>Confirm Deletion</h2>
            <button class="close-button" onclick="closeDeleteModal()">X</button>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete this property?</p>
        </div>
        <div class="modal-footer">
            <button id="confirmDeleteButton" class="confirm-delete-button">Delete</button>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>

    <script src="script.js"></script>
</body>
</html>
