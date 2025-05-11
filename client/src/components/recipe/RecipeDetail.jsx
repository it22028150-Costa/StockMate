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

  const splitInstructions = (instructions, forPrint = false) => {
    const sentences = instructions.split('.').filter(sentence => sentence.trim());
    if (forPrint) {
      return sentences.map(sentence => `${sentence.trim()}.`).join('<br/>');
    }
    return sentences.map((sentence, index) => (
      <p key={index} className="mt-2">{sentence.trim()}.</p>
    ));
  };

  const handlePrint = () => {
    const printContent = document.createElement("div");
    printContent.innerHTML = `
      <h2 style="font-size: 40px; margin-bottom: 20px;">${recipe.strMeal}</h2>
      <div style="font-size: 24px; margin-bottom: 20px;">
        <p><strong>Locality: </strong>${recipe.strArea}</p>
        <p><strong>Category: </strong>${recipe.strCategory}</p>
      </div>
      <div style="display: flex; margin-bottom: 20px;">
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" style="width: 600px; height: auto;">
        <div style="margin-left: 20px;">
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Ingredients:</h3>
          <ol style="margin-left: 20px; font-size: 18px;">
            ${ingredientsWithMeasures.map((item) => `<li>${item}</li>`).join('')}
          </ol>
        </div>
      </div>
      <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Instructions:</h3>
      <div style="font-size: 18px;">${splitInstructions(recipe.strInstructions, true)}</div>
    `;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
      <head>
        <title>Print Recipe - ${recipe.strMeal}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          h2 { font-size: 40px; margin-bottom: 20px; }
          h3 { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          p { font-size: 18px; margin: 0 0 10px; }
          ol { font-size: 18px; margin-left: 20px; }
          li { margin-bottom: 5px; }
          img { max-width: 100%; height: auto; }
          @media print {
            body { padding: 10px; }
            img { width: 400px; height: auto; }
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-5xl">{recipe.strMeal}</h2>
            <div className="flex text-2xl ml-1 mt-4">
              <p><strong>Locality: </strong>{recipe.strArea}</p>
              <p className="ml-12"><strong>Category: </strong>{recipe.strCategory}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-5 py-3 rounded-md hover:bg-green-500 transition font-medium"
          >
            Print Recipe
          </button>
        </div>
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
    </div>
  );
};

export default RecipeDetail;