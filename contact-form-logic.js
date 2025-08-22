// contact-form-logic.js

// This file handles the logic for the contact form submission.

// Import the necessary functions from the Firestore SDK
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Import the database connection object from our init file
import { db } from './firebase-init.js';

// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to the form and the feedback message element
    const contactForm = document.getElementById('contact-form');
    const feedbackEl = document.getElementById('contact-feedback');

    // If the form doesn't exist on the page, stop running the script
    if (!contactForm) {
        return;
    }

    // Add a 'submit' event listener to the form
    contactForm.addEventListener('submit', async (e) => {
        // Prevent the default form submission behavior (which reloads the page)
        e.preventDefault();

        // Get the values from the form fields and trim any extra whitespace
        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();
        
        // Find the submit button within the form
        const submitButton = contactForm.querySelector('.submit-btn');

        // Simple validation to ensure fields are not empty
        if (!name || !email || !message) {
            feedbackEl.textContent = 'Lütfen tüm alanları doldurun.';
            feedbackEl.style.color = 'red';
            return;
        }

        // Disable the button to prevent multiple submissions
        submitButton.disabled = true;
        feedbackEl.textContent = 'Mesajınız gönderiliyor...';
        feedbackEl.style.color = '#457b9d'; // A neutral, informative color

        try {
            // Create a reference to the 'messages' collection in Firestore
            const messagesCollection = collection(db, 'messages');

            // Add a new document to the collection with the form data
            await addDoc(messagesCollection, {
                name: name,
                email: email,
                message: message,
                // Add a server-side timestamp for when the message was created
                createdAt: serverTimestamp()
            });

            // If successful, show a success message and reset the form
            feedbackEl.textContent = 'Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.';
            feedbackEl.style.color = 'green';
            contactForm.reset();

        } catch (error) {
            // If an error occurs, log it to the console for debugging
            console.error("Error adding document to Firestore: ", error);
            
            // Show a user-friendly error message
            feedbackEl.textContent = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
            feedbackEl.style.color = 'red';
        } finally {
            // Re-enable the submit button whether the submission succeeded or failed
            submitButton.disabled = false;
        }
    });
});
