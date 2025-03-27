import { useState, useEffect } from "react";
import axios from "axios";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ title: "", ingredients: "", instructions: "" });

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/recipe", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("token");
      // Split ingredients by comma
      const recipeData = { ...newRecipe, ingredients: newRecipe.ingredients.split(",") };
      await axios.post("http://localhost:5000/api/recipe", recipeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecipes();
      setNewRecipe({ title: "", ingredients: "", instructions: "" });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recipe & Meal Planning</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Recipe Title" 
          value={newRecipe.title} 
          onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <input 
          type="text" 
          placeholder="Ingredients (comma separated)" 
          value={newRecipe.ingredients} 
          onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <textarea 
          placeholder="Instructions" 
          value={newRecipe.instructions} 
          onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})} 
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAdd} className="bg-purple-600 text-white p-2 rounded">Add Recipe</button>
      </div>
      <ul>
        {recipes.map(recipe => (
          <li key={recipe._id} className="mb-2">
            <strong>{recipe.title}</strong><br/>
            Ingredients: {recipe.ingredients.join(", ")}<br/>
            Instructions: {recipe.instructions}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recipe;
