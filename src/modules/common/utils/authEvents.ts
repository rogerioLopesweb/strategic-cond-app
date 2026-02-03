type AuthEvent = "forceLogout";

class AuthEventEmitter {
  private events: { [key: string]: Function[] } = {};

  /**
   * 🎧 Ouve o evento (usado no AuthContext)
   */
  on(event: AuthEvent, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /**
   * 🔇 Para de ouvir o evento (importante para evitar memory leak)
   */
  off(event: AuthEvent, listener: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  /**
   * 📢 Dispara o evento (usado no Interceptor da api.ts)
   */
  emit(event: AuthEvent) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener());
  }
}

// Exportamos uma única instância para o App inteiro compartilhar o mesmo "canal"
export const authEvents = new AuthEventEmitter();
