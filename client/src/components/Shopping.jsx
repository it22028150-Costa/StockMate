import { useState, useEffect } from "react";
import axios from "axios";

const Shopping = () => {
  const [items, setItems] = useState([]);
  const [newShopping, setNewShopping] = useState({ itemName: "", amount: 0 });

  const fetchShopping = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/shopping", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShopping();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/shopping", newShopping, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchShopping();
      setNewShopping({ itemName: "", amount: 0 });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Shopping & Budget Management</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Item Name" 
          value={newShopping.itemName} 
          onChange={(e) => setNewShopping({...newShopping, itemName: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <input 
          type="number" 
          placeholder="Amount" 
          value={newShopping.amount} 
          onChange={(e) => setNewShopping({...newShopping, amount: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAdd} className="bg-yellow-600 text-white p-2 rounded">Add Shopping Item</button>
      </div>
      <ul>
        {items.map(item => (
          <li key={item._id} className="mb-2">
            {item.itemName} - Amount: {item.amount} - Status: {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shopping;
