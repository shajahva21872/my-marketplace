























































































































































































































// server.js
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = 3000;

// -------------------- View Engine --------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- Middleware --------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// -------------------- Upload Ảnh --------------------
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// -------------------- Kết nối PostgreSQL --------------------
const pool = new Pool({
  user: 'truong',
  host: 'localhost',
  database: 'marketplace',
  password: '123456',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ Connection error', err));

// -------------------- Route Đăng ký --------------------
app.get('/dang-ky', (req, res) => res.render('dangKy'));

app.post('/dang-ky', (req, res) => {
  const { username, email, password } = req.body;

  const usersFile = path.join(__dirname, 'data/users.json');
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }
  users.push({ username, email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  console.log('Tài khoản mới:', { username, email });
  res.redirect('/dang-nhap'); // tạo route đăng nhập sau này
});

// -------------------- Route Đăng sản phẩm --------------------
app.get('/dang-san-pham', (req, res) => res.render('dangSanPham'));

app.post('/dang-san-pham', upload.single('anh'), (req, res) => {
  const { ten, moTa, gia } = req.body;
  const anh = req.file ? '/uploads/' + req.file.filename : null;

  const productsFile = path.join(__dirname, 'data/products.json');
  let products = [];
  if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile));
  }
  products.push({ ten, moTa, gia, anh });
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

  console.log('Sản phẩm mới:', { ten, moTa, gia, anh });
  res.redirect('/dang-san-pham');
});

// -------------------- Trang chủ hiển thị sản phẩm --------------------
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.render('index', { products: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error retrieving products');
  }
});

// -------------------- Các trang khác --------------------
app.get('/nap-tien', (req, res) => res.render('nap-tien'));
app.get('/cai-dat', (req, res) => res.render('cai-dat'));
app.get('/tai-khoan', (req, res) => {
  // Demo user
  const usersFile = path.join(__dirname, 'data/users.json');
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }
  const user = users[0] || null;
  res.render('tai-khoan', { user });
});

// -------------------- Đăng nhập (demo) --------------------
app.post('/dang-nhap', (req, res) => {
  const { username, password } = req.body;
  res.send(`<h2>Xin chào ${username}! Bạn đã đăng nhập thành công 🎉</h2><a href="/">⬅️ Trang chủ</a>`);
});

// -------------------- Start server --------------------
app.listen(port, () => {
  console.log(`🚀 Server cute chạy tại http://localhost:${port}`);
});































































































































































































