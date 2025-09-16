import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Forgotpassword } from './components/forgotpassword/forgotpassword';
import { Layout } from './components/layout/layout';
import { Resetpassword } from './components/resetpassword/resetpassword';
import { Code } from './components/code/code';
import { Profile } from './components/profile/profile';
import { Upload } from './components/upload/upload';

export const routes: Routes = [
  { path: '', component: Login },  // default route
  { path: 'signup', component: Signup }, // route for signup
  { path: 'forgotpassword', component: Forgotpassword }, // route for signup
  { path: 'resetpassword', component: Resetpassword },
  { path: 'code', component: Code },
  { path: 'layout', component: Layout,
    children: [
      { path: 'profile', component: Profile },
      { path: 'upload', component: Upload },

    ]
  }
];


