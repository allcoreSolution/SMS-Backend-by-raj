const StudyMaterial = require('../models/StudyMaterial');
const fs = require('fs');
const path = require('path');

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

exports.uploadMaterial = async (req, res, next) => {
  try {
    const materialData = { ...req.body };
    if (req.file) {
        materialData.fileUrl = `uploads/documents/${req.file.filename}`;
    }
    const material = await StudyMaterial.create(materialData);
    res.status(201).json({ success: true, data: material });
  } catch (error) { 
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

exports.getMaterials = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.query;
    let query = {};
    if(classId) query.academicClass = classId;
    if(subjectId) query.subject = subjectId;

    const materials = await StudyMaterial.find(query)
        .populate('subject', 'subjectName')
        .populate('academicClass', 'className')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: materials.length, data: materials });
  } catch (error) { next(error); }
};

exports.updateMaterial = async (req, res, next) => {
    try {
        const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: material });
    } catch (error) { next(error); }
};

exports.deleteMaterial = async (req, res, next) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        
        if (material.fileUrl) deleteFileFromDisk(material.fileUrl);
        
        await material.deleteOne();
        res.status(200).json({ success: true, message: 'Material deleted' });
    } catch (error) { next(error); }
};
