import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { useFirebaseApp } from 'reactfire';
import './inicio-auth.css';  
export default function InicioAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const firebase = useFirebaseApp();
    const auth = getAuth(firebase);

    // 1. Login con Email/Contraseña (Original)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess(true);
            setTimeout(() => {
                setEmail('');
                setPassword('');
                setSuccess(false);
            }, 3000);
        } catch (error) {
            handleLoginError(error);
        }
    };

    // 2. Login con Google (Previo)
    const handleLoginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError('Error al iniciar con Google: ' + error.message);
        }
    };

    // 3. Nuevo: Login con GitHub
    const handleLoginWithGitHub = async () => {
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('user:email'); // Para obtener el email
            const result = await signInWithPopup(auth, provider);
            console.log("Usuario GitHub:", result.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error GitHub Auth:", error);
            setError('Error al iniciar con GitHub: ' + error.message);
        }
    };

    // Resto del código (manejo de errores, reset password)...
    const handleLoginError = (error) => {
        console.error("Error de Firebase:", error.code);
        let errorMessage = 'Error al iniciar sesión';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Correo o contraseña incorrectos';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Tu cuenta ha sido desactivada';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde o restablece tu contraseña';
                break;
            case 'auth/invalid-email':
                errorMessage = 'El formato del correo es inválido';
                break;
            default:
                errorMessage = 'Error al iniciar sesión: ' + error.message;
        }
        
        setError(errorMessage);
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            setError('Ingresa tu correo electrónico para restablecer la contraseña');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSent(true);
            setError('');
            setTimeout(() => {
                setResetSent(false);
                setResetEmail('');
            }, 5000);
        } catch (error) {
            console.error("Error al enviar correo de restablecimiento:", error);
            setError('Error al enviar el correo: ' + error.message);
            setResetSent(false);
        }
    };

    return (
        <div className="neon-auth-container">
            <div className="neon-card">
                <h2 className="neon-title">INICIAR SESIÓN<span className="neon-flicker">_</span></h2>
                
                {error && <div className="neon-error">{error}</div>}
                {success && <div className="neon-success">¡Inicio de sesión exitoso! Redirigiendo...</div>}
                {resetSent && (
                    <div className="neon-success">
                        ¡Correo de restablecimiento enviado a {resetEmail}! 
                        Revisa tu bandeja de entrada y spam.
                    </div>
                )}

                {/* Formulario tradicional */}
                <form onSubmit={handleLogin}>
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
                            placeholder="CONTRASEÑA"
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
                        INGRESAR
                    </button>
                </form>

                {/* Divisor */}
                <div className="neon-divider">
                    <span className="neon-divider-line"></span>
                    <span className="neon-divider-text">O</span>
                    <span className="neon-divider-line"></span>
                </div>

                {/* Proveedores OAuth */}
                <div className="oauth-buttons-container">
                    <button onClick={handleLoginWithGoogle} className="neon-button neon-google-button">
                        <span className="neon-google-icon">G</span>
                        Continuar con Google
                    </button>

                    <button onClick={handleLoginWithGitHub} className="neon-button neon-github-button">
                        <span className="neon-github-icon">
                            <svg aria-hidden="true" height="20" viewBox="0 0 16 16" width="20">
                                <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                            </svg>
                        </span>
                        Continuar con GitHub
                    </button>
                </div>

                {/* Restablecer contraseña */}
                <div className="neon-reset-container">
                    <h3 className="neon-reset-title">¿Olvidaste tu contraseña?</h3>
                    <div className="neon-input-group">
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="INGRESA TU CORREO"
                            className="neon-input"
                        />
                        <span className="neon-input-border"></span>
                    </div>
                    <button 
                        type="button" 
                        className="neon-reset-button"
                        onClick={handleResetPassword}
                    >
                        ENVIAR CORREO DE RESTABLECIMIENTO
                    </button>
                </div>
            </div>
        </div>
    );
}