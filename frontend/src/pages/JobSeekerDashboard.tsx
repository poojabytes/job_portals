import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getAgencyDetails } from '../api/userApi';
import { Agency } from '../api/userApi';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (userData.userType !== 'Job Seeker') {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    fetchAgencyDetails();
  }, [navigate]);

  const fetchAgencyDetails = async () => {
    try {
      setLoading(true);
      const response = await getAgencyDetails();
      setAgency(response.data.agency);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch agency details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Job Seeker Dashboard</h2>
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
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h4 className="mb-0">Agency Details</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : !agency ? (
                <div className="text-center text-muted">No agency assigned</div>
              ) : (
                <div>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Name:</strong>
                    </Col>
                    <Col sm={8}>{agency.name}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Email:</strong>
                    </Col>
                    <Col sm={8}>{agency.email}</Col>
                  </Row>
                  {agency.phone && (
                    <Row className="mb-3">
                      <Col sm={4}>
                        <strong>Phone:</strong>
                      </Col>
                      <Col sm={8}>{agency.phone}</Col>
                    </Row>
                  )}
                  {agency.address && (
                    <Row className="mb-3">
                      <Col sm={4}>
                        <strong>Address:</strong>
                      </Col>
                      <Col sm={8}>{agency.address}</Col>
                    </Row>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JobSeekerDashboard;


