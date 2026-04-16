import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatedCharactersLoginPage } from './components/animated-characters-login-page';
import { AnimatedCharactersRegisterPage } from './components/animated-characters-register-page';

function App() {
    return (
        <Router>
            <Routes>
                {/* 默认跳转到登录 */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<AnimatedCharactersLoginPage />} />
                <Route path="/register" element={<AnimatedCharactersRegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;