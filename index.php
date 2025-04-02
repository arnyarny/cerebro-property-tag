<!DOCTYPE html>
<html lang="en">
<head>
    <title>Property Management</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
<body>
    <header class="header">
        <img src="assets/logo.png" alt="Logo" class="logo">
    </header>

    <div class="controls">
        <div class="sort-search">
            <select id="sortClassification" onchange="sortProperties()">
                <option value="">Sort by Classification</option>
                <option value="name">Name</option>
                <option value="date">Date</option>
                <option value="supplier">Supplier</option>
                <option value="amount">Amount</option>
            </select>
            <input type="text" id="searchBar" placeholder="Search..." oninput="searchProperties()">
        </div>
        <button class="new-button" onclick="showModal()">New</button>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="propertyList"></tbody>
    </table>

    <div>
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

                <label for="date">Date:</label>
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
        </div>
        <div class="modal-footer">
            <button type="button" class="qr-button" id="generateQRCodeButton" onclick="generateQRCode()" style="display: none;">Generate QR Code</button>
            <button type="submit" form="addPropertyForm" class="save-button">Save to Database</button>
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
            <button id="confirmDeleteButton" class="delete-button">Delete</button>
        </div>
    </div>

    <div id="qrCodeModal" class="modal">
        <div class="modal-header">
            <h2>Generated QR Code</h2>
            <button class="close-button" onclick="closeQRCodeModal()">X</button>
        </div>
        <div class="modal-body">
            <div id="qrcode"></div>
        </div>
        <div class="modal-footer">
            <button class="close-button" onclick="closeQRCodeModal()">Close</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
