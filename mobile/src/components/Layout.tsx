import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { House, QrCode, Person } from 'react-bootstrap-icons';
import { Navbar, Container } from 'react-bootstrap';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        <Container>
          <Navbar.Brand className="mx-auto fw-bold">
            <span className="me-2">👥</span>
            HRIS
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Main Content with top padding for header */}
      <main style={{ 
        flex: 1,
        marginTop: '56px' // Height of the navbar
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
                cursor: 'pointer'
              }}
            >
              {item.icon}
              <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
