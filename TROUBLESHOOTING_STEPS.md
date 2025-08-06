# Troubleshooting Login Issue

## Langkah-langkah untuk Debug Login User Baru

### 1. Buka Browser Developer Tools
- Tekan F12 atau klik kanan → Inspect
- Buka tab "Console"

### 2. Test dengan Debug Pages
Buka halaman-halaman debug berikut di browser:
- `/debug` - Untuk melihat data user di localStorage
- `/test-user` - Untuk test create user dan login

### 3. Manual Test di Console Browser
Paste script berikut di Console browser:

```javascript
// 1. Cek data yang ada
console.log('Users:', JSON.parse(localStorage.getItem('app_users') || '[]'));
console.log('Passwords:', JSON.parse(localStorage.getItem('user_passwords') || '{}'));

// 2. Buat user test manual
const testUser = {
  id: 'test123',
  username: 'admin1',
  name: 'Admin Test',
  role: 'admin',
  permissions: {
    subject: true,
    survey: { results: true, analytics: true },
    questions: { create: true, groups: true, categories: true, collection: true }
  },
  isActive: true,
  createdAt: new Date().toISOString()
};

// 3. Simpan user
const users = JSON.parse(localStorage.getItem('app_users') || '[]');
users.push(testUser);
localStorage.setItem('app_users', JSON.stringify(users));

// 4. Simpan password
const passwords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
passwords['test123'] = 'admin123';
localStorage.setItem('user_passwords', JSON.stringify(passwords));

console.log('User created manually!');

// 5. Test login logic
const testUsername = 'admin1';
const testPassword = 'admin123';

const savedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
const savedPasswords = JSON.parse(localStorage.getItem('user_passwords') || '{}');

const foundUser = savedUsers.find(u => 
  u.username.toLowerCase() === testUsername.toLowerCase() && u.isActive
);

console.log('Found user:', foundUser);
console.log('Password match:', foundUser ? savedPasswords[foundUser.id] === testPassword : false);
```

### 4. Cek Kemungkinan Masalah

#### A. Browser Cache/Storage
- Coba hard refresh (Ctrl+Shift+R)
- Atau clear localStorage dengan: `localStorage.clear()`

#### B. Development Server
- Restart development server
- Cek apakah ada error di terminal

#### C. Type Mismatch
- Pastikan role yang disimpan sesuai dengan yang dicek
- Cek apakah isActive = true

### 5. Test Login di Login Page
Setelah membuat user manual dengan script di atas:
1. Buka `/login`
2. Coba login dengan: `admin1` / `admin123`
3. Lihat console untuk debugging log

### 6. Kemungkinan Penyebab

1. **localStorage tidak tersimpan** - Browser blocking localStorage
2. **Case sensitivity** - Username case mismatch
3. **Role mismatch** - Type role tidak sesuai
4. **isActive false** - User tidak aktif
5. **Password tidak tersimpan** - Error saat save password
6. **Development environment** - Hot reload clearing data

Silakan coba langkah-langkah di atas dan beri tahu hasilnya!