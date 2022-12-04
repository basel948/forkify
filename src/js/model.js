import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const creatRecipeObject = function (data) {
  // Refactoring the data names.
  const { recipe } = data.data; // using destructuring

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    cookingTime: recipe.cooking_time,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    // if recipe.key is false then nothing happens
    // if recipe.key is true then we will return {key : recipe.key} and spread it
    // basically if true, it like we added a normal attribute key : recipe.key
    ...(recipe.key && { key: recipe.key }),
  };
};
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = creatRecipeObject(data);
    // we check if in the bookmarks array the recipe with the same id we recived has been bookmarked
    // if yes this recipe will be bookmarked. even after going into another recipe (true)
    // if no this recipe will not be bookmarked (false)
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // making a new object to refactor the data names and only use the that we want.
    state.search.results = data.data.recipes.map(rcp => {
      return {
        id: rcp.id,
        title: rcp.title,
        publisher: rcp.publisher,
        image: rcp.image_url,
        ...(rcp.key && { key: rcp.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

// if we dont pass any page number to the functions, by default the number will be the number in the state which is 1.
export const getResPerPage = function (page = state.search.page) {
  state.search.page = page;
  // we want to show in every page 10 recipes, so from the array we take from:
  // 0-9 , 10-19 , 20-29
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (servings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * servings) / state.recipe.servings;
  });

  state.recipe.servings = servings;
};

const presistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
  // add bookmark to the bookmarks array
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  presistBookmarks();
};

export const removeBookmark = function (id) {
  // remove bookmark from the bookmarks array
  // we go through the array one by one and find the index of the item that has the same id,
  // and then we slice it from the bookmarks array
  const index = state.bookmarks.indexOf(el => el.id === id);
  state.bookmarks.splice(index, 1);
  // Mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  presistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// this we use only when we want to clear the localStorage, so we keep it commented
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  // console.log(Object.entries(newRecipe));
  try {
    // we take the ingredients from the array(we Re-converted the object into an array) we only take the ingredients that has an input
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong Ingredient Format, Please use the correct format! '
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      image_url: newRecipe.image,
      ingredients,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      source_url: newRecipe.sourceUrl,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = creatRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
