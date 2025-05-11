   import React, { useState, useEffect } from "react";
    import { createRoot } from "react-dom/client";
    import axios from "axios";
    import { Doughnut } from "react-chartjs-2";
    import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
    import { ToastContainer, toast } from "react-toastify";

    ChartJS.register(ArcElement, Tooltip, Legend);

    // Utility function to calculate standard price (price per standard quantity)
    const calculateStandardPrice = (price, unit, amount) => {
      const standardQuantities = {
        ml: 100, // 100ml = 1 qty
        l: 1,    // 1L = 1 qty
        g: 100,  // 100g = 1 qty
        kg: 1,   // 1kg = 1 qty
        pcs: 1   // 1 piece = 1 qty
      };
      const factor = standardQuantities[unit] || 1;
      return (price / (amount / factor)).toFixed(2);
    };

    // Utility function to get standard unit label
    const getStandardUnitLabel = (unit) => {
      const labels = {
        ml: "per 100ml",
        l: "per liter",
        g: "per 100g",
        kg: "per kg",
        pcs: "per piece"
      };
      return labels[unit] || "per unit";
    };

    // Utility function to get standard quantity
    const getStandardQuantity = (unit) => {
      const standardQuantities = {
        ml: 100,
        l: 1,
        g: 100,
        kg: 1,
        pcs: 1
      };
      return standardQuantities[unit] || 1;
    };

    // Utility function to get validation rules for units
    const getUnitValidation = (unit) => {
      const validations = {
        pcs: { min: 10, step: 1, type: "integer" }, // Only positive integers, min 10
        g: { min: 10, step: 1, type: "number" },   // Positive numbers, min 10g, 1g increments
        kg: { min: 0.01, step: 0.01, type: "number" }, // Positive numbers, 0.01kg increments
        ml: { min: 1, step: 1, type: "number" },  // Positive numbers, 1ml increments
        l: { min: 0.01, step: 0.01, type: "number" } // Positive numbers, 0.01L increments
      };
      return validations[unit] || { min: 1, step: 1, type: "number" };
    };

    // Header component
    const Header = ({ currentView, setCurrentView }) => (
      <nav className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center space-x-4">
          {["inventory", "shopping", "purchased"].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-6 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                currentView === view
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-white hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
              aria-label={`View ${view.charAt(0).toUpperCase() + view.slice(1)}`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </nav>
    );

    // BudgetSummary component
    const BudgetSummary = ({ monthlyBudget, totalCost }) => {
      const budgetLeft = monthlyBudget - totalCost;
      return (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto mt-8 transform hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Summary</h3>
          <div className="space-y-3">
            <p className="text-gray-600 flex justify-between">
              <span>Total Cost:</span>
              <span className="font-semibold text-indigo-600">${totalCost.toFixed(2)}</span>
            </p>
            <p className="text-gray-600 flex justify-between">
              <span>Monthly Budget:</span>
              <span className="font-semibold text-indigo-600">${monthlyBudget.toFixed(2)}</span>
            </p>
            <p className={`font-semibold flex justify-between ${budgetLeft >= 0 ? "text-green-600" : "text-red-600"}`}>
              <span>{budgetLeft >= 0 ? "Budget Left:" : "Over Budget:"}</span>
              <span>${Math.abs(budgetLeft).toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    };

    // BudgetChart component
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
        <div className="max-w-xs mx-auto mt-8 bg-white p-6 rounded-2xl shadow-xl">
          <Doughnut
            data={data}
            options={{
              plugins: {
                legend: { position: "bottom", labels: { font: { size: 14, family: "'Inter', sans-serif" } } },
                tooltip: { backgroundColor: "rgba(0,0,0,0.8)", padding: 12, cornerRadius: 8 },
              },
            }}
          />
        </div>
      );
    };

    // InventoryList component
    const InventoryList = ({
      inventoryItems,
      amountInputs,
      priceInputs,
      handleAmountChange,
      handlePriceChange,
      handleAddToShopping,
      setAmountInputs,
    }) => {
      const [searchTerm, setSearchTerm] = useState("");

      const isExpiringSoon = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffInDays = (expiry - today) / (1000 * 60 * 60 * 24);
        return diffInDays <= 7 && diffInDays >= 0;
      };

      const isLowStock = (item) => {
        const thresholds = {
          pcs: 10,
          g: 100,
          kg: 1,
          ml: 100,
          l: 1,
        };
        const threshold = thresholds[item.unit] || 10;
        return item.quantity <= threshold;
      };

      const getMinimumQuantity = () => 1;

      const filteredItems = inventoryItems
        .filter(isLowStock)
        .filter((item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Inventory (Low Stock)</h3>
          <div className="relative mb-6">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search Inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700"
              aria-label="Search inventory items"
            />
          </div>
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items with low stock!</p>
          ) : (
            <ul className="space-y-4">
              {filteredItems.map((item) => {
                const minQuantity = getMinimumQuantity();
                const standardQuantity = getStandardQuantity(item.unit);
                const validation = getUnitValidation(amountInputs[`${item._id}_unit`] || item.unit);
                return (
                  <li
                    key={item._id}
                    className={`p-4 sm:p-6 rounded-xl transition-all duration-200 ${
                      isExpiringSoon(item.expiryDate)
                        ? "bg-red-50 border-l-4 border-red-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                      <span className="font-medium text-gray-900 text-lg">{item.itemName}</span>
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                        Stock: {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      {isExpiringSoon(item.expiryDate) && (
                        <span className="ml-2 text-red-600 font-semibold">(Expiring Soon!)</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="number"
                        step={validation.step}
                        min={validation.min}
                        placeholder={`Qty (x${standardQuantity}${item.unit})`}
                        value={amountInputs[item._id] || ""}
                        onChange={(e) => handleAmountChange(e, item._id, validation)}
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        aria-label={`Quantity for ${item.itemName}`}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder={`Price ${getStandardUnitLabel(item.unit)}`}
                        value={priceInputs[item._id] || ""}
                        onChange={(e) => handlePriceChange(e, item._id)}
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        aria-label={`Price for ${item.itemName}`}
                      />
                      <select
                        value={amountInputs[`${item._id}_unit`] || item.unit}
                        onChange={(e) =>
                          setAmountInputs({
                            ...amountInputs,
                            [`${item._id}_unit`]: e.target.value,
                            [item._id]: "", // Reset quantity when unit changes
                          })
                        }
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        aria-label={`Unit for ${item.itemName}`}
                      >
                        <option value="pcs">pcs</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                      </select>
                      <button
                        onClick={() => handleAddToShopping(item)}
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                        aria-label={`Add ${item.itemName} to shopping list`}
                      >
                        <i className="fas fa-plus"></i> Add
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    };

    // ShoppingList component
    const ShoppingList = ({
      shoppingItems,
      calculateItemTotal,
      handleToggleStatus,
      handleRemove,
    }) => {
      const pendingItems = shoppingItems.filter((item) => item.status === "pending");

      return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Shopping List</h3>
          {pendingItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending items in shopping list!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Item Name</th>
                    <th className="px-4 py-3 font-semibold text-center">Quantity</th>
                    <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-3 font-medium">{item.itemName}</td>
                      <td className="px-4 py-3 text-center">
                        {item.amount} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${calculateStandardPrice(item.price, item.unit, item.amount)}{" "}
                        {getStandardUnitLabel(item.unit)}
                      </td>
                      <td className="px-4 py-3 text-right">${calculateItemTotal(item).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 flex items-center gap-2"
                          aria-label={`Mark ${item.itemName} as purchased`}
                        >
                          <i className="fas fa-check"></i> Purchased
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center gap-2"
                          aria-label={`Remove ${item.itemName}`}
                        >
                          <i className="fas fa-trash"></i> Remove
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

    // PurchasedItemsList component
    const PurchasedItemsList = ({ shoppingItems, calculateItemTotal, handleToggleStatus }) => {
      const purchasedItems = shoppingItems.filter((item) => item.status === "purchased");

      return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Purchased Items</h3>
          {purchasedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No purchased items!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Item Name</th>
                    <th className="px-4 py-3 font-semibold text-center">Quantity</th>
                    <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasedItems.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50 transition-all duration-200">
                      <td className="px-4 py-3 font-medium">{item.itemName}</td>
                      <td className="px-4 py-3 text-center">
                        {item.amount} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${calculateStandardPrice(item.price, item.unit, item.amount)}{" "}
                        {getStandardUnitLabel(item.unit)}
                      </td>
                      <td className="px-4 py-3 text-right">${calculateItemTotal(item).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 flex items-center gap-2 mx-auto"
                          aria-label={`Mark ${item.itemName} as pending`}
                        >
                          <i className="fas fa-undo"></i> Pending
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

    // Main Shopping component
    const Shopping = () => {
      const [inventoryItems, setInventoryItems] = useState([]);
      const [shoppingItems, setShoppingItems] = useState([]);
      const [currentView, setCurrentView] = useState("inventory");
      const [priceInputs, setPriceInputs] = useState({});
      const [amountInputs, setAmountInputs] = useState({});
      const [monthlyBudget, setMonthlyBudget] = useState(() => {
        const savedBudget = localStorage.getItem("monthlyBudget");
        return savedBudget ? parseFloat(savedBudget) : 100;
      });
      const [isLoading, setIsLoading] = useState(false);

      // Persist budget
      useEffect(() => {
        localStorage.setItem("monthlyBudget", monthlyBudget);
      }, [monthlyBudget]);

      // Fetchers
      const fetchInventory = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/api/inventory", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setInventoryItems(res.data);
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch inventory");
        } finally {
          setIsLoading(false);
        }
      };

      const fetchShopping = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/api/shopping", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setShoppingItems(res.data);
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch shopping list");
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        fetchInventory();
        fetchShopping();
      }, []);

      // Handlers
      const handlePriceChange = (e, itemId) => {
        setPriceInputs({ ...priceInputs, [itemId]: e.target.value });
      };

      const handleAmountChange = (e, itemId, validation) => {
        const value = e.target.value;
        if (value === "") {
          setAmountInputs({ ...amountInputs, [itemId]: "" });
          return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        if (validation.type === "integer" && !Number.isInteger(numValue)) {
          toast.error("Quantity must be a whole number for pieces.");
          return;
        }

        if (numValue < validation.min) {
          toast.error(`Quantity must be at least ${validation.min} ${amountInputs[`${itemId}_unit`] || "units"}.`);
          return;
        }

        setAmountInputs({ ...amountInputs, [itemId]: value });
      };

      const handleAddToShopping = async (item) => {
        const price = parseFloat(priceInputs[item._id]);
        const quantity = parseFloat(amountInputs[item._id]);
        const unit = amountInputs[`${item._id}_unit`] || item.unit;
        const validation = getUnitValidation(unit);

        if (isNaN(price) || price <= 0) {
          toast.error("Please enter a valid price for the item.");
          return;
        }

        if (isNaN(quantity) || quantity < validation.min) {
          toast.error(`Please enter at least ${validation.min} ${unit} for the item.`);
          return;
        }

        if (validation.type === "integer" && !Number.isInteger(quantity)) {
          toast.error("Quantity must be a whole number for pieces.");
          return;
        }

        const standardQuantity = getStandardQuantity(unit);
        const actualAmount = quantity * standardQuantity;
        const totalPrice = price * quantity;

        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:5000/api/shopping",
            {
              itemName: item.itemName,
              amount: actualAmount,
              price: totalPrice,
              unit,
              status: "pending",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`${item.itemName} added to shopping list!`);
          setPriceInputs({ ...priceInputs, [item._id]: "" });
          setAmountInputs({ ...amountInputs, [item._id]: "", [`${item._id}_unit`]: "" });
          fetchShopping();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to add ${item.itemName}`);
        } finally {
          setIsLoading(false);
        }
      };

      const handleToggleStatus = async (item) => {
        const newStatus = item.status === "pending" ? "purchased" : "pending";
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            `http://localhost:5000/api/shopping/${item._id}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`${item.itemName} marked as ${newStatus}`);
          fetchShopping();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to update status for ${item.itemName}`);
        } finally {
          setIsLoading(false);
        }
      };

      const handleRemove = async (item) => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5000/api/shopping/${item._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success(`${item.itemName} removed from shopping list!`);
          fetchShopping();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to remove ${item.itemName}`);
        } finally {
          setIsLoading(false);
        }
      };

      const calculateItemTotal = (item) => {
        const price = Number(item.price);
        if (isNaN(price)) return 0;
        return price;
      };

      const totalCost = shoppingItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);

      // Print-only-table CSS
      const printStyle = `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `;

      const handlePrint = () => window.print();

      return (
        <div className="min-h-screen bg-gray-100 font-inter">
          <style>{printStyle}</style>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
              Shopping & Inventory Manager
            </h2>

            <Header currentView={currentView} setCurrentView={setCurrentView} />

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
              </div>
            )}

            <div className="transition-opacity duration-500">
              {currentView === "inventory" && (
                <InventoryList
                  inventoryItems={inventoryItems}
                  amountInputs={amountInputs}
                  priceInputs={priceInputs}
                  handleAmountChange={handleAmountChange}
                  handlePriceChange={handlePriceChange}
                  handleAddToShopping={handleAddToShopping}
                  setAmountInputs={setAmountInputs}
                />
              )}

              {currentView === "shopping" && (
                <>
                  <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="w-full max-w-md">
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Monthly Budget
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monthlyBudget}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setMonthlyBudget(isNaN(v) ? 0 : v);
                        }}
                        className="w-full border border-gray-200 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter monthly budget"
                        aria-label="Monthly budget"
                      />
                    </div>
                    <button
                      onClick={handlePrint}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
                      aria-label="Print shopping list"
                    >
                      <i className="fas fa-print"></i> Print Shopping List
                    </button>
                  </div>
                  <div id="printable-area">
                    <ShoppingList
                      shoppingItems={shoppingItems}
                      calculateItemTotal={calculateItemTotal}
                      handleToggleStatus={handleToggleStatus}
                      handleRemove={handleRemove}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <BudgetSummary monthlyBudget={monthlyBudget} totalCost={totalCost} />
                    <BudgetChart monthlyBudget={monthlyBudget} totalCost={totalCost} />
                  </div>
                </>
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