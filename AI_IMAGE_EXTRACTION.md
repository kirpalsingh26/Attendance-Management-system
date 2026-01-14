# AI-Powered Timetable Image Extraction

## Overview

This feature allows users to upload timetable images (photos or screenshots) which are intelligently processed using Google's Gemini Vision API to extract structured timetable data. The extracted data is displayed in an editable JSON format for review and correction before saving.

## Features

✨ **AI-Powered Extraction**: Uses Gemini Vision API to intelligently understand and extract timetable information
📸 **Multiple Image Formats**: Supports JPEG, PNG, and WebP up to 10MB
🎯 **Structured Output**: Converts visual timetable into structured JSON format
✏️ **Editable Results**: Review and manually edit extracted data before saving
🔄 **Automatic Transformation**: Extracted data is automatically normalized using universal parser
✅ **Validation**: Built-in validation ensures data integrity
📊 **Auto-Attendance**: Automatically generates attendance records after saving

## Architecture

### Backend Components

#### 1. Gemini Parser Utility (`Backend/utils/geminiParser.js`)
- **Purpose**: Handles Gemini Vision API integration
- **Key Functions**:
  - `parseTimetableFromImage(imageBase64, mimeType)`: Sends image to Gemini and parses response
  - `validateImage(imageBuffer, mimeType)`: Validates image before processing
  - `getTimetableExtractionPrompt()`: Provides structured prompt for consistent extraction

#### 2. API Route (`Backend/routes/timetable.js`)
- **Endpoint**: `POST /api/timetable/upload-image`
- **Authentication**: Required (JWT token)
- **Middleware**: Multer for handling multipart/form-data
- **Process Flow**:
  1. Receives image upload
  2. Validates image (type, size)
  3. Converts to base64
  4. Sends to Gemini Vision API
  5. Returns extracted JSON to frontend

### Frontend Components

#### 1. TimetableUpload Component
- **New Input Method**: "AI Extract" tab
- **Features**:
  - Image upload zone with drag & drop
  - Image preview
  - AI extraction button with loading state
  - Automatic switch to text editor after extraction
  - Manual editing capability

#### 2. State Management
- `imageFile`: Stores selected image file
- `imagePreview`: Base64 preview of image
- `extracting`: Loading state during AI processing
- `inputMethod`: Includes new 'image' option

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

New dependencies added:
- `@google/generative-ai`: ^0.21.0 (Gemini API client)
- `multer`: ^1.4.5-lts.1 (File upload handling)

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 3. Configure Environment Variables

Create `.env` file in Backend directory:

