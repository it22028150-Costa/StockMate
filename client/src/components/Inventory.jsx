import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, AlertCircle, Edit, Trash, PlusCircle, Search, Printer } from "lucide-react";
import ReactPaginate from "react-paginate";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Meat",
    "Poultry",
  ]);
  const [newItem, setNewItem] = useState({
    itemName: "",
    quantity: 1,
    expiryDate: "",
    category: "",
    unit: "",
  });
  const [alert, setAlert] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setAlert("Failed to fetch inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const itemNameRegex = /^[A-Za-z\s]+$/;
    if (!itemNameRegex.test(newItem.itemName)) {
      setAlert("Item name must contain only letters and spaces.");
      return;
    }

    if (
      !newItem.itemName ||
      !newItem.quantity ||
      !newItem.expiryDate ||
      !newItem.category ||
      !newItem.unit
    ) {
      setAlert("All fields must be filled, including unit.");
      return;
    }

    const expiryDate = new Date(newItem.expiryDate);
    if (expiryDate < new Date()) {
      setAlert("Expiry date must be in the future.");
      return;
    }

    if (newItem.quantity <= 0) {
      setAlert("Quantity must be greater than 0.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (editItem) {
        await axios.put(
          `http://localhost:5000/api/inventory/${editItem._id}`,
          newItem,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAlert("Item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/inventory", newItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert("Item added successfully!");
      }

      setNewItem({
        itemName: "",
        quantity: 1,
        expiryDate: "",
        category: "",
        unit: "",
      });
      setEditItem(null);
      await fetchInventory();
    } catch (err) {
      setAlert("Failed to add or update item. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert("Item deleted successfully!");
      fetchInventory();
    } catch (err) {
      setAlert("Failed to delete item. Please try again.");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setNewItem({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
      category: item.category,
    });
  };

  const checkNotifications = (item) => {
    const thresholds = {
      pcs: 10,
      g: 100,
      kg: 1,
      ml: 100,
      l: 1,
    };

    const threshold = thresholds[item.unit] || 10;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysToExpiry = Math.floor(
      (expiryDate - today) / (1000 * 3600 * 24)
    );

    let notifications = [];

    if (item.quantity <= threshold) {
      notifications.push({
        message: `${item.itemName} is low on stock (${item.quantity} ${item.unit} remaining).`,
        type: "low-stock",
      });
    }

    if (daysToExpiry <= 7 && daysToExpiry >= 0) {
      notifications.push({
        message: `${item.itemName} expires in ${daysToExpiry} day(s).`,
        type: "expiry",
      });
    }

    return notifications;
  };

  const getCategoryData = () => {
    const categoryMap = {};

    items.forEach((item) => {
      if (categoryMap[item.category]) {
        categoryMap[item.category] += item.quantity;
      } else {
        categoryMap[item.category] = item.quantity;
      }
    });

    return Object.entries(categoryMap).map(([category, quantity]) => ({
      category,
      quantity,
    }));
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory ? item.category === filterCategory : true)
  );

  const displayedItems = filteredItems.slice(
    pageNumber * itemsPerPage,
    (pageNumber + 1) * itemsPerPage
  );

  const handlePageChange = (selectedPage) => {
    setPageNumber(selectedPage.selected);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("inventory-table").cloneNode(true);
    const printRows = printContent.querySelectorAll("tr");

    printRows.forEach((row) => {
      row.deleteCell(-1);
    });

    const newWindow = window.open("", "_blank");
    newWindow.document.write("<html><head><title>Print Inventory</title><style>");
    newWindow.document.write(`
      body {
        font-family: 'Inter', sans-serif;
        padding: 20px;
        color: #1f2937;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 12px;
        border: 1px solid #e5e7eb;
        text-align: left;
      }
      th {
        background-color: #f3f4f6;
        font-weight: 600;
        color: #374151;
      }
      tr:nth-child(even) {
        background-color: #f9fafb;
      }
      tr:hover {
        background-color: #f1f5f9;
      }
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        text-align: center;
      }
    `);
    newWindow.document.write("</style></head><body>");
    newWindow.document.write("<h1>Inventory Report</h1>");
    newWindow.document.write(printContent.innerHTML);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">📦</span> Inventory Control Center
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
            title="Print Inventory"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>

        {/* Alert Notification */}
        {alert && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <span>{alert}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Form for Adding/Editing Items */}
        <form
          onSubmit={handleAddOrUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Item Name
            </label>
            <input
              type="text"
              value={newItem.itemName}
              onChange={(e) =>
                setNewItem({ ...newItem, itemName: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Apple"
              aria-required="true"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="1"
              aria-required="true"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-required="true"
            >
              <option value="" disabled>
                Select Unit
              </option>
              <option value="pcs">pcs</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="date"
              value={newItem.expiryDate}
              onChange={(e) =>
                setNewItem({ ...newItem, expiryDate: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-required="true"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-required="true"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category, i) => (
                <option key={i} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none flex items-center justify-center gap-2"
            >
              {editItem ? (
                <>
                  <Edit className="w-5 h-5" />
                  Update
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Search inventory items"
            />
          </div>

          <div className="w-full sm:w-1/3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((category, i) => (
                <option key={i} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto" id="inventory-table">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Category</th>
                <th className="p-4">Alerts</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium">{item.itemName}</td>
                    <td
                      className={`p-4 ${
                        checkNotifications(item).some(
                          (n) => n.type === "low-stock"
                        )
                          ? "text-red-600 font-semibold"
                          : ""
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </td>
                    <td
                      className={`p-4 ${
                        new Date(item.expiryDate) < new Date()
                          ? "text-red-600 font-semibold"
                          : ""
                      }`}
                    >
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 space-y-1">
                      {checkNotifications(item).length > 0 ? (
                        checkNotifications(item).map((n, i) => (
                          <div
                            key={i}
                            className={`text-sm flex items-center gap-1 ${
                              n.type === "low-stock"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            <Bell className="w-4 h-4" />
                            {n.message}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No alerts</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        title="Edit Item"
                        aria-label={`Edit ${item.itemName}`}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                        title="Delete Item"
                        aria-label={`Delete ${item.itemName}`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center pt-6">
          <ReactPaginate
            pageCount={Math.ceil(filteredItems.length / itemsPerPage)}
            onPageChange={handlePageChange}
            containerClassName="flex space-x-2 items-center"
            pageClassName="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            activeClassName="bg-blue-600 text-white"
            previousLabel="<"
            nextLabel=">"
            previousClassName="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            nextClassName="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            breakLabel="..."
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>

        {/* Bar Chart for Category Overview */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Inventory Overview by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="quantity" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default Inventory;