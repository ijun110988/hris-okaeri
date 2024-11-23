import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button, ButtonGroup } from 'react-bootstrap';

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
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            {/* Type Selection */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Select Attendance Type</h5>
                <ButtonGroup className="w-100">
                  <Button
                    variant={selectedType === 'check-in' ? 'success' : 'outline-success'}
                    onClick={() => handleTypeSelect('check-in')}
                    disabled={scanStatus === 'processing'}
                  >
                    Check In
                  </Button>
                  <Button
                    variant={selectedType === 'check-out' ? 'danger' : 'outline-danger'}
                    onClick={() => handleTypeSelect('check-out')}
                    disabled={scanStatus === 'processing'}
                  >
                    Check Out
                  </Button>
                </ButtonGroup>
                {!selectedType && (
                  <div className="text-muted small mt-2">
                    Please select whether you want to check in or check out
                  </div>
                )}
                {selectedType === 'check-out' && (
                  <div className="text-danger small mt-2">
                    Check-out is allowed between 15:00 and 23:00
                  </div>
                )}
              </div>
            </div>

            {/* Camera Selection */}
            {selectedType && cameras.length > 1 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Select Camera</h5>
                  <select 
                    className="form-select"
                    value={cameraId}
                    onChange={(e) => handleCameraSwitch(e.target.value)}
                  >
                    {cameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Scanner */}
            {selectedType && (
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  <div 
                    ref={readerRef}
                    id="reader" 
                    style={{ 
                      width: '100%',
                      minHeight: '300px',
                      background: '#f8f9fa',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Messages */}
            <div className="text-center mt-4">
              <div className="d-inline-flex align-items-center">
                <i className={`bi bi-camera ${scanStatus === 'scanning' ? 'text-primary' : 'text-muted'} me-2`} />
                <p className={`mb-0 ${scanStatus === 'error' ? 'text-danger' : scanStatus === 'success' ? 'text-success' : 'text-muted'}`}>
                  {getStatusMessage()}
                </p>
              </div>
              {scanCount > 0 && (
                <div className="text-success mt-2">
                  <small>Successfully scanned {scanCount} QR code{scanCount !== 1 ? 's' : ''}</small>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center mt-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                <div>{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="alert alert-success d-flex align-items-center mt-4" role="alert">
                <i className="bi bi-check-circle-fill me-2" />
                <div>{success}</div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
