





























































































































































































// server.js
const express = require('express');
const { Pool } = require('pg'); 
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// -------------------- Middleware --------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// -------------------- View Engine --------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- Upload Ảnh --------------------
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// -------------------- PostgreSQL Render --------------------
const pool = new Pool({
  user: 'marketplace_db_fphj_user',
  host: 'dpg-d3uumrbe5dus739vgasg-a.oregon-postgres.render.com',
  database: 'marketplace_db_fphj',
  password: 'h0CUAyDup71qOeiQBNt5H8lUyY1ZqkEr',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.query('SELECT * FROM public.products')
  .then(res => console.log('✅ Products from database:', res.rows))
  .catch(err => console.error('❌ Query error products:', err));

pool.query('SELECT * FROM public.users')
  .then(res => console.log('✅ Users from database:', res.rows))
  .catch(err => console.error('❌ Query error users:', err));

// -------------------- Routes --------------------

// Trang chủ
app.get('/', async (req, res) => {
  try {
    const resultProducts = await pool.query('SELECT * FROM public.products');
    res.render('index', { products: resultProducts.rows });
  } catch (err) {
    console.error('❌ Lỗi khi truy xuất sản phẩm:', err);
    res.send('Lỗi khi truy xuất sản phẩm');
  }
});

// Nạp tiền
app.get('/nap-tien', (req, res) => res.render('nap-tien'));

// Cài đặt
app.get('/cai-dat', (req, res) => res.render('cai-dat'));

// Tài khoản
app.get('/tai-khoan', (req, res) => res.render('tai-khoan'));

// -------------------- Đăng ký --------------------
app.get('/dang-ky', (req, res) => res.render('dangKy'));

app.post('/dang-ky', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, password]
    );
    console.log('Tài khoản mới:', { username, email });
    res.redirect('/dang-nhap');
  } catch (err) {
    console.error('❌ Lỗi khi thêm user:', err);
    res.send('Lỗi khi đăng ký tài khoản');
  }
});

// -------------------- Đăng nhập --------------------
app.get('/dang-nhap', (req, res) => res.render('dangNhap'));

app.post('/dang-nhap', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM public.users WHERE username=$1 AND password=$2',
      [username, password]
    );
    if (result.rows.length > 0) {
      req.session.user = result.rows[0];
      res.send(`<h2>Xin chào ${username}! Bạn đã đăng nhập thành công 🎉</h2><a href="/">⬅️ Trang chủ</a>`);
    } else {
      res.send('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  } catch (err) {
    console.error('❌ Lỗi khi đăng nhập:', err);
    res.send('Lỗi khi đăng nhập');
  }
});

// -------------------- Đăng sản phẩm --------------------
app.get('/dang-san-pham', (req, res) => res.render('dangSanPham'));

app.post('/dang-san-pham', upload.single('anh'), async (req, res) => {
  const { ten, moTa, gia } = req.body;
  const anh = req.file ? '/uploads/' + req.file.filename : null;

  try {
    await pool.query(
      'INSERT INTO public.products (ten, mota, gia, anh) VALUES ($1, $2, $3, $4)',
      [ten, moTa, gia, anh]
    );
    console.log('Sản phẩm mới:', { ten, moTa, gia, anh });
    res.redirect('/dang-san-pham');
  } catch (err) {
    console.error('❌ Lỗi khi thêm sản phẩm:', err);
    res.send('Lỗi khi đăng sản phẩm');
  }
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});



















































































































































































































































































































































































































































































































