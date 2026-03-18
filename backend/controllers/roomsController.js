const Room = require('../models/Room');

exports.create = async (req, res) => {
  const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
  if (existingRoom) return res.status(409).json({ message: 'Room number already exists' });

  const room = new Room(req.body);
  await room.save();
  res.json(room);
};

exports.findAll = async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
};

exports.findOne = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
};

exports.update = async (req, res) => {
  const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber, _id: { $ne: req.params.id } });
  if (existingRoom) return res.status(409).json({ message: 'Room number already exists' });

  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
};

exports.remove = async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json({ message: 'Room deleted successfully' });
};
