import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Form, Button, Table, Card, Row, Col } from 'react-bootstrap';

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

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present':
                return 'bg-success';
            case 'late':
                return 'bg-warning';
            case 'incomplete':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <Layout>
            <div className="container py-4">
                <h1 className="mb-4">Attendance Report</h1>

                {/* Filter Form */}
                <Card className="mb-4">
                    <Card.Body>
                        <Form onSubmit={handleFilter}>
                            <Row className="align-items-end">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button type="submit" variant="primary" className="w-100">
                                        Filter Report
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Summary Cards */}
                {summary && (
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="text-center">
                                <Card.Body>
                                    <h3>{summary.totalDays}</h3>
                                    <Card.Text>Total Days</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center bg-success text-white">
                                <Card.Body>
                                    <h3>{summary.present}</h3>
                                    <Card.Text>Present</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center bg-warning">
                                <Card.Body>
                                    <h3>{summary.late}</h3>
                                    <Card.Text>Late</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="text-center bg-danger text-white">
                                <Card.Body>
                                    <h3>{summary.incomplete}</h3>
                                    <Card.Text>Incomplete</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Period Info */}
                {period && (
                    <Card className="mb-4">
                        <Card.Body>
                            <h5>Report Period</h5>
                            <p className="mb-0">
                                {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </p>
                        </Card.Body>
                    </Card>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Loading Message */}
                {loading && (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Attendance Records Table */}
                {!loading && !error && records.length > 0 && (
                    <div className="table-responsive">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>{record.checkIn}</td>
                                        <td>{record.checkOut || '-'}</td>
                                        <td>{record.duration || '-'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>{record.branch?.name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {/* No Records Message */}
                {!loading && !error && records.length === 0 && (
                    <div className="alert alert-info" role="alert">
                        No attendance records found for the selected period.
                    </div>
                )}
            </div>
        </Layout>
    );
}
