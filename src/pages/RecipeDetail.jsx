import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contentApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import { useLiveData } from '../hooks/useLiveData';
import '../styles/main.css';
import '../styles/recipes.css';

function RecipeDetail() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecipe = useCallback(() => {
    setLoading(true);
    setError('');
    contentApi
      .getRecipe(slug)
      .then((res) => setRecipe(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useLiveData(loadRecipe, [slug]);

  return (
    <section className="product-detail-page recipe-detail-page">
      <div className="container">
        <Link to="/recipes" className="product-detail-back">
          <i className="bi bi-arrow-left" /> Back to Recipes
        </Link>

        {loading && <p className="product-detail-status">Loading...</p>}
        {error && !loading && (
          <div className="product-detail-error">
            <p>{error}</p>
          </div>
        )}

        {recipe && !loading && (
          <>
            <header className="recipe-detail-header">
              <div className="recipe-detail-thumb">
                <img src={resolveImageUrl(recipe.image)} alt={recipe.title} />
              </div>

              <div className="recipe-detail-summary">
                <span className="product-detail-label">Recipe</span>
                <h1>{recipe.title}</h1>
                {recipe.description && <p className="product-detail-desc">{recipe.description}</p>}

                {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                  <div className="recipe-meta-inline">
                    {recipe.prepTime && (
                      <span>
                        <i className="bi bi-clock" /> {recipe.prepTime} prep
                      </span>
                    )}
                    {recipe.cookTime && (
                      <span>
                        <i className="bi bi-fire" /> {recipe.cookTime} cook
                      </span>
                    )}
                    {recipe.servings && (
                      <span>
                        <i className="bi bi-people" /> {recipe.servings}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </header>

            <div className="recipe-detail-body">
              {(recipe.ingredients || []).length > 0 && (
                <div className="recipe-detail-block">
                  <h3>
                    <i className="bi bi-basket" /> Ingredients
                  </h3>
                  <ul className="recipe-ingredients-list">
                    {recipe.ingredients.map((item) => (
                      <li key={item}>
                        <i className="bi bi-dot" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(recipe.steps || []).length > 0 && (
                <div className="recipe-detail-block">
                  <h3>
                    <i className="bi bi-list-ol" /> Steps
                  </h3>
                  <ol className="recipe-steps-list">
                    {recipe.steps.map((step, index) => (
                      <li key={step}>
                        <span className="recipe-step-num">{index + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default RecipeDetail;