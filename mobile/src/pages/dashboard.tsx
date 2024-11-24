import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jwt_decode from 'jwt-decode';
import { FaQrcode, FaUser, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import Modal from 'react-bootstrap/Modal';
import Layout from '../components/Layout';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';

interface AttendanceRecord {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-3">
        <Row>
          <Col xs={12}>
            <h1 className="h4 mb-3">Welcome, {user?.name || 'User'}</h1>
          </Col>
        </Row>

        <Row className="g-4">
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Card.Title>Quick Actions</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item 
                    action 
                    onClick={() => router.push('/attendance/scan')}
                    className="d-flex align-items-center"
                  >
                    <FaQrcode className="me-3" />
                    Scan QR Code for Attendance
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action 
                    onClick={() => router.push('/profile')}
                    className="d-flex align-items-center"
                  >
                    <FaUser className="me-3" />
                    View Profile
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
