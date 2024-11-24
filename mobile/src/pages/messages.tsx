import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaBell, FaArrowLeft } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import Layout from '../components/Layout';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';

interface Message {
  id: number;
  title: string;
  content: string;
  type: string;
  sender: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
  read_status: boolean;
  created_at: string;
}

export default function Messages() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/messages', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.status === 'success') {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read_status: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading || isLoading) {
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
        <Row className="mb-3">
          <Col xs={12} className="d-flex align-items-center">
            <Button 
              variant="link" 
              className="p-0 me-3" 
              onClick={() => router.back()}
            >
              <FaArrowLeft />
            </Button>
            <h1 className="h4 mb-0">Messages</h1>
            {messages.filter(m => !m.read_status).length > 0 && (
              <Badge bg="danger" className="ms-2">
                {messages.filter(m => !m.read_status).length}
              </Badge>
            )}
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                {messages.length === 0 ? (
                  <p className="text-center text-muted my-4">No messages yet</p>
                ) : (
                  <ListGroup variant="flush">
                    {messages.map((msg) => (
                      <ListGroup.Item 
                        key={msg.id} 
                        className={!msg.read_status ? 'bg-light' : ''}
                        onClick={() => !msg.read_status && handleMarkAsRead(msg.id)}
                        style={{ cursor: !msg.read_status ? 'pointer' : 'default' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center">
                              <h6 className="mb-1">{msg.title}</h6>
                              {!msg.read_status && (
                                <Badge bg="primary" pill className="ms-2">New</Badge>
                              )}
                            </div>
                            <p className="mb-1">{msg.content}</p>
                            <small className="text-muted">
                              From: {msg.sender.name} ({msg.sender.role}) • {new Date(msg.created_at).toLocaleString()}
                            </small>
                          </div>
                          {msg.type === 'personal' && (
                            <Badge bg="info">Personal</Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
