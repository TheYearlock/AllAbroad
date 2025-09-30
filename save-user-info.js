import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

export async function saveUserInfo(uid, userInfo) {
    try {
        await setDoc(doc(collection(db, "user info"), uid), userInfo);
    } catch (error) {
        console.error("Error saving user info:", error);
    }
}
