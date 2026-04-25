import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import { getAuthState, shopApi } from 'src/api/shopApi'
import { getErrorMessage } from 'src/views/shop/utils'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (getAuthState()?.accessToken) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const login = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await shopApi.login(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={7}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={login}>
                    <h1>تسجيل الدخول</h1>
                    <p className="text-body-secondary">ادخل إلى نظام إدارة المحل</p>
                    {error ? (
                      <CAlert color="danger" dismissible onClose={() => setError('')}>
                        {error}
                      </CAlert>
                    ) : null}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        name="username"
                        placeholder="اسم المستخدم"
                        autoComplete="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        name="password"
                        type="password"
                        placeholder="كلمة المرور"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                    <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <CSpinner as="span" size="sm" className="me-2" />
                          جاري الدخول
                        </>
                      ) : (
                        'دخول'
                      )}
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5 login-register-card">
                <CCardBody className="text-center d-flex align-items-center">
                  <div>
                    <h2>نظام المحل</h2>
                    <p className="mb-0">
                      استخدم حسابك وصلاحياتك للوصول إلى المبيعات والمخزون والموظفين والمصروفات.
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
