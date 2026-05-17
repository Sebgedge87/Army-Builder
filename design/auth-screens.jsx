const { useState } = React;

// Auth Login Screen
function AuthLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const authStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    card: {
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      border: '1px solid #3a3a3a',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#999',
      marginTop: '8px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#ccc',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      background: '#8b2635',
      color: '#f5f5f0',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '12px',
    },
    googleButton: {
      width: '100%',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      background: '#3a3a3a',
      color: '#f5f5f0',
      border: '1px solid #4a4a4a',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      color: '#666',
      fontSize: '13px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#3a3a3a',
    },
    dividerText: {
      padding: '0 16px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#999',
    },
    link: {
      color: '#8b2635',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };
  
  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>
          <div style={authStyles.title}>⚔️ CFB</div>
          <div style={authStyles.subtitle}>Classic Fantasy Battles</div>
        </div>
        
        <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#f5f5f0' }}>Welcome Back</h2>
        
        <div style={authStyles.inputGroup}>
          <label style={authStyles.label}>Email</label>
          <input 
            type="email" 
            style={authStyles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        
        <div style={authStyles.inputGroup}>
          <label style={authStyles.label}>Password</label>
          <input 
            type="password" 
            style={authStyles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        
        <button style={authStyles.button}>Sign In</button>
        
        <div style={authStyles.divider}>
          <div style={authStyles.dividerLine}></div>
          <div style={authStyles.dividerText}>or</div>
          <div style={authStyles.dividerLine}></div>
        </div>
        
        <button style={authStyles.googleButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        
        <div style={authStyles.footer}>
          Don't have an account? <a href="#" style={authStyles.link}>Sign up</a>
        </div>
      </div>
    </div>
  );
}

// Auth Signup Screen
function AuthSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const authStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    card: {
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      border: '1px solid #3a3a3a',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#999',
      marginTop: '8px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      color: '#ccc',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      background: '#8b2635',
      color: '#f5f5f0',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '12px',
    },
    googleButton: {
      width: '100%',
      padding: '14px',
      fontSize: '15px',
      fontWeight: '600',
      background: '#3a3a3a',
      color: '#f5f5f0',
      border: '1px solid #4a4a4a',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      color: '#666',
      fontSize: '13px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#3a3a3a',
    },
    dividerText: {
      padding: '0 16px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#999',
    },
    link: {
      color: '#8b2635',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };
  
  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>
          <div style={authStyles.title}>⚔️ CFB</div>
          <div style={authStyles.subtitle}>Classic Fantasy Battles</div>
        </div>
        
        <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#f5f5f0' }}>Create Account</h2>
        
        <div style={authStyles.inputGroup}>
          <label style={authStyles.label}>Email</label>
          <input 
            type="email" 
            style={authStyles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        
        <div style={authStyles.inputGroup}>
          <label style={authStyles.label}>Password</label>
          <input 
            type="password" 
            style={authStyles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        
        <div style={authStyles.inputGroup}>
          <label style={authStyles.label}>Confirm Password</label>
          <input 
            type="password" 
            style={authStyles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        
        <button style={authStyles.button}>Create Account</button>
        
        <div style={authStyles.divider}>
          <div style={authStyles.dividerLine}></div>
          <div style={authStyles.dividerText}>or</div>
          <div style={authStyles.dividerLine}></div>
        </div>
        
        <button style={authStyles.googleButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        
        <div style={authStyles.footer}>
          Already have an account? <a href="#" style={authStyles.link}>Sign in</a>
        </div>
      </div>
    </div>
  );
}

// Export to window
Object.assign(window, {
  AuthLoginScreen,
  AuthSignupScreen
});
