import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useFirebaseApp } from 'reactfire';
import './autenticacion.css';

export default function Auth()  {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const firebase = useFirebaseApp();
    const auth = getAuth(firebase);

    const isValidEmail = (email) => {
        // Validación mejorada de dominios comunes
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return false;
        
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
        const domain = email.split('@')[1];
        return domains.some(valid => domain.includes(valid));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Ingresa un correo electrónico válido (Gmail, Yahoo, Outlook, etc.)');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Enviar correo de verificación
            await sendEmailVerification(userCredential.user);
            
            setSuccess(true);
            setVerificationSent(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                setSuccess(false);
                setVerificationSent(false);
            }, 5000);
            
        } catch (error) {
            console.error("Error de Firebase:", error.code);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('El correo ya está registrado');
                    break;
                case 'auth/invalid-email':
                    setError('El formato del correo es inválido');
                    break;
                case 'auth/operation-not-allowed':
                    setError('El registro con email/contraseña no está habilitado');
                    break;
                default:
                    setError('Error al crear usuario: ' + error.message);
            }
        }
    };

    return (
        <div className="neon-auth-container">
            <div className="neon-card">
                <h2 className="neon-title">REGISTRO<span className="neon-flicker">_</span></h2>
                
                {error && <div className="neon-error">{error}</div>}
                
                {success && verificationSent && (
                    <div className="neon-success">
                        ¡Registro exitoso! Verifica tu correo electrónico para activar tu cuenta.
                        <div className="neon-pulse">Revisa tu bandeja de entrada o spam</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="neon-input-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="CORREO ELECTRÓNICO"
                            className="neon-input"
                            required
                        />
                        <span className="neon-input-border"></span>
                    </div>

                    <div className="neon-input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="CONTRASEÑA (MÍN. 6 CARACTERES)"
                            className="neon-input"
                            required
                        />
                        <span className="neon-input-border"></span>
                    </div>

                    <div className="neon-input-group">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRMAR CONTRASEÑA"
                            className="neon-input"
                            required
                        />
                        <span className="neon-input-border"></span>
                    </div>

                    <button type="submit" className="neon-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        CREAR USUARIO
                    </button>
                </form>
            </div>
        </div>
    );
};