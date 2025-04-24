#!/bin/bash

# Kiểm tra tham số dòng lệnh
CHECK_ONLY=false
if [ "$1" == "--check" ]; then
  CHECK_ONLY=true
  echo "Chế độ kiểm tra: Chỉ hiển thị các file dư thừa mà không xóa"
fi

# Hàm để xóa hoặc đếm file
cleanup() {
  local pattern=$1
  local exclude=$2
  local dir=$3
  local count=0
  local files=""
  
  if [ -n "$exclude" ]; then
    files=$(find "$dir" -name "$pattern" -not -path "*/node_modules/*" | grep -v "$exclude" || true)
  else
    files=$(find "$dir" -name "$pattern" -not -path "*/node_modules/*" || true)
  fi
  
  if [ -n "$files" ]; then
    count=$(echo "$files" | wc -l)
    if [ "$CHECK_ONLY" = true ]; then
      echo "Tìm thấy $count file $pattern trong $dir:"
      echo "$files"
    else
      echo "Đang xóa $count file $pattern trong $dir..."
      echo "$files" | xargs rm -f
    fi
  else
    count=0
  fi
  
  echo "$count"
}

total_count=0

# ===== FRONTEND =====
echo "===== FRONTEND ====="
count=$(cleanup "*.js" "nuxt.config.js" "apps/frontend/src")
total_count=$((total_count + count))

count=$(cleanup "*.js.map" "" "apps/frontend/src")
total_count=$((total_count + count))

count=$(cleanup "*.vue.js" "" "apps/frontend/src")
total_count=$((total_count + count))

count=$(cleanup "*.vue.js.map" "" "apps/frontend/src")
total_count=$((total_count + count))

# ===== BACKEND =====
echo "===== BACKEND ====="
count=$(cleanup "*.js" "" "apps/backend/src")
total_count=$((total_count + count))

count=$(cleanup "*.js.map" "" "apps/backend/src")
total_count=$((total_count + count))

# ===== LIBS =====
echo "===== LIBS ====="
count=$(cleanup "*.js" "" "libs")
total_count=$((total_count + count))

count=$(cleanup "*.js.map" "" "libs")
total_count=$((total_count + count))

# ===== KẾT QUẢ =====
if [ "$CHECK_ONLY" = true ]; then
  echo "===== KẾT QUẢ ====="
  echo "Tìm thấy tổng cộng $total_count file dư thừa"
  echo "Chạy lại script không có tham số --check để xóa các file này"
else
  echo "===== KẾT QUẢ ====="
  echo "Đã xóa tổng cộng $total_count file dư thừa"
fi 