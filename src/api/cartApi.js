import axios from "axios";

const BASE_URL = "http://localhost:8080/api/cart";

export const addToCart = (customerId, productId, quantity = 1) => {
  return axios.post(`${BASE_URL}/add`, {
    customerId,
    productId,
    quantity
  });
};

export const getCartItems = (customerId) => {
  return axios.get(`${BASE_URL}/${customerId}`);
};

export const removeCartItem = (cartItemId) => {
  return axios.delete(`${BASE_URL}/item/${cartItemId}`);
};

export const updateCartItemQuantity = (cartItemId, quantity) => {
  return axios.put(`${BASE_URL}/item/${cartItemId}`, {
    quantity,
  });
};

export const clearCart = (customerId) => {
  return axios.delete(`${BASE_URL}/clear/${customerId}`);
};
