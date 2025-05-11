import { useState, useEffect } from "react";
import axios from "axios";
import { Button,Input, AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
const { Search } = Input;



const Recipe = () => {
  const [recipeSearch, setRecipeSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate(); 
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ title: "", ingredients: "", instructions: "" });


//Search and live generate recipes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (recipeSearch.length < 3) {
        setSuggestions([]);
        return;
      }
  
      try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeSearch}`);
        const meals = res.data.meals || [];
        
        const suggestions = meals.map(meal => ({
          value: meal.strMeal,
          id: meal.idMeal, 
        }));
        
        console.log("Suggestions: ", suggestions); 
        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
  
    fetchSuggestions();
  }, [recipeSearch]);

 
//Redirect to different page when recipe is selected  
  const handleSelect = (value, option) => {
    if (option && option.id) {
      navigate(`/recipe/${option.id}`); 
    } else {
      console.log("ID is missing");
    }
  };
 

//Get the custom recipes added by user
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


//Add custom recipes
  const handleAdd = async () => {
    try {
      const token = localStorage.getItem("token");
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

      <h2 className="font-bold mb-4 text-5xl text-center h-48" style={{
    backgroundImage: 'url("https://wallpaperaccess.com/full/767352.jpg")',
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}>Recipes & Meal Planning </h2>


    <AutoComplete
        options={suggestions}
        onSelect={handleSelect}
        onSearch={(value) => setRecipeSearch(value)}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <Search
          placeholder="Search for recipes"

          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
          enterButton
        />
      </AutoComplete>

      <Button type="primary">Generate Recipe from Ingredients</Button>
      
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
