import React from 'react';
import apiClient from '../../apiClient';
import CreatorProfile from '../CreatorProfile/CreatorProfile';
import CustomerProfile from '../CustomerProfile/CustomerProfile';

/**
 * Один адрес /app/profile на обе роли: какой профиль показать, решает роль из JWT.
 * Лишний запрос /api/auth/me не нужен — роль уже лежит в токене.
 */
const Profile = () => {
  const role = apiClient.getJwtMetadata()?.role;

  if (role === 'CREATOR') return <CreatorProfile />;

  // У админа на бэке есть доступ к обоим профилям — показываем оба, друг под другом.
  if (role === 'ADMIN') {
    return (
      <>
        <CustomerProfile />
        <CreatorProfile />
      </>
    );
  }

  // CUSTOMER и всё, что не распозналось: профиль заказчика, а нет прав — форма
  // покажет ошибку с бэка, это честнее пустой страницы.
  return <CustomerProfile />;
};

export default Profile;
