import './Login.css';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const config = require('../config.js');


const Login = (props) => {
  const [b_kennung, setB_kennung] = useState('');
  const [password, setPassword] = useState('');
  const [b_kennungError, setB_kennungError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [visible, setVisible] = useState(true);

  const navigate = useNavigate()

  const onButtonClick = () => {
    // Setzt die anfänglichen Fehlerwerte auf leer
    setB_kennungError('')
    setPasswordError('')

    // Überprüfen, ob der Benutzer beide Felder korrekt eingegeben hat
    if ('' === b_kennung) {
      setB_kennungError('Bitte geben Sie eine B-Kennung ein')
      return
    }

    if (!/[Bb][A-Za-z]{2}[0-9]{4}$/.test(b_kennung)) {
      setB_kennungError('Bitte geben Sie eine gültige B-Kennung ein (z.B. bxx1234)')
      return
    }

    if ('' === password) {
      setPasswordError('Bitte geben Sie ein Passwort ein')
      return
    }

    if (password.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein')
      return
    }
    // Überprüfen, ob die B-Kennung mit einem Konto verknüpft ist
    checkAccountExists((accountExists) => {
      // Wenn ja, einloggen
      if (accountExists) logIn()
      // Wenn nein, zeigen Sie eine Fehlermeldung an
      else if (
        window.alert(
          'Ein Account mit der B-Kennung: ' + b_kennung + ' existiert nicht. Bitte wenden Sie sich an das RRZ?',
        )
      ) {
        logIn()
      }
    })
  }

  // Rufe die Server-API auf, um zu überprüfen, ob die angegebene B-Kennungs-ID bereits existiert
  const checkAccountExists = (callback) => {
    fetch('http://' + config.api.host + ':' + config.api.port + '/check-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ b_kennung }),
    })
      .then((r) => r.json())
      .then((r) => {
        callback(r?.userExists)
      })
  }

  // Ein Benutzer mit B-Kennung und Passwort einloggen
  const logIn = () => {
    fetch('http://' + config.api.host + ':' + config.api.port + '/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ b_kennung, password }),
    })
      .then((r) => r.json())
      .then((r) => {
        if ('Erfolgreich' === r.message) {
          localStorage.setItem('user', JSON.stringify({ b_kennung, token: r.token }))
          props.setLoggedIn(true)
          props.setB_kennung(b_kennung)
          navigate('/Startseite')
        } else {
          window.alert('Falsches Passwort. Bitte versuchen Sie es erneut.')
        }
      })
  }

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div className='text'>StudiCard Login</div>
        <div className="underline"></div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <div className='input'>
          <input
            value={b_kennung}
            placeholder="B-Kennung eingeben"
            onChange={(ev) => setB_kennung(ev.target.value.toLowerCase())}
            className={'inputBox'}
          />
          <label className="errorLabel">{b_kennungError}</label>
        </div>
        <br />
        <div className={'input'}>
          <input
            value={password}
            placeholder="Passwort eingeben"
            onChange={(ev) => setPassword(ev.target.value)}
            className={'inputBox'}
            type={visible ? "text" : "password"}
          />
          <div className="p-2" onClick={() => setVisible(!visible)}>
            {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </div>
          <label className="errorLabel">{passwordError}</label>
        </div>
      </div>
      <br />
      <div className={'anmelden-container'}>
        <input className={'anmelden'} type="button" onClick={onButtonClick} value={'Anmelden'} />
      </div>
    </div>
  )
}

export default Login;