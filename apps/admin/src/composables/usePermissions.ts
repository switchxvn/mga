import { computed } from 'vue';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  // Kiểm tra xem người dùng có phải là SUPER_ADMIN không
  const isSuperAdmin = computed(() => {
    // Trước tiên kiểm tra kiểu role đơn (được đặt trong checkAuth)
    const isSAFromRole = user.value?.role === 'SUPER_ADMIN';
    
    // Tiếp theo kiểm tra từ mảng roles (nếu có)
    let isSAFromRoles = false;
    
    if (user.value?.roles) {
      // Kiểm tra kiểu dữ liệu của roles
      if (Array.isArray(user.value.roles)) {
        if (user.value.roles.length > 0) {
          // Sử dụng "in" operator để kiểm tra thuộc tính an toàn
          isSAFromRoles = user.value.roles.some(role => 
            (typeof role === 'string' && role === 'SUPER_ADMIN') || 
            (typeof role === 'object' && role !== null && 'code' in role && role.code === 'SUPER_ADMIN')
          );
        }
      }
    }
    
    // Kiểm tra từ mảng permissions
    const isSAFromPermissions = user.value?.permissions?.includes('SUPER_ADMIN') || false;
    
    const result = isSAFromRole || isSAFromRoles || isSAFromPermissions;
    
    console.log('SUPER_ADMIN check results:', {
      fromRole: isSAFromRole,
      fromRoles: isSAFromRoles,
      fromPermissions: isSAFromPermissions,
      finalResult: result,
      userRole: user.value?.role,
      userRoles: user.value?.roles,
      userPermissions: user.value?.permissions
    });
    
    return result;
  });

  /**
   * Kiểm tra xem người dùng có quyền cụ thể hoặc là SUPER_ADMIN không
   * @param permission Mã quyền cần kiểm tra
   * @returns Boolean cho biết người dùng có quyền hay không
   */
  const hasPermission = (permission: string) => {
    // Kiểm tra xem người dùng có thông tin không
    if (!user.value) {
      console.log('No user information available, denying permission:', permission);
      return false;
    }
    
    // Kiểm tra SUPER_ADMIN trước
    if (isSuperAdmin.value) {
      console.log('SUPER_ADMIN has all permissions, including:', permission);
      return true;
    }
    
    // Log để debug
    console.log('Checking permission:', permission, {
      userPermissions: user.value?.permissions || [],
      userRole: user.value?.role
    });
    
    // Kiểm tra quyền cụ thể
    const hasPermission = user.value?.permissions?.includes(permission) || false;
    console.log(`Permission check result for ${permission}: ${hasPermission}`);
    return hasPermission;
  };

  /**
   * Kiểm tra xem người dùng có ít nhất một trong các quyền hoặc là SUPER_ADMIN không
   * @param permissions Mảng các mã quyền cần kiểm tra
   * @returns Boolean cho biết người dùng có ít nhất một quyền hay không
   */
  const hasAnyPermission = (permissions: string[]) => {
    // Kiểm tra xem người dùng có thông tin không
    if (!user.value) {
      console.log('No user information available, denying permissions:', permissions);
      return false;
    }
    
    // Kiểm tra SUPER_ADMIN trước
    if (isSuperAdmin.value) {
      console.log('SUPER_ADMIN has all permissions, including any of:', permissions);
      return true;
    }
    
    // Nếu không có quyền nào được yêu cầu, cho phép truy cập
    if (!permissions.length) {
      return true;
    }
    
    // Log để debug
    console.log('Checking any permissions:', permissions, {
      userPermissions: user.value?.permissions || [],
      userRole: user.value?.role
    });
    
    // Kiểm tra xem có ít nhất một quyền trùng khớp không
    const result = permissions.some(permission => 
      user.value?.permissions?.includes(permission)
    );
    console.log(`Any permissions check result: ${result}`);
    return result;
  };

  /**
   * Kiểm tra xem người dùng có tất cả các quyền hoặc là SUPER_ADMIN không
   * @param permissions Mảng các mã quyền cần kiểm tra
   * @returns Boolean cho biết người dùng có tất cả các quyền hay không
   */
  const hasAllPermissions = (permissions: string[]) => {
    // Kiểm tra xem người dùng có thông tin không
    if (!user.value) {
      console.log('No user information available, denying permissions:', permissions);
      return false;
    }
    
    // Kiểm tra SUPER_ADMIN trước
    if (isSuperAdmin.value) {
      console.log('SUPER_ADMIN has all permissions, including all of:', permissions);
      return true;
    }
    
    // Nếu không có quyền nào được yêu cầu, cho phép truy cập
    if (!permissions.length) {
      return true;
    }
    
    // Log để debug
    console.log('Checking all permissions:', permissions, {
      userPermissions: user.value?.permissions || [],
      userRole: user.value?.role
    });
    
    // Kiểm tra xem tất cả các quyền có trùng khớp không
    const result = permissions.every(permission => 
      user.value?.permissions?.includes(permission)
    );
    console.log(`All permissions check result: ${result}`);
    return result;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin
  };
}; 