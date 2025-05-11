import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, AutoComplete, Form, Card, Modal, message, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { TextArea } = Input;

const Recipe = () => {
  const [recipeSearch, setRecipeSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // Search and live generate recipes
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

        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [recipeSearch]);

  // Redirect to different page when recipe is selected
  const handleSelect = (value, option) => {
    if (option && option.id) {
      navigate(`/recipe/${option.id}`);
    } else {
      console.log("ID is missing");
    }
  };

  // Get the custom recipes added by user
  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/recipe", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Add custom recipes
  const handleAdd = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const recipeData = {
        title: values.title,
        ingredients: values.ingredients.split(",").map(item => item.trim()),
        instructions: values.instructions
      };
      await axios.post("http://localhost:5000/api/recipe", recipeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Recipe added successfully!");
      fetchRecipes();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Failed to add recipe. Please try again.");
    }
  };

  // Edit recipe
  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    editForm.setFieldsValue({
      title: recipe.title,
      ingredients: recipe.ingredients.join(", "),
      instructions: recipe.instructions
    });
    setIsModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const recipeData = {
        title: values.title,
        ingredients: values.ingredients.split(",").map(item => item.trim()),
        instructions: values.instructions
      };
      await axios.put(`http://localhost:5000/api/recipe/${editingRecipe._id}`, recipeData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Recipe updated successfully!");
      setIsModalVisible(false);
      fetchRecipes();
    } catch (err) {
      console.error(err);
      message.error("Failed to update recipe. Please try again.");
    }
  };

  // Delete recipe
  const handleDelete = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Recipe deleted successfully!");
      fetchRecipes();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete recipe. Please try again.");
    }
  };

  // Navigate to GenerateRecipes page
  const handleNavigateToGenerate = () => {
    navigate("/recipe/generate");
  };

  // Split instructions into numbered steps
  const parseInstructions = (instructions) => {
    if (!instructions) return [];
    // Split by numbering pattern (e.g., "1. Cook. 2. Clean" or "1. Cook 2. Clean")
    const steps = instructions.split(/(?=\d+\.\s)/).map(step => step.trim()).filter(step => step);
    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <h2
          className="font-bold mb-4 text-5xl text-center h-48 text-white"
          style={{
            backgroundImage: 'url("https://wallpaperaccess.com/full/767352.jpg")',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Recipes & Meal Planning
        </h2>

        <div className="flex justify-center">
          <AutoComplete
            options={suggestions}
            onSelect={handleSelect}
            onSearch={(value) => setRecipeSearch(value)}
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <Search
              placeholder="Search for recipes"
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              enterButton
            />
          </AutoComplete>
        </div>

        <div className="flex justify-center">
          <Button
            type="primary"
            onClick={handleNavigateToGenerate}
            className="bg-blue-600 hover:bg-blue-500"
            size="large"
          >
            Generate Recipe from Ingredients
          </Button>
        </div>

        {/* Add Recipe Form */}
        <Card title="Add a New Recipe" className="shadow-md">
          <Form
            form={form}
            onFinish={handleAdd}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              label="Recipe Title"
              name="title"
              rules={[{ required: true, message: "Please enter the recipe title!" }]}
            >
              <Input placeholder="Enter recipe title" />
            </Form.Item>

            <Form.Item
              label="Ingredients (comma-separated)"
              name="ingredients"
              rules={[{ required: true, message: "Please enter the ingredients!" }]}
            >
              <Input placeholder="e.g., tomatoes, onions, garlic" />
            </Form.Item>

            <Form.Item
              label="Instructions"
              name="instructions"
              rules={[{ required: true, message: "Please enter the instructions!" }]}
            >
              <TextArea rows={4} placeholder="Enter cooking instructions (e.g., 1. Cook 2. Clean)" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-purple-600 hover:bg-purple-500 w-full"
              >
                Add Recipe
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Display Recipes */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Your Recipes</h3>
          {recipes.length === 0 && (
            <p className="text-gray-500">No recipes added yet. Add a recipe above!</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe._id} className="border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800">{recipe.title}</h4>
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
                  <ol className="text-sm text-gray-600">
                    {parseInstructions(recipe.instructions).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="primary"
                    onClick={() => handleEdit(recipe)}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Are you sure to delete this recipe?"
                    onConfirm={() => handleDelete(recipe._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" danger>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          title="Edit Recipe"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            form={editForm}
            onFinish={handleEditSubmit}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              label="Recipe Title"
              name="title"
              rules={[{ required: true, message: "Please enter the recipe title!" }]}
            >
              <Input placeholder="Enter recipe title" />
            </Form.Item>

            <Form.Item
              label="Ingredients (comma-separated)"
              name="ingredients"
              rules={[{ required: true, message: "Please enter the ingredients!" }]}
            >
              <Input placeholder="e.g., tomatoes, onions, garlic" />
            </Form.Item>

            <Form.Item
              label="Instructions"
              name="instructions"
              rules={[{ required: true, message: "Please enter the instructions!" }]}
            >
              <TextArea rows={4} placeholder="Enter cooking instructions (e.g., 1. Cook 2. Clean)" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-purple-600 hover:bg-purple-500 w-full"
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Recipe;