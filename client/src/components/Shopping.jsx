import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaSearch, FaTrash, FaCheck, FaUndo, FaPrint } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

// Header component (unchanged)
const Header = ({ currentView, setCurrentView }) => (
  <nav className="sticky top-0 z-10 bg-white shadow-md py-4 mb-8">
    <div className="container mx-auto px-4 flex justify-center space-x-4">
      <button
        onClick={() => setCurrentView("inventory")}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
          currentView === "inventory"
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="View Inventory"
      >
        Inventory
      </button>
      <button
        onClick={() => setCurrentView("shopping")}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
          currentView === "shopping"
            ? "bg-green-600 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="View Shopping List"
      >
        Shopping List
      </button>
      <button
        onClick={() => setCurrentView("purchased")}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
          currentView === "purchased"
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="View Purchased Items"
      >
        Purchased Items
      </button>
    </div>
  </nav>
);

// BudgetSummary component (unchanged)
const BudgetSummary = ({ monthlyBudget, totalCost }) => {
  const budgetLeft = monthlyBudget - totalCost;
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget Summary</h3>
      <div className="space-y-2">
        <p className="text-gray-600">
          Total Cost: <span className="font-semibold text-indigo-600">${totalCost.toFixed(2)}</span>
        </p>
        <p className="text-gray-600">
          Monthly Budget: <span className="font-semibold text-indigo-600">${monthlyBudget.toFixed(2)}</span>
        </p>
        <p
          className={`font-semibold ${
            budgetLeft >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {budgetLeft >= 0
            ? `Budget Left: $${budgetLeft.toFixed(2)}`
            : `Over Budget: $${Math.abs(budgetLeft).toFixed(2)}`}
        </p>
      </div>
    </div>
  );
};

// BudgetChart component (unchanged)
const BudgetChart = ({ monthlyBudget, totalCost }) => {
  const usedBudget = totalCost;
  const remainingBudget = monthlyBudget - totalCost > 0 ? monthlyBudget - totalCost : 0;
  const data = {
    labels: ["Used Budget", "Remaining Budget"],
    datasets: [
      {
        data: [usedBudget, remainingBudget],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return (
    <div className="max-w-xs mx-auto mt-8">
      <Doughnut
        data={data}
        options={{
          plugins: {
            legend: { position: "bottom", labels: { font: { size: 14 } } },
            tooltip: { backgroundColor: "#333", padding: 10 },
          },
        }}
      />
    </div>
  );
};

// InventoryList component (unchanged)
const InventoryList = ({
  inventoryItems,
  amountInputs,
  priceInputs,
  handleAmountChange,
  handlePriceChange,
  handleAddToShopping,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffInDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7 && diffInDays >= 0;
  };

  const filteredItems = inventoryItems
    .filter((item) => item.quantity < 10)
    .filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Inventory</h3>
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search Inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          aria-label="Search inventory items"
        />
      </div>
      {filteredItems.length === 0 ? (
        <p className="text-gray-500 text-center">No items with low stock!</p>
      ) : (
        <ul className="space-y-4">
          {filteredItems.map((item) => (
            <li
              key={item._id}
              className={`p-4 rounded-lg transition-all duration-200 ${
                isExpiringSoon(item.expiryDate)
                  ? "bg-red-50 border-l-4 border-red-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{item.itemName}</span>
                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                {isExpiringSoon(item.expiryDate) && (
                  <span className="ml-2 text-red-600 font-semibold">
                    (Expiring Soon!)
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="number"
                  step="1"
                  min="11"
                  placeholder="Amount (>10)"
                  value={amountInputs[item._id] || ""}
                  onChange={(e) => handleAmountChange(e, item._id)}
                  className="w-full sm:w-28 border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label={`Amount for ${item.itemName}`}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Price"
                  value={priceInputs[item._id] || ""}
                  onChange={(e) => handlePriceChange(e, item._id)}
                  className="w-full sm:w-28 border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label={`Price for ${item.itemName}`}
                />
                <button
                  onClick={() => handleAddToShopping(item)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                  aria-label={`Add ${item.itemName} to shopping list`}
                >
                  <FaCheck /> Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ShoppingList component (unchanged)
const ShoppingList = ({
  shoppingItems,
  calculateItemTotal,
  handleToggleStatus,
  handleRemove,
}) => {
  const pendingItems = shoppingItems.filter((item) => item.status === "pending");

  return (
    <div id="printable-area" className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Shopping List</h3>
      {pendingItems.length === 0 ? (
        <p className="text-gray-500 text-center">No pending items in shopping list!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 font-semibold">Item Name</th>
                <th className="px-4 py-3 font-semibold text-center">Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3">{item.itemName}</td>
                  <td className="px-4 py-3 text-center">{item.amount}</td>
                  <td className="px-4 py-3 text-right">${Number(item.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">${calculateItemTotal(item).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700"
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all flex items-center gap-2"
                      aria-label={`Mark ${item.itemName} as purchased`}
                    >
                      <FaCheck /> Purchased
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                      aria-label={`Remove ${item.itemName}`}
                    >
                      <FaTrash /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// PurchasedItemsList component (unchanged)
const PurchasedItemsList = ({ shoppingItems, calculateItemTotal, handleToggleStatus }) => {
  const purchasedItems = shoppingItems.filter((item) => item.status === "purchased");

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Purchased Items</h3>
      {purchasedItems.length === 0 ? (
        <p className="text-gray-500 text-center">No purchased items!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 font-semibold">Item Name</th>
                <th className="px-4 py-3 font-semibold text-center">Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchasedItems.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3">{item.itemName}</td>
                  <td className="px-4 py-3 text-center">{item.amount}</td>
                  <td className="px-4 py-3 text-right">${Number(item.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">${calculateItemTotal(item).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 mx-auto"
                      aria-label={`Mark ${item.itemName} as pending`}
                    >
                      <FaUndo /> Pending
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main Shopping component (modified)
const Shopping = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [currentView, setCurrentView] = useState("inventory");
  const [priceInputs, setPriceInputs] = useState({});
  const [amountInputs, setAmountInputs] = useState({});
  // Initialize monthlyBudget from localStorage or default to 100
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem("monthlyBudget");
    return savedBudget ? parseFloat(savedBudget) : 100; // Default to 100 if no saved value
  });

  // Save monthlyBudget to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("monthlyBudget", monthlyBudget);
  }, [monthlyBudget]);

  // Fetch Inventory Items
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Shopping Items
  const fetchShopping = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/shopping", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShoppingItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchShopping();
  }, []);

  const handlePriceChange = (e, itemId) => {
    setPriceInputs({ ...priceInputs, [itemId]: e.target.value });
  };

  const handleAmountChange = (e, itemId) => {
    setAmountInputs({ ...amountInputs, [itemId]: e.target.value });
  };

  const handleAddToShopping = async (item) => {
    const price = parseFloat(priceInputs[item._id]);
    const amount = parseInt(amountInputs[item._id]);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price for the item.");
      return;
    }
    if (isNaN(amount) || amount <= 10) {
      alert("Please enter a valid amount greater than 10 for the item.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/shopping",
        {
          itemName: item.itemName,
          amount: amount,
          price: price,
          status: "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${item.itemName} added to shopping list!`);
      setPriceInputs({ ...priceInputs, [item._id]: "" });
      setAmountInputs({ ...amountInputs, [item._id]: "" });
      fetchShopping();
    } catch (err) {
      console.error(err);
      alert(`Failed to add ${item.itemName}`);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "pending" ? "purchased、上" : "pending";
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/shopping/${item._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${item.itemName} marked as ${newStatus}`);
      fetchShopping();
    } catch (err) {
      console.error(err);
      alert(`Failed to update status for ${item.itemName}`);
    }
  };

  const handleRemove = async (item) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/shopping/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`${item.itemName} removed from shopping list!`);
      fetchShopping();
    } catch (err) {
      console.error(err);
      alert(`Failed to remove ${item.itemName}`);
    }
  };

  const calculateItemTotal = (item) => {
    const price = Number(item.price);
    const amount = Number(item.amount);
    if (isNaN(price) || isNaN(amount)) return 0;
    return price * amount;
  };

  const calculateTotal = () => {
    return shoppingItems.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  const totalCost = calculateTotal();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Shopping & Inventory Manager
        </h2>
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <div className="transition-opacity duration-300">
          {currentView === "inventory" && (
            <InventoryList
              inventoryItems={inventoryItems}
              amountInputs={amountInputs}
              priceInputs={priceInputs}
              handleAmountChange={handleAmountChange}
              handlePriceChange={handlePriceChange}
              handleAddToShopping={handleAddToShopping}
            />
          )}
          {currentView === "shopping" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-xs">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyBudget}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setMonthlyBudget(isNaN(value) ? 0 : value);
                    }}
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    placeholder="Enter monthly budget"
                    aria-label="Monthly budget"
                  />
                </div>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2"
                  aria-label="Print shopping list"
                >
                  <FaPrint /> Print Shopping List
                </button>
              </div>
              <ShoppingList
                shoppingItems={shoppingItems}
                calculateItemTotal={calculateItemTotal}
                handleToggleStatus={handleToggleStatus}
                handleRemove={handleRemove}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BudgetSummary monthlyBudget={monthlyBudget} totalCost={totalCost} />
                <BudgetChart monthlyBudget={monthlyBudget} totalCost={totalCost} />
              </div>
            </div>
          )}
          {currentView === "purchased" && (
            <PurchasedItemsList
              shoppingItems={shoppingItems}
              calculateItemTotal={calculateItemTotal}
              handleToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Shopping;