import { createSlice } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem('wishlist')) ?? [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action) {
      const exists = state.some(item => item.id === action.payload.id);
      if (!exists) {
        state.push(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state));
      }
    },
    removeFromWishlist(state, action) {
      const nextState = state.filter(item => item.id !== action.payload.id);
      localStorage.setItem('wishlist', JSON.stringify(nextState));
      return nextState;
    },
    clearWishlist() {
      localStorage.removeItem('wishlist');
      return [];
    }
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
