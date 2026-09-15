import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router'; // Adicionado RouterModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule], // Adicionado RouterModule aqui
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'biblioteca';
}