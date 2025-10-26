


















































































































































































const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// ---------------- Middleware ----------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// ---------------- View Engine ----------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------- Upload ----------------
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ---------------- Database Render ----------------
const pool = new Pool({
  user: 'marketplace_db_fphj_user',
  host: 'dpg-d3uumrbe5dus739vgasg-a.oregon-postgres.render.com',
  database: 'marketplace_db_fphj',
  password: 'h0CUAyDup71qOeiQBNt5H8lUyY1ZqkEr',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Test query trực tiếp
pool.query('SELECT * FROM products')
  .then(res => console.log('✅ Products from database:', res.rows))
  .catch(err => console.error('❌ Query error:', err));

// ---------------- Routes ----------------
// Trang chủ
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.render('index', { products: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Lỗi khi truy xuất sản phẩm');
  }
});

// Đăng ký
app.get('/dang-ky', (req, res) => res.render('dangKy'));
app.post('/dang-ky', (req, res) => {
  const { username, email, password } = req.body;
  const usersFile = path.join(__dirname, 'data/users.json');
  let users = [];
  if (fs.existsSync(usersFile)) users = JSON.parse(fs.readFileSync(usersFile));
  users.push({ username, email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log('Tài khoản mới:', { username, email });
  res.redirect('/dang-nhap');
});

// Đăng sản phẩm
app.get('/dang-san-pham', (req, res) => res.render('dangSanPham'));
app.post('/dang-san-pham', upload.single('anh'), (req, res) => {
  const { ten, moTa, gia } = req.body;
  const anh = req.file ? '/uploads/' + req.file.filename : null;
  const productsFile = path.join(__dirname, 'data/products.json');
  let products = [];
  if (fs.existsSync(productsFile)) products = JSON.parse(fs.readFileSync(productsFile));
  products.push({ ten, moTa, gia, anh });
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  console.log('Sản phẩm mới:', { ten, moTa, gia, anh });
  res.redirect('/dang-san-pham');
});

// Các trang khác
app.get('/nap-tien', (req, res) => res.render('nap-tien'));
app.get('/cai-dat', (req, res) => res.render('cai-dat'));
app.get('/tai-khoan', (req, res) => res.render('tai-khoan'));

// ---------------- Start server ----------------
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));





































































































































































































































































































































































































































