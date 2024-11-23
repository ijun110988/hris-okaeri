const Attendance = require('../models/attendance');
const Branch = require('../models/branch');
const QRCodeModel = require('../models/QRCode');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { Op, QueryTypes } = require('sequelize');
const geolib = require('geolib');
const sequelize = require('../config/database');
const moment = require('moment-timezone');

// Function to generate random token
const generateQRToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return geolib.getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
    );
};

// Generate QR Code for a specific branch
const generateQR = async (req, res) => {
    try {
        console.log('Generating QR code for branch:', req.params.branchId);
        const { branchId } = req.params;
        
        // Validate branch
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            console.log('Branch not found:', branchId);
            return res.status(404).json({
                status: 'error',
                message: 'Branch not found'
            });
        }
        console.log('Found branch:', branch.name);
        
        // Generate new QR token
        const qrToken = generateQRToken();
        console.log('Generated QR token');
        
        // Create QR code data
        const qrData = JSON.stringify({
            branchId,
            token: qrToken,
            timestamp: new Date().toISOString()
        });
        console.log('Created QR data');
        
        try {
            // Generate QR code
            console.log('Generating QR code image...');
            const qrImage = await QRCode.toDataURL(qrData);
            console.log('QR code image generated');
            
            // Store token in QRCode model
            console.log('Storing QR code in database...');
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 60000); // 60 seconds from now
            await QRCodeModel.create({
                token: qrToken,
                branchId,
                expiresAt,
                isUsed: false,
                createdAt: now,
                updatedAt: now
            });
            console.log('QR code stored in database');
            
            // Always return JSON response with QR code data
            res.json({
                status: 'success',
                data: {
                    qrImage,
                    expiresIn: 60,
                    branch: {
                        name: branch.name,
                        code: branch.code,
                        address: branch.address
                    }
                }
            });
            console.log('QR code response sent successfully');
        } catch (qrError) {
            console.error('Error in QR code generation/storage:', qrError);
            throw new Error('Failed to generate or store QR code: ' + qrError.message);
        }
        
    } catch (error) {
        console.error('Error in generateQR:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate QR code'
        });
    }
};

// Scan QR code from mobile app
const scanQR = async (req, res) => {
    try {
        console.log('Scanning QR code...');
        const { qrToken, location, deviceInfo } = req.body;
        const userId = req.user.id;

        if (!qrToken) {
            return res.status(400).json({
                status: 'error',
                message: 'QR token is required'
            });
        }

        console.log('Parsing QR data...');
        let qrData;
        try {
            qrData = JSON.parse(qrToken);
        } catch (err) {
            console.error('Invalid QR data format:', err);
            return res.status(400).json({
                status: 'error',
                message: 'Invalid QR code format'
            });
        }

        const { branchId, token, timestamp } = qrData;

        // Validate QR code exists and is not expired
        console.log('Validating QR code...');
        const qrCode = await QRCodeModel.findOne({
            where: {
                token: token,
                branchId: branchId,
                isUsed: false,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!qrCode) {
            console.log('QR code not found or expired');
            return res.status(400).json({
                status: 'error',
                message: 'QR code is invalid or has expired'
            });
        }

        // Get branch location
        console.log('Getting branch location...');
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({
                status: 'error',
                message: 'Branch not found'
            });
        }

        // Validate location if provided
        if (location && location.latitude && location.longitude) {
            console.log('Validating location...');
            const distance = calculateDistance(
                location.latitude,
                location.longitude,
                branch.latitude,
                branch.longitude
            );

            // If distance is more than 500 meters
            if (distance > 1500) {
                return res.status(400).json({
                    status: 'error',
                    message: 'You are too far from the branch location'
                });
            }
        }

        // Find existing check-in
        console.log('Checking for existing attendance...');
        const now = new Date();
        const existingAttendance = await Attendance.findOne({
            where: {
                userId,
                checkOutTime: null,
                checkInTime: {
                    [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                }
            }
        });

        let attendance;
        if (existingAttendance) {
            // Check-out
            console.log('Processing check-out...');
            existingAttendance.checkOutTime = now;
            existingAttendance.deviceInfo = deviceInfo;
            if (location) {
                existingAttendance.checkOutLocation = location;
            }
            attendance = await existingAttendance.save();

            // Mark QR code as used
            await qrCode.update({ isUsed: true });

            return res.json({
                status: 'success',
                message: 'Check-out successful',
                data: attendance
            });
        } else {
            // Check-in
            console.log('Processing check-in...');
            const now = new Date();
            attendance = await Attendance.create({
                userId,
                branchId,
                checkInTime: now,
                status: 'present',
                qrToken: token,
                deviceInfo: deviceInfo,
                checkInLatitude: location.latitude,
                checkInLongitude: location.longitude
            });

            // Mark QR code as used
            await qrCode.update({ isUsed: true });

            return res.json({
                status: 'success',
                message: 'Check-in successful',
                data: attendance
            });
        }
    } catch (error) {
        console.error('Error scanning QR:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process attendance: ' + error.message
        });
    }
};

// Check-in with QR code
const checkIn = async (req, res) => {
    try {
        const { qrData, latitude, longitude } = req.body;
        const userId = req.user.id;
        
        // Parse QR data
        const { branchId, token, timestamp } = JSON.parse(qrData);
        
        // Validate QR code timestamp (60 seconds expiry)
        const qrTimestamp = new Date(timestamp);
        const now = new Date();
        if (now - qrTimestamp > 60000) {
            return res.status(400).json({
                status: 'error',
                message: 'QR code has expired'
            });
        }
        
        // Get branch location
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({
                status: 'error',
                message: 'Branch not found'
            });
        }
        
        // Calculate distance
        const distance = calculateDistance(
            latitude,
            longitude,
            branch.latitude,
            branch.longitude
        );
        
        // Check if within 500 meters
        if (distance > 1500) {
            return res.status(400).json({
                status: 'error',
                message: 'You are too far from the branch location'
            });
        }

        // Create attendance record
        const attendance = await Attendance.create({
            userId,
            branchId,
            checkInTime: now,
            status: 'present',
            qrToken: token,
            checkInLatitude: latitude,
            checkInLongitude: longitude
        });

        return res.json({
            status: 'success',
            message: 'Check-in successful',
            data: attendance
        });
    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process check-in'
        });
    }
};

