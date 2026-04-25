const prisma = require("../lib/prisma");

// ─── جلب كل المنتجات مع الفاريانتس ───
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { modelNumber: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// ─── جلب منتج واحد بتفاصيله ───
const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { variants: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة منتج جديد ───
const createProduct = async (req, res, next) => {
  try {
    const { modelNumber, name, category, description } = req.body;

    const product = await prisma.product.create({
      data: { modelNumber, name, category, description },
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل منتج ───
const updateProduct = async (req, res, next) => {
  try {
    const { modelNumber, name, category, description } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { modelNumber, name, category, description },
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    const [purchaseItemsCount, salesItemsCount] = await Promise.all([
      prisma.purchaseInvoiceItem.count({
        where: { variant: { productId } },
      }),
      prisma.salesInvoiceItem.count({
        where: { variant: { productId } },
      }),
    ]);

    if (purchaseItemsCount > 0 || salesItemsCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف المنتج لأنه مرتبط بفواتير شراء أو بيع. يمكنك تعديل بياناته بدل الحذف.",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    res.json({ success: true, data: { id: productId } });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة فاريانت لمنتج ───
const addVariant = async (req, res, next) => {
  try {
    const { size, color, type, purchasePrice, sellingPrice, minStockAlert } =
      req.body;
    const productId = parseInt(req.params.id);

    // تأكد إن المنتج موجود
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        size,
        color,
        type,
        purchasePrice,
        sellingPrice,
        minStockAlert: minStockAlert ?? 5,
      },
    });

    res.status(201).json({ success: true, data: variant });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل فاريانت ───
const updateVariant = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const variantId = parseInt(req.params.variantId);
    const { size, color, type, purchasePrice, sellingPrice, minStockAlert } =
      req.body;

    const existingVariant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "النوع غير موجود لهذا المنتج",
      });
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { size, color, type, purchasePrice, sellingPrice, minStockAlert },
    });

    res.json({ success: true, data: variant });
  } catch (err) {
    next(err);
  }
};

const deleteVariant = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const variantId = parseInt(req.params.variantId);

    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "النوع غير موجود لهذا المنتج",
      });
    }

    const [purchaseItemsCount, salesItemsCount] = await Promise.all([
      prisma.purchaseInvoiceItem.count({ where: { variantId } }),
      prisma.salesInvoiceItem.count({ where: { variantId } }),
    ]);

    if (purchaseItemsCount > 0 || salesItemsCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف النوع لأنه مرتبط بفواتير شراء أو بيع. يمكنك تعديل بياناته بدل الحذف.",
      });
    }

    await prisma.productVariant.delete({ where: { id: variantId } });

    res.json({ success: true, data: { id: variantId } });
  } catch (err) {
    next(err);
  }
};

// ─── منتجات تحت الحد الأدنى ───
const getLowStock = async (req, res, next) => {
  try {
    const lowStockVariants = await prisma.$queryRaw`
      SELECT pv.*, p.name, p.model_number, p.category
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.stock_quantity <= pv.min_stock_alert
    `;

    res.json({ success: true, data: lowStockVariants });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  getLowStock,
};
