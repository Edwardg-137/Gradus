import { button, escape, form, link } from './views.js'
import { recentStudyAttempts } from './study-test-view.js'

const returnQuery = destination => destination ? `?volver=${encodeURIComponent(destination)}` : ''

export function profilePage(account, token, attempts, destination) {
  if (!account) return `<h1>Mi perfil</h1><p>Guarda tu avance y consúltalo al iniciar sesión en cualquier navegador.</p>
    <div class="actions">${link(`/perfil/entrar${returnQuery(destination)}`, 'Iniciar sesión')}
    <a href="/perfil/registro${returnQuery(destination)}">Crear perfil</a></div>`
  return `<h1>Mi perfil</h1><p>Correo registrado</p><p><strong>${escape(account.email)}</strong></p>
    <p><a href="/estudio">Ver mis niveles</a> · <a href="/historial">Ver mi historial inicial</a></p>
    ${form(token, '/perfil/salir', '<button class="secondary">Cerrar sesión</button>')}${recentStudyAttempts(attempts)}`
}

export function credentialsPage(registration, token, { email = '', error, destination } = {}) {
  const title = registration ? 'Crear perfil' : 'Iniciar sesión'
  const action = registration ? '/perfil/registro' : '/perfil/entrar'
  return `<h1>${title}</h1>
    ${registration ? '<p>Tu avance como invitado se guardará en tu nuevo perfil.</p>' : ''}
    ${form(token, action, `${destination ? `<input type="hidden" name="volver" value="${escape(destination)}">` : ''}<div class="fields">
    ${error ? `<p class="error" role="alert">${escape(error)}</p>` : ''}
    <label>Correo <input name="email" type="email" value="${escape(email)}" autocomplete="username" maxlength="254" required></label>
    <label>Contraseña <input name="password" type="password" autocomplete="${registration ? 'new-password' : 'current-password'}"
      ${registration ? 'minlength="12" aria-describedby="password-help"' : ''} required></label>
    ${registration ? '<p class="muted" id="password-help">De 12 a 128 caracteres.</p>' : ''}
    </div>${button(title)}`)}
    <p>${registration ? `<a href="/perfil/entrar${returnQuery(destination)}">Ya tengo un perfil</a>`
      : `<a href="/perfil/registro${returnQuery(destination)}">Crear perfil</a>`}</p>`
}
