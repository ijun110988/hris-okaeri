import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { House, QrCode, Person, Bell } from 'react-bootstrap-icons';
import { Navbar, Container, Badge } from 'react-bootstrap';
import axios from 'axios';

interface Message {
  id: number;
  read_status: boolean;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/messages', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.status === 'success') {
          const unreadMessages = response.data.data.filter((msg: Message) => !msg.read_status);
          setUnreadCount(unreadMessages.length);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Fetch messages initially
    fetchMessages();

    // Set up interval to fetch messages every minute
    const interval = setInterval(fetchMessages, 60000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const isLoginPage = router.pathname === '/login';
  if (isLoginPage) return <>{children}</>;

  const menuItems = [
    {
      path: '/dashboard',
      icon: <House size={24} />,
      label: 'Home'
    },
    {
      path: '/attendance/scan',
      icon: <QrCode size={24} />,
      label: 'Absen'
    },
    {
      path: '/profile',
      icon: <Person size={24} />,
      label: 'Profile'
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      paddingBottom: '60px'
    }}>
      {/* Sticky Header */}
      <Navbar bg="primary" variant="dark" fixed="top" className="shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
          <Navbar.Brand className="fw-bold">
            <span className="me-2">👥</span>
            HRIS
          </Navbar.Brand>
          <div 
            style={{ 
              width: '40px', 
              cursor: 'pointer',
              position: 'relative',
              color: '#ffffff' // Menambahkan warna putih untuk lonceng
            }}
            onClick={() => router.push('/messages')}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge 
                bg="danger" 
                pill 
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  fontSize: '0.7rem',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Main Content with top padding for header */}
      <main style={{ 
        flex: 1,
        marginTop: '48px' // Mengurangi margin dari 56px ke 48px
      }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #dee2e6',
        zIndex: 1000,
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%'
        }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: router.pathname === item.path ? '#0d6efd' : '#6c757d',
                cursor: 'pointer',
                textDecoration: 'none',
                gap: '4px'
              }}
            >
              {item.icon}
              <small style={{ fontSize: '0.75rem' }}>{item.label}</small>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
