import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { ProductsComponent } from './products/products';
import { ProductDetailComponent } from './products/productdetail/productdetail';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  // { path: 'login', component: Login },
  // { path: 'signup', component: Signup },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent }
];