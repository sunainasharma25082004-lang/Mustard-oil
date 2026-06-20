import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import { useLiveData } from '../hooks/useLiveData';
import '../styles/recipes.css';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = useCallback(() => {
    setLoading(true);
    contentApi
      .getRecipes()
      .then((res) => setRecipes(res.data || []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  useLiveData(loadRecipes);

  return (
    <section className="recipes-page">
      <div className="container">
        <header className="recipes-heading">
          <span>Recipes</span>
          <h1>Cook With Karyor</h1>
          <p>Mustard oil recipes for everyday Indian cooking.</p>
        </header>

        {loading && <p className="recipe-loading">Loading...</p>}

        {!loading && recipes.length === 0 && (
          <div className="recipe-empty-state">
            <i className="bi bi-journal-richtext" aria-hidden="true" />
            <p>No recipes yet. Check back soon.</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe._id}>
                <Link to={`/recipes/${recipe.slug}`} className="recipe-card-link">
                  <div className="recipe-card-image">
                    <img src={resolveImageUrl(recipe.image)} alt={recipe.title} loading="lazy" />
                  </div>
                  <div className="recipe-card-body">
                    <h3>{recipe.title}</h3>
                    {recipe.description && <p>{recipe.description}</p>}
                    {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                      <div className="recipe-card-meta">
                        {recipe.prepTime && (
                          <span>
                            <i className="bi bi-clock" aria-hidden="true" />
                            {recipe.prepTime}
                          </span>
                        )}
                        {recipe.cookTime && (
                          <span>
                            <i className="bi bi-fire" aria-hidden="true" />
                            {recipe.cookTime}
                          </span>
                        )}
                        {recipe.servings && (
                          <span>
                            <i className="bi bi-people" aria-hidden="true" />
                            {recipe.servings}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Recipes;