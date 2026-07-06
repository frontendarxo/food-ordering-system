import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllMenu, getCategory, getPopularFoods as getPopularFoodsApi } from '../../api/menu';
import { getAllCategories } from '../../api/category';
import type { Food, Location } from '../../types/food';

interface MenuState {
  foods: Food[];
  popularFoods: Food[];
  categories: string[];
  selectedCategory: string;
  isLoading: boolean;
  isLoadingPopular: boolean;
  isLoadingCategories: boolean;
  error: string | null;
}

const initialState: MenuState = {
  foods: [],
  popularFoods: [],
  categories: [],
  selectedCategory: 'all',
  isLoading: false,
  isLoadingPopular: false,
  isLoadingCategories: false,
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

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async () => {
  const categories = await getAllCategories();
  return categories.map((cat: { _id: string; name: string }) => cat.name);
});

export const fetchPopularFoods = createAsyncThunk('menu/fetchPopularFoods', async (location: Location | null) => {
  if (!location) {
    return [];
  }

  const response = await getPopularFoodsApi(location);
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
      })
      .addCase(fetchCategories.pending, (state) => {
        state.isLoadingCategories = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoadingCategories = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoadingCategories = false;
        state.error = action.error.message || 'Ошибка загрузки категорий';
      })
      .addCase(fetchPopularFoods.pending, (state) => {
        state.isLoadingPopular = true;
        state.error = null;
      })
      .addCase(fetchPopularFoods.fulfilled, (state, action) => {
        state.isLoadingPopular = false;
        state.popularFoods = action.payload || [];
      })
      .addCase(fetchPopularFoods.rejected, (state, action) => {
        state.isLoadingPopular = false;
        state.error = action.error.message || 'Ошибка загрузки популярных блюд';
      });
  },
});

export const { clearError, setSelectedCategory } = menuSlice.actions;
export default menuSlice.reducer;


