import { useState, useEffect } from "react";
import axios from "axios";
import { Search, AlertCircle, ChefHat } from "lucide-react";

const GenerateRecipes = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setInventoryItems(res.data);
    } catch (err) {
      console.error(err);
      setAlert("Failed to fetch inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const fetchRecipes = async () => {
    if (selectedItems.length === 0) {
      setAlert("Please select at least one item to generate recipes.");
      return;
    }

    setIsLoading(true);
    try {
      const selectedItemNames = inventoryItems
        .filter((item) => selectedItems.includes(item._id))
        .map((item) => item.itemName.toLowerCase());

      // Spoonacular API key (replace with your own API key)
      const apiKey = "dfcfb49e8323452783b82e2411dcf64b";

      // Search for recipes using multiple ingredients in a single query
      const searchResponse = await axios.get(
        "https://api.spoonacular.com/recipes/complexSearch",
        {
          params: {
            apiKey,
            includeIngredients: selectedItemNames.join(","),
            number: 10, // Limit to 10 recipes
            addRecipeInformation: false // We'll fetch detailed info separately
          }
        }
      );

      const meals = searchResponse.data.results || [];

      // Fetch detailed information for each recipe
      const detailedRecipes = [];
      for (const meal of meals) {
        const detailResponse = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.id}/information`,
          {
            params: {
              apiKey,
              includeNutrition: false // We don't need nutrition data for now
            }
          }
        );

        const detailedMeal = detailResponse.data;

        // Extract ingredients
        const ingredients = detailedMeal.extendedIngredients.map((ing) => {
          const amount = ing.measures.metric.amount || ing.measures.us.amount;
          const unit = ing.measures.metric.unitShort || ing.measures.us.unitShort;
          return `${amount} ${unit} ${ing.name}`.trim();
        });

        // Extract instructions
        const instructions = detailedMeal.analyzedInstructions?.[0]?.steps?.map(
          (step) => step.step
        ) || [];

        detailedRecipes.push({
          name: detailedMeal.title,
          ingredients,
          instructions
        });
      }

      setRecipes(detailedRecipes);
      setAlert(null);
    } catch (err) {
      console.error(err);
      setAlert("Failed to fetch recipes. Please try again.");
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-10 space-y-10">
        <h2 className="text-3xl font-semibold text-gray-800 text-center flex items-center justify-center gap-2">
          <ChefHat className="w-8 h-8" /> Recipe Generator
        </h2>

        {alert && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{alert}</div>
        )}

        {/* Search and Select Items */}
        <div className="space-y-6">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`p-4 border rounded-md cursor-pointer transition ${
                  selectedItems.includes(item._id)
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 border-gray-300"
                }`}
                onClick={() => handleItemToggle(item._id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.itemName}</span>
                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                </div>
                <div className="text-sm text-gray-500">{item.category}</div>
              </div>
            ))}
          </div>

          <button
            onClick={fetchRecipes}
            className="w-full md:w-auto bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-500 transition"
            disabled={isLoading}
          >
            {isLoading ? "Generating Recipes..." : "Generate Recipes"}
          </button>
        </div>

        {/* Recipes Display */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Suggested Recipes</h3>
          {recipes.length === 0 && !isLoading && (
            <p className="text-gray-500">No recipes found. Select some items and generate recipes.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">{recipe.name}</h4>
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-700">Ingredients:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-700">Instructions:</h5>
                  <ol className="list-decimal list-inside text-sm text-gray-600">
                    {recipe.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipes;