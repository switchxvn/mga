/**
 * Script để sửa các import từ 'vue' trong các file Vue
 * Chạy script này bằng lệnh: node src/scripts/fix-imports.js
 */

const fs = require('fs');
const path = require('path');

// Các thư mục cần quét
const directories = [
  path.resolve(__dirname, '../pages'),
  path.resolve(__dirname, '../components'),
  path.resolve(__dirname, '../layouts'),
  path.resolve(__dirname, '../composables')
];

// Regex để tìm các import từ 'vue'
const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]vue['"]/g;

// Hàm để quét các file trong thư mục
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.vue') || file.endsWith('.ts')) {
      fixImports(filePath);
    }
  });
}

// Hàm để sửa các import trong file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Kiểm tra xem file có import từ 'vue' không
  if (importRegex.test(content)) {
    console.log(`Fixing imports in ${filePath}`);
    
    // Xóa các import từ 'vue'
    content = content.replace(importRegex, '// Auto-imported by Nuxt 3');
    
    // Ghi lại nội dung file
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Bắt đầu quét các thư mục
directories.forEach(directory => {
  if (fs.existsSync(directory)) {
    console.log(`Scanning directory: ${directory}`);
    scanDirectory(directory);
  } else {
    console.log(`Directory not found: ${directory}`);
  }
});

console.log('Done!'); 