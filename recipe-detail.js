// Firebase Configuration

// Initialize Firebase with v9 syntax
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmYXy4OGpK_BwJ_26f4W4azKDZDICWR3w",
    authDomain: "emaillogin-d9312.firebaseapp.com",
    projectId: "emaillogin-d9312",
    storageBucket: "emaillogin-d9312.firebasestorage.app",
    messagingSenderId: "490730052655",
    appId: "1:490730052655:web:5533571f2948710781bada",
    measurementId: "G-TE5EVPJVM6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');
let currentUserEmail = '';
let currentRating = 0;
let feedbackBeingEdited = null;

async function fetchRecipeDetails() {
    if (!recipeId) {
        document.getElementById('recipeDetails').innerHTML = 
            `<p class='text-center text-red-500 py-8'>Recipe not found.</p>`;
        return;
    }

    try {
        const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
        
        if (recipeDoc.exists()) {
            displayRecipeDetails(recipeDoc.data());
            loadFeedbacks();
        } else {
            document.getElementById('recipeDetails').innerHTML = 
                `<p class='text-center text-red-500 py-8'>Recipe not found.</p>`;
        }
    } catch (error) {
        console.error("Error fetching recipe:", error);
    }
}

function displayRecipeDetails(recipe) {
    document.getElementById('recipeDetails').innerHTML = `
    <div class="recipe-grid">
    <div class="recipe-header">
        <h1 class="text-2xl font-bold text-[#693d52]">${recipe.name}</h1>
    </div>

      <div class="recipe-image">
        <div class="content-section p-0 overflow-hidden">
            <img src="${recipe.image}" alt="${recipe.name}" 
                class="w-full  object-cover">
        </div>
    </div>

    <div class="recipe-description">
        <div class="content-section">
            <h2 class="text-lg font-semibold text-[#693d52] mb-1">About this Recipe</h2>
            <p class="text-gray-700 text-sm leading-tight mb-2">${recipe.description}</p>
        </div>
    </div>

    <div class="recipe-ingredients">
        <div class="content-section">
            <h2 class="text-xl font-semibold text-[#693d52] mb-2">Ingredients</h2>
            <div class="text-gray-700 whitespace-pre-line">
                ${recipe.ingredients}
            </div>
        </div>
    </div>

    <div class="recipe-instructions">
        <div class="content-section">
            <h2 class="text-xl font-semibold text-[#693d52] mb-2">Instructions</h2>
            <div class="text-gray-700 whitespace-pre-line">
                ${recipe.instructions}
            </div>
        </div>
    </div>

    ${recipe.video ? `
        <div class="recipe-video">
            <div class="content-section">
                <h2 class="text-xl font-semibold text-[#693d52] mb-2">Video Tutorial</h2>
                <div class="aspect-w-16 aspect-h-9">
                    ${recipe.video}
                </div>
            </div>
        </div>
    ` : ''}

    <div class="recipe-feedback">
        <div class="content-section">
            <h2 class="text-xl font-semibold text-[#693d52] mb-2">Feedback & Ratings</h2>
            
            <div class="mb-4" id="feedbackForm">
                <div class="flex items-center mb-1">
                    <span class="mr-2">Rating:</span>
                    <div class="stars">
                        ${[1, 2, 3, 4, 5].map(num => 
                            `<i class="fas fa-star star" data-rating="${num}"></i>`
                        ).join('')}
                    </div>
                </div>
                <textarea id="feedbackText" class="w-full p-2 border rounded-md mb-2 " 
                    rows="2" placeholder="Share your thoughts about this recipe..."></textarea>
                <div class="flex gap-2">
                    <button id="submitFeedbackBtn" onclick="submitFeedback()" 
                        class="back-btn text-white px-4 py-1 rounded-full font-medium text-sm">
                        Submit Feedback
                    </button>
                 
                </div>
            </div>

            <div id="feedbacksList" class="space-y-3">
                <!-- Feedbacks will be loaded here -->
            </div>
        </div>
    </div>
</div>
     `;
    
    // Add star rating functionality
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            currentRating = rating;
            updateStars(rating);
        });
    });
}

