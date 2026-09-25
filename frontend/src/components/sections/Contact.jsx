import { useState } from 'react'
import { sendContactMessage } from '../../api'
import profile from '../../content/profile'
import Reveal from '../Reveal'

const EMPTY = { name: '', email: '', message: '', website: '' }
const LIMITS = { name: 100, message: 5000 } // mirrors backend/routes/contact.js

function validate({ name, email, message }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (message.trim().length < 10) errors.message = 'Please write at least 10 characters.'
  return errors
}

const mailtoHref = ({ name, message }) =>
  `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio contact from ${name.trim()}`)}&body=${encodeURIComponent(message.trim())}`

export default function Contact() {
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  // state: idle | sending | sent | fallback | error
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const update = (field) => (event) => {
    setFields((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length) {
      // Focus the first invalid field once React has applied aria-invalid.
      requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setStatus({ state: 'sending', message: 'Sending…' })
    try {
      await sendContactMessage(fields)
      setFields(EMPTY)
      setStatus({ state: 'sent', message: `Thanks! Your message was sent. ${profile.firstName} will reply by email.` })
    } catch (err) {
      if (err?.code === 'CONTACT_DISABLED' || err?.code === 'NETWORK') {
        // No mail service available: hand the message to the visitor's email app instead.
        window.location.href = mailtoHref(fields)
        setStatus({ state: 'fallback', message: 'Opening your email app with your message…' })
      } else if (err?.code === 'RATE_LIMITED' || err?.code === 'INVALID_INPUT') {
        setStatus({ state: 'error', message: err.message })
      } else {
        setStatus({ state: 'error', message: "Sorry, your message couldn't be sent. Please email directly." })
      }
    }
  }

  const fieldClass = (field) =>
    `mt-1 block w-full rounded-lg border bg-surface px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-accent ${
      errors[field] ? 'border-red-600 dark:border-red-400' : 'border-field'
    }`

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-4 py-20">
      <Reveal className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title" className="section-title mt-2">
            Let&apos;s talk
          </h2>
          <p className="mt-4 text-lg text-muted">
            Hiring, collaborating, or just have a question? Send a message, or reach out directly.
          </p>
          <ul className="mt-8 space-y-3">
            <li>
              <a className="link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>
              <a className="link" href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="link" href={profile.socials.github} target="_blank" rel="noopener noreferrer">
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            {profile.resume && (
              <li>
                <a className="link" href={profile.resume} download>
                  Download résumé (PDF)
                </a>
              </li>
            )}
          </ul>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card relative space-y-5 p-6" aria-labelledby="contact-title">
          <Field id="contact-name" label="Name" error={errors.name}>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              maxLength={LIMITS.name}
              value={fields.name}
              onChange={update('name')}
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={fieldClass('name')}
            />
          </Field>

          <Field id="contact-email" label="Email" error={errors.email}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={update('email')}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={fieldClass('email')}
            />
          </Field>

          <Field id="contact-message" label="Message" error={errors.message}>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              maxLength={LIMITS.message}
              value={fields.message}
              onChange={update('message')}
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={fieldClass('message')}
            />
          </Field>

          {/* Honeypot for bots: off-screen and hidden from assistive tech. */}
          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={fields.website}
              onChange={update('website')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn-primary disabled:opacity-60" disabled={status.state === 'sending'}>
              {status.state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p
              role="status"
              className={`text-sm ${status.state === 'error' ? 'text-red-700 dark:text-red-300' : 'text-muted'}`}
            >
              {status.message}
              {status.state === 'fallback' && (
                <>
                  {' If nothing opened, email '}
                  <a className="link" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </form>
      </Reveal>
    </section>
  )
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
