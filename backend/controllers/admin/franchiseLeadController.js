import FranchiseLead from '../../models/FranchiseLead.js';

// @desc    Get all franchise leads
// @route   GET /api/admin/franchise-leads
// @access  Private (Admin)
export const getAllLeads = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status && status !== 'all' && status !== 'All') {
      query.status = status;
    }

    // Filter by source
    if (req.query.source) {
      query.source = req.query.source;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
        { additionalInfo: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await FranchiseLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FranchiseLead.countDocuments(query);

    // Get status counts
    const statusCounts = {
      new: await FranchiseLead.countDocuments({ status: 'new' }),
      contacted: await FranchiseLead.countDocuments({ status: 'contacted' }),
      closed: await FranchiseLead.countDocuments({ status: 'closed' })
    };

    res.json({
      success: true,
      data: leads,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts
    });
  } catch (error) {
    console.error('Get all franchise leads error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch franchise leads'
    });
  }
};

// @desc    Get franchise lead by ID
// @route   GET /api/admin/franchise-leads/:id
// @access  Private (Admin)
export const getLeadById = async (req, res) => {
  try {
    const lead = await FranchiseLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Franchise lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get franchise lead by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch franchise lead'
    });
  }
};

// @desc    Update franchise lead status
// @route   PUT /api/admin/franchise-leads/:id/status
// @access  Private (Admin)
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (new, contacted, or closed)'
      });
    }

    const lead = await FranchiseLead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Franchise lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead status updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Update franchise lead status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update lead status'
    });
  }
};

// @desc    Update franchise lead
// @route   PUT /api/admin/franchise-leads/:id
// @access  Private (Admin)
export const updateLead = async (req, res) => {
  try {
    const { name, phone, address, status, notes } = req.body;
    const { id } = req.params;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await FranchiseLead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Franchise lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Update franchise lead error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update lead'
    });
  }
};

// @desc    Delete franchise lead
// @route   DELETE /api/admin/franchise-leads/:id
// @access  Private (Admin)
export const deleteLead = async (req, res) => {
  try {
    const lead = await FranchiseLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Franchise lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete franchise lead error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete lead'
    });
  }
};

// @desc    Get franchise leads statistics
// @route   GET /api/admin/franchise-leads/stats
// @access  Private (Admin)
export const getLeadStats = async (req, res) => {
  try {
    const { source } = req.query;
    const filter = source ? { source } : {};

    const total = await FranchiseLead.countDocuments(filter);
    const newCount = await FranchiseLead.countDocuments({ ...filter, status: 'new' });
    const contactedCount = await FranchiseLead.countDocuments({ ...filter, status: 'contacted' });
    const closedCount = await FranchiseLead.countDocuments({ ...filter, status: 'closed' });

    res.json({
      success: true,
      data: {
        total,
        new: newCount,
        contacted: contactedCount,
        closed: closedCount
      }
    });
  } catch (error) {
    console.error('Get franchise lead stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch lead statistics'
    });
  }
};

