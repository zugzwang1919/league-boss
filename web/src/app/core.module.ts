import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from './user/current-user-service.service';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [ // components that we want to make available
    ],
    declarations: [ // components for use in THIS module
    ],
    providers: [ // singleton services
        CurrentUserService,
    ]
})
export class CoreModule { }
