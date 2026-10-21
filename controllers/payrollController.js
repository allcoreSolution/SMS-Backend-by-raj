const Payroll = require('../models/Payroll');

exports.generatePayslip = async (req, res, next) => {
  try {
    const { basicSalary, allowances = 0, deductions = 0 } = req.body;
    const netSalary = parseFloat(basicSalary) + parseFloat(allowances) - parseFloat(deductions);
    const slip = await Payroll.create({ ...req.body, netSalary });
    res.status(201).json({ success: true, data: slip });
  } catch (error) { next(error); }
};

exports.getPayslips = async (req, res, next) => {
  try {
    const { staffId, month, year, status } = req.query;
    let query = {};
    if(staffId) query.staffId = staffId;
    if(month) query.month = month;
    if(year) query.year = year;
    if(status) query.status = status;
    
    const records = await Payroll.find(query)
      .populate('staffId', 'firstName lastName email role')
      .sort({ year: -1, month: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) { next(error); }
};

exports.updatePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };
    
    // Recalculate netSalary if salary fields change
    const slip = await Payroll.findById(id);
    if (!slip) return res.status(404).json({ success: false, message: 'Payslip not found' });

    let basic = updateData.basicSalary ?? slip.basicSalary;
    let allow = updateData.allowances ?? slip.allowances;
    let deduc = updateData.deductions ?? slip.deductions;
    updateData.netSalary = parseFloat(basic) + parseFloat(allow) - parseFloat(deduc);

    if (updateData.status === 'Paid' && slip.status !== 'Paid') {
      updateData.paymentDate = Date.now();
    }

    const updatedSlip = await Payroll.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedSlip });
  } catch (error) { next(error); }
};

exports.deletePayslip = async (req, res, next) => {
  try {
    const slip = await Payroll.findByIdAndDelete(req.params.id);
    if (!slip) return res.status(404).json({ success: false, message: 'Payslip not found' });
    res.status(200).json({ success: true, message: 'Payslip deleted successfully' });
  } catch (error) { next(error); }
};
