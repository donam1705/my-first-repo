'use client';
import { useState } from 'react';
import ProfileInfo from './profile/ProfileInfo';
import ProfileEdit from './profile/ProfileEdit';
import ChangePassword from './profile/ChangePassword';
import ChangeAvatar from './profile/ChangeAvatar';

export default function ProfileLayout() {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { key: 'info', label: 'Thông tin cá nhân' },
    { key: 'edit', label: 'Chỉnh sửa thông tin' },
    { key: 'avatar', label: 'Đổi avatar' },
    { key: 'password', label: 'Đổi mật khẩu' },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded-lg flex gap-6">
      <div className="w-1/4 border-r">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`block w-full text-left px-4 py-2 rounded-md mb-2 font-medium transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'info' && <ProfileInfo />}
        {activeTab === 'edit' && <ProfileEdit />}
        {activeTab === 'avatar' && <ChangeAvatar />}
        {activeTab === 'password' && <ChangePassword />}
      </div>
    </div>
  );
}
