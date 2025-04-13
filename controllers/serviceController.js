const Service = require('../models/Service');
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');


// GET /api/services
const getAllServices = async (req, res) => {
  const services = await Service.find();
  res.json(services);
};

// POST /api/services
const createService = async (req, res) => {
  const { name, status } = req.body;
  const newService = new Service({ 
    name,
    status,
    lastUpdated: Date.now(),
   });
  await newService.save();
  res.status(201).json(newService);
};

// PUT /api/services/:id
const updateServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // 1. Update the service status
    const updated = await Service.findByIdAndUpdate(
      id,
      {
        status,
        lastUpdated: Date.now(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(updated);

    // 2. Get all subscribers for this service
    const subscribers = await Subscriber.find({ serviceId: id });

    if (subscribers.length > 0) {
      // 3. Configure transporter using Brevo SMTP
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const serviceName = updated.name;

      // 4. Send email to each subscriber
      for (const sub of subscribers) {
        const mailOptions = {
          from: `"Status Page" <${process.env.EMAIL_USER}>`,
          to: sub.email,
          subject: `Update: ${serviceName} status changed`,
          text: `Hello,\n\nThe status of "${serviceName}" has been updated to: ${updated.status}.\n\nThanks for subscribing!\n`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${sub.email}`);
      }
    }
  } catch (err) {
    console.error('❌ Error updating service or sending emails:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service', error: err });
  }
};


module.exports = {
  getAllServices,
  createService,
  updateServiceStatus,
  deleteService
};
