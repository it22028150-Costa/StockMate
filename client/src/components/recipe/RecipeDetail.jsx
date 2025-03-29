import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState("instructions");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        if (res.data.meals) {
          const selectedRecipe = res.data.meals[0];
          setRecipe(selectedRecipe);
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (!recipe) return <p>Loading...</p>;

  const ingredientsWithMeasures = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && measure) {
      ingredientsWithMeasures.push(`${ingredient} - ${measure}`);
    }
  }

  const splitInstructions = (instructions) => {
    return instructions.split('.').map((sentence, index) => {
      if (sentence.trim()) {
        return (
          <p key={index} className="mt-2">{sentence.trim()}.</p>
        );
      }
      return null;
    });
  };

  return (
    <div>
      <div className="flex">
        <div>
          <h2 className="text-5xl">{recipe.strMeal}</h2>
          <div className="flex text-2xl ml-1 mt-4">
            <p><strong>Locality: </strong>{recipe.strArea}</p>
            <p className="ml-12"><strong>Category: </strong>{recipe.strCategory}</p>
          </div>
        </div>
      </div>
      <br />
      <div className="flex">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          style={{ width: "800px", height: "500px" }}
        />
        <div className="ml-20">
          <h3 className="text-xl font-bold">Ingredients:</h3>
          <ol className="ml-4 mt-3" style={{ listStyleType: "decimal" }}>
            {ingredientsWithMeasures.map((ingredientWithMeasure, index) => (
              <li key={index}>{ingredientWithMeasure}</li>
            ))}
          </ol>
        </div>
      </div>


      <div className="mt-4">
        <button
          onClick={() => setActiveTab("instructions")}
          className={`px-4 py-2 mr-4 ${activeTab === "instructions" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          How-To (Instructions)
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`px-4 py-2 ${activeTab === "video" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Video
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "instructions" && (
          <div>
            <h3 className="text-xl font-bold">Instructions:</h3>
            {splitInstructions(recipe.strInstructions)}
          </div>
        )}

        {activeTab === "video" && (
          <div>
            <h3 className="text-xl font-bold">Watch the Recipe Video</h3>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${recipe.strYoutube.split('v=')[1]}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
