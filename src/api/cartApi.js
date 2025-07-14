import axios from "axios";

const BASE_URL = "http://localhost:8080/api/cart";

export const addToCart = (customerId, productId) => {
  return axios.post(`${BASE_URL}/add`, {
    customerId,
    productId,
  });
};


export const getCartItems = (customerId) => {
  return axios.get(`${BASE_URL}/${customerId}`);
};

export const removeCartItem = (cartItemId) => {
  return axios.delete(`${BASE_URL}/item/${cartItemId}`);
};
