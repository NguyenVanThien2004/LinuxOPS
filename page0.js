import { firebaseConfig } from './config.js';
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

const signupForm = document.querySelector('.registration.form');
const loginForm = document.querySelector('.login.form');
const forgotForm = document.querySelector('.forgot.form');
const container = document.querySelector('.container');
const signupBtn = document.querySelector('.signupbtn');

// Xử lý chuyển form (giữ nguyên)
const anchors = document.querySelectorAll('a');
anchors.forEach(anchor => {
  anchor.addEventListener('click', () => {
    const id = anchor.id;
    switch(id){
      case 'loginLabel':
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        forgotForm.style.display = 'none';
        break;
      case 'signupLabel':
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        forgotForm.style.display = 'none';
        break;
      case 'forgotLabel':
        signupForm.style.display = 'none';
        loginForm.style.display = 'none';
        forgotForm.style.display = 'block';
        break;
    }
  });
});

// ĐĂNG KÝ - BỎ QUA XÁC NHẬN EMAIL
signupBtn.addEventListener('click', () => {
  const name = document.querySelector('#name').value;
  const username = document.querySelector('#username').value;
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;

      // Lưu thông tin user vào Firestore
      firestore.collection('users').doc(uid).set({
        name: name,
        username: username,
        email: email,
        emailVerified: true  // Tùy chọn: đánh dấu là đã verified (nếu bạn vẫn muốn theo dõi)
      });

      alert('Đăng ký thành công! Đang chuyển sang trang chính...');

      // Chuyển thẳng sang trang chính mà không cần verify email
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
      // Hoặc chuyển hướng luôn:
      // location.href = "signout.html";
    })
    .catch((error) => {
      alert('Lỗi đăng ký: ' + error.message);
    });
});

// ĐĂNG NHẬP - CHO PHÉP ĐĂNG NHẬP NGAY DÙ CHƯA VERIFY
const loginBtn = document.querySelector('.loginbtn');
loginBtn.addEventListener('click', () => {
  const email = document.querySelector('#inUsr').value.trim();
  const password = document.querySelector('#inPass').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // BỎ QUA KIỂM TRA emailVerified → cho đăng nhập luôn
      alert('Đăng nhập thành công!');
      location.href = "signout.html";  // Chuyển đến trang chính
    })
    .catch((error) => {
      alert('Lỗi đăng nhập: ' + error.message);
    });
});

// QUÊN MẬT KHẨU (giữ nguyên - vẫn hoạt động tốt)
const forgotBtn = document.querySelector('.forgotbtn');
forgotBtn.addEventListener('click', () => {
  const emailForReset = document.querySelector('#forgotinp').value.trim();
  if (emailForReset.length > 0) {
    auth.sendPasswordResetEmail(emailForReset)
      .then(() => {
        alert('Đã gửi link đặt lại mật khẩu đến email của bạn!');
        loginForm.style.display = 'block';
        forgotForm.style.display = 'none';
      })
      .catch((error) => {
        alert('Lỗi: ' + error.message);
      });
  } else {
    alert('Vui lòng nhập email!');
  }
});