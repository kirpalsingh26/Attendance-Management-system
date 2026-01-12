import { useState, useRef, useEffect } from 'react';
import { Upload, FileJson, CheckCircle, AlertCircle, Download, Info, Code, FileUp, Eye, Image as ImageIcon, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const TimetableUpload = ({ onUploadSuccess, onUploadError }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [autoGenerateAttendance, setAutoGenerateAttendance] = useState(true);
    const [inputMethod, setInputMethod] = useState('file'); // 'file', 'text', or 'image'
    const [jsonText, setJsonText] = useState('');
    const [realTimeErrors, setRealTimeErrors] = useState([]);
    const [isValidJson, setIsValidJson] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);

    // Real-time JSON validation as user types
    useEffect(() => {
        if (inputMethod === 'text' && jsonText.trim()) {
            const timer = setTimeout(() => {
                try {
                    const parsed = JSON.parse(jsonText);
                    setPreviewData(parsed);
                    setIsValidJson(true);
                    setRealTimeErrors([]);

                    // Validate structure
                    validateStructure(parsed);
                } catch (error) {
                    setIsValidJson(false);
                    setPreviewData(null);
                    setRealTimeErrors([`JSON Syntax Error: ${error.message}`]);
                }
            }, 500); // Debounce for 500ms

            return () => clearTimeout(timer);
        } else if (inputMethod === 'text' && !jsonText.trim()) {
            setRealTimeErrors([]);
            setIsValidJson(false);
            setPreviewData(null);
        }
    }, [jsonText, inputMethod]);

    // Universal Timetable Parser - supports multiple formats
    const parseUniversalTimetable = (data) => {
        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const generateColor = () => {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        // Handle nested timetable structure (e.g., { "timetable": { "Monday": ... } })
        let actualData = data;
        if (data.timetable && typeof data.timetable === 'object') {
            console.log('Detected nested timetable wrapper, unwrapping...');
            actualData = data.timetable;
        }

        const normalizeTime = (time) => {
            if (!time) return '';
            const timeStr = time.toString().trim();
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (timeRegex.test(timeStr)) return timeStr;
            const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
            if (match) {
                const hours = match[1].padStart(2, '0');
                const minutes = match[2] || '00';
                return `${hours}:${minutes}`;
            }
            return timeStr;
        };

        const extractSubjectInfo = (obj) => {
            const info = { name: null, type: 'Lecture', faculty: '', room: '', code: '', section: '' };
            
            // Extract name
            const nameFields = ['subject', 'name', 'course', 'courseName', 'subjectName', 'title'];
            for (const field of nameFields) {
                if (obj[field] && typeof obj[field] === 'string') {
                    info.name = obj[field].trim();
                    break;
                }
            }

            // Extract type
            const typeMap = {
                'L': 'Lecture', 'P': 'Practical', 'T': 'Tutorial', 'Lab': 'Practical',
                'Lecture': 'Lecture', 'Practical': 'Practical', 'Tutorial': 'Tutorial',
                'L+P': 'Both', 'Both': 'Both'
            };
            const typeFields = ['type', 'classType', 'sessionType'];
            for (const field of typeFields) {
                if (obj[field]) {
                    info.type = typeMap[obj[field]] || 'Lecture';
                    break;
                }
            }

            // Extract other fields
            const facultyFields = ['faculty', 'teacher', 'instructor', 'professor'];
            for (const field of facultyFields) {
                if (obj[field]) { info.faculty = obj[field].toString().trim(); break; }
            }

            const roomFields = ['room', 'location', 'venue', 'classroom'];
            for (const field of roomFields) {
                if (obj[field]) { info.room = obj[field].toString().trim(); break; }
            }

            const codeFields = ['code', 'courseCode', 'subjectCode'];
            for (const field of codeFields) {
                if (obj[field]) { info.code = obj[field].toString().trim(); break; }
            }

            const sectionFields = ['section', 'batch', 'group'];
            for (const field of sectionFields) {
                if (obj[field]) { info.section = obj[field].toString().trim(); break; }
            }

            return info;
        };

        // Helper function to calculate end time (adds 1 hour to start time)
        const calculateEndTime = (startTime) => {
            if (!startTime) return '';
            const [hours, minutes] = startTime.split(':').map(Number);
            const endHours = (hours + 1) % 24;
            return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Format 1: Time-slot based (Day -> Time -> Classes)
        const parseTimeSlotFormat = (data) => {
            const subjectsMap = new Map();
            const schedule = [];

            DAYS.forEach(day => {
                if (!data[day]) return;
                const periods = [];
                const timeSlots = Object.keys(data[day]).sort();

                timeSlots.forEach((time) => {
                    const classes = data[day][time];
                    const classArray = Array.isArray(classes) ? classes : [classes];

                    classArray.forEach(cls => {
                        if (typeof cls === 'object' && cls !== null) {
                            const info = extractSubjectInfo(cls);
                            if (info.name) {
                                const subjectKey = `${info.name}_${info.type}`;
                                if (!subjectsMap.has(subjectKey)) {
                                    subjectsMap.set(subjectKey, {
                                        name: info.name,
                                        code: info.code || info.name.toUpperCase().replace(/\s+/g, '_'),
                                        type: info.type,
                                        color: generateColor(),
                                        teacher: info.faculty,
                                        room: info.room
                                    });
                                }
                                const startTime = normalizeTime(time);
                                periods.push({
                                    subject: info.name,
                                    startTime: startTime,
                                    endTime: calculateEndTime(startTime),
                                    room: info.room,
                                    type: info.type,
                                    section: info.section || 'All'
                                });
                            }
                        }
                    });
                });

                if (periods.length > 0) {
                    schedule.push({ day, periods });
                }
            });

            return { subjects: Array.from(subjectsMap.values()), schedule };
        };

        // Format 2: Array of days with periods
        const parseArrayFormat = (data) => {
            const subjectsMap = new Map();
            const schedule = [];

            data.forEach(dayData => {
                if (!dayData || typeof dayData !== 'object') return;
                const day = dayData.day || dayData.name || dayData.dayName;
                if (!day || !DAYS.includes(day)) return;

                const periods = [];
                const periodsArray = dayData.periods || dayData.classes || dayData.schedule || [];

                periodsArray.forEach(period => {
                    const info = extractSubjectInfo(period);
                    if (info.name) {
                        const subjectKey = `${info.name}_${info.type}`;
                        if (!subjectsMap.has(subjectKey)) {
                            subjectsMap.set(subjectKey, {
                                name: info.name,
                                code: info.code || info.name.toUpperCase().replace(/\s+/g, '_'),
                                type: info.type,
                                color: generateColor(),
                                teacher: info.faculty,
                                room: info.room
                            });
                        }
                        const startTime = normalizeTime(period.startTime || period.time || period.start);
                        const endTime = normalizeTime(period.endTime || period.end || '') || calculateEndTime(startTime);
                        periods.push({
                            subject: info.name,
                            startTime: startTime,
                            endTime: endTime,
                            room: info.room,
                            type: info.type,
                            section: info.section || 'All'
                        });
                    }
                });

                if (periods.length > 0) {
                    schedule.push({ day, periods });
                }
            });

            return { subjects: Array.from(subjectsMap.values()), schedule };
        };

        // Format 3: Standard format (subjects + schedule)
        const parseStandardFormat = (data) => {
            const subjectsArray = data.subjects || data.subject || [];
            const subjects = subjectsArray.map(s => ({
                name: s.name || s.subject || 'Unknown',
                code: s.code || (s.name || '').toUpperCase().replace(/\s+/g, '_'),
                type: s.type || 'Lecture',
                color: s.color || generateColor(),
                teacher: s.teacher || s.faculty || '',
                room: s.room || s.location || ''
            }));

            const scheduleArray = data.schedule || [];
            const schedule = scheduleArray.map(d => ({
                day: d.day || d.name,
                periods: (d.periods || []).map(p => {
                    const startTime = normalizeTime(p.startTime || p.time || p.start);
                    const endTime = normalizeTime(p.endTime || p.end || '') || calculateEndTime(startTime);
                    return {
                        subject: p.subject || p.name,
                        startTime: startTime,
                        endTime: endTime,
                        room: p.room || '',
                        type: p.type || 'L',
                        section: p.section || 'All'
                    };
                })
            }));

            return { subjects, schedule };
        };

        // Detect format and parse
        let result = null;

        if (actualData.subjects || actualData.subject) {
            console.log('Detected: Standard format (subjects + schedule)');
            result = parseStandardFormat(actualData);
        } else if (Array.isArray(actualData)) {
            if (actualData.length > 0 && actualData[0].day && (actualData[0].periods || actualData[0].classes)) {
                console.log('Detected: Array format (days with periods)');
                result = parseArrayFormat(actualData);
            } else {
                console.log('Detected: Flat list format');
                // Flat format handling would go here
                result = { subjects: [], schedule: [] };
            }
        } else if (DAYS.some(day => day in actualData)) {
            console.log('Detected: Time-slot format (day -> time -> classes)');
            result = parseTimeSlotFormat(actualData);
        } else {
            throw new Error('Unable to detect timetable format');
        }

        return {
            name: data.name || actualData.name || 'Imported Timetable',
            semester: data.semester || actualData.semester || 'Current',
            academicYear: data.academicYear || actualData.academicYear || new Date().getFullYear().toString(),
            subjects: result.subjects,
            schedule: result.schedule
        };
    };

    // Transform time-slot format to expected format
    const transformTimeSlotFormat = (data) => {
        try {
            return parseUniversalTimetable(data);
        } catch (error) {
            console.error('Transform error:', error);
            return data;
        }
    };

    // Validate timetable structure (basic validation)
    const validateStructure = (data) => {
        const errors = [];

        // Try to transform if in time-slot format
        const transformedData = transformTimeSlotFormat(data);
        
        if (transformedData !== data) {
            console.log('Transformed data:', transformedData);
            setPreviewData(transformedData);
        }

        // Accept both 'subjects' or 'subject'
        const subjectsArray = transformedData.subjects || transformedData.subject;
        
        if (!subjectsArray) {
            errors.push('Missing "subjects" or "subject" field. Available fields: ' + Object.keys(transformedData).join(', '));
        } else if (!Array.isArray(subjectsArray)) {
            errors.push(`"subjects" or "subject" must be an array, but got: ${typeof subjectsArray}`);
        } else if (subjectsArray.length === 0) {
            errors.push('At least one subject is required');
        } else {
            // Validate each subject has required fields
            subjectsArray.forEach((subject, idx) => {
                if (!subject || typeof subject !== 'object') {
                    errors.push(`Subject at index ${idx} must be an object`);
                } else if (!subject.name || typeof subject.name !== 'string') {
                    errors.push(`Subject at index ${idx} is missing required "name" field`);
                }
            });
        }

        // Schedule is now optional
        if (transformedData.schedule && !Array.isArray(transformedData.schedule)) {
            errors.push('"schedule" must be an array if provided');
        }

        // Check subject names in periods match subjects array (only if schedule exists)
        if (subjectsArray && Array.isArray(subjectsArray) && transformedData.schedule && Array.isArray(transformedData.schedule)) {
            const subjectNames = new Set(subjectsArray.map(s => s.name).filter(Boolean));
            transformedData.schedule.forEach((day, dayIdx) => {
                if (day.periods) {
                    day.periods.forEach((period, periodIdx) => {
                        if (period.subject && !subjectNames.has(period.subject)) {
                            errors.push(`${day.day} - Period ${periodIdx + 1}: Subject "${period.subject}" not found in subjects list`);
                        }
                    });
                }
            });
        }

        setRealTimeErrors(errors);
    };

    // Handle image upload and extraction
    const handleImageSelect = (event) => {
        const selectedFile = event.target.files[0];
        
        if (!selectedFile) return;
        
        // Validate image type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setValidationErrors(['Please select a valid image file (JPEG, PNG, WebP)']);
            return;
        }
        
        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setValidationErrors(['Image size must be less than 10MB']);
            return;
        }
        
        setImageFile(selectedFile);
        setValidationErrors([]);
        setSuccessMessage('');
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleExtractFromImage = async () => {
        if (!imageFile) {
            setValidationErrors(['Please select an image first']);
            return;
        }
        
        setExtracting(true);
        setValidationErrors([]);
        setSuccessMessage('');
        
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', imageFile);
            
            console.log('Uploading image to OCR API...');
            console.log('Image file:', imageFile.name, imageFile.type, imageFile.size);
            
            // Use correct base URL
            const baseURL = window.location.hostname === 'localhost' 
                ? 'http://localhost:5001' 
                : '';
            
            const response = await fetch(`${baseURL}/api/timetable/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('Successfully extracted timetable from image');
                console.log('Raw data from backend:', data.data);
                
                // Transform the extracted data using universal parser
                let transformed;
                try {
                    transformed = transformTimeSlotFormat(data.data);
                    console.log('Transformed data:', transformed);
                } catch (transformError) {
                    console.error('Transform error:', transformError);
                    setValidationErrors([
                        'Failed to transform extracted data',
                        transformError.message,
                        'You can manually edit the JSON below'
                    ]);
                    transformed = data.data;
                }
                
                // Set the JSON text for editing
                setJsonText(JSON.stringify(transformed, null, 2));
                setPreviewData(transformed);
                setIsValidJson(true);
                
                // Validate structure
                validateStructure(transformed);
                
                setSuccessMessage(data.message || '✨ Timetable extracted successfully! Review and edit below before saving.');
                setInputMethod('text'); // Switch to text editor mode
            } else {
                console.error('Extraction failed:', data.message);
                setValidationErrors([data.message || 'Failed to extract timetable from image']);
            }
        } catch (error) {
            console.error('Error extracting from image:', error);
            setValidationErrors([
                `Failed to process image: ${error.message}`,
                'Please check:',
                '1. Backend server is running on port 5001',
                '2. OCR API key is configured in backend .env',
                '3. Image is clear and contains a timetable',
                '4. Check browser console for detailed errors'
            ]);
        } finally {
            setExtracting(false);
        }
    };

    // Load template into text editor
    const handleLoadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/timetable/template', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setJsonText(JSON.stringify(data.template, null, 2));
                setInputMethod('text');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            setValidationErrors(['Failed to load template. Please try again.']);
        }
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.name.endsWith('.json')) {
            setValidationErrors(['Please select a valid JSON file']);
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setValidationErrors(['File size must be less than 5MB']);
            return;
        }

        setFile(selectedFile);
        setValidationErrors([]);
        setSuccessMessage('');

        // Read and preview file content
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                const transformed = transformTimeSlotFormat(jsonData);
                setPreviewData(transformed);
                validateStructure(jsonData);
            } catch (error) {
                setValidationErrors(['Invalid JSON format. Please check your file.']);
                setPreviewData(null);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleUpload = async () => {
        if (inputMethod === 'file' && (!file || !previewData)) {
            setValidationErrors(['Please select a valid JSON file first']);
            return;
        }

        if (inputMethod === 'text' && (!jsonText.trim() || !isValidJson)) {
            setValidationErrors(['Please enter valid JSON code first']);
            return;
        }

        if (realTimeErrors.length > 0) {
            setValidationErrors(['Please fix the validation errors before uploading']);
            return;
        }

        setUploading(true);
        setValidationErrors([]);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            
            console.log('=== UPLOAD DEBUG ===');
            console.log('Preview data:', previewData);
            console.log('Preview data type:', typeof previewData);
            console.log('Has subjects:', previewData?.subjects);
            console.log('Has schedule:', previewData?.schedule);
            console.log('===================');

            // Use correct base URL
            const baseURL = window.location.hostname === 'localhost' 
                ? 'http://localhost:5001' 
                : '';

            const response = await fetch(`${baseURL}/api/timetable/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    timetableData: previewData,
                    autoGenerateAttendance: autoGenerateAttendance,
                    fileName: inputMethod === 'file' ? file.name : 'manual-entry.json'
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Timetable uploaded successfully! ✨');
                setFile(null);
                setPreviewData(null);
                setJsonText('');
                setRealTimeErrors([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Call success callback
                if (onUploadSuccess) {
                    onUploadSuccess(data);
                }

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setValidationErrors(data.errors || [data.message]);

                // Call error callback
                if (onUploadError) {
                    onUploadError(data);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error details:', error.message);
            console.error('Preview data being uploaded:', previewData);
            setValidationErrors([
                'Failed to upload timetable. Please try again.',
                `Error: ${error.message}`,
                'Check browser console for details'
            ]);

            if (onUploadError) {
                onUploadError(error);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/timetable/template', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Create and download template file
                const blob = new Blob([JSON.stringify(data.template, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'timetable-template.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            setValidationErrors(['Failed to download template. Please try again.']);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            // Create a fake event object for handleFileSelect
            handleFileSelect({ target: { files: [droppedFile] } });
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Card */}
            <Card
                title="Upload Custom Timetable"
                subtitle="Import your timetable from a JSON file"
                className="border-2 border-purple-300/60 dark:border-purple-600/60"
            >
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                                    How it works
                                </h4>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                                    <li>Download the template to see the required format</li>
                                    <li>Fill in your subjects, schedule, and class details</li>
                                    <li>Upload the JSON file to automatically create your timetable</li>
                                    <li>Attendance records will be auto-generated based on your schedule</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Input Method Selector */}
                    <div className="flex gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => {
                                setInputMethod('file');
                                setJsonText('');
                                setRealTimeErrors([]);
                                setPreviewData(null);
                                setImageFile(null);
                                setImagePreview(null);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${inputMethod === 'file'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <FileUp className="w-5 h-5" />
                            Upload File
                        </button>
                        <button
                            onClick={() => {
                                setInputMethod('text');
                                setFile(null);
                                setPreviewData(null);
                                setImageFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${inputMethod === 'text'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <Code className="w-5 h-5" />
                            Paste/Edit JSON
                        </button>
                        <button
                            onClick={() => {
                                setInputMethod('image');
                                setFile(null);
                                setJsonText('');
                                setPreviewData(null);
                                setRealTimeErrors([]);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${inputMethod === 'image'
                                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <Sparkles className="w-5 h-5" />
                            AI Extract
                        </button>
                    </div>

                    {/* Image Upload Method with AI Extraction */}
                    {inputMethod === 'image' && (
                        <div className="animate-fade-in space-y-6">
                            {/* AI Info Banner */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">
                                            AI-Powered Timetable Extraction
                                        </h4>
                                        <p className="text-sm text-purple-800 dark:text-purple-300">
                                            Upload a photo or screenshot of your timetable. Our AI will intelligently extract all classes, timings, teachers, and rooms into structured JSON format. You can review and edit before saving.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Zone */}
                            <div
                                className="relative border-3 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10"
                            >
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="timetable-image-upload"
                                />

                                <label
                                    htmlFor="timetable-image-upload"
                                    className="cursor-pointer block"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                            {imageFile ? (
                                                <CheckCircle className="w-10 h-10 text-white" />
                                            ) : (
                                                <ImageIcon className="w-10 h-10 text-white" />
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                {imageFile ? imageFile.name : 'Upload Timetable Image'}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Click to browse or drag & drop
                                            </p>
                                        </div>

                                        {!imageFile && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>Supports JPEG, PNG, WebP up to 10MB</span>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Image Preview
                                    </h4>
                                    <img 
                                        src={imagePreview} 
                                        alt="Timetable preview" 
                                        className="w-full max-h-96 object-contain rounded-lg border-2 border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                        onClick={handleExtractFromImage}
                                        disabled={extracting}
                                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                    >
                                        {extracting ? (
                                            <>
                                                <Sparkles className="w-5 h-5 animate-spin" />
                                                Extracting with AI...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Extract Timetable with AI
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* File Upload Method */}
                    {inputMethod === 'file' && (
                        <div className="animate-fade-in">{/* Drag & Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="relative border-3 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="timetable-upload"
                                />

                                <label
                                    htmlFor="timetable-upload"
                                    className="cursor-pointer block"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                            {file ? (
                                                <CheckCircle className="w-10 h-10 text-white" />
                                            ) : (
                                                <Upload className="w-10 h-10 text-white" />
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                {file ? file.name : 'Drag & drop your JSON file here'}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                or click to browse files
                                            </p>
                                        </div>

                                        {!file && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                                                <FileJson className="w-4 h-4" />
                                                <span>Accepts .json files up to 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* Preview Section */}
                            {previewData && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FileJson className="w-4 h-4" />
                                        Preview
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Name:</span>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {previewData.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Subjects:</span>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {previewData.subjects?.length || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Days:</span>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {previewData.schedule?.filter(d => d.periods?.length > 0).length || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-600 dark:text-slate-400">Total Periods:</span>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {previewData.schedule?.reduce((sum, day) => sum + (day.periods?.length || 0), 0) || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Editor Method */}
                    {inputMethod === 'text' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* JSON Text Editor */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        JSON Editor
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {isValidJson && (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Valid JSON
                                            </span>
                                        )}
                                        {jsonText && !isValidJson && (
                                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Invalid JSON
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    value={jsonText}
                                    onChange={(e) => setJsonText(e.target.value)}
                                    placeholder='Paste your JSON here or click "Load Template to Editor"...'
                                    className="w-full h-96 px-4 py-3 font-mono text-sm bg-slate-900 dark:bg-slate-950 text-slate-100 border-2 border-slate-700 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                                    spellCheck={false}
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setJsonText('');
                                            setPreviewData(null);
                                            setRealTimeErrors([]);
                                            setIsValidJson(false);
                                        }}
                                        className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => {
                                            try {
                                                const formatted = JSON.stringify(JSON.parse(jsonText), null, 2);
                                                setJsonText(formatted);
                                            } catch (e) {
                                                // Invalid JSON, can't format
                                            }
                                        }}
                                        className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                                        disabled={!isValidJson}
                                    >
                                        Format
                                    </button>
                                </div>
                            </div>

                            {/* Real-time Validation Errors */}
                            {realTimeErrors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                                                Validation Issues
                                            </h4>
                                            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                                                {realTimeErrors.map((error, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="text-red-500 mt-0.5">•</span>
                                                        <span>{error}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Preview with Details */}
                            {previewData && isValidJson && realTimeErrors.length === 0 && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            Timetable Preview
                                        </h4>
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                                        >
                                            {showPreview ? 'Hide Details' : 'Show Details'}
                                        </button>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div className="bg-white dark:bg-emerald-950 rounded-lg p-3">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Name</span>
                                            <p className="font-bold text-emerald-900 dark:text-emerald-100 truncate">
                                                {previewData.name || 'Untitled'}
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-emerald-950 rounded-lg p-3">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Subjects</span>
                                            <p className="font-bold text-emerald-900 dark:text-emerald-100">
                                                {previewData.subjects?.length || 0}
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-emerald-950 rounded-lg p-3">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Active Days</span>
                                            <p className="font-bold text-emerald-900 dark:text-emerald-100">
                                                {previewData.schedule?.filter(d => d.periods?.length > 0).length || 0}
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-emerald-950 rounded-lg p-3">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Total Classes</span>
                                            <p className="font-bold text-emerald-900 dark:text-emerald-100">
                                                {previewData.schedule?.reduce((sum, day) => sum + (day.periods?.length || 0), 0) || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Preview */}
                                    {showPreview && (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {/* Subjects List */}
                                            {previewData.subjects?.length > 0 && (
                                                <div>
                                                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mb-2">Subjects:</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {previewData.subjects.map((subject, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-white dark:bg-emerald-950 rounded-lg p-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: subject.color || '#3B82F6' }}
                                                                ></div>
                                                                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                                                                    {subject.name}
                                                                </span>
                                                                {subject.type && (
                                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                                        ({subject.type})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Schedule Overview */}
                                            {previewData.schedule?.length > 0 && (
                                                <div>
                                                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mb-2">Weekly Schedule:</h5>
                                                    <div className="space-y-2">
                                                        {previewData.schedule
                                                            .filter(day => day.periods?.length > 0)
                                                            .map((day, idx) => (
                                                                <div key={idx} className="bg-white dark:bg-emerald-950 rounded-lg p-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                                                                            {day.day}
                                                                        </span>
                                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                                            {day.periods.length} class{day.periods.length !== 1 ? 'es' : ''}
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                        {day.periods.map((period, pIdx) => (
                                                                            <span
                                                                                key={pIdx}
                                                                                className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded"
                                                                            >
                                                                                {period.subject}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Section (for file upload) */}
                    {inputMethod === 'file' && previewData && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileJson className="w-4 h-4" />
                                Preview
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewData.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400">Subjects:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewData.subjects?.length || 0}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400">Days:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewData.schedule?.filter(d => d.periods?.length > 0).length || 0}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400">Total Periods:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {previewData.schedule?.reduce((sum, day) => sum + (day.periods?.length || 0), 0) || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Auto-generate Attendance Option */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                        <input
                            type="checkbox"
                            id="auto-generate-attendance"
                            checked={autoGenerateAttendance}
                            onChange={(e) => setAutoGenerateAttendance(e.target.checked)}
                            className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <label
                            htmlFor="auto-generate-attendance"
                            className="flex-1 cursor-pointer"
                        >
                            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                Auto-generate Attendance Records
                            </span>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                Automatically create attendance records for the current week based on your timetable
                            </p>
                        </label>
                    </div>

                    {/* Error Messages */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                                        Validation Errors
                                    </h4>
                                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                    {successMessage}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex justify-end gap-3">
                        {((inputMethod === 'file' && file) || (inputMethod === 'text' && jsonText)) && (
                            <Button
                                onClick={() => {
                                    setFile(null);
                                    setPreviewData(null);
                                    setValidationErrors([]);
                                    setJsonText('');
                                    setRealTimeErrors([]);
                                    setIsValidJson(false);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="bg-slate-500 hover:bg-slate-600"
                            >
                                Clear
                            </Button>
                        )}
                        <Button
                            onClick={handleUpload}
                            disabled={
                                uploading ||
                                (inputMethod === 'file' && !file) ||
                                (inputMethod === 'text' && (!jsonText.trim() || !isValidJson || realTimeErrors.length > 0))
                            }
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Timetable
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* JSON Format Guide */}
            <Card
                title="JSON Format Guide"
                subtitle="Structure your timetable JSON correctly"
                className="border-2 border-slate-300/60 dark:border-slate-600/60"
            >
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs text-slate-100">
                        {`{
  "name": "My Timetable",
  "semester": "Fall 2026",
  "academicYear": "2026-2027",
  "subjects": [
    {
      "name": "Mathematics",
      "code": "MATH101",
      "type": "Lecture",
      "color": "#3B82F6",
      "teacher": "Dr. Smith",
      "room": "Room 201"
    }
  ],
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "subject": "Mathematics",
          "startTime": "09:30",
          "endTime": "10:30",
          "teacher": "Dr. Smith",
          "room": "Room 201"
        }
      ]
    }
  ]
}`}
                    </pre>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <h4 className="font-bold text-slate-900 dark:text-white">Required Fields:</h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                        <li><code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">subjects</code> - Array of subject objects (name is required)</li>
                        <li><code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">schedule</code> - Array of day schedules (day and periods required)</li>
                        <li><code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">periods</code> - Each period needs subject, startTime, endTime in HH:MM format</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default TimetableUpload;
