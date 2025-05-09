<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-900">
    <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"></div>
        <p class="text-sm text-slate-500 dark:text-neutral-400">Đang tải...</p>
      </div>
    </div>

    <div v-else-if="error" class="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="Chi tiết người dùng" 
        description="Quản lý thông tin và quyền hạn của người dùng"
      >
        <template #actions>
          <NuxtLink 
            to="/users" 
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-600"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Quay lại
          </NuxtLink>
        </template>
      </PageHeader>

      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
        <div class="text-center text-red-600 dark:text-red-400">
          <p>{{ error }}</p>
          <button
            @click="fetchUser"
            class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>

    <div v-else class="container mx-auto py-6 space-y-6">
      <!-- Header -->
      <PageHeader 
        :title="isEditing ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng'" 
        description="Quản lý thông tin và quyền hạn của người dùng"
      >
        <template #actions>
          <button
            v-if="!isEditing"
            @click="isEditing = true"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Pencil class="w-4 h-4 mr-2" />
            Chỉnh sửa
          </button>
          <NuxtLink 
            to="/users" 
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-600"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Quay lại
          </NuxtLink>
        </template>
      </PageHeader>

      <!-- Chế độ xem thông tin -->
      <div v-if="!isEditing" class="space-y-6">
        <!-- Tabs Navigation (Chế độ xem) -->
        <nav class="flex items-center space-x-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-1 w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
            :class="{
              'bg-primary-600 text-white': currentTab === tab.id,
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700': currentTab !== tab.id
            }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>

        <!-- Nội dung tab (Chế độ xem) -->
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <!-- Thông tin cơ bản -->
          <div v-show="currentTab === 'basic'">
            <div class="mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">
              <div class="flex items-center space-x-4">
                <div class="h-14 w-14 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-600 text-xl font-semibold">
                  {{ getUserInitials(user) }}
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    {{ getFullName(user) || user.username || user.email }}
                  </h2>
                  <p class="text-gray-600 dark:text-neutral-400">{{ user.email }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin tài khoản</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">ID</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ user.id }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Email</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ user.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Tên người dùng</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ user.username || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Trạng thái</p>
                  <p class="font-medium">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full', 
                        user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      ]"
                    >
                      {{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Email đã xác thực</p>
                  <p class="font-medium">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full', 
                        user.isEmailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      ]"
                    >
                      {{ user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Lần đăng nhập cuối</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Chưa đăng nhập' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Thông tin cá nhân -->
          <div v-show="currentTab === 'profile'">
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin cá nhân</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Họ</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">
                    {{ getUserProfile(user)?.lastName ? getUserProfile(user).lastName : 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Tên</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">
                    {{ getUserProfile(user)?.firstName ? getUserProfile(user).firstName : 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Họ và tên</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">
                    {{ 
                      (getUserProfile(user) && (getUserProfile(user).firstName || getUserProfile(user).lastName))
                        ? `${getUserProfile(user).lastName || ''} ${getUserProfile(user).firstName || ''}`.trim()
                        : 'N/A'
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Số điện thoại</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">
                    {{ 
                      (getUserProfile(user) && getUserProfile(user).phoneCode && getUserProfile(user).phoneNumber)
                        ? `(+${getUserProfile(user).phoneCode}) ${getUserProfile(user).phoneNumber}`
                        : (getUserProfile(user) && getUserProfile(user).phoneNumber ? getUserProfile(user).phoneNumber : 'N/A')
                    }}
                  </p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Giới thiệu</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">
                    {{ getUserProfile(user)?.bio ? getUserProfile(user).bio : 'N/A' }}
                  </p>
                </div>
                <div v-if="getUserProfile(user) && getUserProfile(user).address" class="col-span-2">
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Địa chỉ</p>
                  <div class="mt-1 text-gray-900 dark:text-neutral-200">
                    <p v-if="getUserProfile(user).address.street">{{ getUserProfile(user).address.street }}</p>
                    <p>
                      <span v-if="getUserProfile(user).address.city">{{ getUserProfile(user).address.city }}, </span>
                      <span v-if="getUserProfile(user).address.state">{{ getUserProfile(user).address.state }} </span>
                      <span v-if="getUserProfile(user).address.zipCode">{{ getUserProfile(user).address.zipCode }}</span>
                    </p>
                    <p v-if="getUserProfile(user).address.country">{{ getUserProfile(user).address.country }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Phân quyền -->
          <div v-show="currentTab === 'permissions'">
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Phân quyền</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Vai trò
                </label>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span 
                    v-for="role in user.roles" 
                    :key="role.id" 
                    class="px-3 py-1.5 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 flex items-center"
                  >
                    <UserCircle2 class="w-3.5 h-3.5 mr-1" />
                    {{ role.name }}
                  </span>
                  <span v-if="!user.roles || !user.roles.length" class="text-gray-500 dark:text-gray-400">
                    Không có vai trò
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cài đặt -->
          <div v-show="currentTab === 'settings'">
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin hệ thống</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Ngày tạo</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ formatDate(user.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">Cập nhật lần cuối</p>
                  <p class="font-medium text-gray-900 dark:text-neutral-200">{{ formatDate(user.updatedAt) }}</p>
                </div>
              </div>

              <div class="mt-6">
                <h4 class="font-medium text-gray-900 dark:text-white mb-4">Thao tác tài khoản</h4>
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="sendPasswordResetEmail"
                    class="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    :disabled="loading"
                  >
                    <Key class="w-4 h-4 mr-2" />
                    Gửi email đặt lại mật khẩu
                  </button>
                  
                  <button
                    v-if="user.isActive"
                    @click="updateUserStatus(false)"
                    class="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    :disabled="loading"
                  >
                    <Lock class="w-4 h-4 mr-2" />
                    Khóa tài khoản
                  </button>
                  
                  <button
                    v-else
                    @click="updateUserStatus(true)"
                    class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    :disabled="loading"
                  >
                    <Unlock class="w-4 h-4 mr-2" />
                    Kích hoạt tài khoản
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chế độ chỉnh sửa -->
      <div v-else class="space-y-6">
        <!-- Tabs Navigation (Chế độ chỉnh sửa) -->
        <nav class="flex items-center space-x-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-1 w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
            :class="{
              'bg-primary-600 text-white': currentTab === tab.id,
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700': currentTab !== tab.id
            }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>

        <!-- Tab Contents (Edit mode) -->
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <form @submit.prevent="updateUser">
            <!-- Thông tin cơ bản -->
            <div v-show="currentTab === 'basic'">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin cơ bản</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div class="col-span-1 md:col-span-2">
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Nhập email người dùng"
                    required
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.email }"
                  />
                  <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ validationErrors.email }}
                  </p>
                </div>

                <!-- Username -->
                <div class="col-span-1">
                  <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên người dùng
                  </label>
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    placeholder="Nhập tên người dùng dạng slug không dấu"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.username }"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Sử dụng các ký tự a-z, 0-9, gạch ngang (-), không dấu, không khoảng trắng (vd: john-doe)
                  </p>
                  <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ validationErrors.username }}
                  </p>
                </div>

                <!-- Password (optional for update) -->
                <div class="col-span-1">
                  <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu <span class="text-sm text-gray-500 dark:text-gray-400">(để trống nếu không thay đổi)</span>
                  </label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Nhập mật khẩu mới"
                      class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      :class="{ 'border-red-500 dark:border-red-500': validationErrors.password }"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 px-3 flex items-center"
                      @click="showPassword = !showPassword"
                    >
                      <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ validationErrors.password }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Thông tin cá nhân -->
            <div v-show="currentTab === 'profile'">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin cá nhân</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name -->
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    placeholder="Nhập tên"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  />
                </div>

                <!-- Last Name -->
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Họ
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    placeholder="Nhập họ"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  />
                </div>

                <!-- Phone Code & Phone Number -->
                <div>
                  <label for="phoneCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã quốc gia
                  </label>
                  <input
                    id="phoneCode"
                    v-model="form.phoneCode"
                    type="text"
                    placeholder="Ví dụ: 84"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  />
                </div>

                <div>
                  <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    id="phoneNumber"
                    v-model="form.phoneNumber"
                    type="text"
                    placeholder="Nhập số điện thoại"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  />
                </div>

                <!-- Bio -->
                <div class="col-span-1 md:col-span-2">
                  <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giới thiệu
                  </label>
                  <textarea
                    id="bio"
                    v-model="form.bio"
                    placeholder="Nhập giới thiệu"
                    rows="3"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  ></textarea>
                </div>

                <!-- Address -->
                <div class="col-span-1 md:col-span-2">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-4">Địa chỉ</h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Street -->
                    <div class="col-span-1 md:col-span-2">
                      <label for="street" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Địa chỉ đường
                      </label>
                      <input
                        id="street"
                        v-model="form.address.street"
                        type="text"
                        placeholder="Nhập địa chỉ đường"
                        class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      />
                    </div>
                    
                    <!-- City -->
                    <div>
                      <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Thành phố
                      </label>
                      <input
                        id="city"
                        v-model="form.address.city"
                        type="text"
                        placeholder="Nhập thành phố"
                        class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      />
                    </div>
                    
                    <!-- State -->
                    <div>
                      <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tỉnh/Thành
                      </label>
                      <input
                        id="state"
                        v-model="form.address.state"
                        type="text"
                        placeholder="Nhập tỉnh/thành"
                        class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      />
                    </div>
                    
                    <!-- Country -->
                    <div>
                      <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quốc gia
                      </label>
                      <input
                        id="country"
                        v-model="form.address.country"
                        type="text"
                        placeholder="Nhập quốc gia"
                        class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      />
                    </div>
                    
                    <!-- Zip Code -->
                    <div>
                      <label for="zipCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mã bưu điện
                      </label>
                      <input
                        id="zipCode"
                        v-model="form.address.zipCode"
                        type="text"
                        placeholder="Nhập mã bưu điện"
                        class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phân quyền -->
            <div v-show="currentTab === 'permissions'">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Phân quyền</h3>
              
              <!-- Roles -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Vai trò
                </label>
                <div class="mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div v-if="rolesLoading" class="text-gray-500 dark:text-gray-400 col-span-3">
                    <Loader2 class="w-4 h-4 mr-2 inline-block animate-spin" />
                    Đang tải vai trò...
                  </div>
                  <template v-else>
                    <div
                      v-for="role in roles"
                      :key="role.id"
                      class="inline-flex items-center p-2 border border-gray-200 dark:border-neutral-700 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700"
                    >
                      <input
                        :id="`role-${role.id}`"
                        type="checkbox"
                        :value="role.id"
                        v-model="form.roleIds"
                        class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                      />
                      <label :for="`role-${role.id}`" class="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer w-full">
                        {{ role.name }}
                      </label>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Cài đặt -->
            <div v-show="currentTab === 'settings'">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Cài đặt tài khoản</h3>
              
              <!-- Active status -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Trạng thái tài khoản
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg cursor-pointer" @click="form.isActive = true">
                    <input
                      type="radio"
                      id="status-active"
                      v-model="form.isActive"
                      :value="true"
                      class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                    />
                    <div class="ml-3">
                      <label for="status-active" class="font-medium text-gray-700 dark:text-gray-300">
                        Hoạt động
                      </label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Người dùng có thể đăng nhập và sử dụng hệ thống</p>
                    </div>
                  </div>
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg cursor-pointer" @click="form.isActive = false">
                    <input
                      type="radio"
                      id="status-inactive"
                      v-model="form.isActive"
                      :value="false"
                      class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                    />
                    <div class="ml-3">
                      <label for="status-inactive" class="font-medium text-gray-700 dark:text-gray-300">
                        Bị khóa
                      </label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Người dùng không thể đăng nhập vào hệ thống</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email verified status -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Trạng thái xác thực email
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg cursor-pointer" @click="form.isEmailVerified = true">
                    <input
                      type="radio"
                      id="email-verified"
                      v-model="form.isEmailVerified"
                      :value="true"
                      class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                    />
                    <div class="ml-3">
                      <label for="email-verified" class="font-medium text-gray-700 dark:text-gray-300">
                        Đã xác thực
                      </label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Email của người dùng đã được xác thực</p>
                    </div>
                  </div>
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg cursor-pointer" @click="form.isEmailVerified = false">
                    <input
                      type="radio"
                      id="email-not-verified"
                      v-model="form.isEmailVerified"
                      :value="false"
                      class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                    />
                    <div class="ml-3">
                      <label for="email-not-verified" class="font-medium text-gray-700 dark:text-gray-300">
                        Chưa xác thực
                      </label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Email của người dùng chưa được xác thực</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nút điều hướng và nút submit -->
            <div class="mt-8 border-t border-gray-200 dark:border-neutral-700 pt-6 flex justify-between">
              <div>
                <button
                  type="button"
                  v-if="getPreviousTab()"
                  @click="currentTab = getPreviousTab()"
                  class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
                >
                  <ChevronLeft class="w-4 h-4 mr-2" />
                  Quay lại
                </button>
              </div>
              
              <div class="flex space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
                  @click="cancelEdit"
                >
                  Hủy
                </button>
                
                <button
                  v-if="getNextTab()"
                  type="button"
                  @click="currentTab = getNextTab()"
                  class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Tiếp theo
                  <ChevronRight class="w-4 h-4 ml-2" />
                </button>
                
                <button
                  v-else
                  type="submit"
                  :disabled="isSubmitting"
                  class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
                  <span v-else>Cập nhật</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '~/composables/useTrpc'
import { useToast } from '~/composables/useToast'
import PageHeader from "../../components/common/header/PageHeader.vue"
import { User, IdCard, Lock, Settings, ChevronLeft, ChevronRight, ArrowLeft, Eye, EyeOff, Loader2, Pencil, Key, UserCircle2, Unlock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const trpc = useTrpc()
const toast = useToast()

const userId = computed(() => route.params.id)
const user = ref(null)
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const isSubmitting = ref(false)
const rolesLoading = ref(false)
const showPassword = ref(false)
const roles = ref([])

// Tab management
const tabs = [
  { id: 'basic', name: 'Thông tin cơ bản', icon: User },
  { id: 'profile', name: 'Thông tin cá nhân', icon: IdCard },
  { id: 'permissions', name: 'Phân quyền', icon: Lock },
  { id: 'settings', name: 'Cài đặt', icon: Settings }
]
const currentTab = ref('basic')

// Helper functions for tab navigation
const getPreviousTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.value)
  return currentIndex > 0 ? tabs[currentIndex - 1].id : null
}

const getNextTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.value)
  return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1].id : null
}

