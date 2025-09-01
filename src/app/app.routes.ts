import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home';
import { LoginViewComponent } from './views/login-view/login-view';
import { SignupViewComponent } from './views/signup-view/signup-view';
import { ColorViewComponent } from './views/color-view/color-view';
import { FontsViewComponent } from './views/fonts-view/fonts-view';
import { FormularioView } from './views/formulario-view/formulario-view';
import { DatatableView } from './views/datatable-view/datatable-view';
import { AdminGuard } from './guards/admin.guard';
import { ImageUpload } from './modules/image/image-upload/image-upload';
import { VideoUpload } from './modules/video/video-upload/video-upload';
import { MediaCarousel } from './modules/carousel/media-carousel/media-carousel';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginViewComponent },
  { path: 'signup', component: SignupViewComponent },
  { path: 'colors', component: ColorViewComponent },
  { path: 'fonts', component: FontsViewComponent },
  { path: 'formulario', component: FormularioView },
  { path: 'usuarios', component: DatatableView, canActivate: [AdminGuard] },
  { path: 'upload/image', component: ImageUpload, canActivate: [AdminGuard] },
  { path: 'upload/video', component: VideoUpload, canActivate: [AdminGuard] },
  { path: 'media', component: MediaCarousel, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
