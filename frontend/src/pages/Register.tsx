import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { registerUser, uploadFiles } from '../api/authApi';
import { getAllAgencies } from '../api/userApi';
import { Agency } from '../api/userApi';

const validationSchema = Yup.object({
  firstName: Yup.string().matches(/^[A-Za-z]+$/, 'First name must contain letters only').required('First name is required'),
  lastName: Yup.string() .matches(/^[A-Za-z]+$/, 'Last name must contain letters only').required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone must contain numbers only')
    .required('Phone is required'),
  gender: Yup.string().oneOf(['male', 'female', 'other'], 'Please select a gender').required('Gender is required'),
  userType: Yup.string().oneOf(['Job Seeker', 'Agency'], 'Please select a user type').required('User type is required'),
  hobbies: Yup.array().of(Yup.string().oneOf(['Sports', 'Dance', 'Reading', 'Singing'])),
  agencyId: Yup.string().when('userType', {
    is: 'Job Seeker',
    then: (schema) => schema.required('Agency selection is required for Job Seekers'),
    otherwise: (schema) => schema.notRequired(),
  }),
  profileImage: Yup.mixed()
    .nullable()
    .required('Profile image is required')
    .test('isFile', 'Please select a file', (value) => {
      return value instanceof File;
    })
    .test('fileType', 'Profile image must be PNG or JPEG', (value) => {
      if (!value || !(value instanceof File)) return false;
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      return validTypes.includes(value.type);
    }),
  resume: Yup.mixed().when('userType', {
    is: 'Job Seeker',
    then: (schema) => schema
      .nullable()
      .required('Resume is required for Job Seekers')
      .test('isFile', 'Please select a file', (value) => {
        return value instanceof File;
      })
      .test('fileType', 'Resume must be PDF or DOCX', (value) => {
        if (!value || !(value instanceof File)) return false;
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        return validTypes.includes(value.type);
      }),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
});

const Register = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const response = await getAllAgencies();
      setAgencies(response.data.agencies || []);
    } catch (error: any) {
      console.error('Error fetching agencies:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '' as 'male' | 'female' | 'other' | '',
      userType: '' as 'Job Seeker' | 'Agency' | '',
      hobbies: [] as string[],
      agencyId: '',
      profileImage: null as File | null,
      resume: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Step 1: Upload files first (only if files are actually selected)
        let profileImagePath: string | undefined;
        let resumePath: string | undefined;

        // Check if files are actually File objects (not null)
        const hasProfileImage = values.profileImage instanceof File;
        const hasResume = values.userType === 'Job Seeker' && values.resume instanceof File;

        if (hasProfileImage || hasResume) {
          const filesToUpload: { profileImage?: File; resume?: File } = {};

          if (hasProfileImage && values.profileImage) {
            filesToUpload.profileImage = values.profileImage;
          }

          if (hasResume && values.resume) {
            filesToUpload.resume = values.resume;
          }

          const uploadResponse = await uploadFiles(filesToUpload);
          // Response interceptor returns response.data directly
          profileImagePath = uploadResponse.data.files.profileImage?.filename;
          resumePath = uploadResponse.data.files.resume?.filename;
        }

        // Step 2: Register user with file paths
        const registerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          gender: values.gender as 'male' | 'female' | 'other',
          userType: values.userType as 'Job Seeker' | 'Agency',
          hobbies: values.hobbies,
          agencyId: values.userType === 'Job Seeker' ? values.agencyId : undefined,
          profileImage: profileImagePath,
          resume: resumePath,
        };

        const response: any = await registerUser(registerData);
        // Response interceptor returns response.data directly
        toast.success(response?.message || 'Registration successful! Please verify your email.');
        localStorage.setItem('registerEmail', values.email);
        navigate('/verify-otp');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleHobbyChange = (hobby: string, checked: boolean) => {
    const currentHobbies = formik.values.hobbies || [];
    if (checked) {
      formik.setFieldValue('hobbies', [...currentHobbies, hobby]);
    } else {
      formik.setFieldValue('hobbies', currentHobbies.filter((h) => h !== hobby));
    }
  };

  const handleFileChange = async (field: 'profileImage' | 'resume', file: File | null) => {
    if (file) {
      let isValid = true;

      if (field === 'profileImage') {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          toast.error('Profile image must be PNG or JPEG');
          isValid = false;
        }
      } else if (field === 'resume') {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          toast.error('Resume must be PDF or DOCX');
          isValid = false;
        }
      }

      if (isValid) {
        // Set the file value and mark as touched
        await formik.setFieldValue(field, file);
        formik.setFieldTouched(field, true, false); // false = don't validate immediately
        // Validate the field after setting the value
        await formik.validateField(field);
      }
    } else {
      // Clear the field if no file is selected
      await formik.setFieldValue(field, null);
      formik.setFieldTouched(field, true, false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Register</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={formik.handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.firstName && !!formik.errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.lastName && !!formik.errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.email && !!formik.errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formik.values.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      formik.setFieldValue('phone', value);
                    }}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.phone && !!formik.errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Male"
                      name="gender"
                      value="male"
                      checked={formik.values.gender === 'male'}
                      onChange={formik.handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Female"
                      name="gender"
                      value="female"
                      checked={formik.values.gender === 'female'}
                      onChange={formik.handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Other"
                      name="gender"
                      value="other"
                      checked={formik.values.gender === 'other'}
                      onChange={formik.handleChange}
                    />
                  </div>
                  {formik.touched.gender && formik.errors.gender && (
                    <div className="text-danger small">{formik.errors.gender}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>User Type</Form.Label>
                  <Form.Select
                    name="userType"
                    value={formik.values.userType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.userType && !!formik.errors.userType}
                  >
                    <option value="">Select User Type</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Agency">Agency</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.userType}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hobbies</Form.Label>
                  <div>
                    {['Sports', 'Dance', 'Reading', 'Singing'].map((hobby) => (
                      <Form.Check
                        key={hobby}
                        type="checkbox"
                        label={hobby}
                        checked={formik.values.hobbies?.includes(hobby) || false}
                        onChange={(e) => handleHobbyChange(hobby, e.target.checked)}
                      />
                    ))}
                  </div>
                </Form.Group>

                {formik.values.userType === 'Job Seeker' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Agency</Form.Label>
                      <Form.Select
                        name="agencyId"
                        value={formik.values.agencyId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.agencyId && !!formik.errors.agencyId}
                      >
                        <option value="">Select Agency</option>
                        {agencies.map((agency) => (
                          <option key={agency.uuid} value={agency.uuid}>
                            {agency.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.agencyId}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Resume (PDF or DOCX only)</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0] || null;
                          handleFileChange('resume', file);
                        }}
                        isInvalid={formik.touched.resume && !!formik.errors.resume}
                        isValid={formik.touched.resume && !formik.errors.resume && !!formik.values.resume}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.resume}
                      </Form.Control.Feedback>
                      {formik.touched.resume && !formik.errors.resume && formik.values.resume && (
                        <Form.Control.Feedback type="valid">
                          File selected successfully
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Profile Image (PNG or JPEG only)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0] || null;
                      handleFileChange('profileImage', file);
                    }}
                    isInvalid={formik.touched.profileImage && !!formik.errors.profileImage}
                    isValid={formik.touched.profileImage && !formik.errors.profileImage && !!formik.values.profileImage}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.profileImage}
                  </Form.Control.Feedback>
                  {formik.touched.profileImage && !formik.errors.profileImage && formik.values.profileImage && (
                    <Form.Control.Feedback type="valid">
                      File selected successfully
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate('/login')}
                  >
                    Already have an account? Login
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

export default Register;



