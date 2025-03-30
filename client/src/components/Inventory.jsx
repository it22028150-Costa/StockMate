import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, AlertCircle, Edit, Trash, PlusCircle, Search } from "lucide-react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["Fruits", "Vegetables", "Dairy", "Bakery"]);
  const [newItem, setNewItem] = useState({ itemName: "", quantity: 1, expiryDate: "", category: "" });
  const [alert, setAlert] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/inventory", { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
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
        await axios.put(`http://localhost:5000/api/inventory/${editItem._id}`, newItem, { headers: { Authorization: `Bearer ${token}` } });
        setAlert("Item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/inventory", newItem, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAlert("Item deleted successfully!");
      fetchInventory();
    } catch (err) {
      setAlert("Failed to delete item. Please try again.");
      console.error(err);
    }
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

  const handleEdit = (item) => {
    setEditItem(item);
    setNewItem({
      itemName: item.itemName,
      quantity: item.quantity,
      expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],  // Format as YYYY-MM-DD
      category: item.category,
    });
  };

  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory ? item.category === filterCategory : true)
  );

  return (
    <div 
  className="min-h-screen bg-cover bg-center p-6 font-sans" 
  style={{ backgroundImage: "url('/i.jpg')" }}
>
  <div className="max-w-5xl mx-auto bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-lg p-8">
    <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Inventory Control Center</h2>

        
        {alert && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg text-center">{alert}</div>}

        {/* Add or Update Item Form */}
        <form onSubmit={handleAddOrUpdate} className="flex flex-wrap gap-8 justify-center mb-8">
          <div className="flex flex-col items-center">
            <label className="text-lg font-medium mb-2 text-gray-700" htmlFor="itemName">Item Name</label>
            <input
              id="itemName"
              type="text"
              placeholder="Item Name"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              className="p-4 border rounded-md w-80 shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="text-lg font-medium mb-2 text-gray-700" htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="p-4 border rounded-md w-32 shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="text-lg font-medium mb-2 text-gray-700" htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="date"
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              className="p-4 border rounded-md w-40 shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <div className="flex flex-col items-center">
            <label className="text-lg font-medium mb-2 text-gray-700" htmlFor="category">Category</label>
            <select
              id="category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="p-4 border rounded-md w-48 shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white p-4 rounded-md flex items-center hover:bg-blue-500 transition duration-300 ease-in-out shadow-lg"
            >
              <PlusCircle className="w-6 h-6 mr-3" />
              {editItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>

        {/* Search and Filter */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center bg-gray-100 p-3 rounded-lg shadow-md w-1/2">
            <Search className="text-gray-500 w-6 h-6" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-4 bg-transparent focus:outline-none text-lg w-full"
            />
          </div>

          <div className="flex items-center w-1/4">
            <label className="text-lg font-medium mr-4 text-gray-700">Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-lg"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-black -600 text-white">
                <th className="p-6 text-left text-lg font-medium">Item</th>
                <th className="p-6 text-left text-lg font-medium">Quantity</th>
                <th className="p-6 text-left text-lg font-medium">Expiry</th>
                <th className="p-6 text-left text-lg font-medium">Category</th>
                <th className="p-6 text-left text-lg font-medium">Alerts</th>
                <th className="p-6 text-left text-lg font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item._id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition`}>
                  <td className="p-6 border text-lg font-medium">{item.itemName}</td>
                  <td className={`p-6 border text-lg ${item.quantity <= 10 ? "text-red-600 font-bold" : ""}`}>{item.quantity}</td>
                  <td className={`p-6 border text-lg ${new Date(item.expiryDate) < new Date() ? "text-red-600 font-bold" : ""}`}>
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="p-6 border text-lg">{item.category}</td>
                  <td className="p-6 border text-lg">
                    {checkNotifications(item).map((n, i) => (
                      <div key={i} className={`text-sm p-2 ${n.type === "low-stock" ? "text-red-500" : "text-yellow-500"}`}>
                        {n.message}
                      </div>
                    ))}
                  </td>
                  <td className="p-6 border flex gap-4">
                    <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white p-3 rounded-md hover:bg-green-400 transition duration-300">
                      <Edit className="w-6 h-6" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white p-3 rounded-md hover:bg-red-400 transition duration-300">
                      <Trash className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
