import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Header component for navigation between views
const Header = ({ showShoppingList, setShowShoppingList }) => (
  <div className="flex justify-center space-x-4 mb-8">
      

    <button
      onClick={() => setShowShoppingList(false)}
      className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-colors hover:bg-blue-600 ${
        !showShoppingList ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
      }`}
    >
      Inventory
    </button>
    <button
      onClick={() => setShowShoppingList(true)}
      className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-colors hover:bg-green-600 ${
        showShoppingList ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
      }`}
    >
      Shopping List
    </button>
  </div>
);

// BudgetSummary component for monthly budgeting details
const BudgetSummary = ({ monthlyBudget, totalCost }) => {
  const budgetLeft = monthlyBudget - totalCost;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-bold mb-2">Budget Summary</h3>
      <p className="font-semibold">Total Cost: ${totalCost.toFixed(2)}</p>
      <p className="font-semibold">
        Monthly Budget: ${monthlyBudget.toFixed(2)}
      </p>
      <p className="font-semibold">
        {budgetLeft >= 0
          ? `Budget Left: $${budgetLeft.toFixed(2)}`
          : `Over budget by $${Math.abs(budgetLeft).toFixed(2)}`}
      </p>
    </div>
  );
};

// BudgetChart component to visualize used vs remaining budget
const BudgetChart = ({ monthlyBudget, totalCost }) => {
  const usedBudget = totalCost;
  const remainingBudget =
    monthlyBudget - totalCost > 0 ? monthlyBudget - totalCost : 0;
  const data = {
    labels: ["Used Budget", "Remaining Budget"],
    datasets: [
      {
        data: [usedBudget, remainingBudget],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-sm mx-auto my-8">

      <Doughnut data={data} />
    </div>
  );
};

// InventoryList component with search, input fields, and expiry alert
const InventoryList = ({
  inventoryItems,
  amountInputs,
  priceInputs,
  handleAmountChange,
  handlePriceChange,
  handleAddToShopping,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Function to check if an item is expiring soon (within 7 days)
  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffInDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7 && diffInDays >= 0; // Expiring within 7 days and not expired
  };

  const filteredItems = inventoryItems
    .filter((item) => item.quantity < 10)
    .filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-gray-300 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Inventory</h3>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {filteredItems.length === 0 ? (
        <p className="text-gray-600">No items with low stock!</p>
      ) : (
        <ul>
          {filteredItems.map((item) => (
            <li
              key={item._id}
              className={`mb-4 border-b pb-4 flex flex-col transition-all hover:bg-gray-50 ${
                isExpiringSoon(item.expiryDate) ? "bg-red-100" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.itemName}</span>
                <span className="text-sm text-gray-600">
                  Qty: {item.quantity}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Expires on: {new Date(item.expiryDate).toLocaleDateString()}
                {isExpiringSoon(item.expiryDate) && (
                  <span className="ml-2 text-red-600 font-semibold">
                    (Expiring Soon!)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="1"
                  placeholder="Amount (>10)"
                  value={amountInputs[item._id] || ""}
                  onChange={(e) => handleAmountChange(e, item._id)}
                  className="w-24 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={priceInputs[item._id] || ""}
                  onChange={(e) => handlePriceChange(e, item._id)}
                  className="w-24 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => handleAddToShopping(item)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
// ShoppingList component to display shopping items in a table
const ShoppingList = ({
  shoppingItems,
  calculateItemTotal,
  handleToggleStatus,
  handleRemove,
}) => (
  <div id="printable-area" className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4">Shopping List</h3>
    {shoppingItems.length === 0 ? (
      <p className="text-gray-600">No items in shopping list!</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Item Name</th>
              <th className="px-4 py-2 text-center">Amount</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shoppingItems.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="px-4 py-2">{item.itemName}</td>
                <td className="px-4 py-2 text-center">{item.amount}</td>
                <td className="px-4 py-2 text-right">
                  ${Number(item.price).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  ${calculateItemTotal(item).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center">{item.status}</td>
                <td className="px-4 py-2 text-center">
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Purchased
                      </button>
                      <button
                        onClick={() => handleRemove(item)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                      Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Main Shopping component combining all subcomponents
const Shopping = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});
  const [amountInputs, setAmountInputs] = useState({});
  const [monthlyBudget, setMonthlyBudget] = useState(0);

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

  // Add an inventory item to the shopping list after validating inputs
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
    const newStatus = item.status === "pending" ? "purchased" : "pending";
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

  // Calculate the total cost for an item (unit price × amount)
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

  // Handler for printing the shopping list view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Shopping & Inventory Manager
      </h2>
      <Header
        showShoppingList={showShoppingList}
        setShowShoppingList={setShowShoppingList}
      />
      {showShoppingList ? (
        <div>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full max-w-xs mb-4">
              <label className="block text-lg font-bold mb-2">
                Monthly Budget:
              </label>
              <input
                type="number"
                step="0.01"
                value={monthlyBudget}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setMonthlyBudget(isNaN(value) ? 0 : value);
                }}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter monthly budget"
              />
            </div>
            <button
              onClick={handlePrint}
              className="mb-6 px-6 py-2 bg-indigo-500 text-white rounded shadow hover:bg-indigo-600 transition-colors"
            >
              Print Shopping List
            </button>
          </div>
          <ShoppingList
            shoppingItems={shoppingItems}
            calculateItemTotal={calculateItemTotal}
            handleToggleStatus={handleToggleStatus}
            handleRemove={handleRemove}
          />
          <BudgetSummary monthlyBudget={monthlyBudget} totalCost={totalCost} />
          <BudgetChart monthlyBudget={monthlyBudget} totalCost={totalCost} />
        </div>
      ) : (
        <InventoryList
          inventoryItems={inventoryItems}
          amountInputs={amountInputs}
          priceInputs={priceInputs}
          handleAmountChange={handleAmountChange}
          handlePriceChange={handlePriceChange}
          handleAddToShopping={handleAddToShopping}
        />
      )}
    </div>
  );
};

export default Shopping;