// Check-out
const checkOut = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;

        // Find existing check-in
        const now = new Date();
        const attendance = await Attendance.findOne({
            where: {
                userId,
                checkOutTime: null,
                checkInTime: {
                    [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                }
            }
        });

        if (!attendance) {
            return res.status(404).json({
                status: 'error',
                message: 'No active check-in found'
            });
        }

        // Update check-out time and location
        attendance.checkOutTime = now;
        attendance.checkOutLatitude = latitude;
        attendance.checkOutLongitude = longitude;
        await attendance.save();

        return res.json({
            status: 'success',
            message: 'Check-out successful',
            data: attendance
        });
    } catch (error) {
        console.error('Error during check-out:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process check-out'
        });
    }
};

// Get attendance report
const getReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        // If no dates provided, use current month
        const today = moment.tz('Asia/Jakarta');
        const start = startDate 
            ? moment.tz(startDate, 'Asia/Jakarta').startOf('day')
            : today.clone().startOf('month');
        const end = endDate 
            ? moment.tz(endDate, 'Asia/Jakarta').endOf('day')
            : today.clone().endOf('month');

        console.log('Debug Info:');
        console.log('User ID:', userId);
        console.log('Start Date (raw):', startDate);
        console.log('End Date (raw):', endDate);
        console.log('Start Date (processed):', start.format('YYYY-MM-DD HH:mm:ss'));
        console.log('End Date (processed):', end.format('YYYY-MM-DD HH:mm:ss'));

        // Format dates for MySQL query
        const startStr = start.format('YYYY-MM-DD HH:mm:ss');
        const endStr = end.format('YYYY-MM-DD HH:mm:ss');

        // Query attendance records with direct JOIN
        const query = `
            SELECT 
                a.*,
                b.name as branch_name,
                b.code as branch_code,
                b.address as branch_address
            FROM attendances a
            LEFT JOIN branches b ON a.branch_id = b.id
            WHERE a.user_id = :userId
            AND a.check_in_time >= :startDate
            AND a.check_in_time <= :endDate
            AND a.deleted_at IS NULL
            ORDER BY a.check_in_time DESC`;

        console.log('SQL Query:', query);
        console.log('Query Parameters:', {
            userId,
            startDate: startStr,
            endDate: endStr
        });

        const records = await sequelize.query(
            query,
            {
                replacements: {
                    userId,
                    startDate: startStr,
                    endDate: endStr
                },
                type: QueryTypes.SELECT,
                logging: console.log // This will log the actual SQL query with values
            }
        );

        console.log('Query Results:', JSON.stringify(records, null, 2));

        // Process records and calculate statistics
        const processedRecords = records.map(record => {
            const checkInTime = moment.tz(record.check_in_time, 'Asia/Jakarta');
            const checkOutTime = record.check_out_time 
                ? moment.tz(record.check_out_time, 'Asia/Jakarta')
                : null;
            
            // Calculate duration if check-out exists
            let duration = null;
            if (checkOutTime) {
                const diff = checkOutTime.diff(checkInTime);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                duration = `${hours}h ${minutes}m`;
            }

            // Determine status
            let status;
            const checkInHour = checkInTime.hour();
            const checkInMinute = checkInTime.minute();

            if (!checkOutTime) {
                status = 'incomplete';
            } else if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
                status = 'late';
            } else {
                status = 'present';
            }

            return {
                id: record.id,
                date: checkInTime.format('YYYY-MM-DD'),
                checkIn: checkInTime.format('HH:mm'),
                checkOut: checkOutTime ? checkOutTime.format('HH:mm') : null,
                duration,
                status,
                branch: {
                    name: record.branch_name,
                    code: record.branch_code,
                    address: record.branch_address
                }
            };
        });

        console.log('Processed Records:', JSON.stringify(processedRecords, null, 2));

        // Calculate summary
        const present = processedRecords.filter(r => r.status === 'present').length;
        const late = processedRecords.filter(r => r.status === 'late').length;
        const incomplete = processedRecords.filter(r => r.status === 'incomplete').length;

        // Calculate average work hours for completed days
        const completedRecords = processedRecords.filter(r => r.duration);
        const totalMinutes = completedRecords.reduce((acc, record) => {
            const [hours, minutes] = record.duration.split('h ');
            return acc + (parseInt(hours) * 60) + parseInt(minutes);
        }, 0);
        const averageWorkHours = completedRecords.length > 0 
            ? Math.round((totalMinutes / completedRecords.length) / 60 * 10) / 10
            : 0;

        const response = {
            status: 'success',
            data: {
                records: processedRecords,
                summary: {
                    totalDays: processedRecords.length,
                    present,
                    late,
                    incomplete,
                    averageWorkHours
                },
                period: {
                    startDate: start.format('YYYY-MM-DD'),
                    endDate: end.format('YYYY-MM-DD')
                }
            }
        };

        console.log('Final Response:', JSON.stringify(response, null, 2));

        res.json(response);
    } catch (error) {
        console.error('Error in getReport:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get attendance report'
        });
    }
};

module.exports = {
    generateQR,
    scanQR,
    checkIn,
    checkOut,
    getReport
};
