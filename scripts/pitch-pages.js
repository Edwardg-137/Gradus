import { pitchApplication, pitchPage } from './pitch.js'

const { title, body, navigation } = pitchPage(new URLSearchParams(location.search))
document.title = `${title} · Gradus`
document.querySelector('.course-nav').outerHTML = navigation
document.getElementById('contenido').innerHTML = body

const demoUrl = address => `./${address.slice('/pitch'.length)}`
for (const link of document.querySelectorAll('a[href="/pitch"], a[href^="/pitch?"]')) {
  link.setAttribute('href', demoUrl(link.getAttribute('href')))
}
for (const form of document.querySelectorAll('form[action="/pitch"]')) {
  form.action = './'
  if (form.method === 'post') form.addEventListener('submit', event => {
    event.preventDefault()
    const answers = new URLSearchParams(new FormData(form, event.submitter))
    location.assign(demoUrl(pitchApplication(answers)))
  })
}

if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
