/**
 * PDF Parser Utility
 * Extracts text from PDF buffer, cleans it, and returns normalized text
 * PDF is discarded immediately after parsing
 */
const pdfParse = require('pdf-parse');

/**
 * Clean and normalize extracted text
 */
const cleanText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove special characters but keep essential punctuation
  cleaned = cleaned.replace(/[^\w\s.,;:!?()\-'"]/g, ' ');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

/**
 * Parse PDF buffer and extract text
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Cleaned and normalized text
 */
const parsePDF = async (buffer) => {
  try {
    // Validate buffer
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid file buffer');
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    // Parse PDF
    const data = await pdfParse(buffer);
    
    // Extract text
    const rawText = data.text || '';
    
    // Clean and normalize text
    const cleanedText = cleanText(rawText);
    
    // Validate extracted text
    if (cleanedText.length < 50) {
      throw new Error('Could not extract sufficient text from PDF. Please ensure the PDF contains readable text.');
    }
    
    // Return cleaned text (PDF buffer is discarded)
    return cleanedText;
    
  } catch (error) {
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. Please ensure the file is a valid PDF.');
    }
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

module.exports = {
  parsePDF,
  cleanText,
};
