// pages/api/posts.js
import clientPromise from "../../lib/mongodb";


export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("mydatabase");
    const posts = await db.collection("posts").find({}).toArray();
    res.status(200).json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
