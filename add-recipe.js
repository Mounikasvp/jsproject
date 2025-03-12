// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmYXy4OGpK_BwJ_26f4W4azKDZDICWR3w",
    authDomain: "emaillogin-d9312.firebaseapp.com",
    projectId: "emaillogin-d9312",
    storageBucket: "emaillogin-d9312.appspot.com",
    messagingSenderId: "490730052655",
    appId: "1:490730052655:web:5533571f2948710781bada",
    measurementId: "G-TE5EVPJVM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Check Authentication State
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});

// Handle Form Submission
document.getElementById('addRecipeForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const user = auth.currentUser;

    const recipe = {
        name: document.getElementById('recipeName').value,
        description: document.getElementById('recipeDescription').value,
        ingredients: document.getElementById('recipeIngredients').value,
        instructions: document.getElementById('recipeInstructions').value,
        image: document.getElementById('recipeImage').value || '/api/placeholder/300/200',
        video: document.getElementById('recipeVideo').value || '',
        category: document.getElementById('recipeCategory').value,
        user: {
            email: user.email,
            uid: user.uid
        },
        createdAt: serverTimestamp()
    };

    try {
        // Add recipe to Firestore
        await addDoc(collection(db, 'recipes'), recipe);
        Swal.fire({
            title: "Recipe Added!",
            text: "Your recipe has been successfully added.",
            icon: "success",
            confirmButtonColor: "#ff6b6b"
        }).then(() => {
            window.location.href = 'yum.html';
        });
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Failed to add recipe: " + error.message,
            icon: "error",
            confirmButtonColor: "#ff6b6b"
        });
    }
});


window.logout = async function() {
    Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: '#808080',
        confirmButtonText: 'Yes, logout!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await signOut(auth);
                Swal.fire({
                    title: 'Logged Out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#ff6b6b'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to logout: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#ff6b6b'
                });
            }
        }
    });
};