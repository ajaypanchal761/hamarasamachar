import FranchiseLead from '../../models/FranchiseLead.js';

// @desc    Create franchise lead (public)
// @route   POST /api/user/franchise-leads
// @access  Public
export const createLead = async (req, res) => {
  try {
    const { name, phone, address, source, qualification, age, additionalInfo } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    // Check if lead with same phone already exists (optional - can be removed if duplicates are allowed)
    const existingLead = await FranchiseLead.findOne({ phone: phone.trim() });
    if (existingLead) {
      // Return existing lead instead of creating duplicate
      return res.status(200).json({
        success: true,
        message: 'Lead already exists',
        data: existingLead
      });
    }

    // Create new lead
    const lead = await FranchiseLead.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      source: source || 'franchise_page',
      status: 'new',
      qualification: qualification?.trim() || '',
      age: age?.trim() || '',
      additionalInfo: additionalInfo?.trim() || ''
    });

    res.status(201).json({
      success: true,
      message: 'Franchise lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create franchise lead error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create franchise lead'
    });
  }
};

