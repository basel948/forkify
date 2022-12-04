import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_WINDOW } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
module.exports = {
  minifySvg: false,
};
// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    // if there is no id, return
    if (!id) return;
    recipeView.loadSpinner();

    // 0) Update the bookmark and results view to mark the selected recipe
    resultsView.update(model.getResPerPage());
    bookmarksView.update(model.state.bookmarks);
    // 1) Loading Recipe
    //no need to store it an a variable,the functions returns nothing it only loads the recipe
    await model.loadRecipe(id);

    // 2) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }
};

const controlSearch = async function () {
  try {
    resultsView.loadSpinner();

    // 1) Get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Get Search Results
    await model.loadSearchResults(query);

    // 3) Render Search Results
    // resultsView.render(model.state.search.results); // this line will show all results.
    resultsView.render(model.getResPerPage());

    // 4) render the Pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const contorlPagination = function (goToPage) {
  // 1) Render NEW Search Results
  resultsView.render(model.getResPerPage(goToPage));

  // 2) render NEW Pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe serving (in the state)
  model.updateServings(newServings);
  // update the recipe view
  // recipeView.render(model.state.recipe); // we dont want to update all the view every time we change something, so we use the update method so it can update only the thing that need updating
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add or Remove Bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  // 2) Update recipe view to be able to see the new bookmarks
  recipeView.update(model.state.recipe);

  // 3) Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render Loading Spinner
    addRecipeView.loadSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe View
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render Bookmarks View
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    /// Close Form Window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_WINDOW * 1000);
  } catch (error) {
    console.error(error);
    addRecipeView.renderError(error.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearch);
  paginationView.addHandlerClick(contorlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
