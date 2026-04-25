import React from 'react'
import PropTypes from 'prop-types'
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'

export const PageHeader = ({ title, subtitle, actions }) => (
  <CRow className="align-items-center mb-4">
    <CCol>
      <h2 className="mb-1">{title}</h2>
      {subtitle ? <div className="text-body-secondary">{subtitle}</div> : null}
    </CCol>
    {actions ? <CCol xs="auto">{actions}</CCol> : null}
  </CRow>
)

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
}

export const LoadingCard = ({ label = 'جاري تحميل بيانات النظام...' }) => (
  <CCard className="mb-4">
    <CCardBody className="text-center py-5">
      <CSpinner color="primary" />
      <div className="mt-3 text-body-secondary">{label}</div>
    </CCardBody>
  </CCard>
)

LoadingCard.propTypes = {
  label: PropTypes.string,
}

export const EmptyState = ({ title = 'لا توجد سجلات', text, action }) => (
  <div className="text-center text-body-secondary py-4">
    <div className="fw-semibold text-body">{title}</div>
    {text ? <div className="small mt-1">{text}</div> : null}
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
)

EmptyState.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  action: PropTypes.node,
}

export const ApiAlert = ({ error, success, onClose }) => {
  if (!error && !success) {
    return null
  }

  return (
    <CAlert
      color={error ? 'danger' : 'success'}
      dismissible={Boolean(onClose)}
      onClose={onClose}
      className="mb-4"
    >
      {error || success}
    </CAlert>
  )
}

ApiAlert.propTypes = {
  error: PropTypes.string,
  success: PropTypes.string,
  onClose: PropTypes.func,
}

export const SectionCard = ({ title, children, actions, className = 'mb-4' }) => (
  <CCard className={className}>
    {title || actions ? (
      <CCardHeader className="d-flex align-items-center justify-content-between gap-3">
        <strong>{title}</strong>
        {actions ? <div>{actions}</div> : null}
      </CCardHeader>
    ) : null}
    <CCardBody>{children}</CCardBody>
  </CCard>
)

SectionCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  className: PropTypes.string,
}

export const SubmitButton = ({ saving, children, ...props }) => (
  <CButton disabled={saving} {...props}>
    {saving ? (
      <>
        <CSpinner as="span" size="sm" className="me-2" />
        جاري الحفظ
      </>
    ) : (
      children
    )}
  </CButton>
)

SubmitButton.propTypes = {
  saving: PropTypes.bool,
  children: PropTypes.node.isRequired,
}
