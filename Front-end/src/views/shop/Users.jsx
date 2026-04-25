import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import { shopApi } from 'src/api/shopApi'
import {
  ApiAlert,
  EmptyState,
  LoadingCard,
  PageHeader,
  SectionCard,
  SubmitButton,
} from 'src/views/shop/components'
import { formatDate, getErrorMessage } from './utils'

const roles = [
  { value: 'ADMIN', label: 'مدير النظام' },
  { value: 'MANAGER', label: 'مدير' },
  { value: 'CASHIER', label: 'كاشير' },
  { value: 'STOCKIST', label: 'مخزن' },
]

const roleLabel = (role) => roles.find((item) => item.value === role)?.label || role

const emptyUser = {
  name: '',
  username: '',
  password: '',
  role: 'CASHIER',
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyUser)
  const [roleUser, setRoleUser] = useState(null)
  const [nextRole, setNextRole] = useState('')
  const [passwordUser, setPasswordUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      setUsers(await shopApi.users())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const createUser = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createUser(form)
      setForm(emptyUser)
      setSuccess('تم إنشاء المستخدم.')
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleUser = async (user) => {
    const confirmed = window.confirm(
      `هل تريد ${user.isActive ? 'إيقاف' : 'تفعيل'} حساب "${user.name}"؟`,
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.toggleUser(user.id)
      setSuccess('تم تحديث حالة المستخدم.')
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openRoleModal = (user) => {
    setRoleUser(user)
    setNextRole(user.role)
  }

  const updateRole = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateUserRole(roleUser.id, { role: nextRole })
      setRoleUser(null)
      setNextRole('')
      setSuccess('تم تعديل الصلاحية.')
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openPasswordModal = (user) => {
    setPasswordUser(user)
    setNewPassword('')
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.resetUserPassword(passwordUser.id, { newPassword })
      setPasswordUser(null)
      setNewPassword('')
      setSuccess('تم إعادة تعيين كلمة المرور.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && users.length === 0) {
    return <LoadingCard label="جاري تحميل المستخدمين..." />
  }

  return (
    <>
      <PageHeader title="المستخدمون والصلاحيات" subtitle="إدارة حسابات الدخول وأدوار النظام." />

      <ApiAlert
        error={error}
        success={success}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <SectionCard title="إضافة مستخدم">
        <CForm onSubmit={createUser}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel htmlFor="userName">الاسم</CFormLabel>
              <CFormInput
                id="userName"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="username">اسم المستخدم</CFormLabel>
              <CFormInput
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="password">كلمة المرور</CFormLabel>
              <CFormInput
                id="password"
                name="password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="role">الدور</CFormLabel>
              <CFormSelect id="role" name="role" value={form.role} onChange={handleChange}>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={1} className="d-flex align-items-end">
              <SubmitButton color="primary" type="submit" saving={saving}>
                إضافة
              </SubmitButton>
            </CCol>
          </CRow>
        </CForm>
      </SectionCard>

      <SectionCard title="قائمة المستخدمين">
        {users.length === 0 ? (
          <EmptyState title="لا يوجد مستخدمون" />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>المستخدم</CTableHeaderCell>
                <CTableHeaderCell>الدور</CTableHeaderCell>
                <CTableHeaderCell>آخر دخول</CTableHeaderCell>
                <CTableHeaderCell>الحالة</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user) => (
                <CTableRow key={user.id}>
                  <CTableDataCell>
                    <div className="fw-semibold">{user.name}</div>
                    <div className="small text-body-secondary">{user.username}</div>
                  </CTableDataCell>
                  <CTableDataCell>{roleLabel(user.role)}</CTableDataCell>
                  <CTableDataCell>{formatDate(user.lastLogin)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'مفعل' : 'موقوف'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleModal(user)}
                      >
                        الدور
                      </CButton>
                      <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        onClick={() => openPasswordModal(user)}
                      >
                        كلمة المرور
                      </CButton>
                      <CButton
                        color={user.isActive ? 'danger' : 'success'}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={() => toggleUser(user)}
                      >
                        {user.isActive ? 'إيقاف' : 'تفعيل'}
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </SectionCard>

      <CModal visible={Boolean(roleUser)} onClose={() => setRoleUser(null)}>
        <CForm onSubmit={updateRole}>
          <CModalHeader>
            <CModalTitle>تعديل دور {roleUser?.name}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormLabel htmlFor="nextRole">الدور</CFormLabel>
            <CFormSelect
              id="nextRole"
              value={nextRole}
              onChange={(event) => setNextRole(event.target.value)}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setRoleUser(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal visible={Boolean(passwordUser)} onClose={() => setPasswordUser(null)}>
        <CForm onSubmit={resetPassword}>
          <CModalHeader>
            <CModalTitle>إعادة تعيين كلمة مرور {passwordUser?.name}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormLabel htmlFor="newPassword">كلمة المرور الجديدة</CFormLabel>
            <CFormInput
              id="newPassword"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setPasswordUser(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Users
