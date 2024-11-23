import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import Layout from '../components/Layout';

// Config
const API_URL = 'http://localhost:3001';

interface ProfileData {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: boolean;
}

const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(response.data.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-3">
      <small className="text-muted">{label}</small>
      <p className="fw-medium">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Row className="justify-content-center mb-5 pb-5">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="text-center">
              <div 
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                style={{ width: '100px', height: '100px' }}
              >
                <span className="display-6">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <h2 className="mb-1">{profile?.name}</h2>
              <span className="badge bg-primary rounded-pill px-3 py-2">
                {profile?.role?.replace('_', ' ')?.toUpperCase()}
              </span>

              <hr className="my-4" />

              <div className="text-start">
                <ProfileItem
                  label="Username"
                  value={profile?.username || ''}
                />
                <ProfileItem
                  label="Role"
                  value={profile?.role?.replace('_', ' ')?.toUpperCase() || ''}
                />
                <ProfileItem
                  label="Status"
                  value={profile?.is_active ? 'Active' : 'Inactive'}
                />
              </div>

              <Button 
                variant="danger" 
                className="w-100 mt-3"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default ProfileScreen;
