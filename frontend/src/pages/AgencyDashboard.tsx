import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getJobSeekersByAgency, updateJobSeekerStatus } from '../api/userApi';
import { JobSeeker } from '../api/userApi';
import envConfig from '../environment';

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (userData.userType !== 'Agency') {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    fetchJobSeekers();
  }, [navigate]);

  const fetchJobSeekers = async () => {
    try {
      setLoading(true);
      const response = await getJobSeekersByAgency();
      setJobSeekers(response.data.jobSeekers || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch job seekers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await updateJobSeekerStatus(userId, status);
      toast.success(response.message || 'Status updated successfully');
      fetchJobSeekers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'declined':
        return <Badge bg="danger">Declined</Badge>;
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Agency Dashboard</h2>
            <div>
              <span className="me-3">Welcome, {user?.firstName} {user?.lastName}</span>
              <Button variant="outline-danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Job Seekers</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : jobSeekers.length === 0 ? (
                <div className="text-center text-muted">No job seekers found</div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Hobbies</th>
                      <th>Profile Image</th>
                      <th>Resume</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobSeekers.map((seeker) => (
                      <tr key={seeker.uuid}>
                        <td>{seeker.firstName} {seeker.lastName}</td>
                        <td>{seeker.email}</td>
                        <td>{seeker.phone}</td>
                        <td>{seeker.gender}</td>
                        <td>{seeker.hobbies?.join(', ') || 'N/A'}</td>
                        <td>
                          {seeker.profileImage ? (
                            <img
                              src={`${envConfig.backendUrl}/public/profileImage/${seeker.profileImage}`}
                              alt="Profile"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {seeker.resume ? (
                            <a
                              href={`${envConfig.backendUrl}/public/resume/${seeker.resume}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Resume
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{getStatusBadge(seeker.status)}</td>
                        <td>
                          {seeker.status === 'pending' && (
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusUpdate(seeker.uuid, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusUpdate(seeker.uuid, 'declined')}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                          {seeker.status !== 'pending' && (
                            <span className="text-muted">Action taken</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgencyDashboard;


