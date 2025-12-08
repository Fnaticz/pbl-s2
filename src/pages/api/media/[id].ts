import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '../../../lib/mongodb';
import Media from '../../../models/media';
import mongoose from "mongoose";
import { deleteFromCloudinary, extractPublicIdFromUrl } from '../../../lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method === "DELETE") {
    try {
      const media = await Media.findById(id);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      // Cek kepemilikan
      const isOwner =
        media.username === session.user.username ||
        media.username === session.user.emailOrPhone;

      if (!isOwner) {
        return res.status(403).json({ message: "You can only delete your own media" });
      }

      // Hapus dari Cloudinary jika URL adalah Cloudinary URL
      if (media.url && media.url.includes('cloudinary.com')) {
        try {
          // Gunakan cloudinaryPublicId jika ada, atau extract dari URL
          const publicId = (media as any).cloudinaryPublicId || extractPublicIdFromUrl(media.url);
          if (publicId) {
            await deleteFromCloudinary(publicId, media.type);
            console.log(`Deleted from Cloudinary: ${publicId}`);
          }
        } catch (cloudinaryError: any) {
          console.error("Error deleting from Cloudinary:", cloudinaryError);
          // Lanjutkan delete dari DB meskipun Cloudinary delete gagal
        }
      }

      await Media.findByIdAndDelete(id);
      return res.status(200).json({ message: "Media deleted successfully" });
    } catch (err) {
      console.error("Delete media error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
