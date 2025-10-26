const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Tạo folder uploads nếu chưa có
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Hiển thị form đăng sản phẩm
router.get('/dang-san-pham', (req, res) => {
  res.render('dangSanPham');
});

// Xử lý đăng sản phẩm
router.post('/dang-san-pham', upload.single('anh'), (req, res) => {
  const { ten, moTa, gia } = req.body;
  const anh = req.file ? '/uploads/' + req.file.filename : null;

  const productsFile = path.join(__dirname, '../data/products.json');
  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }

  products.push({ ten, moTa, gia, anh });
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

  console.log('Sản phẩm mới:', { ten, moTa, gia, anh });
  res.redirect('/dang-san-pham');
});

module.exports = router;
