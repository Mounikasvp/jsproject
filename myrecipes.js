// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase Configuration
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

// Check Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserRecipes(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

async function loadUserRecipes(userId) {
    try {
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef, where("user.uid", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const recipesContainer = document.getElementById("recipesContainer");
        recipesContainer.innerHTML = "";
        
        if (querySnapshot.empty) {
            recipesContainer.innerHTML = "<p class='text-center text-gray-600 py-8 animate__animated animate__fadeIn'>No recipes found. Create one to get started!</p>";
            return;
        }
        
        querySnapshot.forEach((doc, index) => {
            const recipe = doc.data();
            const avgRating = recipe.feedback ? 
                (recipe.feedback.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedback.length).toFixed(1) : '0.0';

            const recipeCard = document.createElement("div");
            recipeCard.classList.add(
                "recipe-card", "bg-white", "rounded-lg", "shadow-md", 
                "staggered-appear", "overflow-hidden"
            );
            recipeCard.style.setProperty('--card-index', index);
            
            recipeCard.innerHTML = `
                <div class="recipe-image-container">
                    <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.name}" class="w-full h-48 object-cover recipe-image"/>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2 text-gray-800">${recipe.name}</h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${recipe.description.length > 100 ? recipe.description.substring(0, 100) + "..." : recipe.description}</p>
                    <div class="flex flex-wrap mb-3">
                        <span class="recipe-badge bg-yellow-100 text-yellow-800">${recipe.category || 'Uncategorized'}</span>
                       
                    </div>
                    <div class="flex justify-between pt-2">
                    <button onclick="console.log('Button clicked'); if(typeof viewRecipe === 'function') { viewRecipe('${doc.id}'); } else { console.error('viewRecipe function not found'); }" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">View</button>
                        <button onclick="editRecipe('${doc.id}')" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">Edit</button>
                        <button onclick="deleteRecipe('${doc.id}')" class="btn-action bg-yellow-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 transform hover:scale-105">Delete</button>
                    </div>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });
        
        // Activate staggered animation after cards are added
        setTimeout(() => {
            const staggeredCards = document.querySelectorAll('.staggered-appear');
            staggeredCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('card-appear');
                }, 100 * index);
            });
        }, 300);
        
    } catch (error) {
        console.error("Error fetching recipes:", error);
        Swal.fire('Error', 'Failed to load recipes: ' + error.message, 'error');
    }
}

// Make functions accessible globally
// window.viewRecipe = function(recipeId) {
//     window.location.href = `recipe-details.html?id=${recipeId}`;
// };
// Make functions accessible globally
// window.viewRecipe = function(recipeId) {
//     if (!recipeId) {
//         console.error("Recipe ID is undefined");
//         return;
//     }
//     console.log("Viewing recipe:", recipeId); // Add this for debugging
//     window.location.href = `recipe-details.html?id=${recipeId}`;
// };
window.viewRecipe = function(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
};

window.editRecipe = async function(recipeId) {
    try {
        const docRef = doc(db, 'recipes', recipeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const recipe = docSnap.data();
            document.getElementById('recipeId').value = recipeId;
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            document.getElementById('recipeIngredients').value = recipe.ingredients;
            document.getElementById('recipeInstructions').value = recipe.instructions;
            document.getElementById('recipeImage').value = recipe.image;
            document.getElementById('recipeVideo').value = recipe.video;
            
            if (document.getElementById('recipeCategory')) {
                document.getElementById('recipeCategory').value = recipe.category || 'Uncategorized';
            }

            showEditModal();
        }
    } catch (error) {
        console.error("Error getting recipe:", error);
        Swal.fire('Error', 'Failed to load recipe: ' + error.message, 'error');
    }
};
// Add this function to your JavaScript file
function addCategoryDropdownToEditForm() {
    // Check if the category dropdown already exists to avoid duplication
    if (!document.getElementById('recipeCategory')) {
        // Create the category dropdown
        const categoryDropdown = document.createElement('div');
        categoryDropdown.className = 'form-group mb-3';
        categoryDropdown.innerHTML = `
            <label for="recipeCategory" class="block text-gray-700 font-semibold mb-2">Category</label>
            <select id="recipeCategory" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all">
           
                    <select id="recipeCategory" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                        <option value="" disabled selected>Select Category</option>
                        <option value="beverages">Beverages</option>
                        <option value="biryani">Biryani</option>
                        <option value="pizza">Pizza</option>
                        <option value="burger">Burger</option>
                        <option value="desserts">Desserts</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="pasta">Pasta</option>
                        <option value="others">Others</option>
             
            </select>
        `;
        
        // Find a good place to insert the dropdown in the form
        // Let's assume there's a submit button or another form field we can reference
        const form = document.getElementById('editRecipeForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Insert before the submit button's parent container
        if (submitButton && submitButton.parentElement) {
            form.insertBefore(categoryDropdown, submitButton.parentElement);
        } else {
            // If we can't find the submit button, just append to the form
            form.appendChild(categoryDropdown);
        }
    }
}

// Modify your existing editRecipe function
window.editRecipe = async function(recipeId) {
    try {
        const docRef = doc(db, 'recipes', recipeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const recipe = docSnap.data();
            document.getElementById('recipeId').value = recipeId;
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            document.getElementById('recipeIngredients').value = recipe.ingredients;
            document.getElementById('recipeInstructions').value = recipe.instructions;
            document.getElementById('recipeImage').value = recipe.image;
            document.getElementById('recipeVideo').value = recipe.video;
            
            // Show the edit modal first
            showEditModal();
            
            // Then add the category dropdown if it doesn't exist
            addCategoryDropdownToEditForm();
            
            // Now set the value of the category dropdown
            setTimeout(() => {
                const categoryDropdown = document.getElementById('recipeCategory');
                if (categoryDropdown) {
                    // Check if the recipe's category is in our fixed list
                    const validCategories = ['beverages', 'biryani', 'pizza', 'burger', 'desserts', 'breakfast', 'pasta', 'others'];
                    
                    // If the recipe has a valid category, use it, otherwise default to "Uncategorized"
                    if (recipe.category && validCategories.includes(recipe.category)) {
                        categoryDropdown.value = recipe.category;
                    } else {
                        categoryDropdown.value = 'Uncategorized';
                    }
                }
            }, 100); // Short timeout to ensure the dropdown is in the DOM
        }
    } catch (error) {
        console.error("Error getting recipe:", error);
        Swal.fire('Error', 'Failed to load recipe: ' + error.message, 'error');
    }
};

// Make sure the category is included when updating the recipe
document.getElementById('editRecipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipeId = document.getElementById('recipeId').value;
    const user = auth.currentUser;

    // Show loading indicator
    Swal.fire({
        title: 'Saving...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Get the category value from the dropdown
    const categoryElement = document.getElementById('recipeCategory');
    const category = categoryElement ? categoryElement.value : 'Uncategorized';

    const updatedRecipe = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value,
        instructions: document.getElementById('recipeInstructions').value,
        image: document.getElementById('recipeImage').value || '/api/placeholder/300/200',
        video: document.getElementById('recipeVideo').value || '',
        category: category, // Using the selected category
        user: user ? { email: user.email, uid: user.uid } : {},
        updatedAt: serverTimestamp()
    };

    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, updatedRecipe);
        Swal.fire({
            title: 'Success!',
            text: 'Recipe updated successfully!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        window.closeEditModal();
        loadUserRecipes(user.uid);
    } catch (error) {
        Swal.fire('Error', 'Failed to update recipe: ' + error.message, 'error');
    }
});

window.showEditModal = function() {
    const modal = document.getElementById('editRecipeModal');
    modal.style.display = 'flex';
    modal.classList.add('animate__animated', 'animate__fadeIn');
};

window.closeEditModal = function() {
    const modal = document.getElementById('editRecipeModal');
    modal.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('animate__animated', 'animate__fadeOut');
    }, 300);
};

document.getElementById('editRecipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipeId = document.getElementById('recipeId').value;
    const user = auth.currentUser;

    // Show loading indicator
    Swal.fire({
        title: 'Saving...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const updatedRecipe = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value,
        instructions: document.getElementById('recipeInstructions').value,
        image: document.getElementById('recipeImage').value || '/api/placeholder/300/200',
        video: document.getElementById('recipeVideo').value || '',
        category: document.getElementById('recipeCategory')?.value || 'Uncategorized',
        user: user ? { email: user.email, uid: user.uid } : {},
        updatedAt: serverTimestamp()
    };

    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, updatedRecipe);
        Swal.fire({
            title: 'Success!',
            text: 'Recipe updated successfully!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        window.closeEditModal();
        loadUserRecipes(user.uid);
    } catch (error) {
        Swal.fire('Error', 'Failed to update recipe: ' + error.message, 'error');
    }
});

window.deleteRecipe = async function(recipeId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to recover this recipe!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f87171',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'btn-action',
            cancelButton: 'btn-action'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const recipeRef = doc(db, 'recipes', recipeId);
                await deleteDoc(recipeRef);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your recipe has been deleted.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
                loadUserRecipes(auth.currentUser.uid);
            } catch (error) {
                Swal.fire('Error', 'Failed to delete recipe: ' + error.message, 'error');
            }
        }
    });
};

window.logout = async function() {
    Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f87171',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, logout!',
        cancelButtonText: 'Cancel',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await signOut(auth);
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#f87171',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to logout: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#f87171'
                });
            }
        }
    });
};
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
