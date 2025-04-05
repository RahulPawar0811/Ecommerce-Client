import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MainMenu from './components/MainMenu';
import AddCategories from './catalog/AddCategories';
import AddSubCategories from './catalog/AddSubCategories';
import AddVariantTypes from './catalog/AddVariantTypes';
import PageNotFound from './pages/PageNotFound';
import Register from './pages/Register';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import AddProducts from './catalog/AddProducts';
import ViewProducts from './catalog/ViewProducts';
import ForgetPassword from './pages/ForgetPassword';
import Test from './components/Test';
import DebugRouter from './components/DebugRouter';

function App() {
  return (
    <>
    <DebugRouter/>
    <Routes>
      <Route path="/signup" element={<Register />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/forget-password" element={<ForgetPassword />} />

      {/* Protected Routes - Main Layout */}
      <Route path="/" element={<MainMenu />}>
        <Route index element={<Dashboard />} />
        <Route path="addCategories" element={<AddCategories />} />
        <Route path="addProducts" element={<AddProducts />} />
        <Route path="addSubCategories" element={<AddSubCategories />} />
        <Route path="addVariantTypes" element={<AddVariantTypes />} />
        <Route path="viewProducts" element={<ViewProducts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="editProduct/:Prod_Id" element={<AddProducts />} />
        <Route path="test" element={<Test />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
}

export default App;
