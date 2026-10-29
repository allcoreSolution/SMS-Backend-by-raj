const QRCode = require('qrcode');

// Code 128 Subset B patterns (ASCII 32 to 127)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

/**
 * Generate standard Code 128 (Subset B) bars and SVG
 * @param {string} text - text to encode (e.g. "STF-101")
 * @returns {object} { code, pattern, bars: [{ x, width }], totalWidth, svg }
 */
const generateCode128 = (text = 'STAFF') => {
  const cleanText = String(text || 'STAFF').trim();
  const startCode = 104; // Start B
  let checksum = startCode;
  const codes = [startCode];

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i) - 32;
    const validCode = (charCode >= 0 && charCode <= 95) ? charCode : 0;
    codes.push(validCode);
    checksum += validCode * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(106); // Stop code

  const patternStr = codes.map(c => CODE128_PATTERNS[c] || CODE128_PATTERNS[0]).join('');

  let currentX = 12; // left quiet zone
  let isBar = true;
  const bars = [];

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10) * 2;
    if (isBar) {
      bars.push({ x: currentX, width });
    }
    currentX += width;
    isBar = !isBar;
  }

  const totalWidth = currentX + 12; // right quiet zone
  const height = 55;

  const rects = bars.map(b => `<rect x="${b.x}" y="0" width="${b.width}" height="${height}" fill="#111827" />`).join('');
  const svg = `<svg viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg" class="w-full h-14" preserveAspectRatio="none">${rects}</svg>`;

  return {
    code: cleanText,
    totalWidth,
    height,
    bars,
    pattern: patternStr,
    svg
  };
};

/**
 * Generate real QR Code Data URL with embedded staff verification payload
 * @param {object} staffData - Staff member details
 * @returns {Promise<string>} Base64 Data URL (image/png)
 */
const generateStaffQRCode = async (staffData = {}) => {
  try {
    const qrPayload = JSON.stringify({
      org: "ALL CORE SOLUTION",
      type: "STAFF_ID_VERIFICATION",
      staffId: staffData.staffId || "STAFF",
      name: staffData.fullName || staffData.name || "Faculty Member",
      designation: staffData.designation || "Faculty",
      department: staffData.department || "Academics",
      email: staffData.email || "",
      phone: staffData.phone || "",
      status: "Active",
      verifiedAt: new Date().toISOString()
    }, null, 2);

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 256,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback simple QR
    return await QRCode.toDataURL(staffData.staffId || 'STAFF', { margin: 2, width: 200 });
  }
};

module.exports = {
  generateCode128,
  generateStaffQRCode
};
