import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, AlertCircle, Edit, Trash, PlusCircle, Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["Fruits", "Vegetables", "Dairy", "Bakery"]);
  const [newItem, setNewItem] = useState({ itemName: "", quantity: 1, expiryDate: "", category: "" });
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
        headers: { Authorization: `Bearer ${token}` }
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

    if (!newItem.itemName || !newItem.quantity || !newItem.expiryDate || !newItem.category) {
      setAlert("All fields must be filled.");
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
        await axios.put(`http://localhost:5000/api/inventory/${editItem._id}`, newItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlert("Item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/inventory", newItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlert("Item added successfully!");
      }
      fetchInventory();
      setNewItem({ itemName: "", quantity: 1, expiryDate: "", category: "" });
      setEditItem(null);
    } catch (err) {
      setAlert("Failed to add or update item. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
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
      expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
      category: item.category
    });
  };

  const checkNotifications = (item) => {
    const threshold = item.threshold || 10;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 3600 * 24));

    let notifications = [];

    if (item.quantity <= threshold) {
      notifications.push({ message: `${item.itemName} is low on stock.`, type: "low-stock" });
    }

    if (daysToExpiry <= 7 && daysToExpiry >= 0) {
      notifications.push({ message: `${item.itemName} expires in ${daysToExpiry} day(s).`, type: "expiry" });
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
      quantity
    }));
  };

  const filteredItems = items.filter((item) =>
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
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
    `);
    newWindow.document.write("</style></head><body>");
    newWindow.document.write(printContent.innerHTML);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-10 space-y-10">
        <h2 className="text-3xl font-semibold text-gray-800 text-center">📦 Inventory Control Center</h2>

        {alert && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{alert}</div>
        )}

        {/* Form */}
        <form onSubmit={handleAddOrUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          {/* Inputs */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category, i) => (
                <option key={i} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-500 transition">
              {editItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="w-full md:w-1/3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category, i) => (
                <option key={i} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Print */}
        <div className="text-right">
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-500 transition font-medium"
          >
            Print Table
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto" id="inventory-table">
          <table className="w-full table-auto border border-gray-200 rounded-md">
            <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
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
              {displayedItems.map((item) => (
                <tr key={item._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{item.itemName}</td>
                  <td className={`p-4 ${item.quantity <= 10 ? "text-red-600 font-semibold" : ""}`}>{item.quantity}</td>
                  <td className={`p-4 ${new Date(item.expiryDate) < new Date() ? "text-red-600 font-semibold" : ""}`}>
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4 space-y-1">
                    {checkNotifications(item).map((n, i) => (
                      <div key={i} className={`text-sm ${n.type === "low-stock" ? "text-red-500" : "text-yellow-500"}`}>
                        {n.message}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-red-500 hover:bg-red-400 text-white rounded-md"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center pt-6">
          <ReactPaginate
            pageCount={Math.ceil(filteredItems.length / itemsPerPage)}
            onPageChange={handlePageChange}
            containerClassName="flex space-x-2"
            pageClassName="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            activeClassName="bg-blue-500 text-white"
            previousLabel="<"
            nextLabel=">"
            previousClassName="px-3 py-2 bg-gray-200 rounded-md"
            nextClassName="px-3 py-2 bg-gray-200 rounded-md"
            breakLabel="..."
          />
        </div>

        {/* Chart */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Inventory Overview by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
