import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LayoutState {
  isSidebarOpen: boolean;
}

// LocalStorage'den başlangıç durumunu al
const initialState: LayoutState = {
  isSidebarOpen: localStorage.getItem('isSidebarOpen') === 'true' ?? true,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      localStorage.setItem('isSidebarOpen', state.isSidebarOpen.toString());
    },
    setSidebarState: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
      localStorage.setItem('isSidebarOpen', action.payload.toString());
    },
  },
});

export const { toggleSidebar, setSidebarState } = layoutSlice.actions;
export default layoutSlice.reducer; 