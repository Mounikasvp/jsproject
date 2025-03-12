// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmYXy4OGpK_BwJ_26f4W4azKDZDICWR3w",
    authDomain: "emaillogin-d9312.firebaseapp.com",
    projectId: "emaillogin-d9312",
    storageBucket: "emaillogin-d9312.firebasestorage.app",
    messagingSenderId: "490730052655",
    appId: "1:490730052655:web:5533571f2948710781bada",
    measurementId: "G-TE5EVPJVM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get category from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');

// Update category title
document.getElementById('categoryTitle').textContent = 
    category ? category.charAt(0).toUpperCase() + category.slice(1) + ' Recipes' : 'All Recipes';

let allRecipes = [];

// Fetch recipes from Firestore
async function fetchRecipes() {
    try {
        const recipesRef = collection(db, 'recipes');
        let recipeQuery;
        
        if (category) {
            recipeQuery = query(recipesRef, where('category', '==', category));
        } else {
            recipeQuery = recipesRef;
        }
        
        const querySnapshot = await getDocs(recipeQuery);
        allRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayRecipes(allRecipes);
    } catch (error) {
        console.error("Error fetching recipes: ", error);
    }
}

// Display recipes in the grid
function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

// Create recipe card element
function createRecipeCard(recipe) {
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const isFavorite = favorites.some(fav => fav.id === recipe.id);
    
    const card = document.createElement('div');
    card.className = 'recipe-card bg-white rounded-lg shadow-lg overflow-hidden';
    
    // Properly stringify the recipe object and escape quotes
    const recipeJSON = JSON.stringify(recipe).replace(/"/g, '&quot;');
    
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-64 object-cover"/>
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold">${recipe.name}</h3>
                <button onclick="toggleFavorite(event, '${recipeJSON}')" class="focus:outline-none">
                    <svg class="w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}" 
                         fill="${isFavorite ? 'currentColor' : 'none'}" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            <span class="inline-block bg-[#f4b266] text-white px-3 py-1 rounded-full text-sm mb-3">${recipe.category}</span>
            <p class="text-gray-600 mb-4">${recipe.description ? recipe.description.substring(0, 150) : ''}...</p>
            <button onclick="viewRecipe('${recipe.id}')" class="explore-btn text-white px-6 py-2 rounded-full font-bold">Explore Recipe</button>
        </div>
    `;
    return card;
}

// Toggle favorite status of recipe
window.toggleFavorite = function(event, recipeJSON) {
    event.stopPropagation();
    try {
        // Parse the recipe JSON string back into an object
        const recipe = JSON.parse(recipeJSON);
        let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
        
        if (existingIndex >= 0) {
            favorites.splice(existingIndex, 1);
        } else {
            favorites.push(recipe);
        }
        
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
        displayRecipes(allRecipes); // Refresh the display to update heart icons
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
};

// // Search recipes by name
// window.searchRecipes = function() {
//     const query = document.getElementById('searchInput').value.toLowerCase();
//     const filteredRecipes = allRecipes.filter(recipe => 
//         recipe.name.toLowerCase().includes(query)
//     );
//     displayRecipes(filteredRecipes);
// };
// Function to handle search
window.searchRecipes = function() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredRecipes = allRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query)
    );
    displayRecipes(filteredRecipes);
};

// Add event listener for Enter key
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchRecipes(); // Trigger search when Enter is pressed
    }
});

// Optional: Add event listener to the search button
document.getElementById('searchButton').addEventListener('click', function() {
    searchRecipes(); // Trigger search when the button is clicked
});

// Navigate to recipe detail page
window.viewRecipe = function(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
};

// Logout function
window.logout = function() {
    Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: '#808080',
        confirmButtonText: 'Yes, logout!'
    }).then((result) => {
        if (result.isConfirmed) {
            signOut(auth).then(() => {
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#ff6b6b'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }).catch((error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to logout: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#ff6b6b'
                });
            });
        }
    });
};

// Check authentication state and fetch recipes
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        fetchRecipes();
    }
});
function goBack() {
    // Always redirect to the home page
    window.location.href = "yum.html";
}

// Add event listener to the back button once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        // Ensure the button is visible
        backButton.style.display = "inline-block";
        backButton.style.visibility = "visible";
        backButton.style.opacity = "1";
        // Add background color to make it more noticeable
        backButton.style.backgroundColor = "#ca8a04";
        
        backButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default action
            goBack();
        });
    } else {
        console.error("Back button not found in the DOM");
    }
});