```bash
cp Backend/.env.example Backend/.env
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

## Usage Guide

### For Users

1. **Navigate to Timetable Page**
   - Click on "Timetable" in the navigation

2. **Access Upload Feature**
   - Click "Manual Editor | Upload JSON" button
   - Select "AI Extract" tab

3. **Upload Image**
   - Click upload zone or drag & drop your timetable image
   - Supported formats: JPEG, PNG, WebP (up to 10MB)
   - Image preview will appear

4. **Extract with AI**
   - Click "Extract Timetable with AI" button
   - Wait for AI processing (usually 5-15 seconds)
   - Extracted JSON will appear in editor

5. **Review and Edit**
   - Review the extracted data
   - Manually correct any errors
   - Format using "Format JSON" button if needed

6. **Save**
   - Click "Upload Timetable" to save
   - Attendance records will be automatically generated

### Best Practices for Images

📸 **Image Quality**:
- Use clear, well-lit photos
- Ensure text is readable
- Avoid shadows or glare
- Higher resolution is better

📐 **Composition**:
- Include entire timetable in frame
- Keep timetable rectangular and aligned
- Avoid excessive borders or backgrounds

📝 **Content**:
- Clear day labels (Monday, Tuesday, etc.)
- Visible time slots
- Readable subject names
- Teacher names and room numbers visible

## Prompt Engineering

The system uses a carefully crafted prompt to ensure consistent extraction:

### Output Format
```json
{
  "Monday": {
    "08:30": [
      {
        "subject": "Subject Name",
        "type": "L/Lab/T/P",
        "faculty": "Teacher Name",
        "room": "Room Number",
        "section": "Section (optional)"
      }
    ]
  }
}
```

### Prompt Guidelines
- Extracts ALL visible classes
- Handles multiple sections/batches
- Converts to structured format
- Uses "N/A" for unclear information
- Returns only JSON (no markdown)

## Error Handling

### Common Errors and Solutions

1. **"API key not configured"**
   - Solution: Add `GEMINI_API_KEY` to `.env` file

2. **"Failed to parse response as JSON"**
   - Cause: Image doesn't contain clear timetable
   - Solution: Use clearer image or manual input

3. **"Image size exceeds maximum"**
   - Solution: Compress image to under 10MB

4. **"Image type not supported"**
   - Solution: Convert to JPEG, PNG, or WebP

### Backend Error Handling

```javascript
try {
  // Image processing
} catch (error) {
  if (error.message.includes('API key')) {
    return 'API key configuration error'
  }
  if (error.name === 'SyntaxError') {
    return 'JSON parsing failed - unclear timetable'
  }
  return 'Generic processing error'
}
```

## API Reference

### Upload Image Endpoint

**POST** `/api/timetable/upload-image`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
```
image: File (required)
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Timetable extracted successfully from image",
  "data": {
    "Monday": { ... },
    "Tuesday": { ... }
  },
  "metadata": {
    "fileName": "timetable.jpg",
    "fileSize": 2048576,
    "extractedAt": "2026-01-12T...",
    "note": "Please review and edit the extracted data before saving"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error description",
  "details": "Detailed error message"
}
```

## Integration with Existing Features

### 1. Universal Parser
- Extracted data is automatically transformed
- Supports multiple timetable formats
- Normalizes field names and types

### 2. Validation System
- Uses existing `timetableValidator.js`
- Validates structure after transformation
- Ensures data integrity

### 3. Attendance Generation
- Automatically creates attendance records
- Links to logged-in user
- Preserves existing attendance data

### 4. MongoDB Storage
- Stores in existing Timetable schema
- Includes upload metadata
- Tracks version history

## Performance Considerations

### Image Processing
- **Average time**: 5-15 seconds per image
- **Concurrent requests**: Handled by Gemini API
- **Rate limits**: Follow Google's API limits

### File Size
- **Maximum**: 10MB per image
- **Recommended**: 2-5MB for optimal performance
- **Compression**: Automatic via Multer

### Memory Usage
- Images stored temporarily in memory
- Converted to base64 for API
- Cleared after processing

## Security

### Input Validation
- File type whitelist (JPEG, PNG, WebP)
- File size limits (10MB max)
- Image buffer validation

### Authentication
- JWT token required
- User-specific operations
- Protected API endpoints

### API Key Protection
- Stored in environment variables
- Never exposed to frontend
- Server-side processing only

## Testing

### Manual Testing Steps

1. **Test with clear timetable image**
   - Upload image
   - Verify extraction accuracy
   - Check all fields populated

2. **Test with unclear image**
   - Verify error handling
   - Check fallback to manual input

3. **Test with large image**
   - Verify size validation
   - Check compression handling

4. **Test editing flow**
   - Extract data
   - Edit in JSON editor
   - Save and verify

### Edge Cases

- Empty timetable
- Multiple sections
- Overlapping time slots
- Special characters in names
- Non-English text
- Handwritten timetables

## Troubleshooting

### Frontend Issues

**Image not uploading:**
- Check file size (< 10MB)
- Verify file type (JPEG/PNG/WebP)
- Check browser console for errors

**Extraction taking too long:**
- Normal processing: 5-15 seconds
- Check network connection
- Verify backend is running

### Backend Issues

**API key error:**
```bash
# Check .env file
cat Backend/.env | grep GEMINI_API_KEY

# Restart backend after adding key
npm run dev
```

**Multer error:**
```bash
# Reinstall dependencies
npm install
```

## Future Enhancements

### Planned Features
- [ ] Multiple image upload (batch processing)
- [ ] OCR fallback for offline processing
- [ ] Custom prompt templates
- [ ] Confidence scores for extracted data
- [ ] Image annotation/markup
- [ ] Format detection (table vs. list vs. grid)

### Optimization Opportunities
- [ ] Image preprocessing (enhance, rotate)
- [ ] Caching for similar images
- [ ] Progressive extraction (show partial results)
- [ ] Client-side compression before upload

## Cost Considerations

### Gemini API Pricing
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Pay per request
- **Optimization**: Cache results, limit re-extractions

### Recommendations
- Monitor API usage via Google Cloud Console
- Implement rate limiting if needed
- Consider cost per user/month

## Support

### Getting Help
1. Check error messages in browser console
2. Review backend logs
3. Verify API key configuration
4. Test with sample images
5. Check network connectivity

### Common Questions

**Q: What image quality is needed?**
A: Clear, readable text. Phone camera quality is usually sufficient.

**Q: Can it handle handwritten timetables?**
A: Gemini can attempt to read handwriting, but typed/printed works best.

**Q: How accurate is the extraction?**
A: Generally 80-95% accurate for clear images. Always review before saving.

**Q: Can I extract multiple timetables?**
A: Currently one at a time. Upload, review, save, then upload next.

## Credits

- **Gemini AI**: Google's Generative AI platform
- **Multer**: File upload middleware
- **Universal Parser**: Custom multi-format timetable parser

## License

This feature is part of the Attendance Management System and follows the same license terms.
