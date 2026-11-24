import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { verifyOTP, resendOTP } from '../api/authApi';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  otp: Yup.string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^[0-9]+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: email,
      otp: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await verifyOTP(values);
        toast.success(response.message || 'OTP verified successfully!');
        navigate('/set-password');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'OTP verification failed');
      }
    },
  });

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const response = await resendOTP(email);
      toast.success(response.message || 'OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Verify OTP</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Enter OTP</Form.Label>
                  <Form.Control
                    type="text"
                    name="otp"
                    value={formik.values.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      formik.setFieldValue('otp', value);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    isInvalid={formik.touched.otp && !!formik.errors.otp}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.otp}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary">
                    Verify OTP
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleResendOTP}
                    disabled={resending}
                  >
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyOTP;


