export const formatMoney = (value) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

export const formatNumber = (value) => new Intl.NumberFormat('ar-EG').format(Number(value || 0))

export const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const getErrorMessage = (error) => error?.message || 'حدث خطأ غير متوقع'

export const flattenVariants = (products = []) =>
  products.flatMap((product) =>
    (product.variants || []).map((variant) => ({
      ...variant,
      product,
      label: `${product.modelNumber} - ${product.name} / ${variant.size} / ${variant.color} / ${variant.type}`,
    })),
  )
