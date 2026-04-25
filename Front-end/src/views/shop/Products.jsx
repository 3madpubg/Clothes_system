import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilChevronBottom,
  cilChevronTop,
  cilPencil,
  cilPlus,
  cilSearch,
  cilTrash,
} from '@coreui/icons'

import { shopApi } from 'src/api/shopApi'
import {
  ApiAlert,
  EmptyState,
  LoadingCard,
  PageHeader,
  SectionCard,
  SubmitButton,
} from 'src/views/shop/components'
import { formatMoney, formatNumber, getErrorMessage, toNumber } from 'src/views/shop/utils'

const emptyProduct = {
  modelNumber: '',
  name: '',
  category: '',
  description: '',
}

const emptyVariant = {
  size: '',
  color: '',
  type: '',
  purchasePrice: '',
  sellingPrice: '',
  minStockAlert: 5,
}

const uncategorizedLabel = 'بدون تصنيف'

const getProductStats = (product) => {
  const variants = product.variants || []
  const stock = variants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0)
  const value = variants.reduce(
    (sum, variant) => sum + Number(variant.stockQuantity || 0) * Number(variant.sellingPrice || 0),
    0,
  )
  const lowStock = variants.filter(
    (variant) => Number(variant.stockQuantity || 0) <= Number(variant.minStockAlert || 0),
  ).length

  return {
    variants: variants.length,
    stock,
    value,
    lowStock,
  }
}

const normalizeVariantPayload = (form) => ({
  size: form.size,
  color: form.color,
  type: form.type,
  purchasePrice: toNumber(form.purchasePrice),
  sellingPrice: toNumber(form.sellingPrice),
  minStockAlert: toNumber(form.minStockAlert, 5),
})

