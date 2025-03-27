import { useState, useEffect } from "react";
import axios from "axios";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: "", quantity: 1, expiryDate: "" });

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/inventory", newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
      setNewItem({ itemName: "", quantity: 1, expiryDate: "" });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Item Name" 
          value={newItem.itemName} 
          onChange={(e) => setNewItem({...newItem, itemName: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <input 
          type="number" 
          placeholder="Quantity" 
          value={newItem.quantity} 
          onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <input 
          type="date" 
          value={newItem.expiryDate} 
          onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded">Add Item</button>
      </div>
      <ul>
        {items.map(item => (
          <li key={item._id} className="mb-2">
            {item.itemName} - Quantity: {item.quantity} {item.expiryDate && `- Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
