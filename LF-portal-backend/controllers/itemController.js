const Item = require('../models/Item');

exports.createItem = async (req, res) => {
  try {
    const { title, category, color, brand, description, location, date, status, imageUrl } = req.body;
    
    const item = await Item.create({
      title,
      category,
      color,
      brand,
      description,
      location,
      date,
      status: status || 'lost',
      imageUrl,
      userId: req.user.id
    });
    
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(400).json({ message: 'Failed to create item' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch items' });
  }
};

exports.claimItem = async (req, res) => {
  try {
    const { id, answer } = req.body;
    
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Allow claiming both lost and found items
    if (item.status !== 'lost' && item.status !== 'found') {
      return res.status(400).json({ message: 'This item cannot be claimed' });
    }
    
    item.status = 'under_verification';
    await item.save();
    
    console.log(`Claim for item ${id}: ${answer}`);
    
    res.json({ message: 'Claim submitted successfully', item });
  } catch (err) {
    console.error('Error claiming item:', err);
    res.status(400).json({ message: 'Failed to claim item' });
  }
};