const form = reactive({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  isActive: true,
  isEmailVerified: false,
  roleIds: [],
  phoneCode: '',
  phoneNumber: '',
  bio: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  }
})

const validationErrors = reactive({
  email: '',
  username: '',
  password: ''
})

// Helper function to get user profile data (from either profile or __profile__)
const getUserProfile = (user) => {
  return user?.profile || user?.__profile__ || null
}

// Fetch user details
const fetchUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    const userData = await trpc.admin.users.getUserById.query(userId.value)
    
    // Normalize data to fix profile field
    user.value = normalizeUserData(userData)
    
    // Initialize form with user data
    form.email = user.value.email
    form.username = user.value.username || ''
    form.isActive = user.value.isActive
    form.isEmailVerified = user.value.isEmailVerified
    
    // Handle profile data
    const profile = getUserProfile(user.value)
    if (profile) {
      form.firstName = profile.firstName || ''
      form.lastName = profile.lastName || ''
      form.phoneCode = profile.phoneCode || ''
      form.phoneNumber = profile.phoneNumber || ''
      form.bio = profile.bio || ''
      if (profile.address) {
        form.address = { ...profile.address }
      }
    }
    
    // Handle roles
    if (user.value.roles) {
      form.roleIds = user.value.roles.map(role => role.id)
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    error.value = 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
}

