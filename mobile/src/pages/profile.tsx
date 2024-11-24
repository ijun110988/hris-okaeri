import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Row, Col, Card, Button, Spinner, Modal, Form } from 'react-bootstrap';
import Layout from '../components/Layout';

// Config
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProfileData {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validasi password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/auth/password`,
        {
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form dan tutup modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      alert('Password has been successfully changed');
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
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
                variant="primary" 
                className="w-100 mt-3 mb-2"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>

              <Button 
                variant="danger" 
                className="w-100"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Reset Password */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            {passwordError && (
              <div className="alert alert-danger">{passwordError}</div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default ProfileScreen;
