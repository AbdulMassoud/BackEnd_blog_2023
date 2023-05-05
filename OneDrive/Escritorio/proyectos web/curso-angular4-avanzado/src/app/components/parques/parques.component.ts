import { Component } from "@angular/core";

@Component({
    selector: 'parques',
    templateUrl: './parques.component.html'

   
})
export class ParquesComponent {
    public nombre: string;
    public metros: number;
    public vegetacion: string;
    public abierto: Boolean;
    

    constructor(){
        this.nombre = 'Este es el parque';
        this.metros = 450;
        this.vegetacion = 'Alta';
        this.abierto = true;
    }
}