import { createSlice } from "@reduxjs/toolkit";

let initialState = [];

try {
  const localData = JSON.parse(localStorage.getItem('cart'));
  initialState = Array.isArray(localData) ? localData : localData?.cart ?? [];
} catch (e) {
  console.error("Invalid cart data in localStorage", e);
  initialState = [];
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            // Check if already in cart
            const exists = state.some(item => item.id === action.payload.id);
            if (!exists) {
                state.push(action.payload);
            }
        },
        deleteFromCart(state, action) {
            return state.filter(item => item.id !== action.payload.id);
        },
        clearCart() {
            return [];
        }
    }
});

export const { addToCart, deleteFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