function updateStars(rating) {
    document.querySelectorAll('.star').forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    if (!feedbackText || currentRating === 0) {
        // Using SweetAlert2 syntax
        Swal.fire({
            title: 'Error!',
            text: 'Please provide both a rating and feedback text.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Get existing feedbacks
    const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
    
    if (feedbackBeingEdited !== null) {
        // Edit existing feedback
        feedbacks[feedbackBeingEdited] = {
            email: currentUserEmail,
            rating: currentRating,
            text: feedbackText,
            date: new Date().toISOString(),
            editedAt: new Date().toISOString()
        };
        
        // Show success message
        Swal.fire({
            title: 'Success!',
            text: 'Your feedback has been updated.',
            icon: 'success',
            confirmButtonText: 'Great!'
        });
        
        // Reset edit mode
        feedbackBeingEdited = null;
        document.getElementById('submitFeedbackBtn').textContent = 'Submit Feedback';
        document.getElementById('cancelEditBtn').classList.add('hidden');
    } else {
        // Add new feedback
        feedbacks.push({
            email: currentUserEmail,
            rating: currentRating,
            text: feedbackText,
            date: new Date().toISOString()
        });
        
        // Show success message
        Swal.fire({
            title: 'Success!',
            text: 'Your feedback has been submitted.',
            icon: 'success',
            confirmButtonText: 'Great!'
        });
    }
    
    // Save updated feedbacks
    localStorage.setItem(`feedbacks_${recipeId}`, JSON.stringify(feedbacks));

    // Reset form
    document.getElementById('feedbackText').value = '';
    currentRating = 0;
    updateStars(0);

    // Reload feedbacks
    loadFeedbacks();
}

function editFeedback(index) {
    const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
    const feedback = feedbacks[index];
    
    // Set form values
    document.getElementById('feedbackText').value = feedback.text;
    currentRating = feedback.rating;
    updateStars(currentRating);
    
    // Switch to edit mode
    feedbackBeingEdited = index;
    document.getElementById('submitFeedbackBtn').textContent = 'Update Feedback';
    document.getElementById('cancelEditBtn').classList.remove('hidden');
    
    // Scroll to form
    document.getElementById('feedbackForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteFeedback(index) {
    Swal.fire({
        title: 'Delete Feedback',
        text: 'Are you sure you want to delete this feedback?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Get feedbacks
            const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
            
            // Remove feedback at index
            feedbacks.splice(index, 1);
            
            // Save updated feedbacks
            localStorage.setItem(`feedbacks_${recipeId}`, JSON.stringify(feedbacks));
            
            // If deleting the one being edited, reset edit mode
            if (feedbackBeingEdited === index) {
                cancelEdit();
            } else if (feedbackBeingEdited !== null && feedbackBeingEdited > index) {
                // Adjust index if deleting feedback before the one being edited
                feedbackBeingEdited--;
            }
            
            // Show success message
            Swal.fire(
                'Deleted!',
                'Your feedback has been deleted.',
                'success'
            );
            
            // Reload feedbacks
            loadFeedbacks();
        }
    });
}

function cancelEdit() {
    feedbackBeingEdited = null;
    document.getElementById('feedbackText').value = '';
    currentRating = 0;
    updateStars(0);
    document.getElementById('submitFeedbackBtn').textContent = 'Submit Feedback';
    document.getElementById('cancelEditBtn').classList.add('hidden');
}

function loadFeedbacks() {
    const feedbacks = JSON.parse(localStorage.getItem(`feedbacks_${recipeId}`) || '[]');
    const feedbacksList = document.getElementById('feedbacksList');
    
    if (feedbacks.length === 0) {
        feedbacksList.innerHTML = '<p class="text-gray-500">No feedbacks yet. Be the first to share your thoughts!</p>';
        return;
    }

    feedbacksList.innerHTML = feedbacks.map((feedback, index) => `
        <div class="feedback-item">
            <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-600">${feedback.email}</span>
                <span class="text-sm text-gray-500">
                    ${new Date(feedback.date).toLocaleDateString()}
                    ${feedback.editedAt ? ' (edited)' : ''}
                </span>
            </div>
            <div class="flex items-center mb-2">
                ${Array(5).fill(0).map((_, i) => 
                    `<i class="fas fa-star ${i < feedback.rating ? 'text-[#f4b266]' : 'text-gray-300'}"></i>`
                ).join('')}
            </div>
            <p class="text-gray-700">${feedback.text}</p>
            ${feedback.email === currentUserEmail ? `
                <div class="flex gap-2 mt-2">
                    <button onclick="editFeedback(${index})" class="text-blue-500 text-sm">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteFeedback(${index})" class="text-red-500 text-sm">
                        <i class="fas fa-trash-alt mr-1"></i>Delete
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function goBack() {
    window.history.back();
}

function logout() {
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
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        currentUserEmail = user.email;
        fetchRecipeDetails();
    }
});

// Make functions globally accessible
window.submitFeedback = submitFeedback;
window.editFeedback = editFeedback;
window.deleteFeedback = deleteFeedback;
window.cancelEdit = cancelEdit;
window.goBack = goBack;
window.logout = logout;