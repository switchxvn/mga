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
  local files=()
  
  if [ -n "$exclude" ]; then
    mapfile -t files < <(find "$dir" -name "$pattern" -not -path "*/node_modules/*" | grep -v "$exclude")
  else
    mapfile -t files < <(find "$dir" -name "$pattern" -not -path "*/node_modules/*")
  fi
  
  local count=${#files[@]}
  
  if [ $count -gt 0 ]; then
    if [ "$CHECK_ONLY" = true ]; then
      echo "Tìm thấy $count file $pattern trong $dir:"
      printf '%s\n' "${files[@]}"
    else
      echo "Đang xóa $count file $pattern trong $dir..."
      printf '%s\n' "${files[@]}" | xargs rm -f
    fi
  fi
  
  echo $count
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