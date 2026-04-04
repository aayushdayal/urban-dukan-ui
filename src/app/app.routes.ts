import { provideRouter, withComponentInputBinding } from '@angular/router';
import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { ProductsComponent } from './products/products';
import { ProductDetailComponent } from './products/productdetail/productdetail';
import { CartComponent } from './cart/cart'; // added
import { PlaceOrderComponent } from './place-order/place-order';
import { OrdersComponent } from './orders/orders';
import { OrderDetailComponent } from './orders/order-detail';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'place-order', component: PlaceOrderComponent }, // new
  { path: 'orders', component: OrdersComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
];

export const appRouterProviders = [
  provideRouter(routes, withComponentInputBinding())
];