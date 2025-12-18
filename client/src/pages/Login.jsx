import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
            <div className="card">
                <h1 className="page-title" style={{ textAlign: 'center' }}>Login</h1>
                {error && <div className="btn-danger" style={{ padding: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="password-wrapper">
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input password-input-with-toggle"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <a href="#" className="forgot-password">Forgot Password?</a>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                    Don't have an account? <a href="/register" style={{ color: '#7c3aed' }}>Register</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
