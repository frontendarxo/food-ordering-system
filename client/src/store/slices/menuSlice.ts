import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllMenu, getCategory } from '../../api/menu';
import type { Food } from '../../types/food';

interface MenuState {
  foods: Food[];
  categories: string[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  foods: [],
  categories: [],
  selectedCategory: 'all',
  isLoading: false,
  error: null,
};

export const fetchAllMenu = createAsyncThunk('menu/fetchAll', async () => {
  const response = await getAllMenu();
  return response.foods || [];
});

export const fetchCategory = createAsyncThunk('menu/fetchCategory', async (category: string) => {
  const response = await getCategory(category);
  return response.foods || [];
});

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foods = action.payload || [];
        state.categories = action.payload && action.payload.length > 0
          ? [...new Set((action.payload as Food[]).map((food) => food.category))]
          : [];
      })
      .addCase(fetchAllMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки меню';
      })
      .addCase(fetchCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foods = action.payload || [];
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки категории';
      });
  },
});

export const { clearError, setSelectedCategory } = menuSlice.actions;
export default menuSlice.reducer;


