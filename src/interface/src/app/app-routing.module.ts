import { Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  RouterModule,
  RouterStateSnapshot,
  Routes,
  TitleStrategy,
} from '@angular/router';

import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { RegionSelectionComponent } from './region-selection/region-selection.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: '',
    title: 'Planscape',
    children: [
      { path: '', redirectTo: 'region', pathMatch: 'full' },
      { path: 'login', title: 'Login', component: LoginComponent },
      { path: 'signup', title: 'Signup', component: SignupComponent },
      {
        path: 'region',
        title: 'Region Selection',
        component: RegionSelectionComponent,
      },
      { path: 'map', title: 'Explore', component: MapComponent },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PlanscapeTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(`Planscape | ${title}`);
    }
  }
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: TitleStrategy,
      useClass: PlanscapeTitleStrategy,
    },
  ],
})
export class AppRoutingModule {}
