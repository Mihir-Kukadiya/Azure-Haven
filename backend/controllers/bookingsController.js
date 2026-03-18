const Booking = require('../models/Booking');
const Room = require('../models/Room');

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'];

const syncRoomStatusWithBookings = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    return;
  }

  const hasActiveBooking = await Booking.exists({
    roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES }
  });

  if (hasActiveBooking && room.status !== 'occupied') {
    await Room.findByIdAndUpdate(roomId, { status: 'occupied' });
  }

  if (!hasActiveBooking && room.status === 'occupied') {
    await Room.findByIdAndUpdate(roomId, { status: 'available' });
  }
};

exports.create = async (req, res) => {
  const room = await Room.findById(req.body.roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  if (room.status !== 'available') {
    return res.status(409).json({ message: 'Room is not available for booking' });
  }

  const booking = new Booking(req.body);
  await booking.save();

  await Room.findByIdAndUpdate(req.body.roomId, { status: 'occupied' });

  res.json(booking);
};

exports.findAll = async (req, res) => {
  const bookings = await Booking.find().populate('userId', 'username email').populate('roomId', 'roomNumber type');
  res.json(bookings);
};

exports.findOne = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('userId', 'username email').populate('roomId', 'roomNumber type');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
};

exports.updateStatus = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('userId', 'username email').populate('roomId', 'roomNumber type');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  await syncRoomStatusWithBookings(booking.roomId?._id || booking.roomId);

  res.json(booking);
};

exports.remove = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  await syncRoomStatusWithBookings(booking.roomId);

  res.json({ message: 'Booking deleted successfully' });
};

exports.getUserStats = async (req, res) => {
  const bookings = await Booking.find({ userId: req.params.userId });
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  res.json({ totalBookings, activeBookings, completedBookings });
};
