import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Form, Button, Table, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Calendar2Check, Clock, GeoAlt, Building } from 'react-bootstrap-icons';

interface AttendanceRecord {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string | null;
    duration: string | null;
    status: string;
    branch: {
        name: string;
        code: string;
        address: string;
    } | null;
}

interface Summary {
    totalDays: number;
    present: number;
    late: number;
    incomplete: number;
    averageWorkHours: number;
}

interface Period {
    startDate: string;
    endDate: string;
}

export default function AttendanceReport() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [period, setPeriod] = useState<Period | null>(null);

    const fetchReport = async (start?: string, end?: string) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/report`;
            if (start && end) {
                url += `?startDate=${start}&endDate=${end}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === 'success') {
                setRecords(response.data.data.records);
                setSummary(response.data.data.summary);
                setPeriod(response.data.data.period);
            }
        } catch (err: any) {
            console.error('Error fetching report:', err);
            setError(err.response?.data?.message || 'Failed to fetch attendance report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            fetchReport(startDate, endDate);
        }
    };

    const getStatusBadgeClass = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'present':
                return 'success';
            case 'late':
                return 'warning';
            case 'incomplete':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Layout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 fw-bold">
                        <Calendar2Check className="me-2" />
                        Attendance Report
                    </h2>
                </div>

                {/* Filter Form */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body className="p-4">
                        <Form onSubmit={handleFilter}>
                            <Row className="g-3 align-items-end">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="text-muted">Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border-0 bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="text-muted">End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border-0 bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="w-100 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : (
                                            <i className="bi bi-filter me-2"></i>
                                        )}
                                        Filter Report
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Summary Cards */}
                {summary && (
                    <Row className="g-3 mb-4">
                        <Col xs={6} md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-2">
                                        <Calendar2Check className="text-primary" size={24} />
                                    </div>
                                    <h3 className="mb-1">{summary.totalDays}</h3>
                                    <Card.Text className="text-muted mb-0">Total Days</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-2">
                                        <Clock className="text-success" size={24} />
                                    </div>
                                    <h3 className="mb-1">{summary.present}</h3>
                                    <Card.Text className="text-muted mb-0">Present</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 mb-2">
                                        <Clock className="text-warning" size={24} />
                                    </div>
                                    <h3 className="mb-1">{summary.late}</h3>
                                    <Card.Text className="text-muted mb-0">Late</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                                    <div className="rounded-circle bg-danger bg-opacity-10 p-3 mb-2">
                                        <Clock className="text-danger" size={24} />
                                    </div>
                                    <h3 className="mb-1">{summary.incomplete}</h3>
                                    <Card.Text className="text-muted mb-0">Incomplete</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Period Info */}
                {period && (
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                                    <Calendar2Check className="text-primary" />
                                </div>
                                <div>
                                    <h6 className="mb-1">Report Period</h6>
                                    <p className="mb-0 text-muted">
                                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Loading attendance records...</p>
                    </div>
                )}

                {/* Attendance Records Table */}
                {!loading && !error && records.length > 0 && (
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table className="table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Check In</th>
                                            <th className="px-4 py-3">Check Out</th>
                                            <th className="px-4 py-3">Duration</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Branch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-3">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Clock className="me-2 text-muted" />
                                                    {record.checkIn}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Clock className="me-2 text-muted" />
                                                    {record.checkOut || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {record.duration || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge bg={getStatusBadgeClass(record.status)} className="px-3 py-2">
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {record.branch ? (
                                                        <div className="d-flex align-items-center">
                                                            <Building className="me-2 text-muted" />
                                                            {record.branch.name}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* No Records Message */}
                {!loading && !error && records.length === 0 && (
                    <Card className="shadow-sm border-0 text-center p-5">
                        <Card.Body>
                            <Calendar2Check size={48} className="text-muted mb-3" />
                            <h5>No Records Found</h5>
                            <p className="text-muted mb-0">
                                No attendance records found for the selected period.
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
