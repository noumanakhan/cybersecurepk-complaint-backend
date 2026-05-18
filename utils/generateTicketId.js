const Complaint = require('../models/Complaint');

const generateTicketId = async (category) => {
  const year = new Date().getFullYear();
  const categoryCode = category.substring(0, 4).toUpperCase(); // TECH, ACCO, SCHO, SUPP
  
  // Find the last ticket for this category and year
  const lastTicket = await Complaint.findOne({
    ticketId: new RegExp(`^HP-${categoryCode}-${year}-`)
  }).sort({ ticketId: -1 });
  
  let number = 1;
  if (lastTicket) {
    const lastNumber = parseInt(lastTicket.ticketId.split('-')[3]);
    number = lastNumber + 1;
  }
  
  const paddedNumber = number.toString().padStart(4, '0');
  return `HP-${categoryCode}-${year}-${paddedNumber}`;
};

module.exports = generateTicketId;