const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Hiển thị form đăng ký
router.get('/dang-ky', (req, res) => {
  res.render('dangKy');
});

// Xử lý đăng ký
router.post('/dang-ky', (req, res) => {
  const { username, email, password } = req.body;

  const usersFile = path.join(__dirname, '../data/users.json');
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }

  users.push({ username, email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  console.log('Tài khoản mới:', { username, email });
  res.redirect('/dang-nhap'); // chuyển sang đăng nhập sau
});

module.exports = router;
