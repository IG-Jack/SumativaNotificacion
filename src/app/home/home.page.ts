import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  estadoBano: number | undefined; // Variable para almacenar el estado actual
  isMorning: boolean = false; // Indica si es de día o de noche
  notificationCounter: number = 1; // Para IDs únicos
  estadoBanoSubscription?: Subscription; // Para manejar la suscripción

  @ViewChild('paragraph') para?: ElementRef<HTMLParagraphElement>;

  constructor(private database: Database) {}

  async ngOnInit() {
    await LocalNotifications.requestPermissions(); // Solicitar permisos para notificaciones

    const routeBano = ref(this.database, 'casa/LCR');
    // Suscribirse para monitorear cambios en `estadoBano`
    onValue(routeBano, (snapshot) => {
      const value = snapshot.val(); // Obtener el valor del snapshot

      if (typeof value === 'number') { // Asegurarse de que es un número
        this.estadoBano = value;

        // Determina si es día o noche según `estadoBano`
        if (this.estadoBano < 500) {
          this.isMorning = true; // Indica día
          console.log("Sol"); // Imprimir "Sol" si es día
        } else {
          this.isMorning = false; // Indica noche
          console.log("Luna"); // Imprimir "Luna" si es noche
        }

        // Actualizar la interfaz visual y enviar notificaciones
        this.updateUI();
        this.scheduleNotification();
      } else {
        console.error('El valor de `estadoBano` no es un número');
      }
    });

    
  }

  getColorClass(): void {
    const routeBano = ref(this.database, 'casa/LCR');
    // Suscribirse para monitorear cambios en `estadoBano`
    onValue(routeBano, (snapshot) => {
      const value = snapshot.val(); // Obtener el valor del snapshot

      if (typeof value === 'number') { // Asegurarse de que es un número
        this.estadoBano = value;

        // Determina si es día o noche según `estadoBano`
        
      if (this.estadoBano < 500) {

        return 'day'; // Clase para "día"
      } else {
        return 'night'; // Clase para "noche"
      }
    }
    return 'unknown'; // Clase por defecto si `estadoBano` es indefinido
  } )  };
  updateUI() {
    if (this.para) {
      this.para.nativeElement.textContent = this.isMorning ? 'Morning, Sunshine!' : 'Good Night!';
      this.para.nativeElement.className = this.isMorning ? 'morning' : ''; // Cambiar la clase según el estado
    }

    // Cambiar el estado del checkbox para reflejar el estado
    const checkbox = document.getElementById('hide-checkbox') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = this.isMorning; // Cambiar el estado del checkbox
    }
  }

  scheduleNotification() {
    const notificationId = this.notificationCounter++; // Incrementar el contador para el ID único
    
    LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: this.isMorning ? 'Hace sol, cuídate de los rayos ultravioleta' : 'No hace sol, cuídate del frío',
          body: this.isMorning ? 'Hace sol, cuídate de los rayos ultravioleta' : 'No hace sol, cuídate del frío',
          schedule: {
            allowWhileIdle: true, // Permitir ejecución en modo reposo
          },
        },
      ],
    });
  }

  ngOnDestroy() {
    if (this.estadoBanoSubscription) {
      this.estadoBanoSubscription.unsubscribe(); // Desuscribirse para evitar fugas de memoria
    }
  }
}
