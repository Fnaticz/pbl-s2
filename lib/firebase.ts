import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyASIOjwUGTaYgYA9Srbyb8oLAhc1QrSm2Q",
  authDomain: "pbls2-f35a9.firebaseapp.com",
  databaseURL: "https://pbls2-f35a9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pbls2-f35a9",
  storageBucket: "pbls2-f35a9.appspot.com",
  messagingSenderId: "509059831529",
  appId: "1:509059831529:web:25f2a614ead7a72abd4278"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const storage = getStorage(app)

export { db, storage }