// Helper function to normalize user data from API
const normalizeUserData = (userData) => {
  // If __profile__ exists but profile doesn't, move it to profile
  if (userData.__profile__ && !userData.profile) {
    userData = {
      ...userData,
      profile: userData.__profile__
    }
    // Delete the original field to avoid duplication
    delete userData.__profile__
  }
  return userData
}

// Fetch available roles
const fetchRoles = async () => {
  rolesLoading.value = true
  try {
    roles.value = await trpc.admin.users.getRoles.query()
  } catch (err) {
    console.error('Error fetching roles:', err)
    toast.error('Không thể tải danh sách vai trò')
  } finally {
    rolesLoading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get user initials for avatar
const getUserInitials = (user) => {
  // Check both possible profile locations
  const profile = getUserProfile(user)
  
  if (profile && profile.firstName && profile.lastName) {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  }
  if (user.username) {
    return user.username.charAt(0).toUpperCase()
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }
  return 'U'
}

// Get full name from profile
const getFullName = (user) => {
  // Check both possible profile locations
  const profile = getUserProfile(user)
  
  if (profile) {
    if (profile.lastName && profile.firstName) {
      return `${profile.lastName} ${profile.firstName}`.trim()
    } else if (profile.lastName) {
      return profile.lastName
    } else if (profile.firstName) {
      return profile.firstName
    }
  }
  return null
}

// Cancel edit mode
const cancelEdit = () => {
  isEditing.value = false
  currentTab.value = 'basic' // Reset tab position
  
  // Reset form to current user data
  form.email = user.value.email
  form.username = user.value.username || ''
  form.password = ''
  form.isActive = user.value.isActive
  form.isEmailVerified = user.value.isEmailVerified
  
  const profile = getUserProfile(user.value)
  if (profile) {
    form.firstName = profile.firstName || ''
    form.lastName = profile.lastName || ''
    form.phoneCode = profile.phoneCode || ''
    form.phoneNumber = profile.phoneNumber || ''
    form.bio = profile.bio || ''
    if (profile.address) {
      form.address = { ...profile.address }
    }
  } else {
    form.firstName = ''
    form.lastName = ''
    form.phoneCode = ''
    form.phoneNumber = ''
    form.bio = ''
    form.address = { street: '', city: '', state: '', country: '', zipCode: '' }
  }
  
  if (user.value.roles) {
    form.roleIds = user.value.roles.map(role => role.id)
  } else {
    form.roleIds = []
  }
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
}

// Validate form
const validateForm = () => {
  let isValid = true
  
  // Reset validation errors
  validationErrors.email = ''
  validationErrors.username = ''
  validationErrors.password = ''
  
  // Email validation
  if (!form.email) {
    validationErrors.email = 'Email là bắt buộc'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    validationErrors.email = 'Email không hợp lệ'
    isValid = false
  }
  
  // Username validation (if provided)
  if (form.username) {
    if (form.username.length < 3) {
      validationErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự'
      isValid = false
    } else if (!/^[a-z0-9-]+$/.test(form.username)) {
      validationErrors.username = 'Tên người dùng chỉ chấp nhận chữ thường a-z, số 0-9 và dấu gạch ngang (-)'
      isValid = false
    }
  }
  
  // Password validation (only if provided)
  if (form.password && form.password.length < 6) {
    validationErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }
  
  return isValid
}

// Update user
const updateUser = async () => {
  if (!validateForm()) {
    // Navigate to the basic tab if there are validation errors
    currentTab.value = 'basic'
    return
  }
  
  isSubmitting.value = true
  try {
    const updateData = {
      id: userId.value,
      email: form.email,
      username: form.username || undefined,
      isActive: form.isActive,
      isEmailVerified: form.isEmailVerified,
      roleIds: form.roleIds,
      firstName: form.firstName || '',
      lastName: form.lastName || '',
      phoneCode: form.phoneCode || '',
      phoneNumber: form.phoneNumber || '',
      bio: form.bio || '',
      address: form.address || {}
    }
    
    // Only include password if it was changed
    if (form.password) {
      updateData.password = form.password
    }
    
    await trpc.admin.users.updateUser.mutate(updateData)
    
    toast.success('Cập nhật người dùng thành công')
    
    // Reload user data and exit edit mode
    await fetchUser()
    isEditing.value = false
  } catch (err) {
    console.error('Error updating user:', err)
    
    if (err.message === 'Email đã được sử dụng bởi người dùng khác') {
      validationErrors.email = 'Email đã được sử dụng bởi người dùng khác'
      currentTab.value = 'basic' // Return to basic tab for email error
    } else {
      toast.error(err.message || 'Không thể cập nhật người dùng')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Send password reset email
const sendPasswordResetEmail = async () => {
  try {
    await trpc.admin.users.sendPasswordResetEmail.mutate(userId.value)
    toast.success('Đã gửi email đặt lại mật khẩu')
  } catch (err) {
    console.error('Error sending password reset email:', err)
    toast.error('Không thể gửi email đặt lại mật khẩu')
  }
}

// Update user status (active/inactive)
const updateUserStatus = async (isActive) => {
  try {
    await trpc.admin.users.updateUser.mutate({
      id: userId.value,
      isActive
    })
    
    toast.success(`Đã ${isActive ? 'kích hoạt' : 'khóa'} tài khoản người dùng`)
    
    // Reload user data
    await fetchUser()
  } catch (err) {
    console.error('Error updating user status:', err)
    toast.error(`Không thể ${isActive ? 'kích hoạt' : 'khóa'} tài khoản người dùng`)
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchRoles()
})
</script> 