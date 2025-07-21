'use client'

import { useState } from 'react'
import emailjs from 'emailjs-com'
import styles from '../styles/contact.module.css'

export default function ContactForm() {
  const [status, setStatus] = useState('')

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('Sending...')

    emailjs.sendForm(
      'service_axw79s4',   
      'template_uhtgdy8',  
      e.target,
      'hmKM1Y8oka3FHrqg_'  
    )
    .then((result) => {
      setStatus('Message sent successfully!')
      e.target.reset()
    })
    .catch((error) => {
      setStatus('Failed to send. Try again.')
      console.error(error)
    })
  }

  return (
    <div className={styles.contactContainer}>
      <form className={styles.contactForm} onSubmit={sendEmail}>
        <h2 style={{color:"#444444"}}>Get in Touch</h2>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          className={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          className={styles.input}
          style={{ marginBottom: '24px' }}
        />
        <textarea
          name="message"
          placeholder="Your message"
          required
          className={styles.textarea}
        ></textarea>
        <div className={styles.checkboxContainer}>
          <button type="submit" className={styles.button}>Send</button>
          <p className={styles.status}>{status}</p>
        </div>
      </form>
    </div>
  )
}