const Products = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedModelId, setSelectedModelId] = useState(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [editProductForm, setEditProductForm] = useState(emptyProduct)
  const [variantForm, setVariantForm] = useState(emptyVariant)
  const [editVariantForm, setEditVariantForm] = useState(emptyVariant)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingVariant, setEditingVariant] = useState(null)
  const [editingVariantProduct, setEditingVariantProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProducts = async (params = {}) => {
    setLoading(true)
    setError('')

    try {
      const data = await shopApi.products(params)
      setProducts(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const summary = useMemo(() => {
    const variants = products.flatMap((product) => product.variants || [])
    const stock = variants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0)
    const value = variants.reduce(
      (sum, variant) =>
        sum + Number(variant.stockQuantity || 0) * Number(variant.sellingPrice || 0),
      0,
    )

    return {
      products: products.length,
      variants: variants.length,
      stock,
      value,
    }
  }, [products])

  const categories = useMemo(() => {
    const map = new Map()

    products.forEach((product) => {
      const categoryName = product.category || uncategorizedLabel
      const current = map.get(categoryName) || {
        name: categoryName,
        products: [],
        variants: 0,
        stock: 0,
        value: 0,
        lowStock: 0,
      }
      const stats = getProductStats(product)

      current.products.push(product)
      current.variants += stats.variants
      current.stock += stats.stock
      current.value += stats.value
      current.lowStock += stats.lowStock
      map.set(categoryName, current)
    })

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  }, [products])

  const handleProductChange = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditProductChange = (event) => {
    const { name, value } = event.target
    setEditProductForm((current) => ({ ...current, [name]: value }))
  }

  const handleVariantChange = (event) => {
    const { name, value } = event.target
    setVariantForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditVariantChange = (event) => {
    const { name, value } = event.target
    setEditVariantForm((current) => ({ ...current, [name]: value }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setSelectedCategory('')
    setSelectedModelId(null)
    loadProducts({ search })
  }

  const createProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createProduct(productForm)
      setProductForm(emptyProduct)
      setSelectedCategory(productForm.category || uncategorizedLabel)
      setSuccess('تم إنشاء المنتج بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const updateProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateProduct(editingProduct.id, editProductForm)
      setSelectedCategory(editProductForm.category || uncategorizedLabel)
      setSelectedModelId(editingProduct.id)
      setEditingProduct(null)
      setEditProductForm(emptyProduct)
      setSuccess('تم تعديل المنتج بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(`هل تريد حذف المنتج "${product.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteProduct(product.id)
      if (selectedModelId === product.id) {
        setSelectedModelId(null)
      }
      setSuccess('تم حذف المنتج بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const createVariant = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.addVariant(selectedProduct.id, normalizeVariantPayload(variantForm))
      setSelectedCategory(selectedProduct.category || uncategorizedLabel)
      setSelectedModelId(selectedProduct.id)
      setSelectedProduct(null)
      setVariantForm(emptyVariant)
      setSuccess('تمت إضافة النوع بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const updateVariant = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateVariant(
        editingVariantProduct.id,
        editingVariant.id,
        normalizeVariantPayload(editVariantForm),
      )
      setSelectedCategory(editingVariantProduct.category || uncategorizedLabel)
      setSelectedModelId(editingVariantProduct.id)
      setEditingVariant(null)
      setEditingVariantProduct(null)
      setEditVariantForm(emptyVariant)
      setSuccess('تم تعديل النوع بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteVariant = async (product, variant) => {
    const confirmed = window.confirm(
      `هل تريد حذف النوع "${variant.size} / ${variant.color} / ${variant.type}"؟`,
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteVariant(product.id, variant.id)
      setSelectedCategory(product.category || uncategorizedLabel)
      setSelectedModelId(product.id)
      setSuccess('تم حذف النوع بنجاح.')
      await loadProducts({ search })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openVariantModal = (product) => {
    setSelectedProduct(product)
    setVariantForm(emptyVariant)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setEditProductForm({
      modelNumber: product.modelNumber || '',
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
    })
  }

  const openEditVariantModal = (product, variant) => {
    setEditingVariantProduct(product)
    setEditingVariant(variant)
    setEditVariantForm({
      size: variant.size || '',
      color: variant.color || '',
      type: variant.type || '',
      purchasePrice: variant.purchasePrice ?? '',
      sellingPrice: variant.sellingPrice ?? '',
      minStockAlert: variant.minStockAlert ?? 5,
    })
  }

  const closeEditVariantModal = () => {
    setEditingVariant(null)
    setEditingVariantProduct(null)
    setEditVariantForm(emptyVariant)
  }

  const toggleCategory = (categoryName) => {
    setSelectedCategory((current) => (current === categoryName ? '' : categoryName))
    setSelectedModelId(null)
  }

  const toggleModel = (productId) => {
    setSelectedModelId((current) => (current === productId ? null : productId))
  }

  const handleClickableKeyDown = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }

  const renderVariantForm = (form, onChange, prefix) => (
    <CRow className="g-3">
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}Size`}>المقاس</CFormLabel>
        <CFormInput
          id={`${prefix}Size`}
          name="size"
          value={form.size}
          onChange={onChange}
          required
        />
      </CCol>
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}Color`}>اللون</CFormLabel>
        <CFormInput
          id={`${prefix}Color`}
          name="color"
          value={form.color}
          onChange={onChange}
          required
        />
      </CCol>
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}Type`}>النوع</CFormLabel>
        <CFormInput
          id={`${prefix}Type`}
          name="type"
          value={form.type}
          onChange={onChange}
          required
        />
      </CCol>
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}PurchasePrice`}>سعر الشراء</CFormLabel>
        <CFormInput
          id={`${prefix}PurchasePrice`}
          name="purchasePrice"
          type="number"
          min="0"
          step="0.01"
          value={form.purchasePrice}
          onChange={onChange}
          required
        />
      </CCol>
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}SellingPrice`}>سعر البيع</CFormLabel>
        <CFormInput
          id={`${prefix}SellingPrice`}
          name="sellingPrice"
          type="number"
          min="0"
          step="0.01"
          value={form.sellingPrice}
          onChange={onChange}
          required
        />
      </CCol>
      <CCol md={4}>
        <CFormLabel htmlFor={`${prefix}MinStockAlert`}>حد التنبيه</CFormLabel>
        <CFormInput
          id={`${prefix}MinStockAlert`}
          name="minStockAlert"
          type="number"
          min="0"
          value={form.minStockAlert}
          onChange={onChange}
        />
      </CCol>
    </CRow>
  )

  if (loading && products.length === 0) {
    return <LoadingCard label="جاري تحميل المنتجات..." />
  }

  return (
    <>
      <PageHeader
        title="المنتجات"
        subtitle="افتح التصنيف ثم الموديل لعرض الأنواع تحته مباشرة في ترتيب رأسي واضح."
      />

      <ApiAlert
        error={error}
        success={success}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">المنتجات</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.products)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">الأنواع</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.variants)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">القطع في المخزون</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.stock)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قيمة البيع</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.value)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="إضافة منتج">
        <CForm onSubmit={createProduct}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel htmlFor="modelNumber">رقم الموديل</CFormLabel>
              <CFormInput
                id="modelNumber"
                name="modelNumber"
                value={productForm.modelNumber}
                onChange={handleProductChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="name">اسم المنتج</CFormLabel>
              <CFormInput
                id="name"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="category">التصنيف</CFormLabel>
              <CFormInput
                id="category"
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
                required
              />
            </CCol>
            <CCol md={3} className="d-flex align-items-end">
              <SubmitButton
                color="primary"
                type="submit"
                saving={saving}
                className="d-inline-flex align-items-center gap-2"
              >
                <CIcon icon={cilPlus} />
                إضافة المنتج
              </SubmitButton>
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="description">الوصف</CFormLabel>
              <CFormTextarea
                id="description"
                name="description"
                rows={2}
                value={productForm.description}
                onChange={handleProductChange}
              />
            </CCol>
          </CRow>
        </CForm>
      </SectionCard>

      <SectionCard
        title="المخزون حسب التصنيف"
        className="mb-4 shop-responsive-card"
        actions={
          <CForm className="shop-search-form" onSubmit={handleSearch}>
            <CFormInput
              size="sm"
              placeholder="ابحث بالموديل أو الاسم"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              type="submit"
              className="d-inline-flex align-items-center gap-2"
            >
              <CIcon icon={cilSearch} />
              بحث
            </CButton>
          </CForm>
        }
      >
        {products.length === 0 ? (
          <EmptyState
            title="لا توجد منتجات"
            text="أضف منتجا جديدا أو أدخل المخزون من فاتورة شراء."
          />
        ) : (
          <div className="shop-product-tree">
            <div className="shop-drilldown-heading">
              <span>التصنيفات</span>
              <CBadge color="secondary">{formatNumber(categories.length)}</CBadge>
            </div>

            {categories.map((category) => {
              const categoryOpen = selectedCategory === category.name

              return (
                <div className="shop-tree-node" key={category.name}>
                  <div
                    className={`shop-drilldown-row shop-category-row ${
                      categoryOpen ? 'is-active' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleCategory(category.name)}
                    onKeyDown={(event) =>
                      handleClickableKeyDown(event, () => toggleCategory(category.name))
                    }
                  >
                    <div className="shop-row-main">
                      <div>
                        <div className="fs-5 fw-semibold">{category.name}</div>
                        <div className="small text-body-secondary mt-1">
                          {formatNumber(category.products.length)} موديل،{' '}
                          {formatNumber(category.variants)} نوع
                        </div>
                      </div>
                      <div className="shop-row-status">
                        {category.lowStock > 0 ? (
                          <CBadge color="warning">{formatNumber(category.lowStock)} ناقص</CBadge>
                        ) : (
                          <CBadge color="success">مستقر</CBadge>
                        )}
                        <CIcon icon={categoryOpen ? cilChevronTop : cilChevronBottom} />
                      </div>
                    </div>
                    <div className="shop-row-metrics">
                      <span>{formatNumber(category.stock)} قطعة</span>
                      <span>{formatMoney(category.value)}</span>
                    </div>
                  </div>

                  {categoryOpen ? (
                    <div className="shop-tree-children">
                      {category.products.map((product) => {
                        const stats = getProductStats(product)
                        const modelOpen = selectedModelId === product.id

                        return (
                          <div className="shop-tree-node" key={product.id}>
                            <div
                              className={`shop-drilldown-row shop-model-row ${
                                modelOpen ? 'is-active' : ''
                              }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleModel(product.id)}
                              onKeyDown={(event) =>
                                handleClickableKeyDown(event, () => toggleModel(product.id))
                              }
                            >
                              <div className="shop-row-main">
                                <div>
                                  <div className="fw-semibold">{product.name}</div>
                                  <div className="small text-body-secondary mt-1">
                                    موديل {product.modelNumber}
                                  </div>
                                  {product.description ? (
                                    <div className="small text-body-secondary mt-1">
                                      {product.description}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="shop-row-status">
                                  {stats.lowStock > 0 ? (
                                    <CBadge color="warning">
                                      {formatNumber(stats.lowStock)} تنبيه
                                    </CBadge>
                                  ) : (
                                    <CBadge color="success">جيد</CBadge>
                                  )}
                                  <CIcon icon={modelOpen ? cilChevronTop : cilChevronBottom} />
                                </div>
                              </div>
                              <div className="shop-row-metrics">
                                <span>{formatNumber(stats.variants)} نوع</span>
                                <span>{formatNumber(stats.stock)} قطعة</span>
                                <span>{formatMoney(stats.value)}</span>
                              </div>
                              <div className="shop-row-actions">
                                <CButton
                                  size="sm"
                                  color="primary"
                                  variant="outline"
                                  className="d-inline-flex align-items-center gap-2"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    openVariantModal(product)
                                  }}
                                >
                                  <CIcon icon={cilPlus} />
                                  إضافة نوع
                                </CButton>
                                <CButton
                                  size="sm"
                                  color="info"
                                  variant="outline"
                                  className="d-inline-flex align-items-center gap-2"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    openEditModal(product)
                                  }}
                                >
                                  <CIcon icon={cilPencil} />
                                  تعديل
                                </CButton>
                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="outline"
                                  className="d-inline-flex align-items-center gap-2"
                                  disabled={saving}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    deleteProduct(product)
                                  }}
                                >
                                  <CIcon icon={cilTrash} />
                                  حذف
                                </CButton>
                              </div>
                            </div>

                            {modelOpen ? (
                              <div className="shop-tree-children shop-variant-children">
                                {product.variants?.length ? (
                                  product.variants.map((variant, index) => {
                                    const lowStock =
                                      Number(variant.stockQuantity || 0) <=
                                      Number(variant.minStockAlert || 0)

                                    return (
                                      <div
                                        key={variant.id}
                                        className={`shop-variant-row ${
                                          lowStock ? 'is-low-stock' : ''
                                        }`}
                                      >
                                        <div className="shop-row-main">
                                          <div>
                                            <div className="fw-semibold">
                                              نوع {formatNumber(index + 1)}
                                            </div>
                                            <div className="small text-body-secondary mt-1">
                                              {variant.size} / {variant.color} / {variant.type}
                                            </div>
                                          </div>
                                          <CBadge color={lowStock ? 'warning' : 'success'}>
                                            {formatNumber(variant.stockQuantity)} قطعة
                                          </CBadge>
                                        </div>
                                        <div className="shop-row-metrics">
                                          <span>شراء {formatMoney(variant.purchasePrice)}</span>
                                          <span>بيع {formatMoney(variant.sellingPrice)}</span>
                                          <span>تنبيه {formatNumber(variant.minStockAlert)}</span>
                                        </div>
                                        <div className="shop-row-actions">
                                          <CButton
                                            size="sm"
                                            color="info"
                                            variant="outline"
                                            className="d-inline-flex align-items-center gap-2"
                                            onClick={() => openEditVariantModal(product, variant)}
                                          >
                                            <CIcon icon={cilPencil} />
                                            تعديل
                                          </CButton>
                                          <CButton
                                            size="sm"
                                            color="danger"
                                            variant="outline"
                                            className="d-inline-flex align-items-center gap-2"
                                            disabled={saving}
                                            onClick={() => deleteVariant(product, variant)}
                                          >
                                            <CIcon icon={cilTrash} />
                                            حذف
                                          </CButton>
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <EmptyState
                                    title="لا توجد أنواع"
                                    text="أضف نوعا لهذا الموديل من زر إضافة نوع."
                                  />
                                )}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      <CModal visible={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)}>
        <CForm onSubmit={createVariant}>
          <CModalHeader>
            <CModalTitle>إضافة نوع</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3 text-body-secondary">
              {selectedProduct?.modelNumber} - {selectedProduct?.name}
            </div>
            {renderVariantForm(variantForm, handleVariantChange, 'variant')}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setSelectedProduct(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ النوع
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal visible={Boolean(editingProduct)} onClose={() => setEditingProduct(null)}>
        <CForm onSubmit={updateProduct}>
          <CModalHeader>
            <CModalTitle>تعديل المنتج</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="editModelNumber">رقم الموديل</CFormLabel>
                <CFormInput
                  id="editModelNumber"
                  name="modelNumber"
                  value={editProductForm.modelNumber}
                  onChange={handleEditProductChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editName">اسم المنتج</CFormLabel>
                <CFormInput
                  id="editName"
                  name="name"
                  value={editProductForm.name}
                  onChange={handleEditProductChange}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="editCategory">التصنيف</CFormLabel>
                <CFormInput
                  id="editCategory"
                  name="category"
                  value={editProductForm.category}
                  onChange={handleEditProductChange}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="editDescription">الوصف</CFormLabel>
                <CFormTextarea
                  id="editDescription"
                  name="description"
                  rows={3}
                  value={editProductForm.description}
                  onChange={handleEditProductChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingProduct(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ التعديل
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal visible={Boolean(editingVariant)} onClose={closeEditVariantModal}>
        <CForm onSubmit={updateVariant}>
          <CModalHeader>
            <CModalTitle>تعديل النوع</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3 text-body-secondary">
              {editingVariantProduct?.modelNumber} - {editingVariantProduct?.name}
            </div>
            {renderVariantForm(editVariantForm, handleEditVariantChange, 'editVariant')}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={closeEditVariantModal}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ التعديل
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Products
