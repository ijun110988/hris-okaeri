import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button, ButtonGroup, Card, Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';

export default function ScanQR() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'standby' | 'scanning' | 'processing' | 'success' | 'error'>('standby');
  const [selectedType, setSelectedType] = useState<'check-in' | 'check-out' | null>(null);
  const [cameraId, setCameraId] = useState<string>('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(false);
  const retryRef = useRef<(() => void) | null>(null);
  const lastScanTimeRef = useRef(0);
  const errorCountRef = useRef(0);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
    setScanStatus('standby');
  }, []);

  // Handle scanner errors
  const handleError = useCallback((err: string | Error) => {
    // Don't log or show errors for normal "no QR code detected" cases
    const errorMessage = err.toString().toLowerCase();
    if (errorMessage.includes('no barcode or qr code detected') || 
        errorMessage.includes('no multiformat readers')) {
      return; // Silently ignore these expected errors
    }

    // For other errors, increment the counter
    errorCountRef.current++;
    
    // Only show error message for persistent errors
    if (errorCountRef.current > 5) {
      console.error('Scanner error:', err);
      if (errorMessage.includes('not able to start scanning')) {
        setError('Unable to access camera. Please check permissions.');
      } else {
        setError('Having trouble scanning? Make sure the QR code is clear and well-lit');
      }
      errorCountRef.current = 0; // Reset counter
    }
  }, []);

  // Handle QR code scan
  const handleScan = useCallback(async (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 5000 || scanStatus === 'processing') {
      return;
    }

    if (!selectedType) {
      setError('Please select check-in or check-out first');
      return;
    }

    lastScanTimeRef.current = now;
    setLastScanTime(now);
    setScanCount(prev => prev + 1);
    setScanStatus('processing');
    errorCountRef.current = 0; // Reset error count on successful scan

    try {
      // Get location
      const location = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          position => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          error => reject(error)
        );
      });

      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/scan`,
        {
          qrToken: decodedText,
          location,
          deviceInfo,
          type: selectedType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        setError('');
        // Vibrate if available
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        // Show success message
        alert(response.data.message);
        // Stop scanner and reset type
        await stopScanner();
        setSelectedType(null);
      }

    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process scan');
      setScanStatus('error');
      // Wait 2 seconds before allowing new scan
      setTimeout(() => {
        setScanStatus('scanning');
      }, 2000);
    }
  }, [router, scanStatus, selectedType, stopScanner]);

  // Function to get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
        setCameraId(devices[0].id); // Set first camera as default
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Unable to access camera. Please check camera permissions.');
    }
  }, []);

  // Initialize scanner
  const initializeScanner = useCallback(async () => {
    if (!readerRef.current || isTransitioningRef.current || !cameraId || scanStatus === 'processing' || isScanning) {
      return;
    }

    try {
      isTransitioningRef.current = true;
      setError('');
      errorCountRef.current = 0;

      // Clean up existing scanner
      await stopScanner();

      // Create new scanner instance
      const scanner = new Html5Qrcode('reader', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });

      scannerRef.current = scanner;
      setIsScanning(true);
      setScanStatus('scanning');

      await scanner.start(
        cameraId,
        {
          fps: 5, // Reduced FPS to minimize error messages
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          disableFlip: false, // Don't disable flip for better compatibility
          videoConstraints: {
            facingMode: { ideal: 'environment' }, // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        (decodedText: string) => handleScan(decodedText),
        (err: string | Error) => handleError(err)
      );

    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to start camera. Please refresh and try again.');
      setScanStatus('error');
    } finally {
      isTransitioningRef.current = false;
    }
  }, [cameraId, isScanning, scanStatus, stopScanner, handleScan, handleError]);

  // Get status message
  const getStatusMessage = useCallback(() => {
    if (!selectedType) {
      return 'Select check-in or check-out to start scanning';
    }

    switch (scanStatus) {
      case 'standby':
        return 'Camera ready';
      case 'scanning':
        return 'Point camera at QR code';
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Scan successful!';
      case 'error':
        return 'Scan failed';
      default:
        return '';
    }
  }, [scanStatus, selectedType]);

  // Handle type selection
  const handleTypeSelect = useCallback(async (type: 'check-in' | 'check-out') => {
    if (selectedType === type) {
      await stopScanner();
      setSelectedType(null);
    } else {
      setSelectedType(type);
      await getCameras();
    }
  }, [selectedType, stopScanner, getCameras]);

  // Initialize camera when type is selected
  useEffect(() => {
    if (selectedType && cameraId) {
      initializeScanner();
    }
  }, [selectedType, cameraId, initializeScanner]);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  // Switch camera handler
  const handleCameraSwitch = useCallback(async (newCameraId: string) => {
    setCameraId(newCameraId);
  }, []);

  return (
    <Layout>
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={6} md={8} sm={12}>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold">Attendance Scanner</h2>
              <p className="text-muted">Scan QR code to record your attendance</p>
            </div>

            {/* Type Selection */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body className="p-4">
                <Card.Title className="mb-3 fw-bold">Select Attendance Type</Card.Title>
                <ButtonGroup className="w-100 gap-2">
                  <Button
                    size="lg"
                    variant={selectedType === 'check-in' ? 'success' : 'outline-success'}
                    onClick={() => handleTypeSelect('check-in')}
                    disabled={scanStatus === 'processing'}
                    className="rounded"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Check In
                  </Button>
                  <Button
                    size="lg"
                    variant={selectedType === 'check-out' ? 'danger' : 'outline-danger'}
                    onClick={() => handleTypeSelect('check-out')}
                    disabled={scanStatus === 'processing'}
                    className="rounded"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Check Out
                  </Button>
                </ButtonGroup>
                {!selectedType && (
                  <div className="text-muted small mt-3 text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Please select whether you want to check in or check out
                  </div>
                )}
                {selectedType === 'check-out' && (
                  <Alert variant="warning" className="mt-3 mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Check-out is allowed between 15:00 and 23:00
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Camera Selection */}
            {selectedType && cameras.length > 1 && (
              <Card className="shadow-sm mb-4 border-0">
                <Card.Body className="p-4">
                  <Card.Title className="mb-3 fw-bold">Select Camera</Card.Title>
                  <Form.Select
                    size="lg"
                    value={cameraId}
                    onChange={(e) => handleCameraSwitch(e.target.value)}
                    className="border-0 bg-light"
                  >
                    {cameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </Form.Select>
                </Card.Body>
              </Card>
            )}

            {/* Scanner */}
            {selectedType && (
              <Card className="shadow-sm border-0 overflow-hidden">
                <Card.Body className="p-0">
                  <div 
                    ref={readerRef}
                    id="reader" 
                    style={{ 
                      width: '100%',
                      minHeight: '350px',
                      background: '#f8f9fa',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px'
                    }}
                  />
                </Card.Body>
                
                {/* Status Messages */}
                <Card.Footer className="bg-white border-0 p-4">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center">
                      {scanStatus === 'scanning' && (
                        <span className="me-2 position-relative">
                          <i className="bi bi-camera-fill fs-4 text-primary"></i>
                          <span className="position-absolute top-0 start-100 translate-middle">
                            <span className="badge bg-success border border-light rounded-circle p-1">
                              <span className="visually-hidden">Scanning</span>
                            </span>
                          </span>
                        </span>
                      )}
                      <p className={`mb-0 fs-5 ${
                        scanStatus === 'error' ? 'text-danger' : 
                        scanStatus === 'success' ? 'text-success' : 
                        'text-muted'
                      }`}>
                        {getStatusMessage()}
                      </p>
                    </div>
                    {scanCount > 0 && (
                      <div className="text-success mt-2">
                        <i className="bi bi-check2-circle me-1"></i>
                        <small>Successfully scanned {scanCount} QR code{scanCount !== 1 ? 's' : ''}</small>
                      </div>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            )}

            {/* Messages */}
            <div className="mt-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-3">
                  <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
                  <div>{error}</div>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill fs-5 me-2"></i>
                  <div>{success}</div>
                </Alert>
              )}

              {loading && (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
