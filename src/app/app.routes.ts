import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { ProductsComponent } from './products/products';
import { ProductDetailComponent } from './products/productdetail/productdetail';
import { CartComponent } from './cart/cart'; // added

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent } // new cart route
];