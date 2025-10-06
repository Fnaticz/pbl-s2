import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import EventApplication from '../../../models/event-register';
import Inbox from '../../../models/inbox';
import Participant from '../../../models/participant';
import MainEvent from '../../../models/main-event';
import Point from '../../../models/point';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { id, action } = req.body;

  try {
    await connectDB();

    const application = await EventApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let message = '';

    const mainEvent = await MainEvent.findOne().sort({ createdAt: -1 });
    // sesuaikan query dengan kebutuhan
    if (!mainEvent) {
      return res.status(404).json({ message: "Main event not found" });
    }

    if (action === 'accept') {
      const existingParticipant = await Participant.findOne({ username: application.username });

      if (existingParticipant) {
        existingParticipant.set({
          emailOrPhone: application.emailOrPhone,   // ✅ perbaikan field
          driverName: application.driverName,
          title: mainEvent.title, // ambil title dari main-event
          coDriverName: application.coDriverName,
          carName: application.carName,
          driverPhone: application.driverPhone,
          coDriverPhone: application.coDriverPhone,
          policeNumber: application.policeNumber,
          address: application.address,
          teamName: application.teamName,
          pointsReward: existingParticipant.pointsReward + 50, // contoh penambahan points
        });
        await existingParticipant.save();
      } else {
        await Participant.create({
          userId: application.userId,
          username: application.username,
          emailOrPhone: application.emailOrPhone,   // ✅ perbaikan
          driverName: application.driverName,
          title: mainEvent.title, // ambil title dari main-event
          coDriverName: application.coDriverName,
          carName: application.carName,
          driverPhone: application.driverPhone,
          coDriverPhone: application.coDriverPhone,
          policeNumber: application.policeNumber,
          address: application.address,
          teamName: application.teamName,
          role: "member",
          pointsReward: 50, // contoh points tiap event
        });
      }

      // ✅ Tambahkan points ke member yang diterima
      const pointsReward = 50; // contoh reward
      const existingPoints = await Point.findOne({ userId: application.userId });

      if (existingPoints) {
        existingPoints.points += pointsReward;
        existingPoints.history.push({
          eventName: mainEvent.title,
          earned: pointsReward,
          date: new Date(),
        });
        await existingPoints.save();
      } else {
        await Point.create({
          userId: application.userId,
          points: pointsReward,
          history: [{
            eventName: mainEvent.title,
            earned: pointsReward,
            date: new Date(),
          }],
        });
      }


      await Inbox.create({
        from: 'Admin',
        to: application.username,
        type: 'admin',
        content: `Hello, ${application.username}! Your participation has been approved!`,
        date: new Date().toLocaleString(),
      });


      message = 'Accepted';
    } else if (action === 'reject') {
      await Inbox.create({
        from: 'Admin',
        to: application.username,
        type: 'admin',
        content: `Hello, ${application.username}! Sorry, your participation has been rejected.`,
        date: new Date().toLocaleString(),
      });

      message = 'Rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await EventApplication.findByIdAndDelete(id);

    return res.status(200).json({ message });

  } catch (error) {
    console.error('Action error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
