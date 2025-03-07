const fs = require('fs');
const path = require('path');

// Hàm tìm file theo pattern
function findFiles(dir, pattern, excludePattern = null) {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`Thư mục ${dir} không tồn tại`);
    return results;
  }
  
  function traverseDir(currentPath) {
    try {
      const files = fs.readdirSync(currentPath);
      
      for (const file of files) {
        const fullPath = path.join(currentPath, file);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Bỏ qua thư mục node_modules
            if (file !== 'node_modules') {
              traverseDir(fullPath);
            }
          } else if (stat.isFile()) {
            // Kiểm tra xem file có khớp với pattern không
            if (file.endsWith(pattern)) {
              // Kiểm tra xem file có bị loại trừ không
              if (!excludePattern || !file.includes(excludePattern)) {
                results.push(fullPath);
              }
            }
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý file ${fullPath}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi đọc thư mục ${currentPath}: ${error.message}`);
    }
  }
  
  traverseDir(dir);
  return results;
}

// Hàm xóa file
function deleteFiles(files) {
  let count = 0;
  for (const file of files) {
    try {
      fs.unlinkSync(file);
      console.log(`Đã xóa: ${file}`);
      count++;
    } catch (error) {
      console.error(`Không thể xóa file ${file}: ${error.message}`);
    }
  }
  return count;
}

// Xóa file trong frontend
console.log('===== FRONTEND =====');
let jsFiles = findFiles('apps/frontend/src', '.js', 'nuxt.config.js');
console.log(`Tìm thấy ${jsFiles.length} file .js trong apps/frontend/src`);
let count = deleteFiles(jsFiles);
console.log(`Đã xóa ${count} file .js trong apps/frontend/src`);

let jsMapFiles = findFiles('apps/frontend/src', '.js.map');
console.log(`Tìm thấy ${jsMapFiles.length} file .js.map trong apps/frontend/src`);
count = deleteFiles(jsMapFiles);
console.log(`Đã xóa ${count} file .js.map trong apps/frontend/src`);

// Xóa file trong backend
console.log('\n===== BACKEND =====');
jsFiles = findFiles('apps/backend/src', '.js');
console.log(`Tìm thấy ${jsFiles.length} file .js trong apps/backend/src`);
count = deleteFiles(jsFiles);
console.log(`Đã xóa ${count} file .js trong apps/backend/src`);

jsMapFiles = findFiles('apps/backend/src', '.js.map');
console.log(`Tìm thấy ${jsMapFiles.length} file .js.map trong apps/backend/src`);
count = deleteFiles(jsMapFiles);
console.log(`Đã xóa ${count} file .js.map trong apps/backend/src`);

// Xóa file trong libs
console.log('\n===== LIBS =====');
jsFiles = findFiles('libs', '.js');
console.log(`Tìm thấy ${jsFiles.length} file .js trong libs`);
count = deleteFiles(jsFiles);
console.log(`Đã xóa ${count} file .js trong libs`);

jsMapFiles = findFiles('libs', '.js.map');
console.log(`Tìm thấy ${jsMapFiles.length} file .js.map trong libs`);
count = deleteFiles(jsMapFiles);
console.log(`Đã xóa ${count} file .js.map trong libs`);

console.log('\n===== HOÀN THÀNH ====='); 